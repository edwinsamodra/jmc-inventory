import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

export class BarangMasuk extends Model {}

BarangMasuk.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nomorSurat: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'nomor_surat',
      validate: {
        len: [1, 100]
      }
    },
    tanggal: {
      type: DataTypes.DATE,
      allowNull: false
    },
    tahun: {
      type: DataTypes.STRING(4),
      allowNull: false,
      validate: {
        len: [4, 4]
      }
    },
    asalBarang: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: 'asal_barang',
      validate: {
        len: [1, 200]
      }
    },
    kategoriId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'kategori_id',
      references: {
        model: 'kategori',
        key: 'id'
      }
    },
    subKategoriId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'sub_kategori_id',
      references: {
        model: 'sub_kategori',
        key: 'id'
      }
    },
    operatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'operator_id',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    lampiranName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'lampiran_name'
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_verified'
    },
    totalHarga: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'total_harga'
    }
  },
  {
    sequelize,
    tableName: 'barang_masuk',
    indexes: [
      {
        fields: ['nomor_surat'],
        name: 'idx_bm_nomor_surat'
      },
      {
        fields: ['tanggal'],
        name: 'idx_bm_tanggal'
      },
      {
        fields: ['tahun'],
        name: 'idx_bm_tahun'
      },
      {
        fields: ['kategori_id'],
        name: 'idx_bm_kategori_id'
      },
      {
        fields: ['sub_kategori_id'],
        name: 'idx_bm_sub_kategori_id'
      },
      {
        fields: ['operator_id'],
        name: 'idx_bm_operator_id'
      },
      {
        fields: ['asal_barang'],
        name: 'idx_bm_asal_barang'
      },
      {
        fields: ['total_harga'],
        name: 'idx_bm_total_harga'
      },
      {
        fields: ['is_verified'],
        name: 'idx_bm_is_verified'
      },
      // Composite index untuk kombinasi filter paling sering dipakai di UI
      {
        fields: ['kategori_id', 'sub_kategori_id', 'tahun'],
        name: 'idx_bm_compound_filters'
      }
    ]
  }
);

export default BarangMasuk;
