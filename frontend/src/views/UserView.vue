<template>
  <div>
    <!-- Header Section -->
    <div class="mb-3">
      <div class="text-uppercase small fw-bold text-muted mb-1" style="font-size: 0.72rem; letter-spacing: 0.05em;">
        HOME &nbsp;/&nbsp; MANAJEMEN USER
      </div>
      <h2 class="h1 fw-bold text-dark mb-0">
        Manajemen User
      </h2>
    </div>

    <!-- Toolbar: Tambah Data di Kiri, Filter Role & Search di Kanan -->
    <div class="row align-items-center g-2 mb-3">
      <!-- Left: Button "+ Tambah Data" -->
      <div class="col-auto">
        <button
          @click="openAddModal"
          type="button"
          class="btn btn-primary d-inline-flex align-items-center gap-1 px-3 py-2 fw-semibold"
          style="background-color: #216ac4; border-color: #216ac4;"
        >
          <span class="fs-4 lh-1">+</span>
          <span>Tambah Data</span>
        </button>
      </div>

      <!-- Right: Filter Role & Search Input -->
      <div class="col-auto ms-auto d-flex align-items-center gap-2">
        <!-- Filter Role -->
        <div style="width: 170px;">
          <select
            v-model="roleFilter"
            class="form-select bg-white"
          >
            <option value="">Semua Role</option>
            <option value="Admin">Admin</option>
            <option value="Operator">Operator</option>
          </select>
        </div>

        <!-- Search Input -->
        <div class="input-group" style="width: 250px;">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari data.."
            class="form-control bg-white"
          />
          <button class="btn btn-outline-secondary bg-white text-secondary" type="button" title="Cari">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <circle cx="10" cy="10" r="7" />
              <line x1="21" y1="21" x2="15" y2="15" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Table Card -->
    <div class="card shadow-sm border-0 mb-4 bg-white">
      <div class="table-responsive">
        <table class="table table-vcenter align-middle mb-0 custom-master-table">
          <thead>
            <tr class="text-uppercase text-secondary small fw-bold" style="font-size: 0.72rem; letter-spacing: 0.05em;">
              <th class="text-center py-3" style="width: 50px;">NO</th>
              <th class="py-3" style="width: 130px;">ACTION</th>
              <th class="py-3" style="width: 160px;">USERNAME</th>
              <th class="py-3">NAMA</th>
              <th class="py-3">EMAIL</th>
              <th class="py-3 text-center" style="width: 120px;">ROLE</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredList.length === 0">
              <td colspan="6" class="text-center py-5 text-secondary">
                <div class="py-3">
                  <p class="fw-bold mb-1">Tidak ada pengguna ditemukan</p>
                  <p class="small text-muted mb-0">Silakan tambah data baru atau sesuaikan kata kunci pencarian.</p>
                </div>
              </td>
            </tr>

            <tr
              v-for="(item, index) in paginatedList"
              :key="item.id"
              class="master-row"
            >
              <!-- NO -->
              <td class="text-center align-middle fw-medium text-dark">
                {{ (currentPage - 1) * pageSize + index + 1 }}
              </td>

              <!-- ACTION: ✏️ Edit, 🗑️ Hapus, 🔒/🔓 Lock/Unlock (tanpa wrapper div) -->
              <td class="align-middle text-nowrap">
                <!-- Edit ✏️ -->
                <button
                  type="button"
                  @click="openEditModal(item)"
                  class="btn p-1 border-0 bg-transparent text-secondary hover-primary d-inline-block"
                  title="Edit Pengguna"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-sm" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                    <line x1="13.5" y1="6.5" x2="17.5" y2="10.5" />
                  </svg>
                </button>

                <!-- Lock / Unlock 🔒/🔓 -->
                <button
                  type="button"
                  @click="toggleLockUser(item)"
                  :disabled="item.id === store.currentUser?.id"
                  class="btn p-1 border-0 bg-transparent d-inline-block"
                  :class="item.isLocked ? 'text-danger' : 'text-success'"
                  :title="item.id === store.currentUser?.id ? 'Akun aktif sendiri' : (item.isLocked ? 'Akun terkunci (Klik untuk Unlock)' : 'Akun aktif (Klik untuk Lock)')"
                >
                  <!-- Locked Icon (Gembok terkunci) -->
                  <svg v-if="item.isLocked" xmlns="http://www.w3.org/2000/svg" class="icon icon-sm text-danger" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <rect x="5" y="11" width="14" height="10" rx="2" />
                    <circle cx="12" cy="16" r="1" />
                    <path d="M8 11v-4a4 4 0 0 1 8 0v4" />
                  </svg>
                  <!-- Unlocked / Active Icon (Gembok terbuka) -->
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="icon icon-sm text-success" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <rect x="5" y="11" width="14" height="10" rx="2" />
                    <circle cx="12" cy="16" r="1" />
                    <path d="M8 11v-5a4 4 0 0 1 8 0" />
                  </svg>
                </button>

                <!-- Hapus 🗑️ -->
                <button
                  type="button"
                  @click="confirmDelete(item)"
                  :disabled="item.id === store.currentUser?.id"
                  class="btn p-1 border-0 bg-transparent text-danger d-inline-block"
                  :title="item.id === store.currentUser?.id ? 'Tidak dapat menghapus akun sendiri' : 'Hapus Pengguna'"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-sm text-danger" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <line x1="4" y1="7" x2="20" y2="7" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                    <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                    <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                  </svg>
                </button>
              </td>

              <!-- USERNAME -->
              <td class="fw-semibold text-secondary">
                {{ item.username }}
              </td>

              <!-- NAMA -->
              <td class="fw-medium text-dark">
                {{ item.nama }}
                <span v-if="item.id === store.currentUser?.id" class="badge bg-green-lt ms-1" style="font-size: 0.65rem;">
                  Anda
                </span>
              </td>

              <!-- EMAIL -->
              <td class="text-secondary small">
                {{ item.email }}
              </td>

              <!-- ROLE -->
              <td class="text-center">
                <span
                  class="badge"
                  :class="item.role === 'Admin' ? 'bg-purple-lt text-purple' : 'bg-blue-lt text-primary'"
                >
                  {{ item.role }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div class="card-footer bg-white border-0 py-3 d-flex justify-content-end align-items-center">
        <ul class="pagination m-0 align-items-center gap-1">
          <li
            v-for="page in totalPages"
            :key="page"
            class="page-item"
            :class="{ active: currentPage === page }"
          >
            <button
              class="page-link border-0 fw-semibold rounded"
              :style="currentPage === page ? 'background-color: #2b6cb0; color: white;' : 'background-color: transparent; color: #4a5568;'"
              @click="currentPage = page"
            >
              {{ page }}
            </button>
          </li>
        </ul>
      </div>
    </div>

    <!-- Modal Form (Tambah / Edit Pengguna) - Clear & No AI slop -->
    <div
      v-if="showModal"
      class="modal modal-blur fade show d-block"
      tabindex="-1"
      role="dialog"
      style="background-color: rgba(0, 0, 0, 0.5);"
    >
      <div class="modal-dialog modal-dialog-centered" role="document" style="max-width: 500px;">
        <div class="modal-content shadow-lg border-0 rounded-3">
          <form @submit.prevent="saveUser">
            <div class="modal-header border-0 pb-0">
              <h5 class="modal-title fw-bold text-dark fs-3">
                {{ isEditing ? 'Edit User' : 'Tambah User' }}
              </h5>
              <button
                type="button"
                class="btn-close"
                aria-label="Close"
                @click="showModal = false"
              ></button>
            </div>

            <div class="modal-body py-3">
              <div v-if="modalError" class="alert alert-danger py-2 px-3 small mb-3" role="alert">
                {{ modalError }}
              </div>

              <!-- Role -->
              <div class="mb-3">
                <label class="form-label text-dark fw-medium small mb-1">
                  Role
                </label>
                <select
                  v-model="form.role"
                  required
                  class="form-select bg-white"
                >
                  <option value="Operator">Operator</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <!-- Username -->
              <div class="mb-3">
                <label class="form-label text-dark fw-medium small mb-1">
                  Username
                </label>
                <input
                  v-model="form.username"
                  type="text"
                  required
                  minlength="8"
                  maxlength="100"
                  class="form-control bg-white"
                  autocomplete="username"
                />
              </div>

              <!-- Nama -->
              <div class="mb-3">
                <label class="form-label text-dark fw-medium small mb-1">
                  Nama
                </label>
                <input
                  v-model="form.nama"
                  type="text"
                  required
                  minlength="8"
                  maxlength="100"
                  class="form-control bg-white"
                />
              </div>

              <!-- Email -->
              <div class="mb-3">
                <label class="form-label text-dark fw-medium small mb-1">
                  Email
                </label>
                <input
                  v-model="form.email"
                  type="email"
                  required
                  minlength="8"
                  maxlength="100"
                  class="form-control bg-white"
                />
              </div>

              <!-- Password -->
              <div class="mb-3">
                <label class="form-label text-dark fw-medium small mb-1">
                  Password {{ isEditing ? '(Opsional jika tidak diubah)' : '' }}
                </label>
                <div class="input-group">
                  <input
                    v-model="form.password"
                    :type="showPassword ? 'text' : 'password'"
                    :required="!isEditing"
                    minlength="8"
                    maxlength="100"
                    placeholder="Min 8 karakter, huruf besar, kecil & angka"
                    class="form-control bg-white"
                    autocomplete="new-password"
                  />
                  <button
                    type="button"
                    class="btn btn-outline-secondary bg-white text-secondary"
                    @click="showPassword = !showPassword"
                  >
                    {{ showPassword ? 'Hide' : 'Show' }}
                  </button>
                </div>
              </div>
            </div>

            <div class="modal-footer border-0 pt-0 pb-3 pe-3">
              <button
                type="button"
                class="btn btn-light px-3 fw-medium text-secondary"
                @click="showModal = false"
              >
                Batal
              </button>
              <button
                type="submit"
                class="btn btn-primary px-4 fw-medium text-white"
                style="background-color: #2b708b; border-color: #2b708b;"
              >
                Simpan
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
      :message="`Apakah Anda yakin ingin menghapus akun '${itemToDelete?.nama}' (${itemToDelete?.username})?`"
      confirmText="Ya, Hapus"
      :danger="true"
      @confirm="executeDelete"
      @cancel="showDeleteModal = false"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { store } from '../store/mockStore';
import ConfirmModal from '../components/ConfirmModal.vue';

onMounted(() => {
  store.loadAllData();
});

const searchQuery = ref('');
const roleFilter = ref('');
const currentPage = ref(1);
const pageSize = 10;

const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const modalError = ref('');
const showPassword = ref(false);

const showDeleteModal = ref(false);
const itemToDelete = ref(null);

const form = reactive({
  role: 'Operator',
  nama: '',
  username: '',
  email: '',
  password: ''
});

// Password validation
const hasMinLength = computed(() => (form.password || '').length >= 8 && (form.password || '').length <= 100);
const hasUppercase = computed(() => /[A-Z]/.test(form.password || ''));
const hasLowercase = computed(() => /[a-z]/.test(form.password || ''));
const hasNumber = computed(() => /[0-9]/.test(form.password || ''));
const isPasswordValid = computed(() => hasMinLength.value && hasUppercase.value && hasLowercase.value && hasNumber.value);

const filteredList = computed(() => {
  let list = [...(store.userList || [])];

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase();
    list = list.filter(u => u.username.toLowerCase().includes(q) || u.nama.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }

  if (roleFilter.value) {
    list = list.filter(u => u.role === roleFilter.value);
  }

  return list;
});

const totalPages = computed(() => Math.ceil(filteredList.value.length / pageSize) || 1);
const startIndex = computed(() => (currentPage.value - 1) * pageSize);
const endIndex = computed(() => startIndex.value + pageSize);
const paginatedList = computed(() => filteredList.value.slice(startIndex.value, endIndex.value));

async function toggleLockUser(user) {
  if (user.id === store.currentUser?.id) {
    store.showToast('Anda tidak dapat mengunci akun Anda sendiri yang sedang aktif!', 'error');
    return;
  }
  try {
    await store.toggleLockUser(user.id);
  } catch (err) {
    console.error(err);
  }
}

function openAddModal() {
  isEditing.value = false;
  editingId.value = null;
  form.role = 'Operator';
  form.nama = '';
  form.username = '';
  form.email = '';
  form.password = '';
  modalError.value = '';
  showModal.value = true;
}

function openEditModal(item) {
  isEditing.value = true;
  editingId.value = item.id;
  form.role = item.role;
  form.nama = item.nama;
  form.username = item.username;
  form.email = item.email;
  form.password = '';
  modalError.value = '';
  showModal.value = true;
}

async function saveUser() {
  modalError.value = '';

  const nama = form.nama.trim();
  const username = form.username.trim();
  const email = form.email.trim();

  // Validasi Nama: 8-100 karakter
  if (nama.length < 8 || nama.length > 100) {
    modalError.value = 'Nama lengkap wajib diisi antara 8 sampai 100 karakter!';
    return;
  }

  // Validasi Username: 8-100 karakter & unique
  if (username.length < 8 || username.length > 100) {
    modalError.value = 'Username wajib diisi antara 8 sampai 100 karakter!';
    return;
  }

  const isDuplicate = (store.userList || []).some(u => {
    if (isEditing.value && u.id === editingId.value) return false;
    return u.username.toLowerCase() === username.toLowerCase();
  });

  if (isDuplicate) {
    modalError.value = `Username '${username}' sudah digunakan oleh pengguna lain!`;
    return;
  }

  // Validasi Email: 8-100 karakter & format email valid
  const emailRegex = /^[^\s@]+@[^\s@]+.[^\s@]+$/;
  if (email.length < 8 || email.length > 100 || !emailRegex.test(email)) {
    modalError.value = 'Format email tidak valid atau panjangnya bukan antara 8 - 100 karakter!';
    return;
  }

  // Validasi Password
  if (!isEditing.value || form.password) {
    if (!isPasswordValid.value) {
      modalError.value = 'Password harus 8–100 karakter, kombinasi huruf besar, huruf kecil, dan angka!';
      return;
    }
  }

  const payload = {
    role: form.role,
    nama,
    username,
    email
  };

  if (form.password) {
    payload.password = form.password;
  }

  try {
    if (isEditing.value) {
      await store.updateUser(editingId.value, payload);
    } else {
      payload.password = form.password;
      await store.addUser(payload);
    }
    showModal.value = false;
  } catch (err) {
    modalError.value = err.message || 'Gagal menyimpan data pengguna';
  }
}

function confirmDelete(item) {
  itemToDelete.value = item;
  showDeleteModal.value = true;
}

async function executeDelete() {
  if (itemToDelete.value) {
    try {
      await store.deleteUser(itemToDelete.value.id);
      showDeleteModal.value = false;
      itemToDelete.value = null;
    } catch (err) {
      console.error(err);
    }
  }
}
</script>

<style scoped>
.custom-master-table thead tr th {
  background-color: #f8fafc;
  color: #64748b;
  border-bottom: 2px solid #e2e8f0;
  border-top: none;
  font-weight: 700;
}

.custom-master-table tbody tr {
  border-bottom: 1px solid #f1f5f9;
}

.custom-master-table tbody tr:hover {
  background-color: #f8fafc;
}

.custom-master-table tbody tr td {
  padding-top: 0.85rem;
  padding-bottom: 0.85rem;
}

.hover-primary:hover {
  color: #206bc4 !important;
}
</style>
