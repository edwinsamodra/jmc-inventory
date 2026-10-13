import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

export class SubKategori extends Model {}

SubKategori.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
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
    nama: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [1, 100]
      }
    },
    batasHarga: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'batas_harga'
    }
  },
  {
    sequelize,
    tableName: 'sub_kategori',
    indexes: [
      {
        fields: ['kategori_id'],
        name: 'idx_sub_kategori_kategori_id'
      },
      {
        fields: ['nama'],
        name: 'idx_sub_kategori_nama'
      },
      {
        fields: ['kategori_id', 'nama'],
        name: 'idx_sub_kategori_kat_nama'
      }
    ]
  }
);

export default SubKategori;
