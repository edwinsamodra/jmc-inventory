<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Barang Masuk
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">
          Kelola penerimaan barang, riwayat transaksi, verifikasi, dan cetak surat masuk.
        </p>
      </div>

      <div class="flex items-center space-x-2.5">
        <!-- Export Excel Button -->
        <button
          @click="handleExportExcel"
          type="button"
          class="inline-flex items-center px-3.5 py-2 border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs sm:text-sm font-semibold transition shadow-2xs"
          title="Export data sesuai filter dan kata kunci pencarian ke file Excel (.xlsx)"
        >
          <svg class="w-4 h-4 mr-1.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export Excel
        </button>

        <!-- Tambah Barang Masuk Button -->
        <RouterLink
          to="/barang-masuk/tambah"
          class="inline-flex items-center px-4 py-2 border border-transparent bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition shadow-xs"
        >
          <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Tambah Barang Masuk
        </RouterLink>
      </div>
    </div>

    <!-- Filter & Search Toolbar Card -->
    <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <!-- 1. Search Box (asal barang atau sub kategori) -->
        <div class="relative">
          <label class="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Pencarian
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Asal barang / Sub kategori..."
              class="block w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
            />
          </div>
        </div>

        <!-- 2. Filter Kategori -->
        <div>
          <label class="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Filter Kategori
          </label>
          <select
            v-model="filters.kategoriId"
            @change="onKategoriChange"
            class="block w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
          >
            <option :value="''">-- Semua Kategori --</option>
            <option v-for="kat in store.kategoriList" :key="kat.id" :value="kat.id">
              {{ kat.kode }} - {{ kat.nama }}
            </option>
          </select>
        </div>

        <!-- 3. Filter Sub Kategori (menyesuaikan Kategori yang dipilih) -->
        <div>
          <label class="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Filter Sub Kategori
          </label>
          <select
            v-model="filters.subKategoriId"
            :disabled="!filters.kategoriId && availableSubKategori.length === 0"
            class="block w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <option :value="''">
              {{ filters.kategoriId ? '-- Semua Sub Kategori --' : '-- Pilih Kategori Dahulu --' }}
            </option>
            <option v-for="sub in availableSubKategori" :key="sub.id" :value="sub.id">
              {{ sub.nama }}
            </option>
          </select>
        </div>

        <!-- 4. Filter Tahun Data -->
        <div>
          <label class="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Filter Tahun
          </label>
          <div class="flex space-x-2">
            <select
              v-model="filters.tahun"
              class="block w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
            >
              <option :value="''">-- Semua Tahun --</option>
              <option v-for="yr in yearOptions" :key="yr" :value="yr">
                Tahun {{ yr }}
              </option>
            </select>

            <button
              v-if="hasActiveFilters"
              @click="resetFilters"
              type="button"
              class="px-2.5 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              title="Reset Semua Filter"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <!-- Filter Stats & Sorting Chips -->
      <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
        <div>
          Ditemukan <strong class="text-slate-800 font-semibold">{{ filteredData.length }}</strong> data barang masuk
          <span v-if="hasActiveFilters" class="text-brand-600 font-medium">(Terfilter)</span>
        </div>

        <div class="flex items-center space-x-3">
          <span class="text-2xs uppercase tracking-wider font-bold text-slate-400">Urutkan:</span>
          <!-- Sort Tanggal -->
          <button
            @click="toggleSort('tanggal')"
            type="button"
            class="flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-2xs font-semibold transition"
            :class="sortBy === 'tanggal' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 hover:bg-slate-50 text-slate-600'"
          >
            <span>Tanggal</span>
            <span v-if="sortBy === 'tanggal'">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
          </button>

          <!-- Sort Asal Barang -->
          <button
            @click="toggleSort('asalBarang')"
            type="button"
            class="flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-2xs font-semibold transition"
            :class="sortBy === 'asalBarang' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 hover:bg-slate-50 text-slate-600'"
          >
            <span>Asal Barang</span>
            <span v-if="sortBy === 'asalBarang'">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
          </button>

          <!-- Sort Total Harga -->
          <button
            @click="toggleSort('totalHarga')"
            type="button"
            class="flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-2xs font-semibold transition"
            :class="sortBy === 'totalHarga' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 hover:bg-slate-50 text-slate-600'"
          >
            <span>Total Harga</span>
            <span v-if="sortBy === 'totalHarga'">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Table Card -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr class="bg-slate-50/75 border-b border-slate-200 text-2xs uppercase tracking-wider font-bold text-slate-500">
              <th class="py-3.5 px-4 text-center w-12">No</th>
              <th class="py-3.5 px-4 cursor-pointer hover:text-slate-800" @click="toggleSort('tanggal')">
                <div class="flex items-center space-x-1">
                  <span>Tanggal</span>
                  <span v-if="sortBy === 'tanggal'">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
                </div>
              </th>
              <th class="py-3.5 px-4">No. Surat</th>
              <th class="py-3.5 px-4 cursor-pointer hover:text-slate-800" @click="toggleSort('asalBarang')">
                <div class="flex items-center space-x-1">
                  <span>Asal Barang</span>
                  <span v-if="sortBy === 'asalBarang'">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
                </div>
              </th>
              <th class="py-3.5 px-4">Kategori & Sub Kategori</th>
              <th class="py-3.5 px-4">Operator</th>
              <th class="py-3.5 px-4 text-right cursor-pointer hover:text-slate-800" @click="toggleSort('totalHarga')">
                <div class="flex items-center justify-end space-x-1">
                  <span>Total Harga</span>
                  <span v-if="sortBy === 'totalHarga'">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
                </div>
              </th>
              <th class="py-3.5 px-4 text-center">Aksi Dokumen</th>
              <!-- Kolom Paling Kanan Sesuai BRIEF: Status verifikasi toggle button dengan centang hijau -->
              <th class="py-3.5 px-4 text-center w-32 bg-slate-100/50">
                Verifikasi
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="(item, index) in paginatedData"
              :key="item.id"
              class="hover:bg-slate-50/80 transition"
            >
              <!-- No -->
              <td class="py-3 px-4 text-center text-slate-400 font-medium text-xs">
                {{ (currentPage - 1) * pageSize + index + 1 }}
              </td>

              <!-- Tanggal -->
              <td class="py-3 px-4 whitespace-nowrap">
                <div class="font-medium text-slate-800">{{ formatDateIndo(item.tanggal) }}</div>
                <div class="text-2xs text-slate-400">Tahun {{ item.tahun }}</div>
              </td>

              <!-- No. Surat -->
              <td class="py-3 px-4 whitespace-nowrap">
                <span class="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                  {{ item.nomorSurat || '-' }}
                </span>
                <div v-if="item.lampiranName" class="text-2xs text-brand-600 mt-1 flex items-center">
                  <svg class="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <span class="truncate max-w-[120px]">{{ item.lampiranName }}</span>
                </div>
              </td>

              <!-- Asal Barang -->
              <td class="py-3 px-4">
                <div class="font-semibold text-slate-800">{{ item.asalBarang }}</div>
                <div class="text-2xs text-slate-500">{{ item.items?.length || 0 }} item barang</div>
              </td>

              <!-- Kategori & Sub Kategori -->
              <td class="py-3 px-4">
                <span class="inline-block text-2xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                  {{ item.kategoriNama }}
                </span>
                <div class="font-medium text-slate-700 mt-0.5">{{ item.subKategoriNama }}</div>
              </td>

              <!-- Operator -->
              <td class="py-3 px-4 whitespace-nowrap">
                <div class="text-xs font-medium text-slate-700">{{ item.operatorNama }}</div>
              </td>

              <!-- Total Harga -->
              <td class="py-3 px-4 text-right whitespace-nowrap">
                <div class="font-bold text-slate-900">{{ formatRupiah(item.totalHarga) }}</div>
                <div class="text-2xs text-slate-400">Maks: {{ formatRupiah(item.batasHargaSubKategori) }}</div>
              </td>

              <!-- Aksi Dokumen -->
              <td class="py-3 px-4 text-center whitespace-nowrap">
                <div class="inline-flex items-center space-x-1">
                  <!-- Cetak Surat Masuk Button -->
                  <button
                    @click="openPrintModal(item)"
                    type="button"
                    class="p-1.5 text-brand-600 hover:text-brand-800 hover:bg-brand-50 rounded-lg transition"
                    title="Cetak Surat Masuk / Bukti Penerimaan"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                  </button>

                  <!-- Detail Button -->
                  <button
                    @click="openDetailModal(item)"
                    type="button"
                    class="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                    title="Lihat Rincian Item"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>

                  <!-- Edit Button -->
                  <RouterLink
                    :to="`/barang-masuk/edit/${item.id}`"
                    class="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition"
                    title="Ubah Data"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </RouterLink>

                  <!-- Delete Button -->
                  <button
                    @click="confirmDelete(item)"
                    type="button"
                    class="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                    title="Hapus Data"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>

              <!-- Status Verifikasi Kolom Paling Kanan (Brief requirement) -->
              <td class="py-3 px-4 text-center whitespace-nowrap bg-slate-50/50">
                <button
                  @click="store.toggleVerifikasiBarangMasuk(item.id)"
                  type="button"
                  class="inline-flex items-center px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition group shadow-2xs"
                  :class="item.isVerified
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                    : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'"
                  :title="item.isVerified ? 'Data sudah diverifikasi. Klik untuk membatalkan' : 'Klik untuk memverifikasi data'"
                >
                  <!-- Centang Hijau Icon -->
                  <span
                    class="w-5 h-5 rounded-full flex items-center justify-center mr-1.5 transition"
                    :class="item.isVerified ? 'bg-emerald-500 text-white shadow-xs' : 'bg-slate-200 text-slate-400 group-hover:bg-slate-300'"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span class="text-2xs">
                    {{ item.isVerified ? 'Diverifikasi' : 'Belum' }}
                  </span>
                </button>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-if="filteredData.length === 0">
              <td colspan="9" class="py-12 text-center text-slate-400">
                <div class="max-w-sm mx-auto">
                  <svg class="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p class="font-medium text-slate-600">Tidak ada data barang masuk</p>
                  <p class="text-xs text-slate-400 mt-1">Coba sesuaikan filter pencarian atau buat data barang masuk baru.</p>
                  <button
                    v-if="hasActiveFilters"
                    @click="resetFilters"
                    class="mt-3 inline-flex items-center px-3 py-1.5 text-xs text-brand-600 hover:underline font-semibold"
                  >
                    Hapus Filter
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer (10 data per halaman sesuai Brief) -->
      <div class="px-4 py-3 sm:px-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div>
          Menampilkan
          <strong class="font-semibold text-slate-900">{{ startIndex + 1 }}</strong> -
          <strong class="font-semibold text-slate-900">{{ Math.min(endIndex, filteredData.length) }}</strong>
          dari <strong class="font-semibold text-slate-900">{{ filteredData.length }}</strong> data
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

    <!-- Modals -->
    <PrintLetterModal
      :show="showPrintModal"
      :item="selectedItem"
      @close="showPrintModal = false"
    />

    <DetailBarangModal
      :show="showDetailModal"
      :item="selectedItem"
      @close="showDetailModal = false"
    />

    <ConfirmModal
      :show="showDeleteModal"
      title="Hapus Data Barang Masuk"
      :message="`Apakah Anda yakin ingin menghapus transaksi barang masuk ${itemToDelete?.nomorSurat || itemToDelete?.asalBarang}? Tindakan ini tidak dapat dibatalkan.`"
      confirmText="Ya, Hapus Data"
      :danger="true"
      @confirm="executeDelete"
      @cancel="showDeleteModal = false"
    />
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue';
import { store } from '../store/mockStore';
import { formatRupiah, formatDateIndo } from '../utils/formatters';
import { exportBarangMasukToExcel } from '../utils/exportExcel';
import PrintLetterModal from '../components/PrintLetterModal.vue';
import DetailBarangModal from '../components/DetailBarangModal.vue';
import ConfirmModal from '../components/ConfirmModal.vue';

// Filters state
const filters = reactive({
  search: '',
  kategoriId: '',
  subKategoriId: '',
  tahun: ''
});

// Sorting state: tanggal, asalBarang, totalHarga
const sortBy = ref('tanggal');
const sortDir = ref('desc');

// Pagination state: 10 per page
const currentPage = ref(1);
const pageSize = 10;

// Dynamic sub-category choices based on selected category
const availableSubKategori = computed(() => {
  if (!filters.kategoriId) return [];
  return store.subKategoriList.filter(s => s.kategoriId === Number(filters.kategoriId));
});

function onKategoriChange() {
  filters.subKategoriId = '';
  currentPage.value = 1;
}

// Year options extracted from data
const yearOptions = computed(() => {
  const years = new Set(store.barangMasukList.map(b => b.tahun || new Date(b.tanggal).getFullYear().toString()));
  // ensure recent years present
  years.add('2026');
  years.add('2025');
  years.add('2024');
  return Array.from(years).sort().reverse();
});

const hasActiveFilters = computed(() => {
  return filters.search || filters.kategoriId || filters.subKategoriId || filters.tahun;
});

function resetFilters() {
  filters.search = '';
  filters.kategoriId = '';
  filters.subKategoriId = '';
  filters.tahun = '';
  currentPage.value = 1;
}

function toggleSort(field) {
  if (sortBy.value === field) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = field;
    sortDir.value = 'asc';
  }
}

// Filter and Sort Pipeline
const filteredData = computed(() => {
  let list = [...store.barangMasukList];

  // 1. Search (asal barang atau sub kategori)
  if (filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    list = list.filter(item => {
      const matchAsal = item.asalBarang?.toLowerCase().includes(q);
      const matchSub = item.subKategoriNama?.toLowerCase().includes(q);
      const matchSurat = item.nomorSurat?.toLowerCase().includes(q);
      return matchAsal || matchSub || matchSurat;
    });
  }

  // 2. Filter Kategori
  if (filters.kategoriId) {
    list = list.filter(item => item.kategoriId === Number(filters.kategoriId));
  }

  // 3. Filter Sub Kategori
  if (filters.subKategoriId) {
    list = list.filter(item => item.subKategoriId === Number(filters.subKategoriId));
  }

  // 4. Filter Tahun
  if (filters.tahun) {
    list = list.filter(item => item.tahun === filters.tahun || item.tanggal?.startsWith(filters.tahun));
  }

  // 5. Sorting (tanggal, asalBarang, totalHarga)
  list.sort((a, b) => {
    let comp = 0;
    if (sortBy.value === 'tanggal') {
      comp = new Date(a.tanggal) - new Date(b.tanggal);
    } else if (sortBy.value === 'asalBarang') {
      comp = (a.asalBarang || '').localeCompare(b.asalBarang || '');
    } else if (sortBy.value === 'totalHarga') {
      comp = (a.totalHarga || 0) - (b.totalHarga || 0);
    }
    return sortDir.value === 'asc' ? comp : -comp;
  });

  return list;
});

// Paging calculations
const totalPages = computed(() => Math.ceil(filteredData.value.length / pageSize) || 1);
const startIndex = computed(() => (currentPage.value - 1) * pageSize);
const endIndex = computed(() => startIndex.value + pageSize);
const paginatedData = computed(() => filteredData.value.slice(startIndex.value, endIndex.value));

// Export Excel handler
function handleExportExcel() {
  exportBarangMasukToExcel(filteredData.value, filters);
  store.showToast(`Berhasil mengekspor ${filteredData.value.length} baris data ke Excel!`, 'success');
}

// Modal handlers
const showPrintModal = ref(false);
const showDetailModal = ref(false);
const selectedItem = ref(null);

function openPrintModal(item) {
  selectedItem.value = item;
  showPrintModal.value = true;
}

function openDetailModal(item) {
  selectedItem.value = item;
  showDetailModal.value = true;
}

// Delete handlers
const showDeleteModal = ref(false);
const itemToDelete = ref(null);

function confirmDelete(item) {
  itemToDelete.value = item;
  showDeleteModal.value = true;
}

function executeDelete() {
  if (itemToDelete.value) {
    store.deleteBarangMasuk(itemToDelete.value.id);
    showDeleteModal.value = false;
    itemToDelete.value = null;
    if (paginatedData.value.length === 0 && currentPage.value > 1) {
      currentPage.value--;
    }
  }
}
</script>
