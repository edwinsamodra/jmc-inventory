import { Router } from 'express';
import barangMasukController from '../controllers/barangMasukController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { handleSingleUpload } from '../middlewares/uploadMiddleware.js';

const router = Router();

// Seluruh endpoint barang masuk membutuhkan autentikasi (Admin & Operator dapat mengakses)
router.use(authenticateToken);

// 1. Ekspor Excel harus didefinisikan sebelum rute dinamis /:id
router.get('/export/excel', barangMasukController.exportExcel);

// 2. Daftar & Tambah Transaksi
router.get('/', barangMasukController.getAll);
router.post('/', handleSingleUpload('lampiran'), barangMasukController.create);

// 3. Detail, Edit, Hapus
router.get('/:id', barangMasukController.getById);
router.put('/:id', handleSingleUpload('lampiran'), barangMasukController.update);
router.delete('/:id', barangMasukController.delete);

// 4. Aksi Tambahan: Toggle Verifikasi Item & Transaksi, Cetak Surat, Download Lampiran
router.patch('/items/:itemId/verifikasi', barangMasukController.toggleItemVerification);
router.patch('/:id/items/:itemId/verifikasi', barangMasukController.toggleItemVerification);
router.patch('/:id/verifikasi', barangMasukController.toggleVerification);
router.get('/:id/cetak', barangMasukController.getCetak);
router.get('/:id/lampiran', barangMasukController.downloadLampiran);

export default router;
