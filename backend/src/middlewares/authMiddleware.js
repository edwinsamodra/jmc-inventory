import { verifyToken } from '../utils/jwtHelper.js';
import { errorResponse } from '../utils/responseHelper.js';
import userRepository from '../repositories/userRepository.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return errorResponse(res, 'Akses ditolak: Token autentikasi tidak ditemukan pada header permintaan', 401);
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return errorResponse(res, 'Format header otorisasi harus Bearer <token>', 401);
  }

  const token = parts[1];

  try {
    const decoded = verifyToken(token);

    // Verifikasi bahwa user masih aktif dan tidak terkunci
    const user = await userRepository.findById(decoded.id);
    if (!user) {
      return errorResponse(res, 'Sesi tidak valid: Pengguna tidak lagi terdaftar di sistem', 401);
    }

    if (user.isLocked) {
      return errorResponse(res, 'Akun Anda telah dikunci oleh Administrator', 403);
    }

    req.user = {
      id: user.id,
      username: user.username,
      role: user.role,
      nama: user.nama,
      email: user.email
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token autentikasi telah kedaluwarsa, silakan login kembali', 401);
    }
    return errorResponse(res, 'Token autentikasi tidak valid atau rusak', 401);
  }
};

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Autentikasi diperlukan', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Akses ditolak: Menu ini hanya dapat diakses oleh peran [${allowedRoles.join(', ')}]`,
        403
      );
    }

    next();
  };
};

export default {
  authenticateToken,
  requireRole
};
