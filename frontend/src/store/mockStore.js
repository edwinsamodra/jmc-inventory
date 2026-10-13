import { reactive } from 'vue';
import api, { setToken } from '../services/api';

const TOKEN_KEY = 'arrg_jwt_token';
const USER_KEY = 'arrg_current_user';

function getSavedUser() {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export const store = reactive({
  currentUser: getSavedUser(),
  kategoriList: [],
  subKategoriList: [],
  userList: [],
  get usersList() {
    return this.userList || [];
  },
  barangMasukList: [],
  isLoading: false,

  // Toast notification state
  toast: {
    show: false,
    message: '',
    type: 'success'
  },

  showToast(message, type = 'success') {
    this.toast.message = message;
    this.toast.type = type;
    this.toast.show = true;
    setTimeout(() => {
      this.toast.show = false;
    }, 3500);
  },

  // Inisialisasi sesi pengguna dan data dari backend REST API
  async init() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      this.currentUser = null;
      return;
    }

    try {
      const meRes = await api.auth.me();
      if (meRes.success && meRes.data) {
        this.currentUser = meRes.data;
        localStorage.setItem(USER_KEY, JSON.stringify(meRes.data));
        await this.loadAllData();
      } else {
        await this.logout();
      }
    } catch (err) {
      console.warn('Sesi tidak valid atau kedaluwarsa:', err.message);
      await this.logout();
    }
  },

  // Memuat data lengkap dari backend database MariaDB
  async loadAllData() {
    if (!this.currentUser) return;
    this.isLoading = true;

    try {
      // 1. Kategori
      try {
        const katRes = await api.kategori.getAll({ limit: 100 });
        if (katRes.success && Array.isArray(katRes.data)) {
          this.kategoriList = katRes.data;
        }
      } catch (e) {
        console.warn('Gagal memuat kategori dari backend:', e.message);
      }

      // 2. Sub Kategori
      try {
        const subRes = await api.subKategori.getAll({ limit: 100 });
        if (subRes.success && Array.isArray(subRes.data)) {
          this.subKategoriList = subRes.data;
        }
      } catch (e) {
        console.warn('Gagal memuat sub kategori dari backend:', e.message);
      }

      // 3. User List (khusus Admin)
      if (this.currentUser?.role === 'Admin') {
        try {
          const userRes = await api.users.getAll({ limit: 100 });
          if (userRes.success && Array.isArray(userRes.data)) {
            this.userList = userRes.data;
          }
        } catch (e) {
          console.warn('Gagal memuat users dari backend:', e.message);
        }
      }

      // 4. Barang Masuk
      try {
        const bmRes = await api.barangMasuk.getAll({ limit: 100 });
        if (bmRes.success && Array.isArray(bmRes.data)) {
          this.barangMasukList = bmRes.data;
        }
      } catch (e) {
        console.warn('Gagal memuat barang masuk dari backend:', e.message);
      }
    } finally {
      this.isLoading = false;
    }
  },

  // ==========================================
  // AUTENTIKASI REAL USER
  // ==========================================
  async login(username, password) {
    try {
      const res = await api.auth.login(username, password);
      if (res.success && res.data) {
        this.currentUser = res.data.user;
        localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
        // Sinkronisasi data dari MariaDB setelah login berhasil
        await this.loadAllData();
        return { success: true, user: this.currentUser };
      }
      return { success: false, message: res.message || 'Login gagal' };
    } catch (err) {
      return {
        success: false,
        message: err.message || 'Terjadi kesalahan saat masuk'
      };
    }
  },

  async logout() {
    try {
      await api.auth.logout();
    } catch (e) {
      // Abaikan error jaringan saat logout
    } finally {
      setToken(null);
      localStorage.removeItem(USER_KEY);
      this.currentUser = null;
      this.kategoriList = [];
      this.subKategoriList = [];
      this.userList = [];
      this.barangMasukList = [];
    }
  },

  // ==========================================
  // MASTER KATEGORI
  // ==========================================
  async addKategori(kategori) {
    try {
      const res = await api.kategori.create(kategori);
      if (res.success && res.data) {
        this.kategoriList.unshift(res.data);
      } else {
        await this.loadAllData();
      }
      this.showToast('Kategori baru berhasil ditambahkan!', 'success');
      return res;
    } catch (err) {
      this.showToast(err.message, 'error');
      throw err;
    }
  },

  async updateKategori(id, data) {
    try {
      const res = await api.kategori.update(id, data);
      const index = this.kategoriList.findIndex(k => k.id === id);
      if (index !== -1 && res.data) {
        this.kategoriList[index] = { ...this.kategoriList[index], ...res.data };
      } else {
        await this.loadAllData();
      }
      this.showToast('Kategori berhasil diperbarui!', 'success');
      return res;
    } catch (err) {
      this.showToast(err.message, 'error');
      throw err;
    }
  },

  async deleteKategori(id) {
    try {
      await api.kategori.delete(id);
      this.kategoriList = this.kategoriList.filter(k => k.id !== id);
      this.showToast('Kategori berhasil dihapus!', 'success');
    } catch (err) {
      this.showToast(err.message, 'error');
      throw err;
    }
  },

  // ==========================================
  // MASTER SUB KATEGORI
  // ==========================================
  async addSubKategori(sub) {
    try {
      const res = await api.subKategori.create(sub);
      if (res.success && res.data) {
        this.subKategoriList.unshift(res.data);
      } else {
        await this.loadAllData();
      }
      this.showToast('Sub Kategori berhasil ditambahkan!', 'success');
      return res;
    } catch (err) {
      this.showToast(err.message, 'error');
      throw err;
    }
  },

  async updateSubKategori(id, data) {
    try {
      const res = await api.subKategori.update(id, data);
      const index = this.subKategoriList.findIndex(s => s.id === id);
      if (index !== -1 && res.data) {
        this.subKategoriList[index] = { ...this.subKategoriList[index], ...res.data };
      } else {
        await this.loadAllData();
      }
      this.showToast('Sub Kategori berhasil diperbarui!', 'success');
      return res;
    } catch (err) {
      this.showToast(err.message, 'error');
      throw err;
    }
  },

  async deleteSubKategori(id) {
    try {
      await api.subKategori.delete(id);
      this.subKategoriList = this.subKategoriList.filter(s => s.id !== id);
      this.showToast('Sub Kategori berhasil dihapus!', 'success');
    } catch (err) {
      this.showToast(err.message, 'error');
      throw err;
    }
  },

  // ==========================================
  // MANAJEMEN USER
  // ==========================================
  async addUser(userData) {
    try {
      const res = await api.users.create(userData);
      if (res.success && res.data) {
        this.userList.unshift(res.data);
      } else {
        await this.loadAllData();
      }
      this.showToast('Pengguna baru berhasil ditambahkan!', 'success');
      return res;
    } catch (err) {
      this.showToast(err.message, 'error');
      throw err;
    }
  },

  async updateUser(id, userData) {
    try {
      const res = await api.users.update(id, userData);
      const index = this.userList.findIndex(u => u.id === id);
      if (index !== -1 && res.data) {
        this.userList[index] = { ...this.userList[index], ...res.data };
      } else {
        await this.loadAllData();
      }
      if (this.currentUser?.id === id && res.data) {
        this.currentUser = { ...this.currentUser, ...res.data };
        localStorage.setItem(USER_KEY, JSON.stringify(this.currentUser));
      }
      this.showToast('Data pengguna berhasil diperbarui!', 'success');
      return res;
    } catch (err) {
      this.showToast(err.message, 'error');
      throw err;
    }
  },

  async toggleLockUser(id) {
    try {
      const res = await api.users.toggleLock(id);
      const index = this.userList.findIndex(u => u.id === id);
      if (index !== -1 && res.data) {
        this.userList[index].isLocked = res.data.isLocked;
      }
      const isLocked = res.data?.isLocked;
      this.showToast(
        isLocked ? 'Akun pengguna berhasil DIKUNCI (Locked)' : 'Akun pengguna berhasil DIBUKA (Unlocked)',
        isLocked ? 'warning' : 'success'
      );
      return res;
    } catch (err) {
      this.showToast(err.message, 'error');
      throw err;
    }
  },

  async deleteUser(id) {
    try {
      await api.users.delete(id);
      this.userList = this.userList.filter(u => u.id !== id);
      this.showToast('Pengguna berhasil dihapus!', 'success');
    } catch (err) {
      this.showToast(err.message, 'error');
      throw err;
    }
  },

  // ==========================================
  // BARANG MASUK
  // ==========================================
  async addBarangMasuk(payload, file = null) {
    try {
      const res = await api.barangMasuk.create(payload, file);
      if (res.success && res.data) {
        this.barangMasukList.unshift(res.data);
      } else {
        await this.loadAllData();
      }
      this.showToast('Data Barang Masuk berhasil disimpan!', 'success');
      return res;
    } catch (err) {
      this.showToast(err.message, 'error');
      throw err;
    }
  },

  async updateBarangMasuk(id, payload, file = null) {
    try {
      const res = await api.barangMasuk.update(id, payload, file);
      const index = this.barangMasukList.findIndex(b => b.id === id);
      if (index !== -1 && res.data) {
        this.barangMasukList[index] = { ...this.barangMasukList[index], ...res.data };
      } else {
        await this.loadAllData();
      }
      this.showToast('Data Barang Masuk berhasil diperbarui!', 'success');
      return res;
    } catch (err) {
      this.showToast(err.message, 'error');
      throw err;
    }
  },

  async deleteBarangMasuk(id) {
    try {
      await api.barangMasuk.delete(id);
      this.barangMasukList = this.barangMasukList.filter(b => b.id !== id);
      this.showToast('Data Barang Masuk berhasil dihapus!', 'success');
    } catch (err) {
      this.showToast(err.message, 'error');
      throw err;
    }
  },

  async toggleVerifikasiBarangMasuk(id) {
    try {
      const res = await api.barangMasuk.toggleVerifikasi(id);
      const item = this.barangMasukList.find(b => b.id === id);
      if (item && res.data) {
        item.isVerified = res.data.isVerified;
      }
      const verified = res.data?.isVerified;
      this.showToast(
        verified ? 'Status transaksi berhasil diverifikasi (centang hijau)!' : 'Verifikasi transaksi dibatalkan.',
        verified ? 'success' : 'info'
      );
      return res;
    } catch (err) {
      this.showToast(err.message, 'error');
      throw err;
    }
  },

  async exportExcel(filters = {}) {
    try {
      const blob = await api.barangMasuk.downloadExcel(filters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Laporan_Barang_Masuk_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      this.showToast('File Excel berhasil diunduh dari server!', 'success');
    } catch (err) {
      this.showToast('Gagal mengunduh Excel: ' + err.message, 'error');
      throw err;
    }
  }
});

// Auto initialize on load in browser environment
if (typeof window !== 'undefined') {
  store.init();
}

export default store;
