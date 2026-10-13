import userService from '../services/userService.js';
import { successResponse } from '../utils/responseHelper.js';

export class UserController {
  async getAll(req, res, next) {
    try {
      const { search, role, page, limit, sort, order } = req.query;
      const result = await userService.getAllUsers({
        search,
        role,
        page,
        limit,
        sort,
        order
      });

      return successResponse(
        res,
        result.users,
        'Daftar pengguna berhasil diambil',
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
      const user = await userService.getUserById(id);
      return successResponse(res, user, 'Data pengguna berhasil diambil', 200);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const user = await userService.createUser(req.body);
      return successResponse(res, user, 'Pengguna baru berhasil ditambahkan', 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const user = await userService.updateUser(id, req.body);
      return successResponse(res, user, 'Data pengguna berhasil diperbarui', 200);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await userService.deleteUser(id, req.user.id);
      return successResponse(res, null, 'Pengguna berhasil dihapus', 200);
    } catch (error) {
      next(error);
    }
  }

  async toggleLock(req, res, next) {
    try {
      const { id } = req.params;
      const explicitVal = req.body && req.body.isLocked !== undefined ? req.body.isLocked : null;
      const updatedUser = await userService.toggleLock(id, req.user.id, explicitVal);
      const message = updatedUser.isLocked
        ? `Akun ${updatedUser.username} berhasil dikunci (Locked)`
        : `Akun ${updatedUser.username} berhasil dibuka (Unlocked)`;
      return successResponse(res, updatedUser, message, 200);
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
