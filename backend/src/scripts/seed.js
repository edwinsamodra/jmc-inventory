import bcrypt from 'bcryptjs';
import { sequelize, User, Kategori, SubKategori, BarangMasuk, BarangMasukItem } from '../models/index.js';

const initialKategori = [
  { id: 1, kode: 'ATK', nama: 'Alat Tulis Kantor' },
  { id: 2, kode: 'ELEC', nama: 'Elektronik & IT' }
];

const initialSubKategori = [
  { id: 1, kategoriId: 1, nama: 'Kertas & Buku Formulir', batasHarga: 5000000 },
  { id: 2, kategoriId: 1, nama: 'Alat Tulis & Kantor', batasHarga: 3000000 },
  { id: 3, kategoriId: 2, nama: 'Perangkat Komputer & IT', batasHarga: 25000000 }
];

const initialUsers = [
  {
    id: 1,
    role: 'Admin',
    username: 'administrator',
    nama: 'Administrator',
    email: 'admin@example.com',
    password: 'Boleh@123',
    isLocked: false
  },
  {
    id: 2,
    role: 'Operator',
    username: 'operator',
    nama: 'Operator',
    email: 'operator@example.com',
    password: 'Boleh@123',
    isLocked: false
  }
];

const initialBarangMasuk = [
  {
    id: 1,
    nomorSurat: 'SRT/2026/04/001',
    tanggal: '2026-04-10',
    tahun: '2026',
    asalBarang: 'PT Graha Kertas Nusantara',
    kategoriId: 1,
    subKategoriId: 1,
    operatorId: 2,
    lampiranName: 'surat_jalan_kertas.docx',
    isVerified: true,
    totalHarga: 2200000,
    items: [
      { namaBarang: 'Kertas HVS A4 80gr PaperOne', harga: 55000, jumlah: 40, satuan: 'Rim', total: 2200000, expiredDate: null, isVerified: true }
    ]
  },
  {
    id: 2,
    nomorSurat: 'SRT/2026/04/002',
    tanggal: '2026-04-12',
    tahun: '2026',
    asalBarang: 'CV Solusi Komputindo Utama',
    kategoriId: 2,
    subKategoriId: 3,
    operatorId: 2,
    lampiranName: 'invoice_laptop.docx',
    isVerified: false,
    totalHarga: 11500000,
    items: [
      { namaBarang: 'Laptop ASUS ExpertBook B1400 i5', harga: 11500000, jumlah: 1, satuan: 'Unit', total: 11500000, expiredDate: null, isVerified: false }
    ]
  },
  {
    id: 3,
    nomorSurat: 'SRT/2026/04/003',
    tanggal: '2026-04-13',
    tahun: '2026',
    asalBarang: 'CV Sinar Jaya Stationery',
    kategoriId: 1,
    subKategoriId: 2,
    operatorId: 2,
    lampiranName: 'tanda_terima_atk.docx',
    isVerified: true,
    totalHarga: 1800000,
    items: [
      { namaBarang: 'Pulpen Gel Pilot G2 0.5 Hitam', harga: 18000, jumlah: 40, satuan: 'Pcs', total: 720000, expiredDate: null, isVerified: true },
      { namaBarang: 'Buku Agenda Kerja Hardcover A5', harga: 45000, jumlah: 15, satuan: 'Buku', total: 675000, expiredDate: null, isVerified: true },
      { namaBarang: 'Spidol Whiteboard Snowman Boardmarker', harga: 11000, jumlah: 30, satuan: 'Pcs', total: 330000, expiredDate: null, isVerified: true },
      { namaBarang: 'Sticky Notes Post-it 3x3 Neon', harga: 15000, jumlah: 5, satuan: 'Pad', total: 75000, expiredDate: null, isVerified: true }
    ]
  }
];


export async function runMigrationAndSeed() {
  console.log('🔄 Memulai sinkronisasi schema database Sequelize ke MariaDB...');
  
  // 1. Sync database tables dengan force: true untuk reset dan pembuatan skema bersih
  await sequelize.sync({ force: true });
  console.log('✅ Skema tabel berhasil dibuat dengan seluruh index dan foreign key constraint.');

  // 2. Seed Users dengan password bcrypt
  console.log('🌱 Menanam data User awal...');
  for (const u of initialUsers) {
    const hashedPassword = await bcrypt.hash(u.password, 10);
    await User.create({
      id: u.id,
      role: u.role,
      username: u.username,
      nama: u.nama,
      email: u.email,
      password: hashedPassword,
      isLocked: u.isLocked
    });
  }

  // 3. Seed Kategori
  console.log('🌱 Menanam data Master Kategori...');
  await Kategori.bulkCreate(initialKategori);

  // 4. Seed Sub Kategori
  console.log('🌱 Menanam data Master Sub Kategori...');
  await SubKategori.bulkCreate(initialSubKategori);

  // 5. Seed Barang Masuk & Items
  console.log('🌱 Menanam data transaksi Barang Masuk dan Item...');
  for (const bm of initialBarangMasuk) {
    const createdBm = await BarangMasuk.create({
      id: bm.id,
      nomorSurat: bm.nomorSurat,
      tanggal: bm.tanggal,
      tahun: bm.tahun,
      asalBarang: bm.asalBarang,
      kategoriId: bm.kategoriId,
      subKategoriId: bm.subKategoriId,
      operatorId: bm.operatorId,
      lampiranName: bm.lampiranName,
      isVerified: bm.isVerified,
      totalHarga: bm.totalHarga
    });

    for (const item of bm.items) {
      await BarangMasukItem.create({
        barangMasukId: createdBm.id,
        namaBarang: item.namaBarang,
        harga: item.harga,
        jumlah: item.jumlah,
        satuan: item.satuan,
        total: item.total,
        expiredDate: item.expiredDate,
        isVerified: item.isVerified !== undefined ? item.isVerified : bm.isVerified
      });
    }
  }

  console.log('🎉 Migrasi & Seeding Database Berhasil!');
  console.log(`- Users: ${initialUsers.length} baris`);
  console.log(`- Kategori: ${initialKategori.length} baris`);
  console.log(`- Sub Kategori: ${initialSubKategori.length} baris`);
  console.log(`- Barang Masuk: ${initialBarangMasuk.length} baris`);
}

// Eksekusi langsung jika dipanggil via node
if (process.argv[1]?.endsWith('seed.js')) {
  runMigrationAndSeed()
    .then(() => {
      console.log('Database siap digunakan.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Gagal menjalankan migrasi/seed:', err);
      process.exit(1);
    });
}
