import sequelize from '../config/database.js';
import User from './User.js';
import Kategori from './Kategori.js';
import SubKategori from './SubKategori.js';
import BarangMasuk from './BarangMasuk.js';
import BarangMasukItem from './BarangMasukItem.js';

// ========================================================
// RELASI & ASOSIASI ANTAR MODEL DENGAN INTEGRITAS REFERENSI
// ========================================================

// 1. Kategori <-> SubKategori (1 to Many)
// Menolak penghapusan Kategori jika masih memiliki SubKategori (RESTRICT)
Kategori.hasMany(SubKategori, {
  foreignKey: 'kategoriId',
  as: 'subKategoriList',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});
SubKategori.belongsTo(Kategori, {
  foreignKey: 'kategoriId',
  as: 'kategori'
});

// 2. Kategori <-> BarangMasuk (1 to Many)
Kategori.hasMany(BarangMasuk, {
  foreignKey: 'kategoriId',
  as: 'barangMasukList',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});
BarangMasuk.belongsTo(Kategori, {
  foreignKey: 'kategoriId',
  as: 'kategori'
});

// 3. SubKategori <-> BarangMasuk (1 to Many)
// Menolak penghapusan SubKategori jika sudah digunakan pada transaksi BarangMasuk (RESTRICT)
SubKategori.hasMany(BarangMasuk, {
  foreignKey: 'subKategoriId',
  as: 'barangMasukList',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});
BarangMasuk.belongsTo(SubKategori, {
  foreignKey: 'subKategoriId',
  as: 'subKategori'
});

// 4. User (Operator) <-> BarangMasuk (1 to Many)
// Menolak penghapusan user jika masih tercatat sebagai penanggung jawab transaksi (RESTRICT)
User.hasMany(BarangMasuk, {
  foreignKey: 'operatorId',
  as: 'transaksiList',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});
BarangMasuk.belongsTo(User, {
  foreignKey: 'operatorId',
  as: 'operator'
});

// 5. BarangMasuk <-> BarangMasukItem (1 to Many)
// Jika transaksi BarangMasuk dihapus, semua baris item otomatis ikut terhapus (CASCADE)
BarangMasuk.hasMany(BarangMasukItem, {
  foreignKey: 'barangMasukId',
  as: 'items',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
BarangMasukItem.belongsTo(BarangMasuk, {
  foreignKey: 'barangMasukId',
  as: 'barangMasuk'
});

export {
  sequelize,
  User,
  Kategori,
  SubKategori,
  BarangMasuk,
  BarangMasukItem
};

export default {
  sequelize,
  User,
  Kategori,
  SubKategori,
  BarangMasuk,
  BarangMasukItem
};
