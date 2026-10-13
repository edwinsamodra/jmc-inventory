import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

export class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    role: {
      type: DataTypes.ENUM('Admin', 'Operator'),
      allowNull: false,
      defaultValue: 'Operator'
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 100]
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    nama: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [1, 100]
      }
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    isLocked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_locked'
    }
  },
  {
    sequelize,
    tableName: 'users',
    indexes: [
      {
        unique: true,
        fields: ['username'],
        name: 'idx_users_username_unique'
      },
      {
        fields: ['role'],
        name: 'idx_users_role'
      },
      {
        fields: ['is_locked'],
        name: 'idx_users_is_locked'
      },
      {
        fields: ['nama'],
        name: 'idx_users_nama'
      }
    ]
  }
);

export default User;
