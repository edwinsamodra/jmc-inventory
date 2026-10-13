import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import kategoriRoutes from './kategoriRoutes.js';
import subKategoriRoutes from './subKategoriRoutes.js';
import barangMasukRoutes from './barangMasukRoutes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/kategori', kategoriRoutes);
apiRouter.use('/sub-kategori', subKategoriRoutes);
apiRouter.use('/barang-masuk', barangMasukRoutes);

export default apiRouter;
