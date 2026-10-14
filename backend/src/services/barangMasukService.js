import { sequelize, BarangMasukItem } from '../models/index.js';
import barangMasukRepository from '../repositories/barangMasukRepository.js';
import subKategoriRepository from '../repositories/subKategoriRepository.js';
import kategoriRepository from '../repositories/kategoriRepository.js';
import userRepository from '../repositories/userRepository.js';
import { terbilangRupiah } from '../utils/terbilangHelper.js';
import { generateBarangMasukExcel } from '../utils/excelHelper.js';

export class BarangMasukService {
  async getAllBarangMasuk({
    search,
    kategoriId,
    subKategoriId,
    tahun,
    sort = 'tanggal',
    order = 'DESC',
    page = 1,
    limit = 10
  }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = parseInt(limit, 10);
    const offset = limitNum > 0 ? (pageNum - 1) * limitNum : 0;

    const { rows, count } = await barangMasukRepository.findAll({
      search,
      kategoriId: kategoriId ? parseInt(kategoriId, 10) : null,
      subKategoriId: subKategoriId ? parseInt(subKategoriId, 10) : null,
      tahun: tahun ? String(tahun) : null,
      sort,
      order,
      limit: limitNum,
      offset
    });

    const totalPages = limitNum > 0 ? Math.ceil(count / limitNum) : 1;

    return {
      barangMasuk: rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages
      }
    };
  }

  async getBarangMasukById(id) {
    const record = await barangMasukRepository.findById(id);
    if (!record) {
      const error = new Error('Data Barang Masuk tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }
    return record;
  }

  async createBarangMasuk(payload, currentUser, file = null) {
    let {
      nomorSurat,
      tanggal,
      asalBarang,
      kategoriId,
      subKategoriId,
      operatorId,
      items
    } = payload;

    // Parse items jika dikirim via multipart/form-data string JSON
    if (typeof items === 'string') {
      try {
        items = JSON.parse(items);
      } catch (e) {
        const error = new Error('Format baris item tidak valid (gagal parsing JSON)');
        error.statusCode = 422;
        throw error;
      }
    }

    const errors = [];

    // Validasi Operator: jika Operator, paksa ID dirinya sendiri
    let finalOperatorId = currentUser.id;
    if (currentUser.role === 'Admin') {
      if (operatorId) {
        finalOperatorId = parseInt(operatorId, 10);
      }
    }

    // Pastikan operator valid di database
    const operatorUser = await userRepository.findById(finalOperatorId);
    if (!operatorUser) {
      errors.push('Operator yang dipilih tidak ditemukan');
    }

    // Validasi Asal Barang
    if (!asalBarang || asalBarang.trim() === '' || asalBarang.trim().length > 200) {
      errors.push('Asal Barang wajib diisi, maksimal 200 karakter');
    }

    // Validasi Tanggal & Tahun dalam Timezone Asia/Jakarta (WIB)
    let targetTanggal = tanggal;
    if (!targetTanggal) {
      targetTanggal = new Date();
    } else if (typeof targetTanggal === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(targetTanggal.trim())) {
      const nowJakartaTime = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).format(new Date());
      targetTanggal = `${targetTanggal.trim()} ${nowJakartaTime}`;
    }
    const tahun = String(new Date(targetTanggal).getFullYear());

    // Validasi Nomor Surat (otomatis jika tidak diisi)
    let finalNomorSurat = nomorSurat ? nomorSurat.trim() : '';
    if (!finalNomorSurat) {
      finalNomorSurat = await barangMasukRepository.generateNomorSurat(targetTanggal);
    } else if (finalNomorSurat.length > 100) {
      errors.push('Nomor Surat maksimal 100 karakter');
    }

    // Validasi Kategori & Sub Kategori
    if (!kategoriId) errors.push('Kategori wajib dipilih');
    if (!subKategoriId) errors.push('Sub Kategori wajib dipilih');

    const subKategori = await subKategoriRepository.findById(subKategoriId);
    if (!subKategori) {
      errors.push('Sub Kategori yang dipilih tidak valid');
    } else if (kategoriId && parseInt(subKategori.kategoriId, 10) !== parseInt(kategoriId, 10)) {
      errors.push('Sub Kategori yang dipilih tidak sesuai dengan Kategori yang dipilih');
    }

    // Validasi Items multi-line
    if (!items || !Array.isArray(items) || items.length === 0) {
      errors.push('Minimal harus ada 1 baris item barang');
    }

    let calculatedGrandTotal = 0;
    const validatedItems = [];

    if (items && Array.isArray(items)) {
      items.forEach((it, index) => {
        const line = index + 1;
        if (!it.namaBarang || it.namaBarang.trim() === '' || it.namaBarang.trim().length > 200) {
          errors.push(`Item ke-${line}: Nama Barang wajib diisi, maksimal 200 karakter`);
        }

        const harga = parseFloat(it.harga);
        if (isNaN(harga) || harga < 0) {
          errors.push(`Item ke-${line}: Harga barang harus bernilai positif`);
        }

        const jumlah = parseInt(it.jumlah, 10);
        if (isNaN(jumlah) || jumlah < 1) {
          errors.push(`Item ke-${line}: Jumlah barang minimal 1`);
        }

        if (!it.satuan || it.satuan.trim() === '' || it.satuan.trim().length > 40) {
          errors.push(`Item ke-${line}: Satuan barang wajib diisi, maksimal 40 karakter`);
        }

        const rowTotal = (harga || 0) * (jumlah || 0);
        calculatedGrandTotal += rowTotal;

        validatedItems.push({
          namaBarang: it.namaBarang ? it.namaBarang.trim() : '',
          harga,
          jumlah,
          satuan: it.satuan ? it.satuan.trim() : '',
          total: rowTotal,
          expiredDate: it.expiredDate && it.expiredDate.trim() !== '' ? it.expiredDate : null
        });
      });
    }

    // =========================================================================
    // VALIDASI PENTING (BRIEF.md): Plafon Anggaran Batas Harga Sub Kategori
    // =========================================================================
    if (subKategori && calculatedGrandTotal > parseFloat(subKategori.batasHarga)) {
      const batasFmt = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(subKategori.batasHarga);
      const totalFmt = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(calculatedGrandTotal);
      errors.push(`Total harga barang (${totalFmt}) melebihi Batas Plafon Anggaran Sub Kategori ${subKategori.nama} (${batasFmt})`);
    }

    if (errors.length > 0) {
      const error = new Error('Validasi data barang masuk gagal');
      error.statusCode = 422;
      error.errors = errors;
      throw error;
    }

    // Nama file lampiran
    const lampiranName = file ? file.filename : (payload.lampiranName || '');

    // Eksekusi atomik database transaksi
    const transaction = await sequelize.transaction();
    try {
      const record = await barangMasukRepository.createWithItems(
        {
          nomorSurat: finalNomorSurat,
          tanggal: targetTanggal,
          tahun,
          asalBarang: asalBarang.trim(),
          kategoriId: parseInt(kategoriId, 10),
          subKategoriId: parseInt(subKategoriId, 10),
          operatorId: finalOperatorId,
          lampiranName,
          isVerified: false,
          totalHarga: calculatedGrandTotal
        },
        validatedItems,
        transaction
      );

      await transaction.commit();
      return await barangMasukRepository.findById(record.id);
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  async updateBarangMasuk(id, payload, currentUser, file = null) {
    const existing = await barangMasukRepository.findById(id);
    if (!existing) {
      const error = new Error('Data Barang Masuk tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    // Jika user Operator, pastikan hanya boleh mengedit miliknya sendiri jika diperlukan
    if (currentUser.role === 'Operator' && existing.operatorId !== currentUser.id) {
      const error = new Error('Anda tidak memiliki akses untuk mengubah transaksi operator lain');
      error.statusCode = 403;
      throw error;
    }

    let {
      nomorSurat,
      tanggal,
      asalBarang,
      kategoriId,
      subKategoriId,
      operatorId,
      items
    } = payload;

    if (typeof items === 'string') {
      try {
        items = JSON.parse(items);
      } catch (e) {
        const error = new Error('Format baris item tidak valid (gagal parsing JSON)');
        error.statusCode = 422;
        throw error;
      }
    }

    const errors = [];

    const targetKategoriId = kategoriId ? parseInt(kategoriId, 10) : existing.kategoriId;
    const targetSubKategoriId = subKategoriId ? parseInt(subKategoriId, 10) : existing.subKategoriId;

    const subKategori = await subKategoriRepository.findById(targetSubKategoriId);
    if (!subKategori) {
      errors.push('Sub Kategori tidak valid');
    } else if (parseInt(subKategori.kategoriId, 10) !== targetKategoriId) {
      errors.push('Sub Kategori tidak sesuai dengan Kategori');
    }

    let finalOperatorId = existing.operatorId;
    if (currentUser.role === 'Admin' && operatorId) {
      finalOperatorId = parseInt(operatorId, 10);
    }

    let targetTanggal = tanggal || existing.tanggal;
    if (tanggal && typeof tanggal === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(tanggal.trim())) {
      const nowJakartaTime = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).format(new Date());
      targetTanggal = `${tanggal.trim()} ${nowJakartaTime}`;
    }
    const tahun = String(new Date(targetTanggal).getFullYear());

    if (asalBarang && (asalBarang.trim() === '' || asalBarang.trim().length > 200)) {
      errors.push('Asal Barang maksimal 200 karakter');
    }

    if (nomorSurat && nomorSurat.trim().length > 100) {
      errors.push('Nomor Surat maksimal 100 karakter');
    }

    let calculatedGrandTotal = 0;
    const validatedItems = [];

    if (items && Array.isArray(items)) {
      if (items.length === 0) {
        errors.push('Minimal harus ada 1 baris item barang');
      }

      items.forEach((it, index) => {
        const line = index + 1;
        if (!it.namaBarang || it.namaBarang.trim() === '' || it.namaBarang.trim().length > 200) {
          errors.push(`Item ke-${line}: Nama Barang wajib diisi, maksimal 200 karakter`);
        }

        const harga = parseFloat(it.harga);
        if (isNaN(harga) || harga < 0) {
          errors.push(`Item ke-${line}: Harga barang harus bernilai positif`);
        }

        const jumlah = parseInt(it.jumlah, 10);
        if (isNaN(jumlah) || jumlah < 1) {
          errors.push(`Item ke-${line}: Jumlah barang minimal 1`);
        }

        if (!it.satuan || it.satuan.trim() === '' || it.satuan.trim().length > 40) {
          errors.push(`Item ke-${line}: Satuan barang wajib diisi, maksimal 40 karakter`);
        }

        const rowTotal = (harga || 0) * (jumlah || 0);
        calculatedGrandTotal += rowTotal;

        validatedItems.push({
          namaBarang: it.namaBarang ? it.namaBarang.trim() : '',
          harga,
          jumlah,
          satuan: it.satuan ? it.satuan.trim() : '',
          total: rowTotal,
          expiredDate: it.expiredDate && it.expiredDate.trim() !== '' ? it.expiredDate : null
        });
      });
    } else {
      // Gunakan items lama jika tidak diubah
      calculatedGrandTotal = existing.totalHarga;
    }

    // Validasi Batas Harga Plafon
    if (subKategori && calculatedGrandTotal > parseFloat(subKategori.batasHarga)) {
      const batasFmt = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(subKategori.batasHarga);
      const totalFmt = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(calculatedGrandTotal);
      errors.push(`Total harga barang (${totalFmt}) melebihi Batas Plafon Anggaran Sub Kategori (${batasFmt})`);
    }

    if (errors.length > 0) {
      const error = new Error('Validasi update barang masuk gagal');
      error.statusCode = 422;
      error.errors = errors;
      throw error;
    }

    const updatePayload = {
      nomorSurat: nomorSurat ? nomorSurat.trim() : existing.nomorSurat,
      tanggal: targetTanggal,
      tahun,
      asalBarang: asalBarang ? asalBarang.trim() : existing.asalBarang,
      kategoriId: targetKategoriId,
      subKategoriId: targetSubKategoriId,
      operatorId: finalOperatorId,
      totalHarga: calculatedGrandTotal
    };

    if (file) {
      updatePayload.lampiranName = file.filename;
    }

    const transaction = await sequelize.transaction();
    try {
      await barangMasukRepository.updateWithItems(
        id,
        updatePayload,
        items && Array.isArray(items) ? validatedItems : null,
        transaction
      );

      await transaction.commit();
      return await barangMasukRepository.findById(id);
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  async deleteBarangMasuk(id) {
    const existing = await barangMasukRepository.findById(id);
    if (!existing) {
      const error = new Error('Data Barang Masuk tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    const transaction = await sequelize.transaction();
    try {
      await barangMasukRepository.delete(id, transaction);
      await transaction.commit();
      return true;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  async toggleVerification(id) {
    const existing = await barangMasukRepository.findById(id);
    if (!existing) {
      const error = new Error('Data Barang Masuk tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    const newStatus = !existing.isVerified;
    await barangMasukRepository.updateVerificationStatus(id, newStatus);
    return await barangMasukRepository.findById(id);
  }

  async toggleItemVerification(itemId, targetBarangMasukId = null) {
    const item = await BarangMasukItem.findByPk(itemId);
    if (!item) {
      const error = new Error('Data item barang masuk tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    if (targetBarangMasukId && parseInt(targetBarangMasukId, 10) !== item.barangMasukId) {
      const error = new Error('Item barang tidak cocok dengan dokumen Barang Masuk yang ditentukan');
      error.statusCode = 400;
      throw error;
    }

    const newStatus = !item.isVerified;
    await barangMasukRepository.updateItemVerificationStatus(itemId, newStatus);

    const updatedItem = await BarangMasukItem.findByPk(itemId);
    const parentDoc = await barangMasukRepository.findById(item.barangMasukId);

    return {
      item: {
        id: updatedItem.id,
        barangMasukId: updatedItem.barangMasukId,
        namaBarang: updatedItem.namaBarang,
        isVerified: Boolean(updatedItem.isVerified)
      },
      barangMasukId: item.barangMasukId,
      parentIsVerified: parentDoc ? parentDoc.isVerified : false,
      isVerified: Boolean(updatedItem.isVerified)
    };
  }

  async getCetakData(id) {
    const record = await barangMasukRepository.findById(id);
    if (!record) {
      const error = new Error('Data Barang Masuk tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    const terbilang = terbilangRupiah(record.totalHarga);

    return {
      kopInstansi: 'PT JMC INDONESIA - SISTEM PENGELOLAAN BARANG INVENTARIS',
      alamatInstansi: 'Jl. Melati No. 42, Sleman, D.I. Yogyakarta | Telp: (0274) 555-123',
      judulDokumen: 'SURAT BUKTI PENERIMAAN BARANG MASUK',
      nomorSurat: record.nomorSurat,
      tanggal: record.tanggal,
      asalBarang: record.asalBarang,
      kategori: record.kategoriNama,
      subKategori: record.subKategoriNama,
      batasPlafon: record.batasHargaSubKategori,
      operator: record.operatorNama,
      isVerified: record.isVerified,
      items: (record.items || []).map((it, idx) => ({
        no: idx + 1,
        namaBarang: it.namaBarang,
        jumlah: it.jumlah,
        satuan: it.satuan,
        harga: it.harga,
        total: it.total,
        expiredDate: it.expiredDate || '-'
      })),
      totalHarga: record.totalHarga,
      terbilang
    };
  }

  async exportExcel(filters) {
    // Ambil seluruh data sesuai filter tanpa limit paginasi
    const { rows } = await barangMasukRepository.findAll({
      ...filters,
      limit: 0,
      offset: 0
    });

    return await generateBarangMasukExcel(rows);
  }
}

export default new BarangMasukService();
