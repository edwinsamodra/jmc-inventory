import { Router } from 'express';
import userController from '../controllers/userController.js';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware.js';

const router = Router();

// Seluruh rute Manajemen User hanya boleh diakses oleh Admin
router.use(authenticateToken, requireRole('Admin'));

router.get('/', userController.getAll);
router.post('/', userController.create);
router.get('/:id', userController.getById);
router.put('/:id', userController.update);
router.delete('/:id', userController.delete);
router.patch('/:id/lock', userController.toggleLock);

export default router;
