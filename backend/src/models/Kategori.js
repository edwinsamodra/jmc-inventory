import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

export class Kategori extends Model {}

Kategori.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    kode: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
      validate: {
        len: [1, 10]
      }
    },
    nama: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [1, 100]
      }
    }
  },
  {
    sequelize,
    tableName: 'kategori',
    indexes: [
      {
        unique: true,
        fields: ['kode'],
        name: 'idx_kategori_kode_unique'
      },
      {
        fields: ['nama'],
        name: 'idx_kategori_nama'
      }
    ]
  }
);

export default Kategori;
