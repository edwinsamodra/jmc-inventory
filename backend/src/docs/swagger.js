const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'JMC Inventory Management API Documentation',
    version: '1.0.0',
    description: `
Dokumentasi spesifikasi HTTP Request & Response API untuk sistem Pengelolaan Barang Masuk dan Master Data JMC.
API ini mengimplementasikan autentikasi JWT, validasi input berlapis (termasuk validasi plafon anggaran batas harga sub kategori), dan layered architecture.

### Ringkasan Fitur & Hak Akses:
- **Autentikasi**: Login, Logout, dan Verifikasi Sesi Token (Admin & Operator).
- **Master Data Kategori**: CRUD kategori inventaris (Khusus Admin).
- **Master Data Sub Kategori**: CRUD sub kategori dengan pembatasan pagu harga (Khusus Admin).
- **Barang Masuk**: CRUD transaksi penerimaan barang multi-item, validasi plafon harga, upload lampiran (.doc/.docx/.zip), toggle status verifikasi centang hijau, cetak surat masuk, dan ekspor data Excel (Admin & Operator).
- **Manajemen User**: CRUD pengguna dan toggle status lock akun (Khusus Admin).
    `,
    contact: {
      name: 'Tim Pengembang Sistem JMC Inventory',
      email: 'dev@jmcinventory.local'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local Development Server'
    }
  ],
  tags: [
    {
      name: 'Autentikasi',
      description: 'Endpoint untuk proses login, validasi status lock, verifikasi sesi, dan logout pengguna.'
    },
    {
      name: 'Master Kategori',
      description: 'Pengelolaan data kategori barang inventaris (CRUD, pencarian, dan validasi kode unik).'
    },
    {
      name: 'Master Sub Kategori',
      description: 'Pengelolaan sub kategori beserta batas harga pagu per kategori.'
    },
    {
      name: 'Barang Masuk',
      description: 'Pengelolaan transaksi penerimaan barang masuk, item multi-line, validasi batas harga, verifikasi centang hijau, cetak surat, dan export Excel.'
    },
    {
      name: 'Manajemen User',
      description: 'Pengelolaan akun pengguna (Admin/Operator), validasi password ketat, dan fitur Lock/Unlock user.'
    }
  ],
  paths: {
    // ==========================================
    // 1. AUTENTIKASI
    // ==========================================
    '/api/auth/login': {
      post: {
        tags: ['Autentikasi'],
        summary: 'Login pengguna ke sistem',
        description: 'Melakukan autentikasi menggunakan username dan password. Jika akun dalam status locked (terkunci), akses akan ditolak dengan status HTTP 403.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LoginRequest'
              },
              example: {
                username: 'admin',
                password: 'Password123'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Login berhasil, token dan profil pengguna dikembalikan.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/LoginSuccessResponse'
                },
                example: {
                  success: true,
                  message: 'Login berhasil',
                  data: {
                    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJBZG1pbiJ9...',
                    user: {
                      id: 1,
                      role: 'Admin',
                      username: 'admin',
                      nama: 'Super Administrator',
                      email: 'admin@jmcinventory.local',
                      isLocked: false
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Permintaan tidak valid (username atau password belum diisi).',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: {
                  success: false,
                  message: 'Username dan password wajib diisi!'
                }
              }
            }
          },
          '401': {
            description: 'Username atau password salah.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: {
                  success: false,
                  message: 'Kombinasi username atau password salah'
                }
              }
            }
          },
          '403': {
            description: 'Akun berstatus terkunci (locked).',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: {
                  success: false,
                  message: 'Akun Anda sedang terkunci (locked). Silakan hubungi Administrator.'
                }
              }
            }
          }
        }
      }
    },
    '/api/auth/me': {
      get: {
        tags: ['Autentikasi'],
        summary: 'Mendapatkan profil pengguna aktif saat ini',
        description: 'Memeriksa keabsahan token JWT dan mengembalikan profil pengguna yang sedang login.',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': {
            description: 'Profil pengguna aktif.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/UserProfileResponse'
                },
                example: {
                  success: true,
                  data: {
                    id: 1,
                    role: 'Admin',
                    username: 'admin',
                    nama: 'Super Administrator',
                    email: 'admin@jmcinventory.local',
                    isLocked: false
                  }
                }
              }
            }
          },
          '401': {
            description: 'Token tidak valid, kedaluwarsa, atau tidak disediakan.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/api/auth/logout': {
      post: {
        tags: ['Autentikasi'],
        summary: 'Logout pengguna dari sistem',
        description: 'Mencabut sesi autentikasi pengguna aktif.',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': {
            description: 'Logout berhasil.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SimpleMessageResponse'
                },
                example: {
                  success: true,
                  message: 'Logout berhasil'
                }
              }
            }
          },
          '401': {
            description: 'Token tidak valid atau tidak disediakan.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },

    // ==========================================
    // 2. MASTER DATA: KATEGORI
    // ==========================================
    '/api/kategori': {
      get: {
        tags: ['Master Kategori'],
        summary: 'Daftar semua kategori barang',
        description: 'Mengambil daftar kategori inventaris dengan dukungan pencarian kata kunci dan paginasi.',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'search',
            in: 'query',
            description: 'Pencarian berdasarkan kode atau nama kategori',
            required: false,
            schema: { type: 'string' },
            example: 'ATK'
          },
          {
            name: 'page',
            in: 'query',
            description: 'Nomor halaman (default: 1)',
            required: false,
            schema: { type: 'integer', default: 1 }
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Jumlah data per halaman (default: 10, isi 0 atau 100 untuk mengambil semua data combobox)',
            required: false,
            schema: { type: 'integer', default: 10 }
          }
        ],
        responses: {
          '200': {
            description: 'Daftar kategori berhasil diambil.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/KategoriListResponse'
                },
                example: {
                  success: true,
                  data: [
                    { id: 1, kode: 'ATK', nama: 'Alat Tulis Kantor', subKategoriCount: 3 },
                    { id: 2, kode: 'ELEC', nama: 'Elektronik & IT', subKategoriCount: 3 },
                    { id: 3, kode: 'MED', nama: 'Peralatan Medis & K3', subKategoriCount: 2 }
                  ],
                  pagination: {
                    page: 1,
                    limit: 10,
                    total: 12,
                    totalPages: 2
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Master Kategori'],
        summary: 'Tambah kategori barang baru',
        description: 'Menyimpan kategori baru. Kode kategori harus unik dan maksimal 10 karakter (khusus Admin).',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateKategoriRequest'
              },
              example: {
                kode: 'SRGM',
                nama: 'Seragam & Pakaian Kerja'
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Kategori berhasil ditambahkan.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/KategoriDetailResponse'
                },
                example: {
                  success: true,
                  message: 'Kategori berhasil ditambahkan',
                  data: {
                    id: 13,
                    kode: 'SRGM',
                    nama: 'Seragam & Pakaian Kerja'
                  }
                }
              }
            }
          },
          '400': {
            description: 'Input tidak valid.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: {
                  success: false,
                  message: 'Kode kategori (maks 10 karakter) dan nama kategori (maks 100 karakter) wajib diisi'
                }
              }
            }
          },
          '409': {
            description: 'Kode kategori sudah digunakan.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: {
                  success: false,
                  message: 'Kode Kategori "SRGM" sudah digunakan!'
                }
              }
            }
          }
        }
      }
    },
    '/api/kategori/{id}': {
      get: {
        tags: ['Master Kategori'],
        summary: 'Detail kategori barang berdasarkan ID',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID Kategori',
            schema: { type: 'integer' }
          }
        ],
        responses: {
          '200': {
            description: 'Detail kategori.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/KategoriDetailResponse' },
                example: {
                  success: true,
                  data: {
                    id: 1,
                    kode: 'ATK',
                    nama: 'Alat Tulis Kantor'
                  }
                }
              }
            }
          },
          '404': {
            description: 'Kategori tidak ditemukan.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      },
      put: {
        tags: ['Master Kategori'],
        summary: 'Ubah data kategori barang',
        description: 'Memperbarui kode atau nama kategori barang (khusus Admin).',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID Kategori',
            schema: { type: 'integer' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateKategoriRequest' },
              example: {
                kode: 'ATK',
                nama: 'Alat Tulis Kantor & Kertas'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Kategori berhasil diperbarui.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/KategoriDetailResponse' },
                example: {
                  success: true,
                  message: 'Kategori berhasil diperbarui',
                  data: {
                    id: 1,
                    kode: 'ATK',
                    nama: 'Alat Tulis Kantor & Kertas'
                  }
                }
              }
            }
          },
          '409': {
            description: 'Kode kategori telah digunakan oleh kategori lain.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      },
      delete: {
        tags: ['Master Kategori'],
        summary: 'Hapus data kategori barang',
        description: 'Menghapus kategori. Penghapusan akan ditolak jika masih terdapat sub-kategori terkait (khusus Admin).',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID Kategori',
            schema: { type: 'integer' }
          }
        ],
        responses: {
          '200': {
            description: 'Kategori berhasil dihapus.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SimpleMessageResponse' },
                example: {
                  success: true,
                  message: 'Kategori berhasil dihapus'
                }
              }
            }
          },
          '400': {
            description: 'Kategori tidak dapat dihapus karena memiliki relasi data sub kategori.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: {
                  success: false,
                  message: 'Kategori ini tidak dapat dihapus karena masih memiliki Sub Kategori!'
                }
              }
            }
          }
        }
      }
    },

    // ==========================================
    // 3. MASTER DATA: SUB KATEGORI
    // ==========================================
    '/api/sub-kategori': {
      get: {
        tags: ['Master Sub Kategori'],
        summary: 'Daftar semua sub kategori',
        description: 'Mengambil daftar sub kategori dengan informasi batas harga pagu. Dapat difilter berdasarkan parent kategori.',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'kategoriId',
            in: 'query',
            description: 'Filter berdasarkan ID Kategori',
            required: false,
            schema: { type: 'integer' },
            example: 1
          },
          {
            name: 'search',
            in: 'query',
            description: 'Pencarian berdasarkan nama sub kategori atau nama kategori',
            required: false,
            schema: { type: 'string' },
            example: 'Kertas'
          },
          {
            name: 'page',
            in: 'query',
            description: 'Nomor halaman (default: 1)',
            required: false,
            schema: { type: 'integer', default: 1 }
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Jumlah data per halaman (default: 10, isi 0 untuk mengambil semua data)',
            required: false,
            schema: { type: 'integer', default: 10 }
          }
        ],
        responses: {
          '200': {
            description: 'Daftar sub kategori berhasil diambil.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SubKategoriListResponse' },
                example: {
                  success: true,
                  data: [
                    {
                      id: 1,
                      kategoriId: 1,
                      kategoriKode: 'ATK',
                      kategoriNama: 'Alat Tulis Kantor',
                      nama: 'Kertas, Buku & Formulir',
                      batasHarga: 5000000
                    },
                    {
                      id: 2,
                      kategoriId: 1,
                      kategoriKode: 'ATK',
                      kategoriNama: 'Alat Tulis Kantor',
                      nama: 'Pulpen, Spidol & Alat Koreksi',
                      batasHarga: 3000000
                    }
                  ],
                  pagination: {
                    page: 1,
                    limit: 10,
                    total: 14,
                    totalPages: 2
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Master Sub Kategori'],
        summary: 'Tambah sub kategori baru',
        description: 'Menyimpan sub kategori baru beserta batas pagu anggaran harga (khusus Admin).',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateSubKategoriRequest' },
              example: {
                kategoriId: 1,
                nama: 'Tinta & Toner Printer',
                batasHarga: 15000000
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Sub kategori berhasil ditambahkan.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SubKategoriDetailResponse' },
                example: {
                  success: true,
                  message: 'Sub Kategori berhasil ditambahkan',
                  data: {
                    id: 15,
                    kategoriId: 1,
                    kategoriNama: 'Alat Tulis Kantor',
                    nama: 'Tinta & Toner Printer',
                    batasHarga: 15000000
                  }
                }
              }
            }
          },
          '400': {
            description: 'Input tidak valid.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: {
                  success: false,
                  message: 'Kategori, nama sub kategori, dan batas harga wajib diisi'
                }
              }
            }
          }
        }
      }
    },
    '/api/sub-kategori/{id}': {
      get: {
        tags: ['Master Sub Kategori'],
        summary: 'Detail sub kategori berdasarkan ID',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID Sub Kategori',
            schema: { type: 'integer' }
          }
        ],
        responses: {
          '200': {
            description: 'Detail sub kategori.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SubKategoriDetailResponse' },
                example: {
                  success: true,
                  data: {
                    id: 1,
                    kategoriId: 1,
                    kategoriNama: 'Alat Tulis Kantor',
                    nama: 'Kertas, Buku & Formulir',
                    batasHarga: 5000000
                  }
                }
              }
            }
          },
          '404': {
            description: 'Sub kategori tidak ditemukan.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      },
      put: {
        tags: ['Master Sub Kategori'],
        summary: 'Ubah data sub kategori',
        description: 'Memperbarui kategori induk, nama sub kategori, atau batas harga (khusus Admin).',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID Sub Kategori',
            schema: { type: 'integer' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateSubKategoriRequest' },
              example: {
                kategoriId: 1,
                nama: 'Kertas, Buku & Dokumen Kantor',
                batasHarga: 6000000
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Sub kategori berhasil diperbarui.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SubKategoriDetailResponse' },
                example: {
                  success: true,
                  message: 'Sub Kategori berhasil diperbarui',
                  data: {
                    id: 1,
                    kategoriId: 1,
                    kategoriNama: 'Alat Tulis Kantor',
                    nama: 'Kertas, Buku & Dokumen Kantor',
                    batasHarga: 6000000
                  }
                }
              }
            }
          }
        }
      },
      delete: {
        tags: ['Master Sub Kategori'],
        summary: 'Hapus sub kategori',
        description: 'Menghapus data sub kategori. Jika sub kategori sudah pernah digunakan dalam transaksi Barang Masuk, penghapusan akan ditolak (khusus Admin).',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID Sub Kategori',
            schema: { type: 'integer' }
          }
        ],
        responses: {
          '200': {
            description: 'Sub kategori berhasil dihapus.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SimpleMessageResponse' },
                example: {
                  success: true,
                  message: 'Sub Kategori berhasil dihapus'
                }
              }
            }
          },
          '400': {
            description: 'Sub kategori tidak dapat dihapus karena sudah berelasi dengan data Barang Masuk.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: {
                  success: false,
                  message: 'Sub Kategori tidak dapat dihapus karena sudah digunakan dalam transaksi Barang Masuk!'
                }
              }
            }
          }
        }
      }
    },

    // ==========================================
    // 4. TRANSAKSI: BARANG MASUK
    // ==========================================
    '/api/barang-masuk': {
      get: {
        tags: ['Barang Masuk'],
        summary: 'Daftar data barang masuk',
        description: 'Mengambil data transaksi penerimaan barang dengan dukungan filter kategori, sub kategori, tahun, pencarian keyword, pengurutan (sorting), dan paginasi.',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'kategoriId',
            in: 'query',
            description: 'Filter berdasarkan Kategori',
            required: false,
            schema: { type: 'integer' },
            example: 1
          },
          {
            name: 'subKategoriId',
            in: 'query',
            description: 'Filter berdasarkan Sub Kategori',
            required: false,
            schema: { type: 'integer' },
            example: 1
          },
          {
            name: 'tahun',
            in: 'query',
            description: 'Filter tahun data (contoh: 2026, 2025)',
            required: false,
            schema: { type: 'string' },
            example: '2026'
          },
          {
            name: 'search',
            in: 'query',
            description: 'Pencarian berdasarkan Asal Barang atau Nama Sub Kategori',
            required: false,
            schema: { type: 'string' },
            example: 'Graha Kertas'
          },
          {
            name: 'sortBy',
            in: 'query',
            description: 'Kolom pengurutan data',
            required: false,
            schema: {
              type: 'string',
              enum: ['tanggal', 'asalBarang', 'totalHarga'],
              default: 'tanggal'
            }
          },
          {
            name: 'sortOrder',
            in: 'query',
            description: 'Arah pengurutan (asc = terlama/A-Z, desc = terbaru/Z-A)',
            required: false,
            schema: {
              type: 'string',
              enum: ['asc', 'desc'],
              default: 'desc'
            }
          },
          {
            name: 'page',
            in: 'query',
            description: 'Halaman data (default: 1)',
            required: false,
            schema: { type: 'integer', default: 1 }
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Jumlah baris data per halaman (default: 10)',
            required: false,
            schema: { type: 'integer', default: 10 }
          }
        ],
        responses: {
          '200': {
            description: 'Daftar data barang masuk berhasil diambil.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/BarangMasukListResponse' },
                example: {
                  success: true,
                  data: [
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
                      lampiranUrl: '/api/barang-masuk/1/lampiran',
                      isVerified: true,
                      itemCount: 3,
                      items: [
                        {
                          id: '1-1',
                          namaBarang: 'Kertas HVS A4 80gr PaperOne',
                          harga: 55000,
                          jumlah: 40,
                          satuan: 'Rim',
                          total: 2200000,
                          expiredDate: ''
                        },
                        {
                          id: '1-2',
                          namaBarang: 'Kertas F4 75gr Sinar Dunia',
                          harga: 52000,
                          jumlah: 30,
                          satuan: 'Rim',
                          total: 1560000,
                          expiredDate: ''
                        },
                        {
                          id: '1-3',
                          namaBarang: 'Buku Ekspedisi Folio 100 lembar',
                          harga: 25000,
                          jumlah: 20,
                          satuan: 'Buku',
                          total: 500000,
                          expiredDate: ''
                        }
                      ],
                      totalHarga: 4260000,
                      createdAt: '2026-04-10T09:30:00Z'
                    }
                  ],
                  pagination: {
                    page: 1,
                    limit: 10,
                    total: 12,
                    totalPages: 2
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Barang Masuk'],
        summary: 'Tambah data barang masuk baru',
        description: `
Menyimpan transaksi barang masuk baru dengan rincian multi-baris item barang.

**Aturan & Validasi Bisnis Kunci:**
1. **Plafon Batas Harga**: Total harga keseluruhan dari seluruh item (\`sum(harga * jumlah)\`) **TIDAK BOLEH MELEBIHI Batas Harga Sub Kategori** yang dipilih. Jika melebihi, sistem akan menolak dengan HTTP 400.
2. **Operator**: Jika role user adalah Admin, field \`operatorId\` dapat dipilih bebas dari daftar user operator. Jika role user adalah Operator, field \`operatorId\` otomatis dikunci ke dirinya sendiri.
3. **Lampiran**: Mendukung upload file dokumen bukti (\`.doc\`, \`.docx\`, \`.zip\`).
4. **Nomor Surat**: Jika tidak diisi, sistem otomatis membuatkan nomor urut format \`SRT/{tahun}/GEN/{nomor}\`.
        `,
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                $ref: '#/components/schemas/CreateBarangMasukMultipartRequest'
              }
            },
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateBarangMasukJsonRequest'
              },
              example: {
                tanggal: '2026-04-14',
                nomorSurat: 'SRT/2026/04/010',
                asalBarang: 'PT Cahaya Komputer Abadi',
                kategoriId: 2,
                subKategoriId: 4,
                operatorId: 2,
                items: [
                  {
                    namaBarang: 'Laptop Lenovo ThinkPad L14 Gen 4',
                    harga: 12500000,
                    jumlah: 2,
                    satuan: 'Unit',
                    expiredDate: ''
                  },
                  {
                    namaBarang: 'Mouse Wireless Logitech Silent M220',
                    harga: 175000,
                    jumlah: 2,
                    satuan: 'Unit',
                    expiredDate: ''
                  }
                ]
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Data barang masuk berhasil disimpan.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/BarangMasukDetailResponse' },
                example: {
                  success: true,
                  message: 'Data Barang Masuk berhasil disimpan',
                  data: {
                    id: 13,
                    nomorSurat: 'SRT/2026/04/010',
                    tanggal: '2026-04-14',
                    tahun: '2026',
                    asalBarang: 'PT Cahaya Komputer Abadi',
                    kategoriId: 2,
                    kategoriNama: 'Elektronik & IT',
                    subKategoriId: 4,
                    subKategoriNama: 'Komputer, Laptop & Monitor',
                    batasHargaSubKategori: 60000000,
                    operatorId: 2,
                    operatorNama: 'Budi Santoso',
                    lampiranName: '',
                    isVerified: false,
                    items: [
                      {
                        id: '13-1',
                        namaBarang: 'Laptop Lenovo ThinkPad L14 Gen 4',
                        harga: 12500000,
                        jumlah: 2,
                        satuan: 'Unit',
                        total: 25000000,
                        expiredDate: ''
                      },
                      {
                        id: '13-2',
                        namaBarang: 'Mouse Wireless Logitech Silent M220',
                        harga: 175000,
                        jumlah: 2,
                        satuan: 'Unit',
                        total: 350000,
                        expiredDate: ''
                      }
                    ],
                    totalHarga: 25350000
                  }
                }
              }
            }
          },
          '400': {
            description: 'Validasi gagal (misal: Total harga melebihi batas plafon sub kategori atau input tidak lengkap).',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: {
                  success: false,
                  message: 'Validasi gagal: Total harga (Rp 65.000.000) melebihi batas plafon sub kategori (Rp 60.000.000)!'
                }
              }
            }
          }
        }
      }
    },
    '/api/barang-masuk/{id}': {
      get: {
        tags: ['Barang Masuk'],
        summary: 'Detail data barang masuk berdasarkan ID',
        description: 'Mengambil rincian data transaksi barang masuk beserta seluruh list item barang dan file lampiran.',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID Barang Masuk',
            schema: { type: 'integer' }
          }
        ],
        responses: {
          '200': {
            description: 'Detail data barang masuk.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/BarangMasukDetailResponse' }
              }
            }
          },
          '404': {
            description: 'Data barang masuk tidak ditemukan.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      },
      put: {
        tags: ['Barang Masuk'],
        summary: 'Ubah data barang masuk',
        description: 'Memperbarui data informasi umum, lampiran, serta daftar item barang masuk. Tetap memvalidasi batas plafon harga sub kategori.',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID Barang Masuk',
            schema: { type: 'integer' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: { $ref: '#/components/schemas/CreateBarangMasukMultipartRequest' }
            },
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateBarangMasukJsonRequest' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Data barang masuk berhasil diperbarui.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/BarangMasukDetailResponse' }
              }
            }
          },
          '400': {
            description: 'Validasi gagal atau total harga melebihi batas pagu.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      },
      delete: {
        tags: ['Barang Masuk'],
        summary: 'Hapus data barang masuk',
        description: 'Menghapus transaksi penerimaan barang masuk beserta seluruh item detail dan file lampiran terkait.',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID Barang Masuk',
            schema: { type: 'integer' }
          }
        ],
        responses: {
          '200': {
            description: 'Data barang masuk berhasil dihapus.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SimpleMessageResponse' },
                example: {
                  success: true,
                  message: 'Data Barang Masuk berhasil dihapus'
                }
              }
            }
          }
        }
      }
    },
    '/api/barang-masuk/{id}/verifikasi': {
      patch: {
        tags: ['Barang Masuk'],
        summary: 'Toggle status verifikasi (centang hijau)',
        description: 'Mengubah status verifikasi data barang masuk (tombol centang hijau di kolom paling kanan tabel). Jika request body tidak mengirimkan nilai `isVerified`, sistem akan otomatis membalikkan status verifikasi saat ini (toggle).',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID Barang Masuk',
            schema: { type: 'integer' }
          }
        ],
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  isVerified: {
                    type: 'boolean',
                    description: 'Status verifikasi baru (opsional, jika tidak ada maka sistem akan toggle status sebelumnya)'
                  }
                }
              },
              example: {
                isVerified: true
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Status verifikasi berhasil diubah.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Status data SRT/2026/04/001 berhasil diverifikasi' },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'integer', example: 1 },
                        isVerified: { type: 'boolean', example: true }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/barang-masuk/{id}/cetak': {
      get: {
        tags: ['Barang Masuk'],
        summary: 'Ambil format data cetak surat masuk',
        description: 'Menyediakan data lengkap dan terstruktur untuk preview/print surat bukti penerimaan barang masuk resmi (Kop surat, nomor surat, tanggal, rincian barang, total biaya, batas plafon, dan tanda tangan pejabat penanggung jawab).',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID Barang Masuk',
            schema: { type: 'integer' }
          }
        ],
        responses: {
          '200': {
            description: 'Data cetak surat masuk siap dicetak.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CetakSuratResponse' },
                example: {
                  success: true,
                  data: {
                    kopInstansi: 'PEMERINTAH KOTA YOGYAKARTA - DINAS INVENTARISASI & PENGADAAN BARANG',
                    alamatInstansi: 'Jl. Malioboro No. 45, Danurejan, Kota Yogyakarta, DI Yogyakarta 55213',
                    judulDokumen: 'SURAT BUKTI PENERIMAAN BARANG MASUK',
                    nomorSurat: 'SRT/2026/04/001',
                    tanggal: '2026-04-10',
                    asalBarang: 'PT Graha Kertas Nusantara',
                    kategori: 'Alat Tulis Kantor',
                    subKategori: 'Kertas, Buku & Formulir',
                    batasPlafon: 5000000,
                    operator: 'Budi Santoso',
                    isVerified: true,
                    items: [
                      { no: 1, namaBarang: 'Kertas HVS A4 80gr PaperOne', jumlah: 40, satuan: 'Rim', harga: 55000, total: 2200000, expiredDate: '-' },
                      { no: 2, namaBarang: 'Kertas F4 75gr Sinar Dunia', jumlah: 30, satuan: 'Rim', harga: 52000, total: 1560000, expiredDate: '-' },
                      { no: 3, namaBarang: 'Buku Ekspedisi Folio 100 lembar', jumlah: 20, satuan: 'Buku', harga: 25000, total: 500000, expiredDate: '-' }
                    ],
                    totalHarga: 4260000,
                    terbilang: 'Empat Juta Dua Ratus Enam Puluh Ribu Rupiah'
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/barang-masuk/{id}/lampiran': {
      get: {
        tags: ['Barang Masuk'],
        summary: 'Download file lampiran dokumen barang masuk',
        description: 'Mengunduh atau membaca file lampiran bukti pengadaan barang (.doc, .docx, atau .zip).',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID Barang Masuk',
            schema: { type: 'integer' }
          }
        ],
        responses: {
          '200': {
            description: 'File lampiran berhasil diunduh.',
            content: {
              'application/octet-stream': {
                schema: {
                  type: 'string',
                  format: 'binary'
                }
              }
            }
          },
          '404': {
            description: 'Lampiran dokumen tidak ditemukan.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/api/barang-masuk/export/excel': {
      get: {
        tags: ['Barang Masuk'],
        summary: 'Export data barang masuk ke format Excel (.xlsx)',
        description: 'Mengunduh file lembar kerja Excel berisi daftar data barang masuk sesuai filter aktif (kategori, sub kategori, tahun) dan kata kunci pencarian.',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'kategoriId',
            in: 'query',
            description: 'Filter Kategori',
            required: false,
            schema: { type: 'integer' }
          },
          {
            name: 'subKategoriId',
            in: 'query',
            description: 'Filter Sub Kategori',
            required: false,
            schema: { type: 'integer' }
          },
          {
            name: 'tahun',
            in: 'query',
            description: 'Filter Tahun',
            required: false,
            schema: { type: 'string' }
          },
          {
            name: 'search',
            in: 'query',
            description: 'Pencarian Asal Barang / Sub Kategori',
            required: false,
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'File Excel (.xlsx) berhasil digenerate dan dikirim sebagai attachment download.',
            headers: {
              'Content-Disposition': {
                schema: {
                  type: 'string',
                  example: 'attachment; filename="data_barang_masuk_2026.xlsx"'
                }
              }
            },
            content: {
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
                schema: {
                  type: 'string',
                  format: 'binary'
                }
              }
            }
          }
        }
      }
    },

    // ==========================================
    // 5. MANAJEMEN USER
    // ==========================================
    '/api/users': {
      get: {
        tags: ['Manajemen User'],
        summary: 'Daftar semua pengguna (User Management)',
        description: 'Mengambil daftar pengguna aplikasi. Mendukung filter role (Admin/Operator), pencarian username/nama, dan paginasi (khusus Admin).',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'role',
            in: 'query',
            description: 'Filter berdasarkan peran',
            required: false,
            schema: {
              type: 'string',
              enum: ['Admin', 'Operator']
            }
          },
          {
            name: 'search',
            in: 'query',
            description: 'Pencarian berdasarkan username atau nama pengguna',
            required: false,
            schema: { type: 'string' },
            example: 'budi'
          },
          {
            name: 'page',
            in: 'query',
            description: 'Nomor halaman (default: 1)',
            required: false,
            schema: { type: 'integer', default: 1 }
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Jumlah pengguna per halaman (default: 10, isi 0 untuk mengambil semua user operator)',
            required: false,
            schema: { type: 'integer', default: 10 }
          }
        ],
        responses: {
          '200': {
            description: 'Daftar pengguna berhasil diambil.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserListResponse' },
                example: {
                  success: true,
                  data: [
                    {
                      id: 1,
                      role: 'Admin',
                      username: 'admin',
                      nama: 'Super Administrator',
                      email: 'admin@jmcinventory.local',
                      isLocked: false
                    },
                    {
                      id: 2,
                      role: 'Operator',
                      username: 'budi_op',
                      nama: 'Budi Santoso',
                      email: 'budi.santoso@jmcinventory.local',
                      isLocked: false
                    },
                    {
                      id: 4,
                      role: 'Operator',
                      username: 'doni_lock',
                      nama: 'Doni Prasetyo (Locked Demo)',
                      email: 'doni.prasetyo@jmcinventory.local',
                      isLocked: true
                    }
                  ],
                  pagination: {
                    page: 1,
                    limit: 10,
                    total: 4,
                    totalPages: 1
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Manajemen User'],
        summary: 'Tambah user baru',
        description: `
Mendaftarkan pengguna baru ke sistem (khusus Admin).

**Aturan Validasi Input:**
- **Role**: Wajib dipilih ('Admin' atau 'Operator').
- **Username**: Unik, 8–100 karakter.
- **Password**: 8–100 karakter, WAJIB kombinasi huruf besar (uppercase), huruf kecil (lowercase), dan angka (numeric).
- **Nama**: 8–100 karakter.
- **Email**: Format email valid, 8–100 karakter.
        `,
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateUserRequest' },
              example: {
                role: 'Operator',
                username: 'ahmad_fauzi',
                password: 'Password123',
                nama: 'Ahmad Fauzi Rahman',
                email: 'ahmad.fauzi@jmcinventory.local'
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'User baru berhasil didaftarkan.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserDetailResponse' },
                example: {
                  success: true,
                  message: 'User berhasil didaftarkan!',
                  data: {
                    id: 5,
                    role: 'Operator',
                    username: 'ahmad_fauzi',
                    nama: 'Ahmad Fauzi Rahman',
                    email: 'ahmad.fauzi@jmcinventory.local',
                    isLocked: false
                  }
                }
              }
            }
          },
          '400': {
            description: 'Validasi form gagal (panjang karakter, format email, atau kompleksitas password tidak terpenuhi).',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: {
                  success: false,
                  message: 'Password harus minimal 8 karakter dan mengandung kombinasi huruf besar, huruf kecil, dan angka!'
                }
              }
            }
          },
          '409': {
            description: 'Username atau email sudah digunakan.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: {
                  success: false,
                  message: 'Username "ahmad_fauzi" sudah digunakan!'
                }
              }
            }
          }
        }
      }
    },
    '/api/users/{id}': {
      get: {
        tags: ['Manajemen User'],
        summary: 'Detail pengguna berdasarkan ID',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID Pengguna',
            schema: { type: 'integer' }
          }
        ],
        responses: {
          '200': {
            description: 'Detail pengguna.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserDetailResponse' }
              }
            }
          },
          '404': {
            description: 'User tidak ditemukan.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      },
      put: {
        tags: ['Manajemen User'],
        summary: 'Ubah data pengguna',
        description: 'Memperbarui data pengguna. Field password bersifat opsional (hanya diisi jika ingin mereset/mengganti password baru).',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID Pengguna',
            schema: { type: 'integer' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateUserRequest' },
              example: {
                role: 'Operator',
                username: 'budi_santoso',
                nama: 'Budi Santoso, S.Kom',
                email: 'budi.santoso@jmcinventory.local',
                password: 'NewPassword123'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'User berhasil diperbarui.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserDetailResponse' }
              }
            }
          },
          '409': {
            description: 'Username sudah digunakan oleh user lain.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      },
      delete: {
        tags: ['Manajemen User'],
        summary: 'Hapus pengguna',
        description: 'Menghapus akun pengguna dari sistem. Pengguna yang sedang login TIDAK DIPERBOLEHKAN menghapus akunnya sendiri.',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID Pengguna',
            schema: { type: 'integer' }
          }
        ],
        responses: {
          '200': {
            description: 'User berhasil dihapus.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SimpleMessageResponse' },
                example: {
                  success: true,
                  message: 'User berhasil dihapus!'
                }
              }
            }
          },
          '400': {
            description: 'Mencoba menghapus akun sendiri.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: {
                  success: false,
                  message: 'Anda tidak dapat menghapus akun Anda sendiri!'
                }
              }
            }
          }
        }
      }
    },
    '/api/users/{id}/lock': {
      patch: {
        tags: ['Manajemen User'],
        summary: 'Toggle status kunci akun user (Lock / Unlock)',
        description: 'Mengubah status lock user. User dengan status `isLocked: true` tidak dapat login ke sistem. Admin tidak diperbolehkan mengunci akunnya sendiri.',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID Pengguna',
            schema: { type: 'integer' }
          }
        ],
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  isLocked: {
                    type: 'boolean',
                    description: 'Status baru nilai isLocked (opsional, default: toggle nilai sebelumnya)'
                  }
                }
              },
              example: {
                isLocked: true
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Status akun berhasil diubah.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'User Doni Prasetyo berhasil DIKUNCI!' },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'integer', example: 4 },
                        isLocked: { type: 'boolean', example: true }
                      }
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Mencoba mengunci akun sendiri.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: {
                  success: false,
                  message: 'Anda tidak dapat mengunci akun Anda sendiri!'
                }
              }
            }
          }
        }
      }
    }
  },

  // ==========================================
  // COMPONENTS / SCHEMAS
  // ==========================================
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Masukkan Token JWT dengan format: `Bearer <token>`'
      }
    },
    schemas: {
      // 1. Generic & Utility Schemas
      PaginationMeta: {
        type: 'object',
        properties: {
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 10 },
          total: { type: 'integer', example: 45 },
          totalPages: { type: 'integer', example: 5 }
        }
      },
      SimpleMessageResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Operasi berhasil dieksekusi' }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Pesan kesalahan validasi atau bisnis' },
          errors: {
            type: 'array',
            items: { type: 'string' },
            description: 'Daftar detail error jika ada'
          }
        }
      },

      // 2. Auth Schemas
      LoginRequest: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: {
            type: 'string',
            description: 'Username pengguna',
            example: 'admin'
          },
          password: {
            type: 'string',
            format: 'password',
            description: 'Password pengguna',
            example: 'Password123'
          }
        }
      },
      LoginSuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Login berhasil' },
          data: {
            type: 'object',
            properties: {
              token: { type: 'string' },
              user: { $ref: '#/components/schemas/User' }
            }
          }
        }
      },
      UserProfileResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { $ref: '#/components/schemas/User' }
        }
      },

      // 3. User Schemas
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          role: { type: 'string', enum: ['Admin', 'Operator'], example: 'Admin' },
          username: { type: 'string', example: 'admin' },
          nama: { type: 'string', example: 'Super Administrator' },
          email: { type: 'string', format: 'email', example: 'admin@jmcinventory.local' },
          isLocked: { type: 'boolean', example: false }
        }
      },
      CreateUserRequest: {
        type: 'object',
        required: ['role', 'username', 'password', 'nama', 'email'],
        properties: {
          role: {
            type: 'string',
            enum: ['Admin', 'Operator'],
            description: 'Peran akun pengguna',
            example: 'Operator'
          },
          username: {
            type: 'string',
            minLength: 8,
            maxLength: 100,
            description: 'Username unik, panjang 8-100 karakter',
            example: 'ahmad_fauzi'
          },
          password: {
            type: 'string',
            minLength: 8,
            maxLength: 100,
            description: 'Password 8-100 karakter, harus mengandung huruf besar, huruf kecil, dan angka',
            example: 'Password123'
          },
          nama: {
            type: 'string',
            minLength: 8,
            maxLength: 100,
            description: 'Nama lengkap pengguna, 8-100 karakter',
            example: 'Ahmad Fauzi Rahman'
          },
          email: {
            type: 'string',
            format: 'email',
            minLength: 8,
            maxLength: 100,
            description: 'Email aktif pengguna',
            example: 'ahmad.fauzi@jmcinventory.local'
          }
        }
      },
      UpdateUserRequest: {
        type: 'object',
        required: ['role', 'username', 'nama', 'email'],
        properties: {
          role: {
            type: 'string',
            enum: ['Admin', 'Operator'],
            example: 'Operator'
          },
          username: {
            type: 'string',
            minLength: 8,
            maxLength: 100,
            example: 'budi_santoso'
          },
          nama: {
            type: 'string',
            minLength: 8,
            maxLength: 100,
            example: 'Budi Santoso, S.Kom'
          },
          email: {
            type: 'string',
            format: 'email',
            minLength: 8,
            maxLength: 100,
            example: 'budi.santoso@jmcinventory.local'
          },
          password: {
            type: 'string',
            minLength: 8,
            maxLength: 100,
            description: 'Kosongkan jika tidak ingin mengubah password lama',
            example: 'NewPassword123'
          }
        }
      },
      UserListResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/User' }
          },
          pagination: { $ref: '#/components/schemas/PaginationMeta' }
        }
      },
      UserDetailResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Data user berhasil diproses' },
          data: { $ref: '#/components/schemas/User' }
        }
      },

      // 4. Kategori Schemas
      Kategori: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          kode: { type: 'string', example: 'ATK' },
          nama: { type: 'string', example: 'Alat Tulis Kantor' },
          subKategoriCount: { type: 'integer', example: 3 }
        }
      },
      CreateKategoriRequest: {
        type: 'object',
        required: ['kode', 'nama'],
        properties: {
          kode: {
            type: 'string',
            maxLength: 10,
            description: 'Kode unik kategori, maks 10 karakter',
            example: 'ATK'
          },
          nama: {
            type: 'string',
            maxLength: 100,
            description: 'Nama kategori, maks 100 karakter',
            example: 'Alat Tulis Kantor'
          }
        }
      },
      UpdateKategoriRequest: {
        type: 'object',
        required: ['kode', 'nama'],
        properties: {
          kode: {
            type: 'string',
            maxLength: 10,
            example: 'ATK'
          },
          nama: {
            type: 'string',
            maxLength: 100,
            example: 'Alat Tulis Kantor & Kertas'
          }
        }
      },
      KategoriListResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/Kategori' }
          },
          pagination: { $ref: '#/components/schemas/PaginationMeta' }
        }
      },
      KategoriDetailResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Berhasil' },
          data: { $ref: '#/components/schemas/Kategori' }
        }
      },

      // 5. Sub Kategori Schemas
      SubKategori: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          kategoriId: { type: 'integer', example: 1 },
          kategoriKode: { type: 'string', example: 'ATK' },
          kategoriNama: { type: 'string', example: 'Alat Tulis Kantor' },
          nama: { type: 'string', example: 'Kertas, Buku & Formulir' },
          batasHarga: { type: 'number', example: 5000000 }
        }
      },
      CreateSubKategoriRequest: {
        type: 'object',
        required: ['kategoriId', 'nama', 'batasHarga'],
        properties: {
          kategoriId: {
            type: 'integer',
            description: 'ID Kategori Induk',
            example: 1
          },
          nama: {
            type: 'string',
            maxLength: 100,
            description: 'Nama sub kategori, maks 100 karakter',
            example: 'Kertas, Buku & Formulir'
          },
          batasHarga: {
            type: 'number',
            description: 'Batas plafon harga belanja barang (numerik Rupiah)',
            example: 5000000
          }
        }
      },
      UpdateSubKategoriRequest: {
        type: 'object',
        required: ['kategoriId', 'nama', 'batasHarga'],
        properties: {
          kategoriId: {
            type: 'integer',
            example: 1
          },
          nama: {
            type: 'string',
            maxLength: 100,
            example: 'Kertas, Buku & Formulir'
          },
          batasHarga: {
            type: 'number',
            example: 6000000
          }
        }
      },
      SubKategoriListResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/SubKategori' }
          },
          pagination: { $ref: '#/components/schemas/PaginationMeta' }
        }
      },
      SubKategoriDetailResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Berhasil' },
          data: { $ref: '#/components/schemas/SubKategori' }
        }
      },

      // 6. Item Barang & Barang Masuk Schemas
      BarangMasukItem: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '1-1' },
          namaBarang: { type: 'string', example: 'Kertas HVS A4 80gr PaperOne' },
          harga: { type: 'number', example: 55000 },
          jumlah: { type: 'integer', example: 40 },
          satuan: { type: 'string', example: 'Rim' },
          total: { type: 'number', example: 2200000 },
          expiredDate: { type: 'string', format: 'date', nullable: true, example: '' }
        }
      },
      CreateBarangMasukItemInput: {
        type: 'object',
        required: ['namaBarang', 'harga', 'jumlah', 'satuan'],
        properties: {
          namaBarang: {
            type: 'string',
            maxLength: 200,
            example: 'Kertas HVS A4 80gr PaperOne'
          },
          harga: {
            type: 'number',
            minimum: 1,
            description: 'Harga satuan dalam Rupiah',
            example: 55000
          },
          jumlah: {
            type: 'integer',
            minimum: 1,
            description: 'Jumlah kuantitas barang',
            example: 40
          },
          satuan: {
            type: 'string',
            maxLength: 40,
            example: 'Rim'
          },
          expiredDate: {
            type: 'string',
            format: 'date',
            description: 'Tanggal kedaluwarsa barang (opsional)',
            example: '2027-12-31'
          }
        }
      },
      BarangMasuk: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          nomorSurat: { type: 'string', example: 'SRT/2026/04/001' },
          tanggal: { type: 'string', format: 'date', example: '2026-04-10' },
          tahun: { type: 'string', example: '2026' },
          asalBarang: { type: 'string', example: 'PT Graha Kertas Nusantara' },
          kategoriId: { type: 'integer', example: 1 },
          kategoriNama: { type: 'string', example: 'Alat Tulis Kantor' },
          subKategoriId: { type: 'integer', example: 1 },
          subKategoriNama: { type: 'string', example: 'Kertas, Buku & Formulir' },
          batasHargaSubKategori: { type: 'number', example: 5000000 },
          operatorId: { type: 'integer', example: 2 },
          operatorNama: { type: 'string', example: 'Budi Santoso' },
          lampiranName: { type: 'string', example: 'surat_jalan_kertas.docx' },
          lampiranUrl: { type: 'string', example: '/api/barang-masuk/1/lampiran' },
          isVerified: { type: 'boolean', example: true },
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/BarangMasukItem' }
          },
          totalHarga: { type: 'number', example: 4260000 },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      CreateBarangMasukJsonRequest: {
        type: 'object',
        required: ['tanggal', 'asalBarang', 'kategoriId', 'subKategoriId', 'items'],
        properties: {
          nomorSurat: {
            type: 'string',
            maxLength: 100,
            description: 'Nomor surat (opsional, jika kosong sistem generate otomatis)',
            example: 'SRT/2026/04/001'
          },
          tanggal: {
            type: 'string',
            format: 'date',
            example: '2026-04-10'
          },
          asalBarang: {
            type: 'string',
            maxLength: 200,
            example: 'PT Graha Kertas Nusantara'
          },
          kategoriId: {
            type: 'integer',
            example: 1
          },
          subKategoriId: {
            type: 'integer',
            example: 1
          },
          operatorId: {
            type: 'integer',
            description: 'ID Pengguna Operator (khusus Admin bisa pilih, Operator otomatis dirinya sendiri)',
            example: 2
          },
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/CreateBarangMasukItemInput' }
          }
        }
      },
      CreateBarangMasukMultipartRequest: {
        type: 'object',
        required: ['tanggal', 'asalBarang', 'kategoriId', 'subKategoriId', 'items'],
        properties: {
          nomorSurat: {
            type: 'string',
            example: 'SRT/2026/04/001'
          },
          tanggal: {
            type: 'string',
            format: 'date',
            example: '2026-04-10'
          },
          asalBarang: {
            type: 'string',
            example: 'PT Graha Kertas Nusantara'
          },
          kategoriId: {
            type: 'integer',
            example: 1
          },
          subKategoriId: {
            type: 'integer',
            example: 1
          },
          operatorId: {
            type: 'integer',
            example: 2
          },
          lampiran: {
            type: 'string',
            format: 'binary',
            description: 'File bukti penerimaan (.doc, .docx, .zip)'
          },
          items: {
            type: 'string',
            description: 'JSON serialized array of item rows, contoh: `[{"namaBarang":"Kertas A4","harga":55000,"jumlah":40,"satuan":"Rim"}]`'
          }
        }
      },
      BarangMasukListResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/BarangMasuk' }
          },
          pagination: { $ref: '#/components/schemas/PaginationMeta' }
        }
      },
      BarangMasukDetailResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Data barang masuk berhasil diproses' },
          data: { $ref: '#/components/schemas/BarangMasuk' }
        }
      },
      CetakSuratResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'object',
            properties: {
              kopInstansi: { type: 'string' },
              alamatInstansi: { type: 'string' },
              judulDokumen: { type: 'string' },
              nomorSurat: { type: 'string' },
              tanggal: { type: 'string' },
              asalBarang: { type: 'string' },
              kategori: { type: 'string' },
              subKategori: { type: 'string' },
              batasPlafon: { type: 'number' },
              operator: { type: 'string' },
              isVerified: { type: 'boolean' },
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    no: { type: 'integer' },
                    namaBarang: { type: 'string' },
                    jumlah: { type: 'integer' },
                    satuan: { type: 'string' },
                    harga: { type: 'number' },
                    total: { type: 'number' },
                    expiredDate: { type: 'string' }
                  }
                }
              },
              totalHarga: { type: 'number' },
              terbilang: { type: 'string' }
            }
          }
        }
      }
    }
  }
};

export default swaggerDocument;
