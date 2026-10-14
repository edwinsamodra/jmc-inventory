import http from 'http';
import app from '../server.js';
import { runMigrationAndSeed } from './seed.js';

const PORT = 3999;
let server;

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(body);
          } catch (e) {
            parsed = body;
          }
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        });
      }
    );

    req.on('error', reject);

    if (postData) {
      if (typeof postData === 'string') {
        req.write(postData);
      } else {
        req.write(JSON.stringify(postData));
      }
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Memulai rangkaian pengujian API Backend JMC Inventory...\n');

  // 1. Reset database ke data awal
  await runMigrationAndSeed();

  // 2. Start server di test port
  server = app.listen(PORT);
  console.log(`Server uji coba aktif pada port ${PORT}\n`);

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // ----------------------------------------------------
    // TEST 1: Health Check & Swagger
    // ----------------------------------------------------
    console.log('--- TEST GROUP 1: Health & Docs ---');
    const healthRes = await request({ path: '/api/health', method: 'GET' });
    assert(healthRes.status === 200 && healthRes.body.status === 'ok', 'GET /api/health mengembalikan 200 OK');

    const swaggerRes = await request({ path: '/api-docs.json', method: 'GET' });
    assert(swaggerRes.status === 200 && swaggerRes.body.openapi === '3.0.3', 'GET /api-docs.json mengembalikan OpenAPI 3.0.3');

    // ----------------------------------------------------
    // TEST 2: Autentikasi & Akun Terkunci (isLocked)
    // ----------------------------------------------------
    console.log('\n--- TEST GROUP 2: Autentikasi & Sesi ---');
    // Salah password
    const wrongPassRes = await request({ path: '/api/auth/login', method: 'POST' }, { username: 'admin', password: 'WrongPassword' });
    assert(wrongPassRes.status === 401, 'Login salah password ditolak dengan HTTP 401');

    // Login Operator (operator)
    const operatorLogin = await request({ path: '/api/auth/login', method: 'POST' }, { username: 'operator', password: 'Boleh@123' });
    assert(operatorLogin.status === 200 && operatorLogin.body.data.token, 'Login operator berhasil mengembalikan JWT');
    const operatorToken = operatorLogin.body.data.token;

    // Login Admin (administrator)
    const adminLogin = await request({ path: '/api/auth/login', method: 'POST' }, { username: 'administrator', password: 'Boleh@123' });
    assert(adminLogin.status === 200 && adminLogin.body.data.user.role === 'Admin', 'Login super admin berhasil mengembalikan JWT');
    const adminToken = adminLogin.body.data.token;

    // GET /api/auth/me
    const meRes = await request({ path: '/api/auth/me', method: 'GET', headers: { Authorization: `Bearer ${adminToken}` } });
    assert(meRes.status === 200 && meRes.body.data.username === 'administrator', 'GET /api/auth/me berhasil mengembalikan profil admin');

    // ----------------------------------------------------
    // TEST 3: Otorisasi Berbasis Peran (RBAC)
    // ----------------------------------------------------
    console.log('\n--- TEST GROUP 3: Otorisasi Berbasis Peran (RBAC) ---');
    // Operator mengakses Manajemen User (harus ditolak 403)
    const opAccessUser = await request({ path: '/api/users', method: 'GET', headers: { Authorization: `Bearer ${operatorToken}` } });
    assert(opAccessUser.status === 403, 'Operator dilarang mengakses GET /api/users (HTTP 403)');

    // Operator membuat Kategori (harus ditolak 403)
    const opCreateKat = await request({ path: '/api/kategori', method: 'POST', headers: { Authorization: `Bearer ${operatorToken}` } }, { kode: 'TEST', nama: 'Test' });
    assert(opCreateKat.status === 403, 'Operator dilarang mengakses POST /api/kategori (HTTP 403)');

    // Operator membaca Kategori untuk combobox (harus diperbolehkan 200)
    const opReadKat = await request({ path: '/api/kategori', method: 'GET', headers: { Authorization: `Bearer ${operatorToken}` } });
    assert(opReadKat.status === 200 && Array.isArray(opReadKat.body.data), 'Operator diizinkan membaca GET /api/kategori untuk pilihan dropdown');

    // ----------------------------------------------------
    // TEST 4: Master Kategori (CRUD & Validasi)
    // ----------------------------------------------------
    console.log('\n--- TEST GROUP 4: Master Kategori CRUD ---');
    // Tambah Kategori
    const addKatRes = await request(
      { path: '/api/kategori', method: 'POST', headers: { Authorization: `Bearer ${adminToken}` } },
      { kode: 'TESK', nama: 'Kategori Uji Coba' }
    );
    assert(addKatRes.status === 201 && addKatRes.body.data.kode === 'TESK', 'Admin berhasil menambah kategori baru');
    const createdKatId = addKatRes.body.data.id;

    // Validasi Kode Unik
    const duplicateKatRes = await request(
      { path: '/api/kategori', method: 'POST', headers: { Authorization: `Bearer ${adminToken}` } },
      { kode: 'TESK', nama: 'Kategori Duplikat' }
    );
    assert(duplicateKatRes.status === 409, 'Penambahan kode kategori duplikat ditolak HTTP 409');

    // Hapus Kategori yang masih punya Sub Kategori (id 1: ATK) -> RESTRICT
    const deleteKatRestrict = await request(
      { path: '/api/kategori/1', method: 'DELETE', headers: { Authorization: `Bearer ${adminToken}` } }
    );
    assert(deleteKatRestrict.status === 400, 'Hapus kategori dengan sub kategori ditolak dengan HTTP 400 (RESTRICT)');

    // Hapus Kategori uji coba yang tidak punya relasi
    const deleteKatOk = await request(
      { path: `/api/kategori/${createdKatId}`, method: 'DELETE', headers: { Authorization: `Bearer ${adminToken}` } }
    );
    assert(deleteKatOk.status === 200, 'Hapus kategori mandiri tanpa dependensi berhasil');

    // ----------------------------------------------------
    // TEST 5: Master Sub Kategori (CRUD & Validasi)
    // ----------------------------------------------------
    console.log('\n--- TEST GROUP 5: Master Sub Kategori CRUD ---');
    const addSubKat = await request(
      { path: '/api/sub-kategori', method: 'POST', headers: { Authorization: `Bearer ${adminToken}` } },
      { kategoriId: 1, nama: 'Sub Kategori Uji', batasHarga: 2500000 }
    );
    assert(addSubKat.status === 201 && addSubKat.body.data.batasHarga === 2500000, 'Admin berhasil menambah Sub Kategori');
    const createdSubKatId = addSubKat.body.data.id;

    // Hapus Sub Kategori yang sudah memiliki transaksi Barang Masuk (id 1) -> RESTRICT
    const delSubKatRestrict = await request(
      { path: '/api/sub-kategori/1', method: 'DELETE', headers: { Authorization: `Bearer ${adminToken}` } }
    );
    assert(delSubKatRestrict.status === 400, 'Hapus Sub Kategori berelasi Barang Masuk ditolak HTTP 400');

    // Hapus Sub Kategori uji coba
    const delSubKatOk = await request(
      { path: `/api/sub-kategori/${createdSubKatId}`, method: 'DELETE', headers: { Authorization: `Bearer ${adminToken}` } }
    );
    assert(delSubKatOk.status === 200, 'Hapus Sub Kategori mandiri berhasil');

    // ----------------------------------------------------
    // TEST 6: Manajemen User (Validasi Password & Lock)
    // ----------------------------------------------------
    console.log('\n--- TEST GROUP 6: Manajemen User & Password Rule ---');
    // Validasi Password Lemah (tidak ada angka / huruf besar)
    const weakUserRes = await request(
      { path: '/api/users', method: 'POST', headers: { Authorization: `Bearer ${adminToken}` } },
      { role: 'Operator', username: 'usertest1', password: 'password', nama: 'User Test 1', email: 'test@jmc.local' }
    );
    assert(weakUserRes.status === 422, 'Password tanpa huruf besar & angka ditolak HTTP 422');

    // Tambah User Valid
    const validUserRes = await request(
      { path: '/api/users', method: 'POST', headers: { Authorization: `Bearer ${adminToken}` } },
      { role: 'Operator', username: 'usertest1', password: 'Password123', nama: 'User Test Satu', email: 'user.test1@jmc.local' }
    );
    assert(validUserRes.status === 201 && validUserRes.body.data.username === 'usertest1', 'User baru dengan password valid berhasil dibuat');
    const createdUserId = validUserRes.body.data.id;

    // Toggle Lock User
    const lockToggleRes = await request(
      { path: `/api/users/${createdUserId}/lock`, method: 'PATCH', headers: { Authorization: `Bearer ${adminToken}` } }
    );
    assert(lockToggleRes.status === 200 && lockToggleRes.body.data.isLocked === true, 'Admin berhasil mengunci akun pengguna (isLocked: true)');

    // Login akun terkunci (isLocked)
    const lockedLoginRes = await request(
      { path: '/api/auth/login', method: 'POST' },
      { username: 'usertest1', password: 'Password123' }
    );
    assert(lockedLoginRes.status === 403 && lockedLoginRes.body.message.includes('terkunci'), 'Login akun yang terkunci ditolak dengan HTTP 403 (Locked)');

    // Admin mencoba mengunci diri sendiri
    const lockSelfRes = await request(
      { path: '/api/users/1/lock', method: 'PATCH', headers: { Authorization: `Bearer ${adminToken}` } }
    );
    assert(lockSelfRes.status === 400, 'Admin dilarang mengunci akun dirinya sendiri');

    // ----------------------------------------------------
    // TEST 7: Barang Masuk (Validasi Plafon Batas Harga & Fitur)
    // ----------------------------------------------------
    console.log('\n--- TEST GROUP 7: Barang Masuk & Validasi Batas Harga ---');
    // Sub Kategori id: 1 batasHarga = 5.000.000
    // Coba simpan transaksi dengan total 6.000.000 (melebihi batas plafon)
    const exceedPlafonRes = await request(
      { path: '/api/barang-masuk', method: 'POST', headers: { Authorization: `Bearer ${operatorToken}` } },
      {
        nomorSurat: 'SRT/TEST/001',
        tanggal: '2026-04-14',
        asalBarang: 'PT Toko Kertas',
        kategoriId: 1,
        subKategoriId: 1,
        items: [
          { namaBarang: 'Kertas Kualitas Ekstra', harga: 2000000, jumlah: 3, satuan: 'Box' } // Total 6.000.000
        ]
      }
    );
    assert(
      exceedPlafonRes.status === 422 && exceedPlafonRes.body.errors[0].includes('melebihi Batas Plafon Anggaran'),
      'Transaksi melebihi Batas Plafon Sub Kategori DITOLAK dengan pesan validasi yang jelas'
    );

    // Simpan transaksi valid (Total 3.000.000 <= 5.000.000)
    const validBmRes = await request(
      { path: '/api/barang-masuk', method: 'POST', headers: { Authorization: `Bearer ${operatorToken}` } },
      {
        nomorSurat: 'SRT/TEST/002',
        tanggal: '2026-04-14',
        asalBarang: 'PT Toko Kertas Nusantara',
        kategoriId: 1,
        subKategoriId: 1,
        items: [
          { namaBarang: 'Kertas HVS Standar', harga: 50000, jumlah: 60, satuan: 'Rim' } // Total 3.000.000
        ]
      }
    );
    assert(
      validBmRes.status === 201 && validBmRes.body.data.totalHarga === 3000000,
      'Transaksi dalam batas plafon berhasil disimpan dengan perhitungan total otomatis'
    );
    const createdBmId = validBmRes.body.data.id;

    // Toggle Verifikasi (Centang Hijau)
    const toggleVerifRes = await request(
      { path: `/api/barang-masuk/${createdBmId}/verifikasi`, method: 'PATCH', headers: { Authorization: `Bearer ${operatorToken}` } }
    );
    assert(
      toggleVerifRes.status === 200 && toggleVerifRes.body.data.isVerified === true,
      'Toggle verifikasi transaksi berhasil mengubah status centang hijau (isVerified: true)'
    );

    // Cetak Surat Masuk
    const cetakRes = await request(
      { path: `/api/barang-masuk/${createdBmId}/cetak`, method: 'GET', headers: { Authorization: `Bearer ${operatorToken}` } }
    );
    assert(
      cetakRes.status === 200 && cetakRes.body.data.terbilang.includes('Tiga Juta Rupiah'),
      'Endpoint cetak surat menghasilkan dokumen resmi lengkap dengan kalimat terbilang Rupiah'
    );

    // Export Excel
    const excelRes = await request(
      { path: '/api/barang-masuk/export/excel', method: 'GET', headers: { Authorization: `Bearer ${operatorToken}` } }
    );
    assert(
      excelRes.status === 200 && excelRes.headers['content-type'].includes('spreadsheetml'),
      'GET /api/barang-masuk/export/excel mengembalikan file stream spreadsheet XLSX'
    );

    console.log(`\n========================================`);
    console.log(`HASIL AKHIR PENGUJIAN:`);
    console.log(`Total Pengujian Berhasil : ${passed}`);
    console.log(`Total Pengujian Gagal    : ${failed}`);
    console.log(`========================================\n`);

    if (failed === 0) {
      console.log('🎉 SEMUA PENGUJIAN LAYERED ARCHITECTURE BACKEND LULUS 100%!');
    }
  } catch (err) {
    console.error('Fatal error during test:', err);
  } finally {
    if (server) server.close();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
