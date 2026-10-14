import path from 'path';
import fs from 'fs';
import barangMasukService from '../services/barangMasukService.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';
import { UPLOADS_DIR } from '../config/upload.js';

export class BarangMasukController {
  async getAll(req, res, next) {
    try {
      const {
        search,
        kategoriId,
        subKategoriId,
        tahun,
        sort,
        order,
        page,
        limit
      } = req.query;

      const result = await barangMasukService.getAllBarangMasuk({
        search,
        kategoriId,
        subKategoriId,
        tahun,
        sort,
        order,
        page,
        limit
      });

      return successResponse(
        res,
        result.barangMasuk,
        'Daftar barang masuk berhasil diambil',
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
      const record = await barangMasukService.getBarangMasukById(id);
      return successResponse(res, record, 'Data barang masuk berhasil diambil', 200);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const record = await barangMasukService.createBarangMasuk(
        req.body,
        req.user,
        req.file || null
      );
      return successResponse(res, record, 'Data barang masuk berhasil disimpan', 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const record = await barangMasukService.updateBarangMasuk(
        id,
        req.body,
        req.user,
        req.file || null
      );
      return successResponse(res, record, 'Data barang masuk berhasil diperbarui', 200);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await barangMasukService.deleteBarangMasuk(id);
      return successResponse(res, null, 'Data barang masuk berhasil dihapus', 200);
    } catch (error) {
      next(error);
    }
  }

  async toggleVerification(req, res, next) {
    try {
      const { id } = req.params;
      const record = await barangMasukService.toggleVerification(id);
      const message = record.isVerified
        ? 'Status transaksi berhasil diverifikasi (Centang Hijau)'
        : 'Status verifikasi transaksi berhasil dibatalkan';
      return successResponse(res, record, message, 200);
    } catch (error) {
      next(error);
    }
  }

  async toggleItemVerification(req, res, next) {
    try {
      const { id, itemId } = req.params;
      const result = await barangMasukService.toggleItemVerification(itemId, id);
      const message = result.isVerified
        ? 'Status item barang berhasil diverifikasi (Centang Hijau)'
        : 'Status verifikasi item barang berhasil dibatalkan';
      return successResponse(res, result, message, 200);
    } catch (error) {
      next(error);
    }
  }

  async getCetak(req, res, next) {
    try {
      const { id } = req.params;
      const data = await barangMasukService.getCetakData(id);
      return successResponse(res, data, 'Data cetak surat penerimaan berhasil diambil', 200);
    } catch (error) {
      next(error);
    }
  }

  async downloadLampiran(req, res, next) {
    try {
      const { id } = req.params;
      const record = await barangMasukService.getBarangMasukById(id);

      if (!record.lampiranName) {
        return errorResponse(res, 'Transaksi ini tidak memiliki file lampiran', 404);
      }

      const filePath = path.resolve(UPLOADS_DIR, record.lampiranName);
      if (!fs.existsSync(filePath)) {
        return errorResponse(res, 'File fisik lampiran tidak ditemukan pada server penyimpanan', 404);
      }

      return res.download(filePath, record.lampiranName);
    } catch (error) {
      next(error);
    }
  }

  async exportExcel(req, res, next) {
    try {
      const {
        search,
        kategoriId,
        subKategoriId,
        tahun,
        sort,
        order
      } = req.query;

      const workbook = await barangMasukService.exportExcel({
        search,
        kategoriId,
        subKategoriId,
        tahun,
        sort,
        order
      });

      const fileName = `Laporan_Barang_Masuk_${new Date().toISOString().slice(0, 10)}.xlsx`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      next(error);
    }
  }
}

export default new BarangMasukController();
