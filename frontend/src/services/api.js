/**
 * HTTP API Service for JMC Inventory System
 * Handles communication with Express backend REST API
 */

const API_BASE_URL = '/api';

const TOKEN_KEY = 'jmc_jwt_token';

const getToken = () => {
  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem('arrg_jwt_token') || '';
};

export const setToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('arrg_jwt_token');
  }
};

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    Accept: 'application/json',
    ...(options.headers || {})
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If body is NOT FormData, default to application/json
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  // Handle binary / blob responses (e.g. Excel export)
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('spreadsheetml') || contentType.includes('octet-stream')) {
    if (!response.ok) {
      throw new Error('Gagal mengunduh file.');
    }
    return await response.blob();
  }

  let result;
  try {
    result = await response.json();
  } catch (e) {
    result = { success: false, message: 'Respons server tidak valid' };
  }

  if (!response.ok) {
    let errorMessage = result.message || 'Terjadi kesalahan pada permintaan';
    if (result.errors && Array.isArray(result.errors) && result.errors.length > 0) {
      errorMessage = result.errors.join('; ');
    }
    const error = new Error(errorMessage);
    error.statusCode = response.status;
    error.errors = result.errors || [];
    error.data = result;
    throw error;
  }

  return result;
}

export const api = {
  // 1. Autentikasi
  auth: {
    async login(username, password) {
      const res = await request('/auth/login', {
        method: 'POST',
        body: { username, password }
      });
      if (res.data?.token) {
        setToken(res.data.token);
      }
      return res;
    },
    async me() {
      return await request('/auth/me', { method: 'GET' });
    },
    async logout() {
      try {
        await request('/auth/logout', { method: 'POST' });
      } finally {
        setToken(null);
      }
    }
  },

  // 2. Master Kategori
  kategori: {
    async getAll(params = {}) {
      const query = new URLSearchParams(params).toString();
      return await request(`/kategori${query ? `?${query}` : ''}`, { method: 'GET' });
    },
    async getById(id) {
      return await request(`/kategori/${id}`, { method: 'GET' });
    },
    async create(data) {
      return await request('/kategori', {
        method: 'POST',
        body: data
      });
    },
    async update(id, data) {
      return await request(`/kategori/${id}`, {
        method: 'PUT',
        body: data
      });
    },
    async delete(id) {
      return await request(`/kategori/${id}`, { method: 'DELETE' });
    }
  },

  // 3. Master Sub Kategori
  subKategori: {
    async getAll(params = {}) {
      const query = new URLSearchParams(params).toString();
      return await request(`/sub-kategori${query ? `?${query}` : ''}`, { method: 'GET' });
    },
    async getById(id) {
      return await request(`/sub-kategori/${id}`, { method: 'GET' });
    },
    async create(data) {
      return await request('/sub-kategori', {
        method: 'POST',
        body: data
      });
    },
    async update(id, data) {
      return await request(`/sub-kategori/${id}`, {
        method: 'PUT',
        body: data
      });
    },
    async delete(id) {
      return await request(`/sub-kategori/${id}`, { method: 'DELETE' });
    }
  },

  // 4. Manajemen User
  users: {
    async getAll(params = {}) {
      const query = new URLSearchParams(params).toString();
      return await request(`/users${query ? `?${query}` : ''}`, { method: 'GET' });
    },
    async getById(id) {
      return await request(`/users/${id}`, { method: 'GET' });
    },
    async create(data) {
      return await request('/users', {
        method: 'POST',
        body: data
      });
    },
    async update(id, data) {
      return await request(`/users/${id}`, {
        method: 'PUT',
        body: data
      });
    },
    async toggleLock(id, isLocked = null) {
      return await request(`/users/${id}/lock`, {
        method: 'PATCH',
        body: isLocked !== null ? { isLocked } : {}
      });
    },
    async delete(id) {
      return await request(`/users/${id}`, { method: 'DELETE' });
    }
  },

  // 5. Barang Masuk
  barangMasuk: {
    async getAll(params = {}) {
      const query = new URLSearchParams(params).toString();
      return await request(`/barang-masuk${query ? `?${query}` : ''}`, { method: 'GET' });
    },
    async getById(id) {
      return await request(`/barang-masuk/${id}`, { method: 'GET' });
    },
    async create(data, file = null) {
      if (file) {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
          if (key === 'items') {
            formData.append('items', typeof data.items === 'string' ? data.items : JSON.stringify(data.items));
          } else if (data[key] !== undefined && data[key] !== null) {
            formData.append(key, data[key]);
          }
        });
        formData.append('lampiran', file);
        return await request('/barang-masuk', {
          method: 'POST',
          body: formData
        });
      } else {
        return await request('/barang-masuk', {
          method: 'POST',
          body: data
        });
      }
    },
    async update(id, data, file = null) {
      if (file) {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
          if (key === 'items') {
            formData.append('items', typeof data.items === 'string' ? data.items : JSON.stringify(data.items));
          } else if (data[key] !== undefined && data[key] !== null) {
            formData.append(key, data[key]);
          }
        });
        formData.append('lampiran', file);
        return await request(`/barang-masuk/${id}`, {
          method: 'PUT',
          body: formData
        });
      } else {
        return await request(`/barang-masuk/${id}`, {
          method: 'PUT',
          body: data
        });
      }
    },
    async delete(id) {
      return await request(`/barang-masuk/${id}`, { method: 'DELETE' });
    },
    async toggleVerifikasi(id) {
      return await request(`/barang-masuk/${id}/verifikasi`, { method: 'PATCH' });
    },
    async getCetak(id) {
      return await request(`/barang-masuk/${id}/cetak`, { method: 'GET' });
    },
    async downloadExcel(params = {}) {
      const query = new URLSearchParams(params).toString();
      return await request(`/barang-masuk/export/excel${query ? `?${query}` : ''}`, { method: 'GET' });
    }
  }
};

export default api;
