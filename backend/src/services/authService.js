import bcrypt from 'bcryptjs';
import userRepository from '../repositories/userRepository.js';
import { generateToken } from '../utils/jwtHelper.js';

export class AuthService {
  async login(username, password) {
    if (!username || !password) {
      const error = new Error('Username dan password wajib diisi');
      error.statusCode = 400;
      throw error;
    }

    const user = await userRepository.findByUsername(username.trim());
    if (!user) {
      const error = new Error('Username atau password salah');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = new Error('Username atau password salah');
      error.statusCode = 401;
      throw error;
    }

    // Validasi akun terkunci (isLocked) sesuai spesifikasi BRIEF.md
    if (user.isLocked) {
      const error = new Error('Akun Anda dalam status terkunci (locked). Silakan hubungi Administrator.');
      error.statusCode = 403;
      throw error;
    }

    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
      nama: user.nama
    };

    const token = generateToken(payload);

    return {
      token,
      user: {
        id: user.id,
        role: user.role,
        username: user.username,
        nama: user.nama,
        email: user.email,
        isLocked: user.isLocked
      }
    };
  }

  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error('Pengguna tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    return {
      id: user.id,
      role: user.role,
      username: user.username,
      nama: user.nama,
      email: user.email,
      isLocked: user.isLocked
    };
  }
}

export default new AuthService();
