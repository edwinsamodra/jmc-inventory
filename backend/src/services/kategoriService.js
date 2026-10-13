import kategoriRepository from '../repositories/kategoriRepository.js';

export class KategoriService {
  async getAllKategori({ search, page = 1, limit = 10, sort = 'id', order = 'ASC' }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = parseInt(limit, 10);
    const offset = limitNum > 0 ? (pageNum - 1) * limitNum : 0;

    const { rows, count } = await kategoriRepository.findAll({
      search,
      limit: limitNum,
      offset,
      sort,
      order
    });

    const totalPages = limitNum > 0 ? Math.ceil(count / limitNum) : 1;

    return {
      kategori: rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages
      }
    };
  }

  async getKategoriById(id) {
    const kategori = await kategoriRepository.findById(id);
    if (!kategori) {
      const error = new Error('Kategori tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }
    return kategori;
  }

  async createKategori({ kode, nama }) {
    const errors = [];

    if (!kode || kode.trim() === '' || kode.trim().length > 10) {
      errors.push('Kode Kategori wajib diisi, maksimal 10 karakter');
    }

    if (!nama || nama.trim() === '' || nama.trim().length > 100) {
      errors.push('Nama Kategori wajib diisi, maksimal 100 karakter');
    }

    if (errors.length > 0) {
      const error = new Error('Validasi data kategori gagal');
      error.statusCode = 422;
      error.errors = errors;
      throw error;
    }

    const cleanKode = kode.trim().toUpperCase();

    // Validasi keunikan kode
    const existing = await kategoriRepository.findByKode(cleanKode);
    if (existing) {
      const error = new Error(`Kode Kategori "${cleanKode}" sudah digunakan`);
      error.statusCode = 409;
      throw error;
    }

    return await kategoriRepository.create({
      kode: cleanKode,
      nama: nama.trim()
    });
  }

  async updateKategori(id, { kode, nama }) {
    const existingKategori = await kategoriRepository.findById(id);
    if (!existingKategori) {
      const error = new Error('Kategori tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    const errors = [];

    if (kode && (kode.trim() === '' || kode.trim().length > 10)) {
      errors.push('Kode Kategori maksimal 10 karakter');
    }

    if (nama && (nama.trim() === '' || nama.trim().length > 100)) {
      errors.push('Nama Kategori maksimal 100 karakter');
    }

    if (errors.length > 0) {
      const error = new Error('Validasi update kategori gagal');
      error.statusCode = 422;
      error.errors = errors;
      throw error;
    }

    const updatePayload = {};

    if (kode) {
      const cleanKode = kode.trim().toUpperCase();
      if (cleanKode !== existingKategori.kode) {
        const duplicate = await kategoriRepository.findByKodeExcludeSelf(cleanKode, id);
        if (duplicate) {
          const error = new Error(`Kode Kategori "${cleanKode}" sudah digunakan oleh kategori lain`);
          error.statusCode = 409;
          throw error;
        }
      }
      updatePayload.kode = cleanKode;
    }

    if (nama) {
      updatePayload.nama = nama.trim();
    }

    await kategoriRepository.update(id, updatePayload);
    return await kategoriRepository.findById(id);
  }

  async deleteKategori(id) {
    const kategori = await kategoriRepository.findById(id);
    if (!kategori) {
      const error = new Error('Kategori tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    // Integritas referensial: tolak jika memiliki Sub Kategori
    const hasSubKategori = await kategoriRepository.hasSubKategori(id);
    if (hasSubKategori) {
      const error = new Error('Kategori tidak dapat dihapus karena masih memiliki Sub Kategori terkait');
      error.statusCode = 400;
      throw error;
    }

    // Integritas referensial: tolak jika sudah dipakai di Barang Masuk
    const hasBarangMasuk = await kategoriRepository.hasBarangMasuk(id);
    if (hasBarangMasuk) {
      const error = new Error('Kategori tidak dapat dihapus karena sudah memiliki riwayat transaksi Barang Masuk');
      error.statusCode = 400;
      throw error;
    }

    await kategoriRepository.delete(id);
    return true;
  }
}

export default new KategoriService();
