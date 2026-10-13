import subKategoriRepository from '../repositories/subKategoriRepository.js';
import kategoriRepository from '../repositories/kategoriRepository.js';

export class SubKategoriService {
  async getAllSubKategori({ search, kategoriId, page = 1, limit = 10, sort = 'id', order = 'ASC' }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = parseInt(limit, 10);
    const offset = limitNum > 0 ? (pageNum - 1) * limitNum : 0;

    const { rows, count } = await subKategoriRepository.findAll({
      search,
      kategoriId: kategoriId ? parseInt(kategoriId, 10) : null,
      limit: limitNum,
      offset,
      sort,
      order
    });

    const totalPages = limitNum > 0 ? Math.ceil(count / limitNum) : 1;

    return {
      subKategori: rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages
      }
    };
  }

  async getSubKategoriById(id) {
    const subKategori = await subKategoriRepository.findById(id);
    if (!subKategori) {
      const error = new Error('Sub Kategori tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }
    return subKategori;
  }

  async createSubKategori({ kategoriId, nama, batasHarga }) {
    const errors = [];

    if (!kategoriId) {
      errors.push('Kategori induk wajib dipilih');
    }

    if (!nama || nama.trim() === '' || nama.trim().length > 100) {
      errors.push('Nama Sub Kategori wajib diisi, maksimal 100 karakter');
    }

    const batasHargaNum = parseFloat(batasHarga);
    if (isNaN(batasHargaNum) || batasHargaNum < 0) {
      errors.push('Batas Harga wajib berupa angka nominal positif');
    }

    if (errors.length > 0) {
      const error = new Error('Validasi data sub kategori gagal');
      error.statusCode = 422;
      error.errors = errors;
      throw error;
    }

    // Pastikan kategori induk ada
    const kategori = await kategoriRepository.findById(kategoriId);
    if (!kategori) {
      const error = new Error('Kategori induk yang dipilih tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    // Cek duplikasi nama pada kategori yang sama
    const duplicate = await subKategoriRepository.findByKategoriAndNama(kategoriId, nama.trim());
    if (duplicate) {
      const error = new Error(`Sub Kategori "${nama.trim()}" sudah ada pada kategori ini`);
      error.statusCode = 409;
      throw error;
    }

    const created = await subKategoriRepository.create({
      kategoriId: parseInt(kategoriId, 10),
      nama: nama.trim(),
      batasHarga: batasHargaNum
    });

    return await subKategoriRepository.findById(created.id);
  }

  async updateSubKategori(id, { kategoriId, nama, batasHarga }) {
    const existing = await subKategoriRepository.findById(id);
    if (!existing) {
      const error = new Error('Sub Kategori tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    const errors = [];

    if (kategoriId) {
      const kategori = await kategoriRepository.findById(kategoriId);
      if (!kategori) {
        errors.push('Kategori induk yang dipilih tidak ditemukan');
      }
    }

    if (nama && (nama.trim() === '' || nama.trim().length > 100)) {
      errors.push('Nama Sub Kategori maksimal 100 karakter');
    }

    if (batasHarga !== undefined) {
      const batasHargaNum = parseFloat(batasHarga);
      if (isNaN(batasHargaNum) || batasHargaNum < 0) {
        errors.push('Batas Harga harus berupa angka nominal positif');
      }
    }

    if (errors.length > 0) {
      const error = new Error('Validasi update sub kategori gagal');
      error.statusCode = 422;
      error.errors = errors;
      throw error;
    }

    const targetKategoriId = kategoriId ? parseInt(kategoriId, 10) : existing.kategoriId;
    const targetNama = nama ? nama.trim() : existing.nama;

    // Cek duplikasi
    const duplicate = await subKategoriRepository.findByKategoriAndNama(targetKategoriId, targetNama, id);
    if (duplicate) {
      const error = new Error(`Sub Kategori "${targetNama}" sudah terdaftar pada kategori tersebut`);
      error.statusCode = 409;
      throw error;
    }

    const updatePayload = {};
    if (kategoriId) updatePayload.kategoriId = parseInt(kategoriId, 10);
    if (nama) updatePayload.nama = targetNama;
    if (batasHarga !== undefined) updatePayload.batasHarga = parseFloat(batasHarga);

    await subKategoriRepository.update(id, updatePayload);
    return await subKategoriRepository.findById(id);
  }

  async deleteSubKategori(id) {
    const subKategori = await subKategoriRepository.findById(id);
    if (!subKategori) {
      const error = new Error('Sub Kategori tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    // Integritas: tolak jika sudah digunakan di transaksi Barang Masuk
    const hasBarangMasuk = await subKategoriRepository.hasBarangMasuk(id);
    if (hasBarangMasuk) {
      const error = new Error('Sub Kategori tidak dapat dihapus karena sudah digunakan dalam transaksi Barang Masuk');
      error.statusCode = 400;
      throw error;
    }

    await subKategoriRepository.delete(id);
    return true;
  }
}

export default new SubKategoriService();
