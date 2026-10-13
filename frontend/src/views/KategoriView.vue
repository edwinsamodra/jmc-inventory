<template>
  <div>
    <!-- Header Section -->
    <div class="mb-3">
      <div class="text-uppercase small fw-bold text-muted mb-1" style="font-size: 0.72rem; letter-spacing: 0.05em;">
        HOME &nbsp;/&nbsp; MASTER DATA &nbsp;/&nbsp; KATEGORI
      </div>
      <h2 class="h1 fw-bold text-dark mb-0">
        Kategori
      </h2>
    </div>

    <!-- Toolbar: Tambah Data di Kiri, Search di Kanan -->
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

      <!-- Right: Search Input -->
      <div class="col-auto ms-auto">
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
              <th class="py-3" style="width: 100px;">ACTION</th>
              <th class="py-3" style="width: 180px;">KODE</th>
              <th class="py-3">NAMA KATEGORI</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredList.length === 0">
              <td colspan="4" class="text-center py-5 text-secondary">
                <div class="py-3">
                  <p class="fw-bold mb-1">Tidak ada kategori ditemukan</p>
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

              <!-- ACTION: ✏️ Edit, 🗑️ Hapus (tanpa wrapper div) -->
              <td class="align-middle text-nowrap">
                <!-- Edit ✏️ -->
                <button
                  type="button"
                  @click="openEditModal(item)"
                  class="btn p-1 border-0 bg-transparent text-secondary hover-primary d-inline-block"
                  title="Edit Data"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-sm" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                    <line x1="13.5" y1="6.5" x2="17.5" y2="10.5" />
                  </svg>
                </button>

                <!-- Hapus 🗑️ -->
                <button
                  type="button"
                  @click="confirmDelete(item)"
                  class="btn p-1 border-0 bg-transparent text-danger d-inline-block"
                  title="Hapus Data"
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

              <!-- KODE -->
              <td class="fw-semibold text-secondary">
                {{ item.kode }}
              </td>

              <!-- NAMA KATEGORI -->
              <td class="fw-medium text-dark">
                {{ item.nama }}
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

          <li class="page-item" :class="{ disabled: currentPage >= totalPages }">
            <button
              class="page-link border-0 text-secondary bg-transparent d-flex align-items-center gap-1"
              @click="currentPage++"
            >
              <span>next</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-sm" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <polyline points="9 6 15 12 9 18" />
              </svg>
            </button>
          </li>
        </ul>
      </div>
    </div>

    <!-- Modal Form (Tambah / Edit Kategori) - Clean & Clear tanpa AI guidance slop -->
    <div v-if="showModal" class="modal modal-blur fade show d-block" tabindex="-1" role="dialog" style="background-color: rgba(0, 0, 0, 0.45);">
      <div class="modal-dialog modal-dialog-centered" style="max-width: 440px;" role="document">
        <div class="modal-content shadow-lg border-0 rounded-2">
          <form @submit.prevent="saveKategori">
            <div class="modal-header border-bottom py-3 px-4">
              <h5 class="modal-title fw-bold text-dark m-0">
                {{ isEditing ? 'Edit Kategori' : 'Tambah Kategori' }}
              </h5>
              <button type="button" class="btn-close" aria-label="Close" @click="showModal = false"></button>
            </div>

            <div class="modal-body px-4 py-4">
              <div v-if="modalError" class="alert alert-danger py-2 px-3 mb-3 small" role="alert">
                {{ modalError }}
              </div>

              <!-- Kode Kategori -->
              <div class="mb-3">
                <label class="form-label text-dark fw-medium small mb-1">Kode Kategori</label>
                <input
                  v-model="form.kode"
                  type="text"
                  maxlength="10"
                  required
                  placeholder="Contoh: ATK"
                  class="form-control text-uppercase"
                  autocomplete="off"
                />
              </div>

              <!-- Nama Kategori -->
              <div class="mb-2">
                <label class="form-label text-dark fw-medium small mb-1">Nama Kategori</label>
                <input
                  v-model="form.nama"
                  type="text"
                  maxlength="100"
                  required
                  placeholder="Contoh: Alat Tulis Kantor"
                  class="form-control"
                />
              </div>
            </div>

            <div class="modal-footer border-top py-3 px-4 d-flex justify-content-end gap-2">
              <button type="button" class="btn btn-outline-secondary px-3" @click="showModal = false">
                Batal
              </button>
              <button
                type="submit"
                class="btn text-white px-4 fw-semibold"
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
      title="Hapus Kategori"
      :message="`Apakah Anda yakin ingin menghapus kategori '${itemToDelete?.nama}'? Data sub-kategori terkait juga akan terhapus.`"
      confirmText="Ya, Hapus Data"
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
const currentPage = ref(1);
const pageSize = 10;

const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const modalError = ref('');

const showDeleteModal = ref(false);
const itemToDelete = ref(null);

const form = reactive({
  kode: '',
  nama: ''
});

const filteredList = computed(() => {
  let list = [...store.kategoriList];
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase();
    list = list.filter(k => k.kode.toLowerCase().includes(q) || k.nama.toLowerCase().includes(q));
  }
  return list;
});

const totalPages = computed(() => Math.ceil(filteredList.value.length / pageSize) || 1);
const startIndex = computed(() => (currentPage.value - 1) * pageSize);
const endIndex = computed(() => startIndex.value + pageSize);
const paginatedList = computed(() => filteredList.value.slice(startIndex.value, endIndex.value));

function openAddModal() {
  isEditing.value = false;
  editingId.value = null;
  form.kode = '';
  form.nama = '';
  modalError.value = '';
  showModal.value = true;
}

function openEditModal(item) {
  isEditing.value = true;
  editingId.value = item.id;
  form.kode = item.kode;
  form.nama = item.nama;
  modalError.value = '';
  showModal.value = true;
}

function saveKategori() {
  modalError.value = '';
  const trimmedKode = form.kode.trim().toUpperCase();
  const trimmedNama = form.nama.trim();

  if (!trimmedKode || !trimmedNama) {
    modalError.value = 'Kode dan nama kategori wajib diisi!';
    return;
  }

  // Check unique code
  const isDuplicate = store.kategoriList.some(k => {
    if (isEditing.value && k.id === editingId.value) return false;
    return k.kode.toUpperCase() === trimmedKode;
  });

  if (isDuplicate) {
    modalError.value = `Kode kategori '${trimmedKode}' sudah digunakan!`;
    return;
  }

  if (isEditing.value) {
    store.updateKategori(editingId.value, { kode: trimmedKode, nama: trimmedNama });
    store.showToast('Kategori berhasil diperbarui', 'success');
  } else {
    store.addKategori({ kode: trimmedKode, nama: trimmedNama });
    store.showToast('Kategori baru berhasil ditambahkan', 'success');
  }

  showModal.value = false;
}

function confirmDelete(item) {
  itemToDelete.value = item;
  showDeleteModal.value = true;
}

function executeDelete() {
  if (itemToDelete.value) {
    store.deleteKategori(itemToDelete.value.id);
    showDeleteModal.value = false;
    itemToDelete.value = null;
    store.showToast('Kategori berhasil dihapus', 'success');
  }
}
</script>

<style scoped>
.hover-primary:hover {
  color: #216ac4 !important;
}

.custom-master-table {
  border-collapse: collapse !important;
  width: 100%;
}

.custom-master-table thead tr th {
  background-color: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
  border-top: 1px solid #e2e8f0;
  color: #64748b;
  font-weight: 600;
}

.custom-master-table th,
.custom-master-table td {
  padding: 0.75rem 0.85rem;
}

.custom-master-table .master-row td {
  border-top: 1px solid #e2e8f0;
}
</style>
