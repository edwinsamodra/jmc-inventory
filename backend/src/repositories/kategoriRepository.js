import { Op, fn, col } from 'sequelize';
import { Kategori, SubKategori, BarangMasuk } from '../models/index.js';

export class KategoriRepository {
  async findById(id) {
    return await Kategori.findByPk(id, {
      include: [
        {
          model: SubKategori,
          as: 'subKategoriList',
          attributes: ['id', 'nama', 'batasHarga']
        }
      ]
    });
  }

  async findByKode(kode) {
    return await Kategori.findOne({
      where: { kode }
    });
  }

  async findByKodeExcludeSelf(kode, excludeId) {
    return await Kategori.findOne({
      where: {
        kode,
        id: { [Op.ne]: excludeId }
      }
    });
  }

  async findAll({ search, limit = 10, offset = 0, sort = 'id', order = 'ASC' }) {
    const where = {};

    if (search && search.trim() !== '') {
      const q = `%${search.trim()}%`;
      where[Op.or] = [
        { kode: { [Op.like]: q } },
        { nama: { [Op.like]: q } }
      ];
    }

    const queryOptions = {
      where,
      attributes: {
        include: [
          [
            fn('COUNT', col('subKategoriList.id')),
            'subKategoriCount'
          ]
        ]
      },
      include: [
        {
          model: SubKategori,
          as: 'subKategoriList',
          attributes: [],
          duplicating: false
        }
      ],
      group: ['Kategori.id'],
      order: [[sort, order.toUpperCase()]],
      subQuery: false
    };

    if (limit > 0) {
      queryOptions.limit = limit;
      queryOptions.offset = offset;
    }

    const { rows, count } = await Kategori.findAndCountAll(queryOptions);
    // Saat memakai group by di Sequelize findAndCountAll, count bisa bertipe array of objects
    const totalCount = Array.isArray(count) ? count.length : count;

    return {
      rows: rows.map(r => {
        const item = r.toJSON();
        item.subKategoriCount = parseInt(item.subKategoriCount || 0, 10);
        return item;
      }),
      count: totalCount
    };
  }

  async create(data) {
    return await Kategori.create(data);
  }

  async update(id, data) {
    const kategori = await Kategori.findByPk(id);
    if (!kategori) return null;
    return await kategori.update(data);
  }

  async delete(id) {
    const kategori = await Kategori.findByPk(id);
    if (!kategori) return null;
    await kategori.destroy();
    return true;
  }

  async hasSubKategori(kategoriId) {
    const count = await SubKategori.count({
      where: { kategoriId }
    });
    return count > 0;
  }

  async hasBarangMasuk(kategoriId) {
    const count = await BarangMasuk.count({
      where: { kategoriId }
    });
    return count > 0;
  }
}

export default new KategoriRepository();
