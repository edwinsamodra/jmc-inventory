# ARRG - Sistem Pengelolaan Barang Sederhana

Aplikasi pengelolaan logistik & inventaris barang masuk berbasis web. Dibangun sesuai spesifikasi pada [BRIEF.md](file:///Users/edwinsamodra/Code/arrg/BRIEF.md), [FUNCTIONALITY.md](file:///Users/edwinsamodra/Code/arrg/FUNCTIONALITY.md), dan [TECHNICAL.md](file:///Users/edwinsamodra/Code/arrg/TECHNICAL.md).

---

## 🏗 Arsitektur Monorepo

```
arrg/
├── frontend/               # Vue.js 3 + Vite + Tailwind CSS + Vue Router
│   ├── src/
│   │   ├── components/     # Navbar, Sidebar, Toast, Modals (Print, Detail, Confirm)
│   │   ├── views/          # Login, BarangMasuk, FormBarangMasuk, Kategori, SubKategori, User
│   │   ├── store/          # Reactive Mock Store & LocalStorage persistence
│   │   ├── utils/          # Formatter Rupiah/Tanggal & Export Excel (.xlsx)
│   │   ├── router/         # Vue Router dengan Role-Based Guard (Admin vs Operator)
│   │   ├── App.vue
│   │   └── main.js
│   └── package.json
├── backend/                # Node.js + Express.js (Layered Architecture)
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── config/
│   │   └── server.js
│   └── package.json
├── docker-compose.yml      # MariaDB 11.4 container service
├── BRIEF.md                # Spesifikasi kebutuhan bisnis
├── FUNCTIONALITY.md        # Daftar modul halaman
└── TECHNICAL.md            # Spesifikasi teknologi
```

---

## 🚀 Menjalankan Aplikasi

### 1. Menjalankan Frontend UI (Mock Data Aktif)
Aplikasi frontend saat ini sudah siap diuji dengan data tiruan (mock data) interaktif yang tersimpan di browser:

```bash
cd frontend
npm install
npm run dev
```

Buka browser di: **http://localhost:5173**

### 2. Akun Demo untuk Pengujian Cepat
Pada halaman login tersedia tombol cepat untuk mengisi akun demo:
- **Admin**: Username: `admin` | Password: `Password123`
  - Memiliki akses ke seluruh modul: *Login, Barang Masuk, Master Kategori, Master Sub Kategori, Manajemen User*.
- **Operator**: Username: `budi_op` | Password: `Operator123`
  - Memiliki akses terbatas hanya ke: *Login dan Barang Masuk*.
- **Akun Terkunci (Demo)**: Username: `doni_lock` | Password: `Operator123`
  - Untuk memverifikasi validasi penolakan login saat user berstatus terkunci (*locked*).

> **Fitur Mode Tes Peran**: Di bagian header atas (*Navbar*), terdapat tombol toggle cepat **Admin** / **Operator** sehingga Anda dapat beralih peran seketika tanpa harus login/logout berulang kali.

---

## 📋 Fitur UI yang Sudah Dibuat

1. **Halaman Login**
   - Validasi username & password wajib diisi.
   - Deteksi akun berstatus *Locked* (tidak diizinkan masuk).
   - Tombol pengisian cepat (*quick-fill*) untuk demo.

2. **Daftar Barang Masuk (`/barang-masuk`)**
   - **Paginasi**: 10 data per halaman.
   - **Filter Kategori**: Dropdown kategori.
   - **Filter Sub Kategori**: Dropdown dinamis menyesuaikan kategori yang dipilih.
   - **Filter Tahun**: Pilihan tahun transaksi.
   - **Pencarian**: Berdasarkan Asal Barang atau Sub Kategori.
   - **Pengurutan (Sorting)**: Berdasarkan Tanggal, Asal Barang, dan Total Harga.
   - **Export Excel**: Tombol ekspor langsung mengunduh file `.xlsx` sesuai filter dan pencarian aktif.
   - **Cetak Surat Masuk**: Menampilkan modal pratinjau surat bukti penerimaan resmi dengan format kop surat, rincian item, batas pagu, tanda tangan, dan tombol print dokumen (`window.print()`).
   - **Status Verifikasi (Kolom Paling Kanan)**: Tombol centang hijau yang dapat diklik langsung untuk memverifikasi atau membatalkan status verifikasi baris data.

3. **Form Tambah / Edit Barang Masuk (`/barang-masuk/tambah`)**
   - **Informasi Umum**:
     - *Operator*: Admin dapat memilih dari daftar user operator; untuk Operator otomatis terkunci pada dirinya sendiri.
     - *Kategori & Sub Kategori*: Pilihan Sub Kategori dinamis mengikuti Kategori.
     - *Batas Harga*: Readonly otomatis menampilkan batas plafon harga sub kategori.
     - *Asal Barang*: Maksimal 200 karakter dengan penghitung karakter.
     - *Nomor Surat*: Maksimal 100 karakter.
     - *Lampiran*: File picker pendukung format `.doc`, `.docx`, `.zip`.
   - **Informasi Barang (Multi-line Items)**:
     - Input dinamis: Tambah baris item (+) dan Hapus baris item (×).
     - Input harga dengan masking Rupiah (contoh: `Rp 55.000`).
     - Total baris otomatis dihitung (`Harga × Jumlah`).
     - Tanggal expired (opsional).
   - **Validasi Plafon Anggaran**:
     - Total keseluruhan dihitung otomatis realtime.
     - Apabila total melebihi Batas Harga Sub Kategori, muncul banner peringatan merah tebal dan tombol simpan dinonaktifkan.

4. **Master Data: Kategori (`/master/kategori`)**
   - Paginasi 10 data per halaman & pencarian kode/nama.
   - Modal popup Tambah & Edit dengan validasi kode kategori unik (maks. 10 karakter).

5. **Master Data: Sub Kategori (`/master/sub-kategori`)**
   - Paginasi 10 data per halaman & pencarian kategori/sub kategori.
   - Modal popup Tambah & Edit dengan pilihan Kategori, nama sub kategori, dan masking Rupiah untuk batas harga.

6. **Manajemen User (`/users`)**
   - Paginasi 10 data per halaman & pencarian nama/username.
   - Filter role (Admin / Operator).
   - Tombol **Lock/Unlock**: Mengunci atau membuka akses login pengguna.
   - Modal popup Tambah & Edit: Validasi nama & username (8-100 karakter), email valid, dan validasi checklist ketentuan password (minimal 8 karakter, kombinasi huruf besar, huruf kecil, dan angka).
