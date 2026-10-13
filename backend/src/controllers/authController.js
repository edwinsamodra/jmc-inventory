import authService from '../services/authService.js';
import { successResponse } from '../utils/responseHelper.js';

export class AuthController {
  async login(req, res, next) {
    try {
      const { username, password } = req.body;
      const result = await authService.login(username, password);
      return successResponse(res, result, 'Login berhasil', 200);
    } catch (error) {
      next(error);
    }
  }

  async me(req, res, next) {
    try {
      const user = await authService.getProfile(req.user.id);
      return successResponse(res, user, 'Data profil berhasil diambil', 200);
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      return successResponse(res, null, 'Logout berhasil', 200);
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
