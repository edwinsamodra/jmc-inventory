import http from 'http';
import app from '../server.js';
import { runMigrationAndSeed } from './seed.js';

const PORT = 3999;
let server;

function createMultipartFormData(fields, file = null) {
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  const crlf = '\r\n';
  const parts = [];

  for (const [key, val] of Object.entries(fields)) {
    const stringVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
    parts.push(
      `--${boundary}${crlf}Content-Disposition: form-data; name="${key}"${crlf}${crlf}${stringVal}${crlf}`
    );
  }

  if (file) {
    parts.push(
      `--${boundary}${crlf}Content-Disposition: form-data; name="${file.fieldname}"; filename="${file.filename}"${crlf}Content-Type: ${file.contentType || 'application/octet-stream'}${crlf}${crlf}`
    );
  }

  const headerPart = Buffer.from(parts.join(''), 'utf-8');
  const fileContent = file ? (Buffer.isBuffer(file.content) ? file.content : Buffer.from(file.content)) : Buffer.alloc(0);
  const footerPart = Buffer.from(`${file ? crlf : ''}--${boundary}--${crlf}`, 'utf-8');

  const body = Buffer.concat([headerPart, fileContent, footerPart]);

  return {
    contentType: `multipart/form-data; boundary=${boundary}`,
    body
  };
}

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    if (postData && Buffer.isBuffer(postData)) {
      headers['Content-Length'] = postData.length;
    }

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        ...options,
        headers
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
      if (Buffer.isBuffer(postData)) {
        req.write(postData);
      } else if (typeof postData === 'string') {
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

    // Login tanpa username/password (wajib diisi)
    const emptyLoginRes = await request({ path: '/api/auth/login', method: 'POST' }, { username: '', password: '' });
    assert(emptyLoginRes.status === 400, 'Login dengan username/password kosong ditolak HTTP 400 (Wajib diisi)');

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

    // Validasi Kode Kategori > 10 karakter
    const longKodeKat = await request(
      { path: '/api/kategori', method: 'POST', headers: { Authorization: `Bearer ${adminToken}` } },
      { kode: 'KODELEBIH10CHAR', nama: 'Kategori Valid' }
    );
    assert(longKodeKat.status === 422, 'Kode Kategori > 10 karakter ditolak HTTP 422');

    // Validasi Nama Kategori kosong
    const emptyNamaKat = await request(
      { path: '/api/kategori', method: 'POST', headers: { Authorization: `Bearer ${adminToken}` } },
      { kode: 'VALID', nama: '' }
    );
    assert(emptyNamaKat.status === 422, 'Nama Kategori kosong ditolak HTTP 422');

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

    // Validasi Batas Harga bernilai negatif
    const negativeBatasHarga = await request(
      { path: '/api/sub-kategori', method: 'POST', headers: { Authorization: `Bearer ${adminToken}` } },
      { kategoriId: 1, nama: 'Sub Kategori Negatif', batasHarga: -50000 }
    );
    assert(negativeBatasHarga.status === 422, 'Batas Harga bernilai negatif ditolak HTTP 422');

    // Validasi Duplikasi Nama pada Kategori yang sama
    const duplicateSubKat = await request(
      { path: '/api/sub-kategori', method: 'POST', headers: { Authorization: `Bearer ${adminToken}` } },
      { kategoriId: 1, nama: 'Sub Kategori Uji', batasHarga: 1000000 }
    );
    assert(duplicateSubKat.status === 409, 'Penambahan Sub Kategori dengan nama duplikat pada kategori yang sama ditolak HTTP 409');

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

    // Validasi Username < 8 karakter (harus 8-100)
    const shortUsernameRes = await request(
      { path: '/api/users', method: 'POST', headers: { Authorization: `Bearer ${adminToken}` } },
      { role: 'Operator', username: 'user123', password: 'Password123', nama: 'Nama Pengguna Valid', email: 'user123@jmc.local' }
    );
    assert(shortUsernameRes.status === 422, 'Username < 8 karakter ditolak HTTP 422');

    // Validasi Nama < 8 karakter (harus 8-100)
    const shortNamaRes = await request(
      { path: '/api/users', method: 'POST', headers: { Authorization: `Bearer ${adminToken}` } },
      { role: 'Operator', username: 'userpjg1', password: 'Password123', nama: 'Pendek', email: 'userpjg1@jmc.local' }
    );
    assert(shortNamaRes.status === 422, 'Nama < 8 karakter ditolak HTTP 422');

    // Validasi Format Email tidak valid / panjang < 8
    const invalidEmailRes = await request(
      { path: '/api/users', method: 'POST', headers: { Authorization: `Bearer ${adminToken}` } },
      { role: 'Operator', username: 'userpjg2', password: 'Password123', nama: 'Nama Pengguna Valid', email: 'bukanemail' }
    );
    assert(invalidEmailRes.status === 422, 'Email berformat tidak valid ditolak HTTP 422');

    // Validasi Duplikasi Username (409)
    const duplicateUserRes = await request(
      { path: '/api/users', method: 'POST', headers: { Authorization: `Bearer ${adminToken}` } },
      { role: 'Operator', username: 'usertest1', password: 'Password123', nama: 'User Duplikat Test', email: 'lain@jmc.local' }
    );
    assert(duplicateUserRes.status === 409, 'Username duplikat ditolak HTTP 409');

    // Validasi Duplikasi Email (409)
    const duplicateEmailRes = await request(
      { path: '/api/users', method: 'POST', headers: { Authorization: `Bearer ${adminToken}` } },
      { role: 'Operator', username: 'usertest2', password: 'Password123', nama: 'User Duplikat Email', email: 'user.test1@jmc.local' }
    );
    assert(duplicateEmailRes.status === 409, 'Email duplikat ditolak HTTP 409');

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

    // Validasi Barang Masuk tanpa baris item (items: [])
    const emptyItemsRes = await request(
      { path: '/api/barang-masuk', method: 'POST', headers: { Authorization: `Bearer ${operatorToken}` } },
      {
        nomorSurat: 'SRT/TEST/003',
        tanggal: '2026-04-14',
        asalBarang: 'PT Toko Kertas Nusantara',
        kategoriId: 1,
        subKategoriId: 1,
        items: []
      }
    );
    assert(emptyItemsRes.status === 422, 'Barang Masuk tanpa baris item ditolak HTTP 422');

    // Validasi Item dengan Jumlah < 1 (0)
    const zeroJumlahRes = await request(
      { path: '/api/barang-masuk', method: 'POST', headers: { Authorization: `Bearer ${operatorToken}` } },
      {
        tanggal: '2026-04-14',
        asalBarang: 'PT Toko Kertas Nusantara',
        kategoriId: 1,
        subKategoriId: 1,
        items: [
          { namaBarang: 'Kertas HVS', harga: 50000, jumlah: 0, satuan: 'Rim' }
        ]
      }
    );
    assert(zeroJumlahRes.status === 422, 'Item dengan jumlah barang < 1 ditolak HTTP 422');

    // Validasi Item dengan Harga negatif (< 0)
    const negativeHargaRes = await request(
      { path: '/api/barang-masuk', method: 'POST', headers: { Authorization: `Bearer ${operatorToken}` } },
      {
        tanggal: '2026-04-14',
        asalBarang: 'PT Toko Kertas Nusantara',
        kategoriId: 1,
        subKategoriId: 1,
        items: [
          { namaBarang: 'Kertas HVS', harga: -1000, jumlah: 1, satuan: 'Rim' }
        ]
      }
    );
    assert(negativeHargaRes.status === 422, 'Item dengan harga negatif ditolak HTTP 422');

    // Validasi Asal Barang > 200 karakter
    const longAsalRes = await request(
      { path: '/api/barang-masuk', method: 'POST', headers: { Authorization: `Bearer ${operatorToken}` } },
      {
        tanggal: '2026-04-14',
        asalBarang: 'A'.repeat(201),
        kategoriId: 1,
        subKategoriId: 1,
        items: [
          { namaBarang: 'Kertas HVS', harga: 50000, jumlah: 1, satuan: 'Rim' }
        ]
      }
    );
    assert(longAsalRes.status === 422, 'Asal Barang > 200 karakter ditolak HTTP 422');

    // Validasi Sub Kategori tidak sesuai Kategori induk
    const mismatchSubKatRes = await request(
      { path: '/api/barang-masuk', method: 'POST', headers: { Authorization: `Bearer ${operatorToken}` } },
      {
        tanggal: '2026-04-14',
        asalBarang: 'PT Toko Kertas Nusantara',
        kategoriId: 1, // Kategori 1 (ATK)
        subKategoriId: 3, // Sub Kategori 3 milik Kategori 2 (Elektronik)
        items: [
          { namaBarang: 'Kertas HVS', harga: 50000, jumlah: 1, satuan: 'Rim' }
        ]
      }
    );
    assert(mismatchSubKatRes.status === 422, 'Sub Kategori tidak sesuai Kategori induk ditolak HTTP 422');

    // Validasi Upload Lampiran dengan format TIDAK SAH (.pdf)
    const invalidUploadData = createMultipartFormData(
      {
        tanggal: '2026-04-14',
        asalBarang: 'PT Toko Komputer',
        kategoriId: 2,
        subKategoriId: 3,
        items: JSON.stringify([{ namaBarang: 'Mouse USB', harga: 100000, jumlah: 1, satuan: 'Pcs' }])
      },
      {
        fieldname: 'lampiran',
        filename: 'dokumen.pdf',
        contentType: 'application/pdf',
        content: Buffer.from('%PDF-1.4 dummy pdf content')
      }
    );
    const invalidUploadRes = await request(
      {
        path: '/api/barang-masuk',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${operatorToken}`,
          'Content-Type': invalidUploadData.contentType
        }
      },
      invalidUploadData.body
    );
    assert(
      invalidUploadRes.status === 422 && invalidUploadRes.body.message.includes('Hanya file dengan ekstensi .doc, .docx, atau .zip'),
      'Upload file lampiran dengan format tidak diizinkan (.pdf) ditolak HTTP 422'
    );

    // Validasi Upload Lampiran dengan format SAH (.docx)
    const validUploadData = createMultipartFormData(
      {
        tanggal: '2026-04-14',
        asalBarang: 'PT Solusi Komputer',
        kategoriId: 2,
        subKategoriId: 3,
        items: JSON.stringify([{ namaBarang: 'Keyboard USB', harga: 150000, jumlah: 1, satuan: 'Pcs' }])
      },
      {
        fieldname: 'lampiran',
        filename: 'surat_jalan.docx',
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        content: Buffer.from('dummy docx content')
      }
    );
    const validUploadRes = await request(
      {
        path: '/api/barang-masuk',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${operatorToken}`,
          'Content-Type': validUploadData.contentType
        }
      },
      validUploadData.body
    );
    assert(
      validUploadRes.status === 201 && validUploadRes.body.data.lampiranName.includes('.docx'),
      'Upload file lampiran dengan ekstensi yang diizinkan (.docx) berhasil (HTTP 201)'
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

    // Toggle Verifikasi Per Item (Centang Hijau Per Item)
    const firstItemId = validBmRes.body.data.items[0].id;
    const toggleItemRes = await request(
      { path: `/api/barang-masuk/${createdBmId}/items/${firstItemId}/verifikasi`, method: 'PATCH', headers: { Authorization: `Bearer ${operatorToken}` } }
    );
    assert(
      toggleItemRes.status === 200 && toggleItemRes.body.data.item.isVerified === false,
      'Toggle verifikasi status per item (barang_masuk_item) berhasil'
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
