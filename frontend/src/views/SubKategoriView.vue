<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Master Data: Sub Kategori
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">
          Kelola rincian sub kategori dan batas plafon harga pengadaan barang.
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
        Tambah Sub Kategori
      </button>
    </div>

    <!-- Toolbar: Search (nama kategori atau sub kategori) -->
    <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
      <div class="w-full sm:w-96 relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari nama kategori atau sub kategori..."
          class="block w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
        />
      </div>

      <div class="text-xs text-slate-500 w-full sm:w-auto text-right">
        Total <strong class="text-slate-800 font-semibold">{{ filteredList.length }}</strong> sub kategori
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-2xs uppercase tracking-wider font-bold text-slate-500">
              <th class="py-3 px-4 text-center w-12">No</th>
              <th class="py-3 px-4">Kategori Induk</th>
              <th class="py-3 px-4">Nama Sub Kategori</th>
              <th class="py-3 px-4 text-right">Batas Harga (Plafon)</th>
              <th class="py-3 px-4 text-center w-28">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="(sub, index) in paginatedList"
              :key="sub.id"
              class="hover:bg-slate-50/80 transition"
            >
              <td class="py-3 px-4 text-center text-slate-400 font-medium">
                {{ (currentPage - 1) * pageSize + index + 1 }}
              </td>
              <td class="py-3 px-4 whitespace-nowrap">
                <span class="inline-block px-2.5 py-1 bg-slate-100 text-slate-700 font-medium text-xs rounded-lg">
                  {{ getKategoriName(sub.kategoriId) }}
                </span>
              </td>
              <td class="py-3 px-4 font-semibold text-slate-800">
                {{ sub.nama }}
              </td>
              <td class="py-3 px-4 text-right whitespace-nowrap">
                <span class="font-bold text-emerald-700 text-xs sm:text-sm">
                  {{ formatRupiah(sub.batasHarga) }}
                </span>
              </td>
              <td class="py-3 px-4 text-center whitespace-nowrap">
                <div class="inline-flex items-center space-x-1">
                  <button
                    @click="openEditModal(sub)"
                    type="button"
                    class="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition"
                    title="Ubah Sub Kategori"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    @click="confirmDelete(sub)"
                    type="button"
                    class="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                    title="Hapus Sub Kategori"
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
                Tidak ada data sub kategori yang cocok dengan pencarian.
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

    <!-- Modal Form Tambah / Edit Sub Kategori (Brief requirement) -->
    <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-center justify-center min-h-screen p-4 text-center sm:p-0">
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" @click="closeModal"></div>

        <div class="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full border border-slate-100 p-6">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 class="text-base font-bold text-slate-900">
              {{ editingId ? 'Edit Sub Kategori' : 'Tambah Sub Kategori Baru' }}
            </h3>
            <button @click="closeModal" class="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
              &times;
            </button>
          </div>

          <form @submit.prevent="saveSubKategori" class="mt-4 space-y-4">
            <!-- Kategori (Combobox, opsi diambil dari data Kategori) -->
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Kategori <span class="text-rose-500">*</span>
              </label>
              <select
                v-model="form.kategoriId"
                required
                class="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
              >
                <option :value="''">-- Pilih Kategori --</option>
                <option v-for="kat in store.kategoriList" :key="kat.id" :value="kat.id">
                  {{ kat.kode }} - {{ kat.nama }}
                </option>
              </select>
            </div>

            <!-- Nama Sub Kategori (maks 100 char) -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Nama Sub Kategori <span class="text-rose-500">*</span>
                </label>
                <span class="text-2xs text-slate-400">{{ form.nama.length }}/100</span>
              </div>
              <input
                v-model="form.nama"
                type="text"
                maxlength="100"
                placeholder="Contoh: Kertas & Formulir"
                required
                class="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
              />
            </div>

            <!-- Batas Harga (Rupiah dengan masking) -->
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Batas Harga (Rupiah) <span class="text-rose-500">*</span>
              </label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs font-bold">Rp</span>
                <input
                  type="text"
                  :value="formatRupiah(form.batasHarga, false)"
                  @input="handlePriceMasking"
                  placeholder="0"
                  required
                  class="block w-full pl-9 pr-3 py-2 text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
                />
              </div>
              <p class="text-2xs text-slate-400 mt-1">Nilai plafon maksimum untuk setiap form Barang Masuk.</p>
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
                {{ editingId ? 'Simpan Perubahan' : 'Tambah Sub Kategori' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Confirm Delete Modal -->
    <ConfirmModal
      :show="showDeleteModal"
      title="Hapus Sub Kategori"
      :message="`Apakah Anda yakin ingin menghapus Sub Kategori '${itemToDelete?.nama}'?`"
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
import { formatRupiah, parseRupiah } from '../utils/formatters';
import ConfirmModal from '../components/ConfirmModal.vue';

const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = 10;

function getKategoriName(kategoriId) {
  const found = store.kategoriList.find(k => k.id === kategoriId);
  return found ? `${found.kode} - ${found.nama}` : '-';
}

// Filtered list by search (nama kategori atau nama sub kategori)
const filteredList = computed(() => {
  if (!searchQuery.value.trim()) return store.subKategoriList;
  const q = searchQuery.value.trim().toLowerCase();
  return store.subKategoriList.filter(s => {
    const katName = getKategoriName(s.kategoriId).toLowerCase();
    const subName = s.nama.toLowerCase();
    return katName.includes(q) || subName.includes(q);
  });
});

// Pagination
const totalPages = computed(() => Math.ceil(filteredList.value.length / pageSize) || 1);
const startIndex = computed(() => (currentPage.value - 1) * pageSize);
const endIndex = computed(() => startIndex.value + pageSize);
const paginatedList = computed(() => filteredList.value.slice(startIndex.value, endIndex.value));

// Modal Form State
const showModal = ref(false);
const editingId = ref(null);
const form = reactive({
  kategoriId: '',
  nama: '',
  batasHarga: 0
});

function openAddModal() {
  editingId.value = null;
  form.kategoriId = store.kategoriList[0]?.id || '';
  form.nama = '';
  form.batasHarga = 5000000;
  showModal.value = true;
}

function openEditModal(sub) {
  editingId.value = sub.id;
  form.kategoriId = sub.kategoriId;
  form.nama = sub.nama;
  form.batasHarga = sub.batasHarga;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  editingId.value = null;
}

function handlePriceMasking(e) {
  form.batasHarga = parseRupiah(e.target.value);
}

function saveSubKategori() {
  if (!form.kategoriId || !form.nama.trim() || form.batasHarga <= 0) {
    alert('Harap lengkapi semua isian (Kategori, nama sub kategori, dan batas harga > 0).');
    return;
  }

  if (editingId.value) {
    store.updateSubKategori(editingId.value, {
      kategoriId: Number(form.kategoriId),
      nama: form.nama,
      batasHarga: Number(form.batasHarga)
    });
  } else {
    store.addSubKategori({
      kategoriId: Number(form.kategoriId),
      nama: form.nama,
      batasHarga: Number(form.batasHarga)
    });
  }
  closeModal();
}

// Delete State
const showDeleteModal = ref(false);
const itemToDelete = ref(null);

function confirmDelete(sub) {
  itemToDelete.value = sub;
  showDeleteModal.value = true;
}

function executeDelete() {
  if (itemToDelete.value) {
    try {
      store.deleteSubKategori(itemToDelete.value.id);
      showDeleteModal.value = false;
      itemToDelete.value = null;
    } catch (err) {
      alert(err.message);
      showDeleteModal.value = false;
    }
  }
}
</script>
