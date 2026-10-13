import bcrypt from 'bcryptjs';
import { sequelize, User, Kategori, SubKategori, BarangMasuk, BarangMasukItem } from '../models/index.js';

const initialKategori = [
  { id: 1, kode: 'ATK', nama: 'Alat Tulis Kantor' },
  { id: 2, kode: 'ELEC', nama: 'Elektronik & IT' },
  { id: 3, kode: 'MED', nama: 'Peralatan Medis & K3' },
  { id: 4, kode: 'FURN', nama: 'Furniture & Perabot' },
  { id: 5, kode: 'KONS', nama: 'Konsumsi & Logistik Dapur' },
  { id: 6, kode: 'KEBR', nama: 'Peralatan Kebersihan' },
  { id: 7, kode: 'OTOM', nama: 'Suku Cadang & Otomotif' },
  { id: 8, kode: 'BANG', nama: 'Material & Bangunan' },
  { id: 9, kode: 'CETK', nama: 'Percetakan & Publikasi' },
  { id: 10, kode: 'LAB', nama: 'Peralatan Laboratorium' },
  { id: 11, kode: 'SRGM', nama: 'Seragam & Pakaian Kerja' },
  { id: 12, kode: 'SEWA', nama: 'Perlengkapan Sewa & Event' }
];

const initialSubKategori = [
  { id: 1, kategoriId: 1, nama: 'Kertas, Buku & Formulir', batasHarga: 5000000 },
  { id: 2, kategoriId: 1, nama: 'Pulpen, Spidol & Alat Koreksi', batasHarga: 3000000 },
  { id: 3, kategoriId: 1, nama: 'Tinta & Toner Printer', batasHarga: 15000000 },
  { id: 4, kategoriId: 2, nama: 'Komputer, Laptop & Monitor', batasHarga: 60000000 },
  { id: 5, kategoriId: 2, nama: 'Aksesoris & Perangkat Jaringan', batasHarga: 12000000 },
  { id: 6, kategoriId: 2, nama: 'Software & Lisensi', batasHarga: 25000000 },
  { id: 7, kategoriId: 3, nama: 'Masker, Hand Sanitizer & APD', batasHarga: 8000000 },
  { id: 8, kategoriId: 3, nama: 'Kotak P3K & Obat Pertolongan Pertama', batasHarga: 4000000 },
  { id: 9, kategoriId: 4, nama: 'Meja & Kursi Ergonomis', batasHarga: 35000000 },
  { id: 10, kategoriId: 4, nama: 'Lemari Arsip & Rak Dokumen', batasHarga: 18000000 },
  { id: 11, kategoriId: 5, nama: 'Kopi, Teh, Gula & Snack Kantor', batasHarga: 3000000 },
  { id: 12, kategoriId: 6, nama: 'Sabun, Disinfektan & Pembersih Lantai', batasHarga: 4500000 },
  { id: 13, kategoriId: 7, nama: 'Oli Mesin, Minyak Rem & Aki', batasHarga: 9000000 },
  { id: 14, kategoriId: 8, nama: 'Cat Tembok & Perlengkapan Perbaikan', batasHarga: 7500000 }
];

const initialUsers = [
  {
    id: 1,
    role: 'Admin',
    username: 'admin',
    nama: 'Super Administrator',
    email: 'admin@arrg.local',
    password: 'Password123',
    isLocked: false
  },
  {
    id: 2,
    role: 'Operator',
    username: 'budi_op',
    nama: 'Budi Santoso',
    email: 'budi.santoso@arrg.local',
    password: 'Operator123',
    isLocked: false
  },
  {
    id: 3,
    role: 'Operator',
    username: 'siti_op',
    nama: 'Siti Rahmawati',
    email: 'siti.rahma@arrg.local',
    password: 'Operator123',
    isLocked: false
  },
  {
    id: 4,
    role: 'Operator',
    username: 'doni_lock',
    nama: 'Doni Prasetyo (Locked Demo)',
    email: 'doni.prasetyo@arrg.local',
    password: 'Operator123',
    isLocked: true
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
    totalHarga: 4260000,
    items: [
      { namaBarang: 'Kertas HVS A4 80gr PaperOne', harga: 55000, jumlah: 40, satuan: 'Rim', total: 2200000, expiredDate: null },
      { namaBarang: 'Kertas F4 75gr Sinar Dunia', harga: 52000, jumlah: 30, satuan: 'Rim', total: 1560000, expiredDate: null },
      { namaBarang: 'Buku Ekspedisi Folio 100 lembar', harga: 25000, jumlah: 20, satuan: 'Buku', total: 500000, expiredDate: null }
    ]
  },
  {
    id: 2,
    nomorSurat: 'SRT/2026/04/002',
    tanggal: '2026-04-12',
    tahun: '2026',
    asalBarang: 'CV Solusi Komputindo Utama',
    kategoriId: 2,
    subKategoriId: 4,
    operatorId: 2,
    lampiranName: 'invoice_laptop.docx',
    isVerified: true,
    totalHarga: 54400000,
    items: [
      { namaBarang: 'Laptop ASUS ExpertBook B1400 i5', harga: 11500000, jumlah: 4, satuan: 'Unit', total: 46000000, expiredDate: null },
      { namaBarang: 'Monitor Dell 24 inch IPS FHD', harga: 2100000, jumlah: 4, satuan: 'Unit', total: 8400000, expiredDate: null }
    ]
  },
  {
    id: 3,
    nomorSurat: 'SRT/2026/03/015',
    tanggal: '2026-03-20',
    tahun: '2026',
    asalBarang: 'Apotek & Alkes Sehat Farma',
    kategoriId: 3,
    subKategoriId: 7,
    operatorId: 3,
    lampiranName: 'do_alkes_maret.docx',
    isVerified: false,
    totalHarga: 5975000,
    items: [
      { namaBarang: 'Masker Medis 3 Ply Earloop Surgical', harga: 45000, jumlah: 50, satuan: 'Box', total: 2250000, expiredDate: '2028-06-30' },
      { namaBarang: 'Hand Sanitizer Gel 5 Liter', harga: 135000, jumlah: 15, satuan: 'Jerigen', total: 2025000, expiredDate: '2027-12-31' },
      { namaBarang: 'Sarung Tangan Nitrile Disposable', harga: 85000, jumlah: 20, satuan: 'Box', total: 1700000, expiredDate: '2028-03-15' }
    ]
  },
  {
    id: 4,
    nomorSurat: 'SRT/2026/02/008',
    tanggal: '2026-02-18',
    tahun: '2026',
    asalBarang: 'PT Ergo Jaya Furniture',
    kategoriId: 4,
    subKategoriId: 9,
    operatorId: 2,
    lampiranName: 'po_furniture.zip',
    isVerified: true,
    totalHarga: 31500000,
    items: [
      { namaBarang: 'Kursi Kerja Ergonomis Mesh Jaring', harga: 1750000, jumlah: 10, satuan: 'Unit', total: 17500000, expiredDate: null },
      { namaBarang: 'Meja Kerja Staff Kayu Minimalis 120x60', harga: 1400000, jumlah: 10, satuan: 'Unit', total: 14000000, expiredDate: null }
    ]
  },
  {
    id: 5,
    nomorSurat: 'SRT/2026/01/003',
    tanggal: '2026-01-15',
    tahun: '2026',
    asalBarang: 'CV Berkah Alat Kantor',
    kategoriId: 1,
    subKategoriId: 2,
    operatorId: 3,
    lampiranName: '',
    isVerified: true,
    totalHarga: 2650000,
    items: [
      { namaBarang: 'Pulpen Gel Pilot G2 0.5 Hitam', harga: 220000, jumlah: 5, satuan: 'Lusin', total: 1100000, expiredDate: null },
      { namaBarang: 'Spidol Whiteboard Snowman Boardmarker', harga: 110000, jumlah: 10, satuan: 'Lusin', total: 1100000, expiredDate: null },
      { namaBarang: 'Correction Tape Joyko CT-522', harga: 90000, jumlah: 5, satuan: 'Lusin', total: 450000, expiredDate: null }
    ]
  },
  {
    id: 6,
    nomorSurat: 'SRT/2025/11/045',
    tanggal: '2025-11-22',
    tahun: '2025',
    asalBarang: 'PT Triputra Jaringan Solusi',
    kategoriId: 2,
    subKategoriId: 5,
    operatorId: 2,
    lampiranName: 'bast_switch_jaringan.docx',
    isVerified: true,
    totalHarga: 10950000,
    items: [
      { namaBarang: 'Switch Gigabit TP-Link 24 Port Managed', harga: 2350000, jumlah: 3, satuan: 'Unit', total: 7050000, expiredDate: null },
      { namaBarang: 'Kabel UTP Cat6 Belden 305m Original', harga: 1950000, jumlah: 2, satuan: 'Roll', total: 3900000, expiredDate: null }
    ]
  },
  {
    id: 7,
    nomorSurat: 'SRT/2025/08/022',
    tanggal: '2025-08-05',
    tahun: '2025',
    asalBarang: 'CV Logistik Bersama Sukses',
    kategoriId: 5,
    subKategoriId: 11,
    operatorId: 3,
    lampiranName: '',
    isVerified: true,
    totalHarga: 2740000,
    items: [
      { namaBarang: 'Kopi Kapal Api Special Mix Renceng', harga: 155000, jumlah: 8, satuan: 'Karton', total: 1240000, expiredDate: '2027-01-01' },
      { namaBarang: 'Teh Celup Sariwangi 100s', harga: 38000, jumlah: 20, satuan: 'Kotak', total: 760000, expiredDate: '2027-04-10' },
      { namaBarang: 'Gula Pasir Gulaku Premium 1kg', harga: 18500, jumlah: 40, satuan: 'Kg', total: 740000, expiredDate: '2027-08-01' }
    ]
  },
  {
    id: 8,
    nomorSurat: 'SRT/2025/05/019',
    tanggal: '2025-05-18',
    tahun: '2025',
    asalBarang: 'Toko Kimia Bersih Higienis',
    kategoriId: 6,
    subKategoriId: 12,
    operatorId: 2,
    lampiranName: 'lampiran_kebersihan.zip',
    isVerified: true,
    totalHarga: 4050000,
    items: [
      { namaBarang: 'Pembersih Lantai Karbol Wangi 5 Liter', harga: 95000, jumlah: 20, satuan: 'Jerigen', total: 1900000, expiredDate: '2027-05-01' },
      { namaBarang: 'Sabun Cuci Tangan Foam Refill 4 Liter', harga: 85000, jumlah: 15, satuan: 'Jerigen', total: 1275000, expiredDate: '2027-05-01' },
      { namaBarang: 'Trash Bag Kantong Sampah Hitam 80x100', harga: 35000, jumlah: 25, satuan: 'Pack', total: 875000, expiredDate: null }
    ]
  },
  {
    id: 9,
    nomorSurat: 'SRT/2024/12/088',
    tanggal: '2024-12-10',
    tahun: '2024',
    asalBarang: 'PT Mitra Sukses Otomotif',
    kategoriId: 7,
    subKategoriId: 13,
    operatorId: 2,
    lampiranName: '',
    isVerified: true,
    totalHarga: 7820000,
    items: [
      { namaBarang: 'Oli Mesin Shell Helix HX7 10W-40 4L', harga: 345000, jumlah: 12, satuan: 'Galon', total: 4140000, expiredDate: null },
      { namaBarang: 'Aki Mobil GS Astra MF 46B24L', harga: 920000, jumlah: 4, satuan: 'Unit', total: 3680000, expiredDate: null }
    ]
  },
  {
    id: 10,
    nomorSurat: 'SRT/2026/04/005',
    tanggal: '2026-04-13',
    tahun: '2026',
    asalBarang: 'PT Toner Indo Perkasa',
    kategoriId: 1,
    subKategoriId: 3,
    operatorId: 3,
    lampiranName: 'spk_toner_2026.docx',
    isVerified: false,
    totalHarga: 12480000,
    items: [
      { namaBarang: 'Toner HP LaserJet Original 85A (CE285A)', harga: 1100000, jumlah: 6, satuan: 'Box', total: 6600000, expiredDate: null },
      { namaBarang: 'Toner Canon Cartridge 325 Black', harga: 980000, jumlah: 6, satuan: 'Box', total: 5880000, expiredDate: null }
    ]
  },
  {
    id: 11,
    nomorSurat: 'SRT/2026/04/006',
    tanggal: '2026-04-13',
    tahun: '2026',
    asalBarang: 'CV Bangun Prima Sentosa',
    kategoriId: 8,
    subKategoriId: 14,
    operatorId: 2,
    lampiranName: 'do_material.docx',
    isVerified: false,
    totalHarga: 6500000,
    items: [
      { namaBarang: 'Cat Dulux Weathershield Putih 20 Liter', harga: 2200000, jumlah: 2, satuan: 'Pail', total: 4400000, expiredDate: null },
      { namaBarang: 'Kuas Roll & Bak Cat Set Ace Oldfields', harga: 45000, jumlah: 15, satuan: 'Set', total: 675000, expiredDate: null },
      { namaBarang: 'Semen Plester Mortar Utama 40kg', harga: 95000, jumlah: 15, satuan: 'Sak', total: 1425000, expiredDate: null }
    ]
  },
  {
    id: 12,
    nomorSurat: 'SRT/2026/02/011',
    tanggal: '2026-02-28',
    tahun: '2026',
    asalBarang: 'PT Sentra Medika Nusantara',
    kategoriId: 3,
    subKategoriId: 8,
    operatorId: 3,
    lampiranName: 'faktur_p3k.zip',
    isVerified: true,
    totalHarga: 3300000,
    items: [
      { namaBarang: 'Kotak P3K Dinding Lengkap Tipe B', harga: 450000, jumlah: 5, satuan: 'Unit', total: 2250000, expiredDate: null },
      { namaBarang: 'Betadine Antiseptik 60ml & Kassa Steril', harga: 35000, jumlah: 30, satuan: 'Paket', total: 1050000, expiredDate: '2027-10-20' }
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
        expiredDate: item.expiredDate
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
