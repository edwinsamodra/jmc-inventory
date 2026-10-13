import bcrypt from 'bcryptjs';
import userRepository from '../repositories/userRepository.js';

export class UserService {
  // Regex validasi password: 8-100 karakter, harus ada huruf besar, huruf kecil, dan angka
  _validatePasswordComplexity(password) {
    if (!password || password.length < 8 || password.length > 100) {
      return false;
    }
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return hasUpperCase && hasLowerCase && hasNumber;
  }

  // Regex validasi email
  _validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async getAllUsers({ search, role, page = 1, limit = 10, sort = 'id', order = 'ASC' }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = parseInt(limit, 10);
    const offset = limitNum > 0 ? (pageNum - 1) * limitNum : 0;

    const { rows, count } = await userRepository.findAll({
      search,
      role,
      limit: limitNum,
      offset,
      sort,
      order
    });

    const totalPages = limitNum > 0 ? Math.ceil(count / limitNum) : 1;

    return {
      users: rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages
      }
    };
  }

  async getUserById(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      const error = new Error('Pengguna tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  async createUser({ role, username, password, nama, email }) {
    const errors = [];

    if (!role || !['Admin', 'Operator'].includes(role)) {
      errors.push('Role wajib dipilih: Admin atau Operator');
    }

    if (!username || username.trim().length < 8 || username.trim().length > 100) {
      errors.push('Username wajib diisi dengan panjang 8–100 karakter');
    }

    if (!this._validatePasswordComplexity(password)) {
      errors.push('Password harus 8–100 karakter dan merupakan kombinasi huruf besar, huruf kecil, dan angka');
    }

    if (!nama || nama.trim().length < 8 || nama.trim().length > 100) {
      errors.push('Nama wajib diisi dengan panjang 8–100 karakter');
    }

    if (!email || email.trim().length < 8 || email.trim().length > 100 || !this._validateEmail(email)) {
      errors.push('Email wajib diisi 8–100 karakter dengan format email yang valid');
    }

    if (errors.length > 0) {
      const error = new Error('Validasi data pengguna gagal');
      error.statusCode = 422;
      error.errors = errors;
      throw error;
    }

    // Cek username unik
    const existingUser = await userRepository.findByUsername(username.trim());
    if (existingUser) {
      const error = new Error('Username sudah digunakan oleh akun lain');
      error.statusCode = 409;
      throw error;
    }

    // Cek email unik
    const existingEmail = await userRepository.findByEmail(email.trim());
    if (existingEmail) {
      const error = new Error('Email sudah terdaftar pada akun lain');
      error.statusCode = 409;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userRepository.create({
      role,
      username: username.trim(),
      password: hashedPassword,
      nama: nama.trim(),
      email: email.trim().toLowerCase(),
      isLocked: false
    });

    return await userRepository.findById(newUser.id);
  }

  async updateUser(id, { role, username, password, nama, email }) {
    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      const error = new Error('Pengguna tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    const errors = [];

    if (role && !['Admin', 'Operator'].includes(role)) {
      errors.push('Role harus Admin atau Operator');
    }

    if (username && (username.trim().length < 8 || username.trim().length > 100)) {
      errors.push('Username harus 8–100 karakter');
    }

    if (nama && (nama.trim().length < 8 || nama.trim().length > 100)) {
      errors.push('Nama harus 8–100 karakter');
    }

    if (email && (email.trim().length < 8 || email.trim().length > 100 || !this._validateEmail(email))) {
      errors.push('Email harus 8–100 karakter dan berformat valid');
    }

    if (password && password.trim() !== '' && !this._validatePasswordComplexity(password)) {
      errors.push('Password baru harus 8–100 karakter dan merupakan kombinasi huruf besar, huruf kecil, dan angka');
    }

    if (errors.length > 0) {
      const error = new Error('Validasi update data pengguna gagal');
      error.statusCode = 422;
      error.errors = errors;
      throw error;
    }

    // Cek keunikan username
    if (username && username.trim() !== existingUser.username) {
      const duplicateUser = await userRepository.findByUsernameExcludeSelf(username.trim(), id);
      if (duplicateUser) {
        const error = new Error('Username sudah digunakan oleh akun lain');
        error.statusCode = 409;
        throw error;
      }
    }

    // Cek keunikan email
    if (email && email.trim().toLowerCase() !== existingUser.email) {
      const duplicateEmail = await userRepository.findByEmail(email.trim().toLowerCase(), id);
      if (duplicateEmail) {
        const error = new Error('Email sudah digunakan oleh akun lain');
        error.statusCode = 409;
        throw error;
      }
    }

    const updatePayload = {};
    if (role) updatePayload.role = role;
    if (username) updatePayload.username = username.trim();
    if (nama) updatePayload.nama = nama.trim();
    if (email) updatePayload.email = email.trim().toLowerCase();

    if (password && password.trim() !== '') {
      updatePayload.password = await bcrypt.hash(password, 10);
    }

    await userRepository.update(id, updatePayload);
    return await userRepository.findById(id);
  }

  async toggleLock(id, currentAdminId, explicitValue = null) {
    if (parseInt(id, 10) === parseInt(currentAdminId, 10)) {
      const error = new Error('Anda tidak dapat mengunci akun Anda sendiri');
      error.statusCode = 400;
      throw error;
    }

    const user = await userRepository.findById(id);
    if (!user) {
      const error = new Error('Pengguna tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    const newLockStatus = explicitValue !== null ? Boolean(explicitValue) : !user.isLocked;
    await userRepository.update(id, { isLocked: newLockStatus });

    return await userRepository.findById(id);
  }

  async deleteUser(id, currentAdminId) {
    if (parseInt(id, 10) === parseInt(currentAdminId, 10)) {
      const error = new Error('Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif');
      error.statusCode = 400;
      throw error;
    }

    const user = await userRepository.findById(id);
    if (!user) {
      const error = new Error('Pengguna tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    // Cek apakah user memiliki riwayat transaksi Barang Masuk (RESTRICT constraint)
    const hasTransactions = await userRepository.hasTransactions(id);
    if (hasTransactions) {
      const error = new Error('Pengguna tidak dapat dihapus karena memiliki riwayat pencatatan transaksi Barang Masuk. Nonaktifkan melalui fitur Kunci (Lock) akun.');
      error.statusCode = 400;
      throw error;
    }

    await userRepository.delete(id);
    return true;
  }
}

export default new UserService();
