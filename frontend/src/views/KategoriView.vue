<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Master Data: Kategori
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">
          Daftar kelompok kategori utama untuk klasifikasi barang logistik.
        </p>
      </div>

      <button
        @click="openAddModal"
        type="button"
        class="inline-flex items-center px-4 py-2 border border-transparent bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition shadow-xs self-start sm:self-auto"
      >
        <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Tambah Kategori
      </button>
    </div>

    <!-- Toolbar: Search -->
    <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
      <div class="w-full sm:w-80 relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari kode atau nama kategori..."
          class="block w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
        />
      </div>

      <div class="text-xs text-slate-500 w-full sm:w-auto text-right">
        Total <strong class="text-slate-800 font-semibold">{{ filteredList.length }}</strong> kategori
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-2xs uppercase tracking-wider font-bold text-slate-500">
              <th class="py-3 px-4 text-center w-12">No</th>
              <th class="py-3 px-4 w-36">Kode Kategori</th>
              <th class="py-3 px-4">Nama Kategori</th>
              <th class="py-3 px-4 text-center w-36">Jumlah Sub Kategori</th>
              <th class="py-3 px-4 text-center w-28">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="(kat, index) in paginatedList"
              :key="kat.id"
              class="hover:bg-slate-50/80 transition"
            >
              <td class="py-3 px-4 text-center text-slate-400 font-medium">
                {{ (currentPage - 1) * pageSize + index + 1 }}
              </td>
              <td class="py-3 px-4 whitespace-nowrap">
                <span class="inline-block px-2.5 py-1 bg-brand-50 text-brand-700 font-mono font-bold text-xs rounded-lg border border-brand-100">
                  {{ kat.kode }}
                </span>
              </td>
              <td class="py-3 px-4 font-semibold text-slate-800">
                {{ kat.nama }}
              </td>
              <td class="py-3 px-4 text-center">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold bg-slate-100 text-slate-700">
                  {{ countSubKategori(kat.id) }} Sub Kategori
                </span>
              </td>
              <td class="py-3 px-4 text-center whitespace-nowrap">
                <div class="inline-flex items-center space-x-1">
                  <button
                    @click="openEditModal(kat)"
                    type="button"
                    class="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition"
                    title="Ubah Kategori"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    @click="confirmDelete(kat)"
                    type="button"
                    class="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                    title="Hapus Kategori"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="filteredList.length === 0">
              <td colspan="5" class="py-10 text-center text-slate-400">
                Tidak ada data kategori yang cocok dengan pencarian.
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
          dari <strong class="font-semibold text-slate-900">{{ filteredList.length }}</strong> data
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

    <!-- Modal Form Tambah / Edit Kategori -->
    <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-center justify-center min-h-screen p-4 text-center sm:p-0">
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" @click="closeModal"></div>

        <div class="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full border border-slate-100 p-6">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 class="text-base font-bold text-slate-900">
              {{ editingId ? 'Edit Kategori' : 'Tambah Kategori Baru' }}
            </h3>
            <button @click="closeModal" class="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
              &times;
            </button>
          </div>

          <form @submit.prevent="saveKategori" class="mt-4 space-y-4">
            <!-- Kode Kategori (Unique, maks 10 char) -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Kode Kategori <span class="text-rose-500">*</span>
                </label>
                <span class="text-2xs text-slate-400">{{ form.kode.length }}/10</span>
              </div>
              <input
                v-model="form.kode"
                type="text"
                maxlength="10"
                placeholder="Contoh: ATK, ELEC"
                required
                class="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl uppercase font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
              />
              <p class="text-2xs text-slate-400 mt-1">Harus unik, maksimal 10 karakter.</p>
              <p v-if="modalError" class="text-2xs text-rose-500 mt-1">{{ modalError }}</p>
            </div>

            <!-- Nama Kategori (maks 100 char) -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Nama Kategori <span class="text-rose-500">*</span>
                </label>
                <span class="text-2xs text-slate-400">{{ form.nama.length }}/100</span>
              </div>
              <input
                v-model="form.nama"
                type="text"
                maxlength="100"
                placeholder="Contoh: Alat Tulis Kantor"
                required
                class="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
              />
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
                {{ editingId ? 'Simpan Perubahan' : 'Tambah Kategori' }}
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
      :message="`Apakah Anda yakin ingin menghapus kategori '${itemToDelete?.nama}' (${itemToDelete?.kode})?`"
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
const currentPage = ref(1);
const pageSize = 10;

// Sub kategori count
function countSubKategori(kategoriId) {
  return store.subKategoriList.filter(s => s.kategoriId === kategoriId).length;
}

// Filtered list by search
const filteredList = computed(() => {
  if (!searchQuery.value.trim()) return store.kategoriList;
  const q = searchQuery.value.trim().toLowerCase();
  return store.kategoriList.filter(k =>
    k.kode.toLowerCase().includes(q) || k.nama.toLowerCase().includes(q)
  );
});

// Pagination
const totalPages = computed(() => Math.ceil(filteredList.value.length / pageSize) || 1);
const startIndex = computed(() => (currentPage.value - 1) * pageSize);
const endIndex = computed(() => startIndex.value + pageSize);
const paginatedList = computed(() => filteredList.value.slice(startIndex.value, endIndex.value));

// Modal Form State
const showModal = ref(false);
const editingId = ref(null);
const modalError = ref('');
const form = reactive({
  kode: '',
  nama: ''
});

function openAddModal() {
  editingId.value = null;
  form.kode = '';
  form.nama = '';
  modalError.value = '';
  showModal.value = true;
}

function openEditModal(kat) {
  editingId.value = kat.id;
  form.kode = kat.kode;
  form.nama = kat.nama;
  modalError.value = '';
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  editingId.value = null;
}

function saveKategori() {
  modalError.value = '';
  try {
    if (editingId.value) {
      store.updateKategori(editingId.value, { kode: form.kode, nama: form.nama });
    } else {
      store.addKategori({ kode: form.kode, nama: form.nama });
    }
    closeModal();
  } catch (err) {
    modalError.value = err.message;
  }
}

// Delete State
const showDeleteModal = ref(false);
const itemToDelete = ref(null);

function confirmDelete(kat) {
  itemToDelete.value = kat;
  showDeleteModal.value = true;
}

function executeDelete() {
  if (itemToDelete.value) {
    try {
      store.deleteKategori(itemToDelete.value.id);
      showDeleteModal.value = false;
      itemToDelete.value = null;
    } catch (err) {
      alert(err.message);
      showDeleteModal.value = false;
    }
  }
}
</script>
