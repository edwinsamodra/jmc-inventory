import { Router } from 'express';
import kategoriController from '../controllers/kategoriController.js';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware.js';

const router = Router();

// Seluruh endpoint kategori membutuhkan autentikasi
router.use(authenticateToken);

// Operator dan Admin boleh membaca daftar kategori (untuk pilihan combobox transaksi)
router.get('/', kategoriController.getAll);
router.get('/:id', kategoriController.getById);

// Khusus Admin yang boleh menambah, mengubah, dan menghapus Master Kategori
router.post('/', requireRole('Admin'), kategoriController.create);
router.put('/:id', requireRole('Admin'), kategoriController.update);
router.delete('/:id', requireRole('Admin'), kategoriController.delete);

export default router;
