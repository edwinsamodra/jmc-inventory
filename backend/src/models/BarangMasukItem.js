import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

export class BarangMasukItem extends Model {}

BarangMasukItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    barangMasukId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'barang_masuk_id',
      references: {
        model: 'barang_masuk',
        key: 'id'
      }
    },
    namaBarang: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: 'nama_barang',
      validate: {
        len: [1, 200]
      }
    },
    harga: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    jumlah: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    satuan: {
      type: DataTypes.STRING(40),
      allowNull: false,
      validate: {
        len: [1, 40]
      }
    },
    total: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    expiredDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'expired_date'
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_verified'
    }
  },
  {
    sequelize,
    tableName: 'barang_masuk_items',
    indexes: [
      {
        fields: ['barang_masuk_id'],
        name: 'idx_bmi_barang_masuk_id'
      },
      {
        fields: ['nama_barang'],
        name: 'idx_bmi_nama_barang'
      }
    ]
  }
);

export default BarangMasukItem;
