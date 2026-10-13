import { Op } from 'sequelize';
import { BarangMasuk, BarangMasukItem, Kategori, SubKategori, User, sequelize } from '../models/index.js';

export class BarangMasukRepository {
  async findById(id) {
    const record = await BarangMasuk.findByPk(id, {
      include: [
        {
          model: Kategori,
          as: 'kategori',
          attributes: ['id', 'kode', 'nama']
        },
        {
          model: SubKategori,
          as: 'subKategori',
          attributes: ['id', 'nama', 'batasHarga']
        },
        {
          model: User,
          as: 'operator',
          attributes: ['id', 'username', 'nama', 'role']
        },
        {
          model: BarangMasukItem,
          as: 'items',
          attributes: ['id', 'namaBarang', 'harga', 'jumlah', 'satuan', 'total', 'expiredDate']
        }
      ]
    });

    if (!record) return null;
    return this._formatRecord(record);
  }

  async findAll({
    search,
    kategoriId,
    subKategoriId,
    tahun,
    sort = 'tanggal',
    order = 'DESC',
    limit = 10,
    offset = 0
  }) {
    const where = {};

    if (kategoriId) {
      where.kategoriId = kategoriId;
    }

    if (subKategoriId) {
      where.subKategoriId = subKategoriId;
    }

    if (tahun) {
      where.tahun = String(tahun);
    }

    if (search && search.trim() !== '') {
      const q = `%${search.trim()}%`;
      where[Op.or] = [
        { asalBarang: { [Op.like]: q } },
        { '$subKategori.nama$': { [Op.like]: q } },
        { nomorSurat: { [Op.like]: q } }
      ];
    }

    // Validasi sort field
    let orderClause;
    const sortFieldMap = {
      tanggal: 'tanggal',
      asalBarang: 'asalBarang',
      totalHarga: 'totalHarga',
      id: 'id'
    };

    const targetSort = sortFieldMap[sort] || 'tanggal';
    orderClause = [[targetSort, order.toUpperCase()]];

    const include = [
      {
        model: Kategori,
        as: 'kategori',
        attributes: ['id', 'kode', 'nama']
      },
      {
        model: SubKategori,
        as: 'subKategori',
        attributes: ['id', 'nama', 'batasHarga']
      },
      {
        model: User,
        as: 'operator',
        attributes: ['id', 'username', 'nama', 'role']
      },
      {
        model: BarangMasukItem,
        as: 'items',
        attributes: ['id', 'namaBarang', 'harga', 'jumlah', 'satuan', 'total', 'expiredDate']
      }
    ];

    const queryOptions = {
      where,
      include,
      order: orderClause,
      distinct: true
    };

    if (limit > 0) {
      queryOptions.limit = limit;
      queryOptions.offset = offset;
    }

    const { rows, count } = await BarangMasuk.findAndCountAll(queryOptions);

    return {
      rows: rows.map(r => this._formatRecord(r)),
      count
    };
  }

  async createWithItems(data, items, transaction) {
    const record = await BarangMasuk.create(data, { transaction });

    if (items && items.length > 0) {
      const itemRecords = items.map(it => ({
        barangMasukId: record.id,
        namaBarang: it.namaBarang,
        harga: parseFloat(it.harga),
        jumlah: parseInt(it.jumlah, 10),
        satuan: it.satuan,
        total: parseFloat(it.total || it.harga * it.jumlah),
        expiredDate: it.expiredDate || null
      }));

      await BarangMasukItem.bulkCreate(itemRecords, { transaction });
    }

    return record;
  }

  async updateWithItems(id, data, items, transaction) {
    const record = await BarangMasuk.findByPk(id, { transaction });
    if (!record) return null;

    await record.update(data, { transaction });

    if (items && Array.isArray(items)) {
      // Hapus item lama dan insert item baru untuk update atomik
      await BarangMasukItem.destroy({
        where: { barangMasukId: id },
        transaction
      });

      const itemRecords = items.map(it => ({
        barangMasukId: id,
        namaBarang: it.namaBarang,
        harga: parseFloat(it.harga),
        jumlah: parseInt(it.jumlah, 10),
        satuan: it.satuan,
        total: parseFloat(it.total || it.harga * it.jumlah),
        expiredDate: it.expiredDate || null
      }));

      await BarangMasukItem.bulkCreate(itemRecords, { transaction });
    }

    return record;
  }

  async delete(id, transaction) {
    const record = await BarangMasuk.findByPk(id, { transaction });
    if (!record) return null;

    // Hapus items terlebih dahulu (walaupun cascade aktif)
    await BarangMasukItem.destroy({
      where: { barangMasukId: id },
      transaction
    });

    await record.destroy({ transaction });
    return true;
  }

  async updateVerificationStatus(id, isVerified) {
    const record = await BarangMasuk.findByPk(id);
    if (!record) return null;
    return await record.update({ isVerified });
  }

  async generateNomorSurat(tanggal) {
    const dateObj = tanggal ? new Date(tanggal) : new Date();
    const tahun = dateObj.getFullYear();
    const bulan = String(dateObj.getMonth() + 1).padStart(2, '0');

    const count = await BarangMasuk.count({
      where: { tahun: String(tahun) }
    });

    const sequence = String(count + 1).padStart(3, '0');
    return `SRT/${tahun}/${bulan}/${sequence}`;
  }

  async getDistinctYears() {
    const results = await BarangMasuk.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('tahun')), 'tahun']],
      order: [['tahun', 'DESC']]
    });
    return results.map(r => r.tahun);
  }

  _formatRecord(r) {
    const item = r.toJSON ? r.toJSON() : r;
    return {
      id: item.id,
      nomorSurat: item.nomorSurat,
      tanggal: item.tanggal,
      tahun: item.tahun,
      asalBarang: item.asalBarang,
      kategoriId: item.kategoriId,
      kategoriNama: item.kategori?.nama || '',
      kategoriKode: item.kategori?.kode || '',
      subKategoriId: item.subKategoriId,
      subKategoriNama: item.subKategori?.nama || '',
      batasHargaSubKategori: parseFloat(item.subKategori?.batasHarga || 0),
      operatorId: item.operatorId,
      operatorNama: item.operator?.nama || '',
      operatorUsername: item.operator?.username || '',
      lampiranName: item.lampiranName || '',
      lampiranUrl: item.lampiranName ? `/api/barang-masuk/${item.id}/lampiran` : null,
      isVerified: Boolean(item.isVerified),
      totalHarga: parseFloat(item.totalHarga || 0),
      items: (item.items || []).map((it, idx) => ({
        id: it.id || `${item.id}-${idx + 1}`,
        namaBarang: it.namaBarang,
        harga: parseFloat(it.harga || 0),
        jumlah: parseInt(it.jumlah || 0, 10),
        satuan: it.satuan,
        total: parseFloat(it.total || 0),
        expiredDate: it.expiredDate || null
      })),
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    };
  }
}

export default new BarangMasukRepository();
