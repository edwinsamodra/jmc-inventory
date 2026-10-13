import { reactive, watch } from 'vue';

const STORAGE_KEY = 'arrg_mock_store_v1';

// Seed data
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
    kategoriNama: 'Alat Tulis Kantor',
    subKategoriId: 1,
    subKategoriNama: 'Kertas, Buku & Formulir',
    batasHargaSubKategori: 5000000,
    operatorId: 2,
    operatorNama: 'Budi Santoso',
    lampiranName: 'surat_jalan_kertas.docx',
    isVerified: true,
    items: [
      { id: '1-1', namaBarang: 'Kertas HVS A4 80gr PaperOne', harga: 55000, jumlah: 40, satuan: 'Rim', total: 2200000, expiredDate: '' },
      { id: '1-2', namaBarang: 'Kertas F4 75gr Sinar Dunia', harga: 52000, jumlah: 30, satuan: 'Rim', total: 1560000, expiredDate: '' },
      { id: '1-3', namaBarang: 'Buku Ekspedisi Folio 100 lembar', harga: 25000, jumlah: 20, satuan: 'Buku', total: 500000, expiredDate: '' }
    ],
    totalHarga: 4260000
  },
  {
    id: 2,
    nomorSurat: 'SRT/2026/04/002',
    tanggal: '2026-04-12',
    tahun: '2026',
    asalBarang: 'CV Solusi Komputindo Utama',
    kategoriId: 2,
    kategoriNama: 'Elektronik & IT',
    subKategoriId: 4,
    subKategoriNama: 'Komputer, Laptop & Monitor',
    batasHargaSubKategori: 60000000,
    operatorId: 2,
    operatorNama: 'Budi Santoso',
    lampiranName: 'invoice_laptop.docx',
    isVerified: true,
    items: [
      { id: '2-1', namaBarang: 'Laptop ASUS ExpertBook B1400 i5', harga: 11500000, jumlah: 4, satuan: 'Unit', total: 46000000, expiredDate: '' },
      { id: '2-2', namaBarang: 'Monitor Dell 24 inch IPS FHD', harga: 2100000, jumlah: 4, satuan: 'Unit', total: 8400000, expiredDate: '' }
    ],
    totalHarga: 54400000
  },
  {
    id: 3,
    nomorSurat: 'SRT/2026/03/015',
    tanggal: '2026-03-20',
    tahun: '2026',
    asalBarang: 'Apotek & Alkes Sehat Farma',
    kategoriId: 3,
    kategoriNama: 'Peralatan Medis & K3',
    subKategoriId: 7,
    subKategoriNama: 'Masker, Hand Sanitizer & APD',
    batasHargaSubKategori: 8000000,
    operatorId: 3,
    operatorNama: 'Siti Rahmawati',
    lampiranName: 'do_alkes_maret.docx',
    isVerified: false,
    items: [
      { id: '3-1', namaBarang: 'Masker Medis 3 Ply Earloop Surgical', harga: 45000, jumlah: 50, satuan: 'Box', total: 2250000, expiredDate: '2028-06-30' },
      { id: '3-2', namaBarang: 'Hand Sanitizer Gel 5 Liter', harga: 135000, jumlah: 15, satuan: 'Jerigen', total: 2025000, expiredDate: '2027-12-31' },
      { id: '3-3', namaBarang: 'Sarung Tangan Nitrile Disposable', harga: 85000, jumlah: 20, satuan: 'Box', total: 1700000, expiredDate: '2028-03-15' }
    ],
    totalHarga: 5975000
  },
  {
    id: 4,
    nomorSurat: 'SRT/2026/02/008',
    tanggal: '2026-02-18',
    tahun: '2026',
    asalBarang: 'PT Ergo Jaya Furniture',
    kategoriId: 4,
    kategoriNama: 'Furniture & Perabot',
    subKategoriId: 9,
    subKategoriNama: 'Meja & Kursi Ergonomis',
    batasHargaSubKategori: 35000000,
    operatorId: 2,
    operatorNama: 'Budi Santoso',
    lampiranName: 'ba_serah_terima_kursi.zip',
    isVerified: true,
    items: [
      { id: '4-1', namaBarang: 'Kursi Kerja Ergonomis Mesh Lumbar Support', harga: 1450000, jumlah: 15, satuan: 'Unit', total: 21750000, expiredDate: '' },
      { id: '4-2', namaBarang: 'Meja Kerja Staff 120x60 Minimalis', harga: 850000, jumlah: 10, satuan: 'Unit', total: 8500000, expiredDate: '' }
    ],
    totalHarga: 30250000
  },
  {
    id: 5,
    nomorSurat: 'SRT/2026/01/010',
    tanggal: '2026-01-25',
    tahun: '2026',
    asalBarang: 'Toko ATK Cahaya Mentari',
    kategoriId: 1,
    kategoriNama: 'Alat Tulis Kantor',
    subKategoriId: 2,
    subKategoriNama: 'Pulpen, Spidol & Alat Koreksi',
    batasHargaSubKategori: 3000000,
    operatorId: 3,
    operatorNama: 'Siti Rahmawati',
    lampiranName: 'nota_atk_januari.docx',
    isVerified: false,
    items: [
      { id: '5-1', namaBarang: 'Pulpen Gel Pilot G2 0.5 Hitam', harga: 180000, jumlah: 6, satuan: 'Lusin', total: 1080000, expiredDate: '' },
      { id: '5-2', namaBarang: 'Spidol Whiteboard Snowman Hitam/Biru', harga: 95000, jumlah: 10, satuan: 'Lusin', total: 950000, expiredDate: '' },
      { id: '5-3', namaBarang: 'Correction Tape Joyko CT-522', harga: 85000, jumlah: 5, satuan: 'Lusin', total: 425000, expiredDate: '' }
    ],
    totalHarga: 2455000
  },
  {
    id: 6,
    nomorSurat: 'SRT/2025/11/045',
    tanggal: '2025-11-14',
    tahun: '2025',
    asalBarang: 'PT Jaringan Prima Solusindo',
    kategoriId: 2,
    kategoriNama: 'Elektronik & IT',
    subKategoriId: 5,
    subKategoriNama: 'Aksesoris & Perangkat Jaringan',
    batasHargaSubKategori: 12000000,
    operatorId: 2,
    operatorNama: 'Budi Santoso',
    lampiranName: 'surat_jalan_switch.docx',
    isVerified: true,
    items: [
      { id: '6-1', namaBarang: 'Switch Gigabit TP-Link 24 Port Managed', harga: 2350000, jumlah: 3, satuan: 'Unit', total: 7050000, expiredDate: '' },
      { id: '6-2', namaBarang: 'Kabel UTP Cat6 Belden 305m Original', harga: 1950000, jumlah: 2, satuan: 'Roll', total: 3900000, expiredDate: '' }
    ],
    totalHarga: 10950000
  },
  {
    id: 7,
    nomorSurat: 'SRT/2025/08/022',
    tanggal: '2025-08-05',
    tahun: '2025',
    asalBarang: 'CV Logistik Bersama Sukses',
    kategoriId: 5,
    kategoriNama: 'Konsumsi & Logistik Dapur',
    subKategoriId: 11,
    subKategoriNama: 'Kopi, Teh, Gula & Snack Kantor',
    batasHargaSubKategori: 3000000,
    operatorId: 3,
    operatorNama: 'Siti Rahmawati',
    lampiranName: '',
    isVerified: true,
    items: [
      { id: '7-1', namaBarang: 'Kopi Kapal Api Special Mix Renceng', harga: 155000, jumlah: 8, satuan: 'Karton', total: 1240000, expiredDate: '2027-01-01' },
      { id: '7-2', namaBarang: 'Teh Celup Sariwangi 100s', harga: 38000, jumlah: 20, satuan: 'Kotak', total: 760000, expiredDate: '2027-04-10' },
      { id: '7-3', namaBarang: 'Gula Pasir Gulaku Premium 1kg', harga: 18500, jumlah: 40, satuan: 'Kg', total: 740000, expiredDate: '2027-08-01' }
    ],
    totalHarga: 2740000
  },
  {
    id: 8,
    nomorSurat: 'SRT/2025/05/019',
    tanggal: '2025-05-18',
    tahun: '2025',
    asalBarang: 'Toko Kimia Bersih Higienis',
    kategoriId: 6,
    kategoriNama: 'Peralatan Kebersihan',
    subKategoriId: 12,
    subKategoriNama: 'Sabun, Disinfektan & Pembersih Lantai',
    batasHargaSubKategori: 4500000,
    operatorId: 2,
    operatorNama: 'Budi Santoso',
    lampiranName: 'lampiran_kebersihan.zip',
    isVerified: true,
    items: [
      { id: '8-1', namaBarang: 'Pembersih Lantai Karbol Wangi 5 Liter', harga: 95000, jumlah: 20, satuan: 'Jerigen', total: 1900000, expiredDate: '2027-05-01' },
      { id: '8-2', namaBarang: 'Sabun Cuci Tangan Foam Refill 4 Liter', harga: 85000, jumlah: 15, satuan: 'Jerigen', total: 1275000, expiredDate: '2027-05-01' },
      { id: '8-3', namaBarang: 'Trash Bag Kantong Sampah Hitam 80x100', harga: 35000, jumlah: 25, satuan: 'Pack', total: 875000, expiredDate: '' }
    ],
    totalHarga: 4050000
  },
  {
    id: 9,
    nomorSurat: 'SRT/2024/12/088',
    tanggal: '2024-12-10',
    tahun: '2024',
    asalBarang: 'PT Mitra Sukses Otomotif',
    kategoriId: 7,
    kategoriNama: 'Suku Cadang & Otomotif',
    subKategoriId: 13,
    subKategoriNama: 'Oli Mesin, Minyak Rem & Aki',
    batasHargaSubKategori: 9000000,
    operatorId: 2,
    operatorNama: 'Budi Santoso',
    lampiranName: '',
    isVerified: true,
    items: [
      { id: '9-1', namaBarang: 'Oli Mesin Shell Helix HX7 10W-40 4L', harga: 345000, jumlah: 12, satuan: 'Galon', total: 4140000, expiredDate: '' },
      { id: '9-2', namaBarang: 'Aki Mobil GS Astra MF 46B24L', harga: 920000, jumlah: 4, satuan: 'Unit', total: 3680000, expiredDate: '' }
    ],
    totalHarga: 7820000
  },
  {
    id: 10,
    nomorSurat: 'SRT/2026/04/005',
    tanggal: '2026-04-13',
    tahun: '2026',
    asalBarang: 'PT Toner Indo Perkasa',
    kategoriId: 1,
    kategoriNama: 'Alat Tulis Kantor',
    subKategoriId: 3,
    subKategoriNama: 'Tinta & Toner Printer',
    batasHargaSubKategori: 15000000,
    operatorId: 3,
    operatorNama: 'Siti Rahmawati',
    lampiranName: 'spk_toner_2026.docx',
    isVerified: false,
    items: [
      { id: '10-1', namaBarang: 'Toner HP LaserJet Original 85A (CE285A)', harga: 1100000, jumlah: 6, satuan: 'Box', total: 6600000, expiredDate: '' },
      { id: '10-2', namaBarang: 'Toner Canon Cartridge 325 Black', harga: 980000, jumlah: 6, satuan: 'Box', total: 5880000, expiredDate: '' }
    ],
    totalHarga: 12480000
  },
  {
    id: 11,
    nomorSurat: 'SRT/2026/04/006',
    tanggal: '2026-04-13',
    tahun: '2026',
    asalBarang: 'CV Bangun Prima Sentosa',
    kategoriId: 8,
    kategoriNama: 'Material & Bangunan',
    subKategoriId: 14,
    subKategoriNama: 'Cat Tembok & Perlengkapan Perbaikan',
    batasHargaSubKategori: 7500000,
    operatorId: 2,
    operatorNama: 'Budi Santoso',
    lampiranName: 'do_material.docx',
    isVerified: false,
    items: [
      { id: '11-1', namaBarang: 'Cat Dulux Weathershield Putih 20 Liter', harga: 2200000, jumlah: 2, satuan: 'Pail', total: 4400000, expiredDate: '' },
      { id: '11-2', namaBarang: 'Kuas Roll & Bak Cat Set Ace Oldfields', harga: 45000, jumlah: 15, satuan: 'Set', total: 675000, expiredDate: '' },
      { id: '11-3', namaBarang: 'Semen Plester Mortar Utama 40kg', harga: 95000, jumlah: 15, satuan: 'Sak', total: 1425000, expiredDate: '' }
    ],
    totalHarga: 6500000
  },
  {
    id: 12,
    nomorSurat: 'SRT/2026/02/011',
    tanggal: '2026-02-28',
    tahun: '2026',
    asalBarang: 'PT Sentra Medika Nusantara',
    kategoriId: 3,
    kategoriNama: 'Peralatan Medis & K3',
    subKategoriId: 8,
    subKategoriNama: 'Kotak P3K & Obat Pertolongan Pertama',
    batasHargaSubKategori: 4000000,
    operatorId: 3,
    operatorNama: 'Siti Rahmawati',
    lampiranName: 'faktur_p3k.zip',
    isVerified: true,
    items: [
      { id: '12-1', namaBarang: 'Kotak P3K Dinding Lengkap Tipe B', harga: 450000, jumlah: 5, satuan: 'Unit', total: 2250000, expiredDate: '' },
      { id: '12-2', namaBarang: 'Betadine Antiseptik 60ml & Kassa Steril', harga: 35000, jumlah: 30, satuan: 'Paket', total: 1050000, expiredDate: '2027-10-20' }
    ],
    totalHarga: 3300000
  }
];

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        currentUser: parsed.currentUser || initialUsers[0],
        kategoriList: parsed.kategoriList || initialKategori,
        subKategoriList: parsed.subKategoriList || initialSubKategori,
        userList: parsed.userList || initialUsers,
        barangMasukList: parsed.barangMasukList || initialBarangMasuk,
      };
    }
  } catch (e) {
    console.error('Error loading mock store from localStorage:', e);
  }
  return {
    currentUser: initialUsers[0], // default Admin
    kategoriList: initialKategori,
    subKategoriList: initialSubKategori,
    userList: initialUsers,
    barangMasukList: initialBarangMasuk,
  };
}

const saved = loadFromStorage();

export const store = reactive({
  currentUser: saved.currentUser,
  kategoriList: saved.kategoriList,
  subKategoriList: saved.subKategoriList,
  userList: saved.userList,
  get usersList() {
    return this.userList || [];
  },
  barangMasukList: saved.barangMasukList,

  // Toast notification state
  toast: {
    show: false,
    message: '',
    type: 'success' // success, error, warning, info
  },

  showToast(message, type = 'success') {
    this.toast.message = message;
    this.toast.type = type;
    this.toast.show = true;
    setTimeout(() => {
      this.toast.show = false;
    }, 3500);
  },

  // Auth actions
  login(username, password) {
    const found = this.userList.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
    if (!found) {
      return { success: false, message: 'Username tidak ditemukan' };
    }
    if (found.password !== password) {
      return { success: false, message: 'Password salah' };
    }
    if (found.isLocked) {
      return { success: false, message: 'Akun Anda sedang terkunci (locked). Silakan hubungi Administrator.' };
    }

    this.currentUser = { ...found };
    this.save();
    return { success: true, user: this.currentUser };
  },

  logout() {
    this.currentUser = null;
    this.save();
  },

  switchRole(role) {
    const user = this.userList.find(u => u.role === role && !u.isLocked);
    if (user) {
      this.currentUser = { ...user };
      this.save();
      this.showToast(`Berhasil berganti peran ke: ${user.nama} (${user.role})`, 'info');
    }
  },

  // Kategori actions
  addKategori(kategori) {
    const exists = this.kategoriList.some(k => k.kode.toUpperCase() === kategori.kode.trim().toUpperCase());
    if (exists) {
      throw new Error(`Kode Kategori "${kategori.kode}" sudah digunakan!`);
    }
    const newId = Math.max(...this.kategoriList.map(k => k.id), 0) + 1;
    this.kategoriList.unshift({
      id: newId,
      kode: kategori.kode.trim().toUpperCase(),
      nama: kategori.nama.trim()
    });
    this.save();
    this.showToast('Kategori berhasil ditambahkan!');
  },

  updateKategori(id, data) {
    const exists = this.kategoriList.some(k => k.id !== id && k.kode.toUpperCase() === data.kode.trim().toUpperCase());
    if (exists) {
      throw new Error(`Kode Kategori "${data.kode}" sudah digunakan!`);
    }
    const index = this.kategoriList.findIndex(k => k.id === id);
    if (index !== -1) {
      this.kategoriList[index] = {
        ...this.kategoriList[index],
        kode: data.kode.trim().toUpperCase(),
        nama: data.nama.trim()
      };
      // update sub kategori and barang masuk cached names if any
      this.save();
      this.showToast('Kategori berhasil diperbarui!');
    }
  },

  deleteKategori(id) {
    // Check if sub categories exist
    const hasSub = this.subKategoriList.some(s => s.kategoriId === id);
    if (hasSub) {
      throw new Error('Kategori ini tidak dapat dihapus karena masih memiliki Sub Kategori!');
    }
    this.kategoriList = this.kategoriList.filter(k => k.id !== id);
    this.save();
    this.showToast('Kategori berhasil dihapus!');
  },

  // Sub Kategori actions
  addSubKategori(sub) {
    const newId = Math.max(...this.subKategoriList.map(s => s.id), 0) + 1;
    this.subKategoriList.unshift({
      id: newId,
      kategoriId: sub.kategoriId,
      nama: sub.nama.trim(),
      batasHarga: sub.batasHarga
    });
    this.save();
    this.showToast('Sub Kategori berhasil ditambahkan!');
  },

  updateSubKategori(id, data) {
    const index = this.subKategoriList.findIndex(s => s.id === id);
    if (index !== -1) {
      this.subKategoriList[index] = {
        ...this.subKategoriList[index],
        kategoriId: data.kategoriId,
        nama: data.nama.trim(),
        batasHarga: data.batasHarga
      };
      this.save();
      this.showToast('Sub Kategori berhasil diperbarui!');
    }
  },

  deleteSubKategori(id) {
    const hasBarang = this.barangMasukList.some(b => b.subKategoriId === id);
    if (hasBarang) {
      throw new Error('Sub Kategori tidak dapat dihapus karena sudah digunakan dalam transaksi Barang Masuk!');
    }
    this.subKategoriList = this.subKategoriList.filter(s => s.id !== id);
    this.save();
    this.showToast('Sub Kategori berhasil dihapus!');
  },

  // User management actions
  addUser(user) {
    const exists = this.userList.some(u => u.username.toLowerCase() === user.username.trim().toLowerCase());
    if (exists) {
      throw new Error(`Username "${user.username}" sudah digunakan!`);
    }
    const newId = Math.max(...this.userList.map(u => u.id), 0) + 1;
    this.userList.unshift({
      id: newId,
      role: user.role,
      username: user.username.trim(),
      nama: user.nama.trim(),
      email: user.email.trim(),
      password: user.password,
      isLocked: false
    });
    this.save();
    this.showToast('User berhasil didaftarkan!');
  },

  updateUser(id, data) {
    const exists = this.userList.some(u => u.id !== id && u.username.toLowerCase() === data.username.trim().toLowerCase());
    if (exists) {
      throw new Error(`Username "${data.username}" sudah digunakan!`);
    }
    const index = this.userList.findIndex(u => u.id === id);
    if (index !== -1) {
      this.userList[index] = {
        ...this.userList[index],
        role: data.role,
        username: data.username.trim(),
        nama: data.nama.trim(),
        email: data.email.trim(),
        ...(data.password ? { password: data.password } : {})
      };
      // If current user is modified, update session
      if (this.currentUser?.id === id) {
        this.currentUser = { ...this.userList[index] };
      }
      this.save();
      this.showToast('User berhasil diperbarui!');
    }
  },

  toggleLockUser(id) {
    const user = this.userList.find(u => u.id === id);
    if (!user) return;
    if (this.currentUser?.id === id) {
      throw new Error('Anda tidak dapat mengunci akun Anda sendiri!');
    }
    user.isLocked = !user.isLocked;
    this.save();
    this.showToast(user.isLocked ? `User ${user.nama} berhasil DIKUNCI!` : `User ${user.nama} berhasil DIBUKA!`, user.isLocked ? 'warning' : 'success');
  },

  deleteUser(id) {
    if (this.currentUser?.id === id) {
      throw new Error('Anda tidak dapat menghapus akun Anda sendiri!');
    }
    this.userList = this.userList.filter(u => u.id !== id);
    this.save();
    this.showToast('User berhasil dihapus!');
  },

  // Barang Masuk actions
  addBarangMasuk(payload) {
    const newId = Math.max(...this.barangMasukList.map(b => b.id), 0) + 1;
    const kategori = this.kategoriList.find(k => k.id === payload.kategoriId);
    const subKategori = this.subKategoriList.find(s => s.id === payload.subKategoriId);
    const operator = this.userList.find(u => u.id === payload.operatorId);

    const year = payload.tanggal ? new Date(payload.tanggal).getFullYear().toString() : new Date().getFullYear().toString();

    this.barangMasukList.unshift({
      id: newId,
      nomorSurat: payload.nomorSurat || `SRT/${year}/GEN/${String(newId).padStart(3, '0')}`,
      tanggal: payload.tanggal,
      tahun: year,
      asalBarang: payload.asalBarang.trim(),
      kategoriId: payload.kategoriId,
      kategoriNama: kategori ? kategori.nama : '-',
      subKategoriId: payload.subKategoriId,
      subKategoriNama: subKategori ? subKategori.nama : '-',
      batasHargaSubKategori: subKategori ? subKategori.batasHarga : 0,
      operatorId: payload.operatorId,
      operatorNama: operator ? operator.nama : 'Operator',
      lampiranName: payload.lampiranName || '',
      isVerified: false,
      items: payload.items,
      totalHarga: payload.totalHarga
    });
    this.save();
    this.showToast('Data Barang Masuk berhasil disimpan!');
  },

  updateBarangMasuk(id, payload) {
    const index = this.barangMasukList.findIndex(b => b.id === id);
    if (index === -1) return;

    const kategori = this.kategoriList.find(k => k.id === payload.kategoriId);
    const subKategori = this.subKategoriList.find(s => s.id === payload.subKategoriId);
    const operator = this.userList.find(u => u.id === payload.operatorId);
    const year = payload.tanggal ? new Date(payload.tanggal).getFullYear().toString() : new Date().getFullYear().toString();

    this.barangMasukList[index] = {
      ...this.barangMasukList[index],
      nomorSurat: payload.nomorSurat,
      tanggal: payload.tanggal,
      tahun: year,
      asalBarang: payload.asalBarang.trim(),
      kategoriId: payload.kategoriId,
      kategoriNama: kategori ? kategori.nama : '-',
      subKategoriId: payload.subKategoriId,
      subKategoriNama: subKategori ? subKategori.nama : '-',
      batasHargaSubKategori: subKategori ? subKategori.batasHarga : 0,
      operatorId: payload.operatorId,
      operatorNama: operator ? operator.nama : 'Operator',
      lampiranName: payload.lampiranName !== undefined ? payload.lampiranName : this.barangMasukList[index].lampiranName,
      items: payload.items,
      totalHarga: payload.totalHarga
    };
    this.save();
    this.showToast('Data Barang Masuk berhasil diperbarui!');
  },

  toggleVerifikasiBarangMasuk(id) {
    const item = this.barangMasukList.find(b => b.id === id);
    if (!item) return;
    item.isVerified = !item.isVerified;
    this.save();
    this.showToast(
      item.isVerified
        ? `Status data ${item.nomorSurat} diverifikasi (centang hijau)!`
        : `Verifikasi data ${item.nomorSurat} dibatalkan.`,
      item.isVerified ? 'success' : 'info'
    );
  },

  deleteBarangMasuk(id) {
    this.barangMasukList = this.barangMasukList.filter(b => b.id !== id);
    this.save();
    this.showToast('Data Barang Masuk berhasil dihapus!');
  },

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        currentUser: this.currentUser,
        kategoriList: this.kategoriList,
        subKategoriList: this.subKategoriList,
        userList: this.userList,
        barangMasukList: this.barangMasukList
      }));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  },

  resetToDefault() {
    localStorage.removeItem(STORAGE_KEY);
    this.currentUser = initialUsers[0];
    this.kategoriList = [...initialKategori];
    this.subKategoriList = [...initialSubKategori];
    this.userList = [...initialUsers];
    this.barangMasukList = [...initialBarangMasuk];
    this.showToast('Data mock berhasil di-reset ke nilai awal!', 'info');
  }
});
