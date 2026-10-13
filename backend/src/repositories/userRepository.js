import { Op } from 'sequelize';
import { User, BarangMasuk } from '../models/index.js';

export class UserRepository {
  async findById(id) {
    return await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });
  }

  async findByIdWithPassword(id) {
    return await User.findByPk(id);
  }

  async findByUsername(username) {
    return await User.findOne({
      where: { username }
    });
  }

  async findByEmail(email, excludeId = null) {
    const where = { email };
    if (excludeId) {
      where.id = { [Op.ne]: excludeId };
    }
    return await User.findOne({ where });
  }

  async findByUsernameExcludeSelf(username, excludeId) {
    return await User.findOne({
      where: {
        username,
        id: { [Op.ne]: excludeId }
      }
    });
  }

  async findAll({ search, role, limit = 10, offset = 0, sort = 'id', order = 'ASC' }) {
    const where = {};

    if (role && ['Admin', 'Operator'].includes(role)) {
      where.role = role;
    }

    if (search && search.trim() !== '') {
      const q = `%${search.trim()}%`;
      where[Op.or] = [
        { username: { [Op.like]: q } },
        { nama: { [Op.like]: q } },
        { email: { [Op.like]: q } }
      ];
    }

    const queryOptions = {
      where,
      attributes: { exclude: ['password'] },
      order: [[sort, order.toUpperCase()]]
    };

    if (limit > 0) {
      queryOptions.limit = limit;
      queryOptions.offset = offset;
    }

    return await User.findAndCountAll(queryOptions);
  }

  async create(userData) {
    return await User.create(userData);
  }

  async update(id, updateData) {
    const user = await User.findByPk(id);
    if (!user) return null;
    return await user.update(updateData);
  }

  async delete(id) {
    const user = await User.findByPk(id);
    if (!user) return null;
    await user.destroy();
    return true;
  }

  async hasTransactions(userId) {
    const count = await BarangMasuk.count({
      where: { operatorId: userId }
    });
    return count > 0;
  }
}

export default new UserRepository();
