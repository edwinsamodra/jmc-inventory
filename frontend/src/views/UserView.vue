<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Manajemen User
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">
          Kelola akun pengguna, hak akses per role, dan kunci akses login (Lock/Unlock).
        </p>
      </div>

      <button
        @click="openAddModal"
        type="button"
        class="inline-flex items-center px-4 py-2 border border-transparent bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition shadow-xs self-start sm:self-auto"
      >
        <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
        Tambah User
      </button>
    </div>

    <!-- Toolbar: Search & Role Filter -->
    <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
      <div class="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <!-- Search -->
        <div class="w-full sm:w-72 relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari username atau nama..."
            class="block w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
          />
        </div>

        <!-- Filter Role -->
        <div class="w-full sm:w-48">
          <select
            v-model="roleFilter"
            class="block w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
          >
            <option value="">-- Semua Role --</option>
            <option value="Admin">Admin</option>
            <option value="Operator">Operator</option>
          </select>
        </div>
      </div>

      <div class="text-xs text-slate-500 w-full sm:w-auto text-right">
        Total <strong class="text-slate-800 font-semibold">{{ filteredList.length }}</strong> pengguna
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-2xs uppercase tracking-wider font-bold text-slate-500">
              <th class="py-3 px-4 text-center w-12">No</th>
              <th class="py-3 px-4">Nama Lengkap</th>
              <th class="py-3 px-4">Username</th>
              <th class="py-3 px-4">Email</th>
              <th class="py-3 px-4 text-center">Role</th>
              <th class="py-3 px-4 text-center">Status Akun</th>
              <th class="py-3 px-4 text-center w-36">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="(user, index) in paginatedList"
              :key="user.id"
              class="hover:bg-slate-50/80 transition"
              :class="user.isLocked ? 'bg-rose-50/30' : ''"
            >
              <td class="py-3 px-4 text-center text-slate-400 font-medium">
                {{ (currentPage - 1) * pageSize + index + 1 }}
              </td>

              <!-- Nama -->
              <td class="py-3 px-4">
                <div class="font-bold text-slate-900 flex items-center">
                  {{ user.nama }}
                  <span v-if="user.id === store.currentUser?.id" class="ml-2 text-2xs px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-normal">
                    Anda
                  </span>
                </div>
              </td>

              <!-- Username -->
              <td class="py-3 px-4 font-mono font-medium text-slate-700">
                @{{ user.username }}
              </td>

              <!-- Email -->
              <td class="py-3 px-4 text-slate-600">
                {{ user.email }}
              </td>

              <!-- Role -->
              <td class="py-3 px-4 text-center">
                <span
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-2xs font-bold"
                  :class="user.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'"
                >
                  {{ user.role }}
                </span>
              </td>

              <!-- Status Akun (Aktif / Terkunci) -->
              <td class="py-3 px-4 text-center">
                <span
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-2xs font-semibold"
                  :class="user.isLocked ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'"
                >
                  <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="user.isLocked ? 'bg-rose-500' : 'bg-emerald-500'"></span>
                  {{ user.isLocked ? 'Terkunci (Locked)' : 'Aktif' }}
                </span>
              </td>

              <!-- Aksi -->
              <td class="py-3 px-4 text-center whitespace-nowrap">
                <div class="inline-flex items-center space-x-1">
                  <!-- Lock / Unlock Toggle Button (Brief requirement) -->
                  <button
                    @click="handleToggleLock(user)"
                    type="button"
                    class="p-1.5 rounded-lg transition"
                    :class="user.isLocked
                      ? 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50'
                      : 'text-rose-600 hover:text-rose-800 hover:bg-rose-50'"
                    :title="user.isLocked ? 'Buka Kunci (Unlock) Akun' : 'Kunci (Lock) Akun - User tidak bisa login'"
                  >
                    <!-- Unlock Icon -->
                    <svg v-if="user.isLocked" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                    <!-- Lock Icon -->
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </button>

                  <!-- Edit -->
                  <button
                    @click="openEditModal(user)"
                    type="button"
                    class="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition"
                    title="Ubah Data User"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  <!-- Delete -->
                  <button
                    @click="confirmDelete(user)"
                    :disabled="user.id === store.currentUser?.id"
                    type="button"
                    class="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Hapus User"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="filteredList.length === 0">
              <td colspan="7" class="py-10 text-center text-slate-400">
                Tidak ada data user yang sesuai dengan filter atau pencarian.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer (10 per page) -->
      <div class="px-4 py-3 sm:px-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div>
          Menampilkan
          <strong class="font-semibold text-slate-900">{{ startIndex + 1 }}</strong> -
          <strong class="font-semibold text-slate-900">{{ Math.min(endIndex, filteredList.length) }}</strong>
          dari <strong class="font-semibold text-slate-900">{{ filteredList.length }}</strong> user
        </div>

        <div class="flex items-center space-x-1.5">
          <button
            @click="currentPage--"
            :disabled="currentPage <= 1"
            class="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium"
          >
            Sebelumnya
          </button>
          <template v-for="page in totalPages" :key="page">
            <button
              @click="currentPage = page"
              class="w-8 h-8 rounded-lg font-semibold transition"
              :class="currentPage === page ? 'bg-brand-600 text-white shadow-2xs' : 'border border-slate-200 hover:bg-slate-50 text-slate-700'"
            >
              {{ page }}
            </button>
          </template>
          <button
            @click="currentPage++"
            :disabled="currentPage >= totalPages"
            class="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium"
          >
            Berikutnya
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Form Tambah / Edit User -->
    <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-center justify-center min-h-screen p-4 text-center sm:p-0">
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" @click="closeModal"></div>

        <div class="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full border border-slate-100 p-6">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 class="text-base font-bold text-slate-900">
              {{ editingId ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru' }}
            </h3>
            <button @click="closeModal" class="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
              &times;
            </button>
          </div>

          <form @submit.prevent="saveUser" class="mt-4 space-y-4">
            <!-- Role (Combobox: Admin atau Operator) -->
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Role Pengguna <span class="text-rose-500">*</span>
              </label>
              <select
                v-model="form.role"
                required
                class="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
              >
                <option value="Operator">Operator</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <!-- Nama (8-100 char) -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Nama Lengkap <span class="text-rose-500">*</span>
                </label>
                <span class="text-2xs text-slate-400">{{ form.nama.length }}/100 (min 8)</span>
              </div>
              <input
                v-model="form.nama"
                type="text"
                minlength="8"
                maxlength="100"
                placeholder="Contoh: Budi Prasetyo"
                required
                class="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
              />
              <p v-if="validationErrors.nama" class="text-2xs text-rose-500 mt-1">{{ validationErrors.nama }}</p>
            </div>

            <!-- Username (Unique, 8-100 char) -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Username <span class="text-rose-500">*</span>
                </label>
                <span class="text-2xs text-slate-400">{{ form.username.length }}/100 (min 8)</span>
              </div>
              <input
                v-model="form.username"
                type="text"
                minlength="8"
                maxlength="100"
                placeholder="Contoh: budi_prasetyo"
                required
                class="block w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
              />
              <p v-if="validationErrors.username" class="text-2xs text-rose-500 mt-1">{{ validationErrors.username }}</p>
            </div>

            <!-- Email (8-100 char, valid email format) -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Email <span class="text-rose-500">*</span>
                </label>
                <span class="text-2xs text-slate-400">{{ form.email.length }}/100</span>
              </div>
              <input
                v-model="form.email"
                type="email"
                minlength="8"
                maxlength="100"
                placeholder="budi@arrg.local"
                required
                class="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
              />
              <p v-if="validationErrors.email" class="text-2xs text-rose-500 mt-1">{{ validationErrors.email }}</p>
            </div>

            <!-- Password (8-100 char, uppercase, lowercase, number) -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Password <span v-if="!editingId" class="text-rose-500">*</span>
                  <span v-else class="text-slate-400 font-normal lowercase">(kosongkan jika tidak diubah)</span>
                </label>
                <span class="text-2xs text-slate-400">{{ form.password.length }}/100 (min 8)</span>
              </div>
              <input
                v-model="form.password"
                type="password"
                :required="!editingId"
                placeholder="Minimal 8 karakter (A-Z, a-z, 0-9)"
                class="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
              />

              <!-- Password requirements checklist -->
              <div v-if="form.password || !editingId" class="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-2xs space-y-1">
                <div class="font-semibold text-slate-600 mb-1">Ketentuan Password:</div>
                <div class="flex items-center" :class="form.password.length >= 8 ? 'text-emerald-600 font-semibold' : 'text-slate-400'">
                  <span class="mr-1.5">{{ form.password.length >= 8 ? '✓' : '•' }}</span> Panjang minimal 8 - 100 karakter
                </div>
                <div class="flex items-center" :class="/[A-Z]/.test(form.password) ? 'text-emerald-600 font-semibold' : 'text-slate-400'">
                  <span class="mr-1.5">{{ /[A-Z]/.test(form.password) ? '✓' : '•' }}</span> Mengandung huruf besar (A-Z)
                </div>
                <div class="flex items-center" :class="/[a-z]/.test(form.password) ? 'text-emerald-600 font-semibold' : 'text-slate-400'">
                  <span class="mr-1.5">{{ /[a-z]/.test(form.password) ? '✓' : '•' }}</span> Mengandung huruf kecil (a-z)
                </div>
                <div class="flex items-center" :class="/[0-9]/.test(form.password) ? 'text-emerald-600 font-semibold' : 'text-slate-400'">
                  <span class="mr-1.5">{{ /[0-9]/.test(form.password) ? '✓' : '•' }}</span> Mengandung angka (0-9)
                </div>
              </div>
              <p v-if="validationErrors.password" class="text-2xs text-rose-500 mt-1">{{ validationErrors.password }}</p>
            </div>

            <div class="mt-6 flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                {{ editingId ? 'Simpan Perubahan' : 'Daftarkan Pengguna' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Confirm Delete Modal -->
    <ConfirmModal
      :show="showDeleteModal"
      title="Hapus Pengguna"
      :message="`Apakah Anda yakin ingin menghapus user '${userToDelete?.nama}' (@${userToDelete?.username})?`"
      confirmText="Ya, Hapus"
      :danger="true"
      @confirm="executeDelete"
      @cancel="showDeleteModal = false"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { store } from '../store/mockStore';
import ConfirmModal from '../components/ConfirmModal.vue';

const searchQuery = ref('');
const roleFilter = ref('');
const currentPage = ref(1);
const pageSize = 10;

// Filtered list
const filteredList = computed(() => {
  let list = store.userList;
  if (roleFilter.value) {
    list = list.filter(u => u.role === roleFilter.value);
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase();
    list = list.filter(u => u.username.toLowerCase().includes(q) || u.nama.toLowerCase().includes(q));
  }
  return list;
});

// Pagination
const totalPages = computed(() => Math.ceil(filteredList.value.length / pageSize) || 1);
const startIndex = computed(() => (currentPage.value - 1) * pageSize);
const endIndex = computed(() => startIndex.value + pageSize);
const paginatedList = computed(() => filteredList.value.slice(startIndex.value, endIndex.value));

// Toggle lock
function handleToggleLock(user) {
  try {
    store.toggleLockUser(user.id);
  } catch (err) {
    alert(err.message);
  }
}

// Modal Form State
const showModal = ref(false);
const editingId = ref(null);
const form = reactive({
  role: 'Operator',
  nama: '',
  username: '',
  email: '',
  password: ''
});

const validationErrors = reactive({
  nama: '',
  username: '',
  email: '',
  password: ''
});

function openAddModal() {
  editingId.value = null;
  form.role = 'Operator';
  form.nama = '';
  form.username = '';
  form.email = '';
  form.password = '';
  clearErrors();
  showModal.value = true;
}

function openEditModal(user) {
  editingId.value = user.id;
  form.role = user.role;
  form.nama = user.nama;
  form.username = user.username;
  form.email = user.email;
  form.password = ''; // left blank to keep current
  clearErrors();
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  editingId.value = null;
}

function clearErrors() {
  validationErrors.nama = '';
  validationErrors.username = '';
  validationErrors.email = '';
  validationErrors.password = '';
}

function validatePasswordString(pwd) {
  if (pwd.length < 8 || pwd.length > 100) return false;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNum = /[0-9]/.test(pwd);
  return hasUpper && hasLower && hasNum;
}

function saveUser() {
  clearErrors();
  let hasError = false;

  // Nama 8-100 char
  if (form.nama.length < 8 || form.nama.length > 100) {
    validationErrors.nama = 'Nama wajib 8 - 100 karakter!';
    hasError = true;
  }

  // Username 8-100 char
  if (form.username.length < 8 || form.username.length > 100) {
    validationErrors.username = 'Username wajib 8 - 100 karakter!';
    hasError = true;
  }

  // Email 8-100 char and valid email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (form.email.length < 8 || form.email.length > 100 || !emailRegex.test(form.email)) {
    validationErrors.email = 'Format email tidak valid (harus 8 - 100 karakter)!';
    hasError = true;
  }

  // Password validation
  if (!editingId.value || form.password) {
    if (!validatePasswordString(form.password)) {
      validationErrors.password = 'Password harus 8-100 karakter dengan kombinasi huruf besar, huruf kecil, dan angka!';
      hasError = true;
    }
  }

  if (hasError) return;

  try {
    if (editingId.value) {
      store.updateUser(editingId.value, { ...form });
    } else {
      store.addUser({ ...form });
    }
    closeModal();
  } catch (err) {
    alert(err.message);
  }
}

// Delete State
const showDeleteModal = ref(false);
const userToDelete = ref(null);

function confirmDelete(user) {
  userToDelete.value = user;
  showDeleteModal.value = true;
}

function executeDelete() {
  if (userToDelete.value) {
    try {
      store.deleteUser(userToDelete.value.id);
      showDeleteModal.value = false;
      userToDelete.value = null;
    } catch (err) {
      alert(err.message);
      showDeleteModal.value = false;
    }
  }
}
</script>
