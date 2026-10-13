import subKategoriService from '../services/subKategoriService.js';
import { successResponse } from '../utils/responseHelper.js';

export class SubKategoriController {
  async getAll(req, res, next) {
    try {
      const { search, kategoriId, page, limit, sort, order } = req.query;
      const result = await subKategoriService.getAllSubKategori({
        search,
        kategoriId,
        page,
        limit,
        sort,
        order
      });

      return successResponse(
        res,
        result.subKategori,
        'Daftar sub kategori berhasil diambil',
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
      const subKategori = await subKategoriService.getSubKategoriById(id);
      return successResponse(res, subKategori, 'Data sub kategori berhasil diambil', 200);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const subKategori = await subKategoriService.createSubKategori(req.body);
      return successResponse(res, subKategori, 'Sub Kategori baru berhasil ditambahkan', 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const subKategori = await subKategoriService.updateSubKategori(id, req.body);
      return successResponse(res, subKategori, 'Data sub kategori berhasil diperbarui', 200);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await subKategoriService.deleteSubKategori(id);
      return successResponse(res, null, 'Sub Kategori berhasil dihapus', 200);
    } catch (error) {
      next(error);
    }
  }
}

export default new SubKategoriController();
