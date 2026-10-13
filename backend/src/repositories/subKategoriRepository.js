import { Op } from 'sequelize';
import { SubKategori, Kategori, BarangMasuk } from '../models/index.js';

export class SubKategoriRepository {
  async findById(id) {
    return await SubKategori.findByPk(id, {
      include: [
        {
          model: Kategori,
          as: 'kategori',
          attributes: ['id', 'kode', 'nama']
        }
      ]
    });
  }

  async findByKategoriAndNama(kategoriId, nama, excludeId = null) {
    const where = {
      kategoriId,
      nama
    };
    if (excludeId) {
      where.id = { [Op.ne]: excludeId };
    }
    return await SubKategori.findOne({ where });
  }

  async findAll({ search, kategoriId, limit = 10, offset = 0, sort = 'id', order = 'ASC' }) {
    const where = {};

    if (kategoriId) {
      where.kategoriId = kategoriId;
    }

    const include = [
      {
        model: Kategori,
        as: 'kategori',
        attributes: ['id', 'kode', 'nama']
      }
    ];

    if (search && search.trim() !== '') {
      const q = `%${search.trim()}%`;
      where[Op.or] = [
        { nama: { [Op.like]: q } },
        { '$kategori.nama$': { [Op.like]: q } },
        { '$kategori.kode$': { [Op.like]: q } }
      ];
    }

    const queryOptions = {
      where,
      include,
      order: [[sort, order.toUpperCase()]]
    };

    if (limit > 0) {
      queryOptions.limit = limit;
      queryOptions.offset = offset;
    }

    const { rows, count } = await SubKategori.findAndCountAll(queryOptions);

    return {
      rows: rows.map(r => {
        const item = r.toJSON();
        return {
          id: item.id,
          kategoriId: item.kategoriId,
          kategoriKode: item.kategori?.kode || '',
          kategoriNama: item.kategori?.nama || '',
          nama: item.nama,
          batasHarga: parseFloat(item.batasHarga || 0),
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        };
      }),
      count
    };
  }

  async create(data) {
    return await SubKategori.create(data);
  }

  async update(id, data) {
    const subKategori = await SubKategori.findByPk(id);
    if (!subKategori) return null;
    return await subKategori.update(data);
  }

  async delete(id) {
    const subKategori = await SubKategori.findByPk(id);
    if (!subKategori) return null;
    await subKategori.destroy();
    return true;
  }

  async hasBarangMasuk(subKategoriId) {
    const count = await BarangMasuk.count({
      where: { subKategoriId }
    });
    return count > 0;
  }
}

export default new SubKategoriRepository();
