# JMC Inventory

## Informasi Aplikasi

| Informasi | Keterangan / Link |
| :--- | :--- |
| **1. Link Deployment (Live App)** | [https://jmc-inventory-mgmt.pages.dev](https://jmc-inventory-mgmt.pages.dev) *(atau sesuaikan dengan URL deployment aktif Anda)* |
| **2. Link Video Demo** | [https://youtu.be/your-demo-video-id](https://youtu.be/your-demo-video-id) *(atau link Google Drive / Loom / YouTube demo)* |
| **3. Tech Stack** | **Frontend:** Vue.js 3 (Composition API), Vite<br>**Backend:** Node.js, Express.js (Layered Architecture - Controller, Service, Repository)<br>**Database:** MariaDB 12.3 |

---

## Akun Pengujian (Kredensial)

Aplikasi menggunakan autentikasi nyata berbasis JWT yang terhubung langsung ke database MariaDB. Gunakan kredensial pengguna hasil seed berikut untuk login ke sistem:

| Peran (Role) | Username | Password | Nama | Email | Hak Akses & Keterangan |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Administrator (Admin)** | `administrator` | `Boleh@123` | Administrator | `admin@example.com` | Akses penuh: Transaksi Barang Masuk, Master Data Kategori, Master Sub Kategori, dan Manajemen Pengguna. |
| **Operator** | `operator` | `Boleh@123` | Operator | `operator@example.com` | Akses operasional: Input, filter/pencarian, toggle verifikasi, cetak surat masuk, dan ekspor spreadsheet XLSX Barang Masuk. |

> **Catatan Pengujian Akun Terkunci (isLocked):**  
> Admin dapat menguji fitur pembatasan akun terkunci secara langsung melalui menu **Manajemen User** dengan menekan tombol kunci/gembok. Akun pengguna yang berstatus terkunci akan langsung ditolak saat mencoba login (HTTP 403 Forbidden).

---

## Petunjuk Instalasi Lokal

### Prasyarat
- Node.js (LTS)
- npm / pnpm / yarn
- Docker & Docker Compose (opsional, untuk service MariaDB)

### Cara Menjalankan dengan Docker Compose

Seluruh service (Frontend, Backend, dan Database) dapat langsung dijalankan bersamaan menggunakan Docker Compose:

- **Node.js**: `node:24-alpine` (digunakan pada backend service & proses build frontend)
- **MariaDB**: `mariadb:12.3`
- **Frontend Server**: Nginx Alpine (Reverse proxy port `8080` -> internal backend port `3000`)

```bash
# 1. Jalankan semua container (Frontend, Backend, MariaDB)
docker compose up -d --build

# 2. Cek status container
docker compose ps
```

Akses layanan di dev mode:
- **Frontend App**: [http://localhost:8080](http://localhost:8080) (atau http://localhost:5173 jika dijalankan via npm dev lokal)
- **Backend API**: [http://localhost:3000](http://localhost:3000) (Health check: `http://localhost:3000/api/health`)
- **MariaDB Database**: `localhost:3306` (User: `jmc_user`, Database: `jmc_inventory`)

---

### Cara Menjalankan Tanpa Docker

#### A. Clone Repository
```bash
git clone https://github.com/edwinsamodra/jmc-inventory-mgmt.git
cd jmc-inventory-mgmt
```

#### B. Menjalankan Database
```bash
docker compose up -d mariadb
```

#### C. Menjalankan Backend API
```bash
cd backend
cp .env.example .env
npm install
npm run db:seed   # Menanam data awal: 1 Admin, 1 Operator, Master Data, & Transaksi
npm run dev
```

#### D. Menjalankan Frontend Web App
Buka terminal baru:
```bash
cd frontend
npm install
npm run dev
```
> Buka browser di: **http://localhost:5173**
