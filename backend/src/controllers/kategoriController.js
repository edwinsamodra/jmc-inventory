import kategoriService from '../services/kategoriService.js';
import { successResponse } from '../utils/responseHelper.js';

export class KategoriController {
  async getAll(req, res, next) {
    try {
      const { search, page, limit, sort, order } = req.query;
      const result = await kategoriService.getAllKategori({
        search,
        page,
        limit,
        sort,
        order
      });

      return successResponse(
        res,
        result.kategori,
        'Daftar kategori berhasil diambil',
        200,
        result.pagination
      );
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const kategori = await kategoriService.getKategoriById(id);
      return successResponse(res, kategori, 'Data kategori berhasil diambil', 200);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const kategori = await kategoriService.createKategori(req.body);
      return successResponse(res, kategori, 'Kategori baru berhasil ditambahkan', 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const kategori = await kategoriService.updateKategori(id, req.body);
      return successResponse(res, kategori, 'Data kategori berhasil diperbarui', 200);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await kategoriService.deleteKategori(id);
      return successResponse(res, null, 'Kategori berhasil dihapus', 200);
    } catch (error) {
      next(error);
    }
  }
}

export default new KategoriController();
