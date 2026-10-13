import { Router } from 'express';
import subKategoriController from '../controllers/subKategoriController.js';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware.js';

const router = Router();

// Seluruh endpoint sub kategori membutuhkan autentikasi
router.use(authenticateToken);

// Operator dan Admin boleh membaca daftar sub kategori (untuk pilihan dinamis transaksi)
router.get('/', subKategoriController.getAll);
router.get('/:id', subKategoriController.getById);

// Khusus Admin yang boleh menambah, mengubah, dan menghapus Master Sub Kategori
router.post('/', requireRole('Admin'), subKategoriController.create);
router.put('/:id', requireRole('Admin'), subKategoriController.update);
router.delete('/:id', requireRole('Admin'), subKategoriController.delete);

export default router;
