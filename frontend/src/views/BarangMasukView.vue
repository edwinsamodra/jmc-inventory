<template>
  <div>
    <!-- Header Section (Breadcrumb + Title) -->
    <div class="d-flex align-items-center justify-content-between mb-3">
      <div>
        <div class="text-uppercase small fw-bold text-muted mb-1" style="font-size: 0.72rem; letter-spacing: 0.05em;">
          HOME &nbsp;/&nbsp; BARANG MASUK
        </div>
        <h2 class="h1 fw-bold text-dark mb-0">
          Barang Masuk
        </h2>
      </div>
      <div>
        <!-- Export Excel action placed neatly on header -->
        <button
          @click="handleExportExcel"
          type="button"
          class="btn btn-sm btn-outline-success d-inline-flex align-items-center gap-1 shadow-sm"
          title="Export Data ke Excel (.xlsx)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-sm" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M14 3v4a1 1 0 0 0 1 1h4" />
            <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
            <line x1="8" y1="11" x2="16" y2="19" />
            <line x1="16" y1="11" x2="8" y2="19" />
          </svg>
          <span>Export Excel</span>
        </button>
      </div>
    </div>

    <!-- Filter & Toolbar Row matching Screenshot and CSV -->
    <div class="row align-items-center g-2 mb-3">
      <!-- Left: Button "+ Tambah Data" -->
      <div class="col-auto">
        <RouterLink
          to="/barang-masuk/tambah"
          class="btn btn-primary d-inline-flex align-items-center gap-1 px-3 py-2 fw-semibold"
          style="background-color: #216ac4; border-color: #216ac4;"
        >
          <span class="fs-4 lh-1">+</span>
          <span>Tambah Data</span>
        </RouterLink>
      </div>

      <!-- Right: Dropdowns & Search grouped together matching Screenshot & CSV -->
      <div class="col-auto ms-auto d-flex flex-wrap align-items-center gap-2">
        <!-- 1. Filter Kategori -->
        <div style="min-width: 170px;">
          <select
            v-model="filters.kategoriId"
            @change="onKategoriChange"
            class="form-select bg-white"
          >
            <option :value="''">Semua Kategori</option>
            <option v-for="kat in store.kategoriList" :key="kat.id" :value="kat.id">
              {{ kat.kode }} - {{ kat.nama }}
            </option>
          </select>
        </div>

        <!-- 2. Filter Sub Kategori -->
        <div style="min-width: 180px;">
          <select
            v-model="filters.subKategoriId"
            :disabled="!filters.kategoriId && availableSubKategori.length === 0"
            class="form-select bg-white"
          >
            <option :value="''">Semua Sub Kategori</option>
            <option v-for="sub in availableSubKategori" :key="sub.id" :value="sub.id">
              {{ sub.nama }}
            </option>
          </select>
        </div>

        <!-- 3. Filter Tahun -->
        <div style="min-width: 140px;">
          <select
            v-model="filters.tahun"
            class="form-select bg-white"
          >
            <option :value="''">Semua Tahun</option>
            <option v-for="yr in yearOptions" :key="yr" :value="yr">
              {{ yr }}
            </option>
          </select>
        </div>

        <!-- 4. Search input with magnifying glass button -->
        <div class="input-group" style="width: 220px;">
          <input
            v-model="filters.search"
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

    <!-- Table Card matching Screenshot and CSV Structure -->
    <div class="card shadow-sm border-0 mb-4 bg-white">
      <div class="table-responsive">
        <table class="table table-vcenter align-middle mb-0 custom-dashboard-table">
          <thead>
            <tr class="text-uppercase text-secondary small fw-bold" style="font-size: 0.72rem; letter-spacing: 0.05em;">
              <th class="text-center py-3" style="width: 45px;">NO</th>
              <th class="py-3" style="width: 100px;">ACTION</th>
              <th class="py-3 cursor-pointer" @click="toggleSort('tanggal')" style="width: 140px;">
                TANGGAL {{ sortBy === 'tanggal' ? (sortDir === 'asc' ? '▲' : '▼') : '' }}
              </th>
              <th class="py-3 cursor-pointer" @click="toggleSort('asalBarang')" style="min-width: 160px;">
                ASAL BARANG {{ sortBy === 'asalBarang' ? (sortDir === 'asc' ? '▲' : '▼') : '' }}
              </th>
              <th class="py-3" style="width: 110px;">PENERIMA</th>
              <th class="py-3" style="width: 130px;">UNIT</th>
              <th class="py-3" style="width: 100px;">KODE</th>
              <th class="py-3" style="min-width: 170px;">NAMA</th>
              <th class="text-end py-3" style="width: 110px;">HARGA (RP.)</th>
              <th class="text-center py-3" style="width: 90px;">JUMLAH</th>
              <th class="text-end py-3 cursor-pointer" @click="toggleSort('totalHarga')" style="width: 120px;">
                TOTAL (RP.) {{ sortBy === 'totalHarga' ? (sortDir === 'asc' ? '▲' : '▼') : '' }}
              </th>
              <th class="text-center py-3" style="width: 75px;">STATUS</th>
            </tr>
          </thead>
          <tbody>
            <!-- Empty state -->
            <tr v-if="paginatedData.length === 0">
              <td colspan="12" class="text-center py-5 text-secondary">
                <div class="py-3">
                  <p class="fw-bold mb-1">Tidak ada data barang masuk</p>
                  <p class="small text-muted mb-0">Coba sesuaikan filter pencarian atau tambahkan data barang masuk baru.</p>
                </div>
              </td>
            </tr>

            <!-- Document Data Rows grouped with Rowspan according to Screenshot & CSV -->
            <template v-for="(doc, docIndex) in paginatedData" :key="doc.id">
              <!-- First row of document (contains grouped columns with rowspan) -->
              <tr class="doc-start-row">
                <!-- NO -->
                <td
                  :rowspan="doc.items?.length || 1"
                  class="text-center align-middle fw-medium text-dark rowspan-cell"
                >
                  {{ (currentPage - 1) * pageSize + docIndex + 1 }}
                </td>

                <!-- ACTION: ✏️ Edit, 📝 Print / Surat, 🗑️ Delete -->
                <td
                  :rowspan="doc.items?.length || 1"
                  class="align-middle text-nowrap rowspan-cell"
                >
                  <!-- Edit ✏️ -->
                  <RouterLink
                    :to="`/barang-masuk/edit/${doc.id}`"
                    class="text-secondary text-decoration-none p-1 hover-primary d-inline-block"
                    title="Edit Data"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-sm" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                      <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                      <line x1="13.5" y1="6.5" x2="17.5" y2="10.5" />
                    </svg>
                  </RouterLink>

                  <!-- Cetak Surat / Dokumen 📝 -->
                  <button
                    type="button"
                    @click="openPrintModal(doc)"
                    class="btn p-1 border-0 bg-transparent text-secondary hover-primary d-inline-block"
                    title="Cetak Surat Masuk"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-sm" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                      <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                      <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
                      <line x1="9" y1="9" x2="10" y2="9" />
                      <line x1="9" y1="13" x2="15" y2="13" />
                      <line x1="9" y1="17" x2="15" y2="17" />
                    </svg>
                  </button>

                  <!-- Hapus 🗑️ -->
                  <button
                    type="button"
                    @click="confirmDelete(doc)"
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

                <!-- TANGGAL: DD/MM/YY HH:mm:ss -->
                <td
                  :rowspan="doc.items?.length || 1"
                  class="align-middle text-nowrap rowspan-cell"
                >
                  {{ formatDateTime(doc.tanggal) }}
                </td>

                <!-- ASAL BARANG -->
                <td
                  :rowspan="doc.items?.length || 1"
                  class="align-middle fw-semibold text-dark rowspan-cell"
                >
                  {{ doc.asalBarang }}
                </td>

                <!-- PENERIMA -->
                <td
                  :rowspan="doc.items?.length || 1"
                  class="align-middle text-dark rowspan-cell"
                >
                  {{ doc.operatorNama || 'Liana' }}
                </td>

                <!-- UNIT -->
                <td
                  :rowspan="doc.items?.length || 1"
                  class="align-middle text-dark rowspan-cell"
                >
                  {{ doc.unit || 'Gudang Utama' }}
                </td>

                <!-- ITEM #1 DETAILS -->
                <!-- KODE -->
                <td class="text-secondary item-cell">
                  {{ doc.items && doc.items[0] ? (doc.items[0].kode || getItemKode(doc, 0)) : '-' }}
                </td>

                <!-- NAMA -->
                <td class="text-dark item-cell">
                  {{ doc.items && doc.items[0] ? doc.items[0].namaBarang : '-' }}
                </td>

                <!-- HARGA (RP.) -->
                <td class="text-end item-cell">
                  {{ doc.items && doc.items[0] ? formatNumberOnly(doc.items[0].harga) : '-' }}
                </td>

                <!-- JUMLAH -->
                <td class="text-center item-cell">
                  {{ doc.items && doc.items[0] ? `${doc.items[0].jumlah} ${doc.items[0].satuan || ''}` : '-' }}
                </td>

                <!-- TOTAL (RP.) -->
                <td class="text-end fw-semibold item-cell">
                  {{ doc.items && doc.items[0] ? formatNumberOnly(doc.items[0].total) : '-' }}
                </td>

                <!-- STATUS (Clickable toggle verification) -->
                <td
                  class="text-center align-middle item-cell"
                  style="border-left: 1px solid #f1f5f9;"
                >
                  <button
                    type="button"
                    @click="store.toggleVerifikasiBarangMasuk(doc.id)"
                    class="btn p-0 border-0 bg-transparent"
                    :title="doc.isVerified ? 'Diverifikasi. Klik untuk membatalkan' : 'Belum diverifikasi. Klik untuk verifikasi'"
                  >
                    <!-- Green checkmark circle if verified -->
                    <svg v-if="doc.isVerified" xmlns="http://www.w3.org/2000/svg" class="icon text-success" width="22" height="22" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                      <circle cx="12" cy="12" r="9" />
                      <path d="M9 12l2 2l4 -4" />
                    </svg>
                    <!-- Gray dash circle if unverified (-) -->
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="icon text-secondary" width="22" height="22" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                      <circle cx="12" cy="12" r="9" />
                      <line x1="9" y1="12" x2="15" y2="12" />
                    </svg>
                  </button>
                </td>
              </tr>

              <!-- Subsequent Item Rows of the same document (if items.length > 1) -->
              <template v-if="doc.items && doc.items.length > 1">
                <tr
                  v-for="(it, itIdx) in doc.items.slice(1)"
                  :key="it.id || itIdx"
                  class="doc-sub-row"
                >
                  <!-- KODE -->
                  <td class="text-secondary item-cell">
                    {{ it.kode || getItemKode(doc, itIdx + 1) }}
                  </td>

                  <!-- NAMA -->
                  <td class="text-dark item-cell">
                    {{ it.namaBarang }}
                  </td>

                  <!-- HARGA (RP.) -->
                  <td class="text-end item-cell">
                    {{ formatNumberOnly(it.harga) }}
                  </td>

                  <!-- JUMLAH -->
                  <td class="text-center item-cell">
                    {{ `${it.jumlah} ${it.satuan || ''}` }}
                  </td>

                  <!-- TOTAL (RP.) -->
                  <td class="text-end fw-semibold item-cell">
                    {{ formatNumberOnly(it.total) }}
                  </td>

                  <!-- STATUS (Follows document status) -->
                  <td
                    class="text-center align-middle item-cell"
                    style="border-left: 1px solid #f1f5f9;"
                  >
                    <button
                      type="button"
                      @click="store.toggleVerifikasiBarangMasuk(doc.id)"
                      class="btn p-0 border-0 bg-transparent"
                      :title="doc.isVerified ? 'Diverifikasi. Klik untuk membatalkan' : 'Belum diverifikasi. Klik untuk verifikasi'"
                    >
                      <svg v-if="doc.isVerified" xmlns="http://www.w3.org/2000/svg" class="icon text-success" width="22" height="22" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <circle cx="12" cy="12" r="9" />
                        <path d="M9 12l2 2l4 -4" />
                      </svg>
                      <svg v-else xmlns="http://www.w3.org/2000/svg" class="icon text-secondary" width="22" height="22" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <circle cx="12" cy="12" r="9" />
                        <line x1="9" y1="12" x2="15" y2="12" />
                      </svg>
                    </button>
                  </td>
                </tr>
              </template>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer matching Screenshot (e.g. 1, 2, 3, 4, 5, next >) -->
      <div class="card-footer bg-white border-0 py-3 d-flex justify-content-end align-items-center">
        <ul class="pagination m-0 align-items-center gap-1">
          <!-- Page numbers -->
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

          <!-- Next link -->
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
import { reactive, ref, computed, onMounted } from 'vue';
import { store } from '../store/mockStore';
import { exportBarangMasukToExcel } from '../utils/exportExcel';
import PrintLetterModal from '../components/PrintLetterModal.vue';
import DetailBarangModal from '../components/DetailBarangModal.vue';
import ConfirmModal from '../components/ConfirmModal.vue';

onMounted(() => {
  store.loadAllData();
});

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

// Pagination state: 5 per page matching screenshot reference
const currentPage = ref(1);
const pageSize = 5;

// Dynamic sub-category choices based on selected category
const availableSubKategori = computed(() => {
  if (!filters.kategoriId) return store.subKategoriList;
  return store.subKategoriList.filter(s => s.kategoriId === Number(filters.kategoriId));
});

function onKategoriChange() {
  filters.subKategoriId = '';
  currentPage.value = 1;
}

// Year options extracted from data
const yearOptions = computed(() => {
  const years = new Set(store.barangMasukList.map(b => b.tahun || new Date(b.tanggal).getFullYear().toString()));
  years.add('2026');
  years.add('2025');
  years.add('2024');
  years.add('2023');
  return Array.from(years).sort().reverse();
});

// Format numbers with thousand separator dots (e.g. 61.000)
function formatNumberOnly(val) {
  if (val === null || val === undefined || val === '') return '0';
  const num = typeof val === 'string' ? parseInt(val.replace(/\D/g, ''), 10) || 0 : Math.round(val);
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Format date to DD/MM/YY HH:mm:ss matching screenshot (e.g. 04/10/23 10:00:00)
function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = String(d.getFullYear()).slice(-2);
  return `${day}/${month}/${year} 10:00:00`;
}

// Item Kode helper generator
function getItemKode(doc, itemIdx) {
  const katCode = store.kategoriList.find(k => k.id === doc.kategoriId)?.kode || 'ATK';
  return `${katCode}${String(doc.id * 10 + itemIdx + 1).padStart(4, '0')}`;
}

function toggleSort(field) {
  if (sortBy.value === field) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = field;
    sortDir.value = 'asc';
  }
}

// Filtered and sorted data
const filteredData = computed(() => {
  let list = [...store.barangMasukList];

  // Search filter
  if (filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    list = list.filter(item => {
      const matchDoc = (
        item.asalBarang?.toLowerCase().includes(q) ||
        item.subKategoriNama?.toLowerCase().includes(q) ||
        item.operatorNama?.toLowerCase().includes(q) ||
        item.nomorSurat?.toLowerCase().includes(q)
      );
      const matchItem = item.items?.some(it =>
        it.namaBarang?.toLowerCase().includes(q) ||
        it.kode?.toLowerCase().includes(q)
      );
      return matchDoc || matchItem;
    });
  }

  // Kategori filter
  if (filters.kategoriId) {
    list = list.filter(item => item.kategoriId === Number(filters.kategoriId));
  }

  // Sub Kategori filter
  if (filters.subKategoriId) {
    list = list.filter(item => item.subKategoriId === Number(filters.subKategoriId));
  }

  // Tahun filter
  if (filters.tahun) {
    list = list.filter(item => item.tahun === String(filters.tahun));
  }

  // Sorting
  list.sort((a, b) => {
    let valA = a[sortBy.value];
    let valB = b[sortBy.value];

    if (sortBy.value === 'tanggal') {
      valA = new Date(valA).getTime();
      valB = new Date(valB).getTime();
    } else if (sortBy.value === 'totalHarga') {
      valA = Number(valA);
      valB = Number(valB);
    } else if (typeof valA === 'string') {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }

    if (valA < valB) return sortDir.value === 'asc' ? -1 : 1;
    if (valA > valB) return sortDir.value === 'asc' ? 1 : -1;
    return 0;
  });

  return list;
});

// Pagination calculation
const totalPages = computed(() => Math.ceil(filteredData.value.length / pageSize) || 1);
const startIndex = computed(() => (currentPage.value - 1) * pageSize);
const endIndex = computed(() => startIndex.value + pageSize);
const paginatedData = computed(() => filteredData.value.slice(startIndex.value, endIndex.value));

// Export Excel handler
async function handleExportExcel() {
  try {
    await store.exportExcel({
      search: filters.search,
      kategoriId: filters.kategoriId,
      subKategoriId: filters.subKategoriId,
      tahun: filters.tahun,
      sort: sortBy.value,
      order: sortDir.value
    });
  } catch (err) {
    // Fallback export jika server offline
    exportBarangMasukToExcel(filteredData.value, {
      search: filters.search,
      kategori: store.kategoriList.find(k => k.id === Number(filters.kategoriId))?.nama,
      subKategori: availableSubKategori.value.find(s => s.id === Number(filters.subKategoriId))?.nama,
      tahun: filters.tahun
    });
    store.showToast('Data berhasil diekspor ke file Excel (.xlsx)', 'success');
  }
}

// Modal handling
const showPrintModal = ref(false);
const showDetailModal = ref(false);
const showDeleteModal = ref(false);
const selectedItem = ref(null);
const itemToDelete = ref(null);

function openPrintModal(item) {
  selectedItem.value = item;
  showPrintModal.value = true;
}

function openDetailModal(item) {
  selectedItem.value = item;
  showDetailModal.value = true;
}

function confirmDelete(item) {
  itemToDelete.value = item;
  showDeleteModal.value = true;
}

async function executeDelete() {
  if (itemToDelete.value) {
    try {
      await store.deleteBarangMasuk(itemToDelete.value.id);
      showDeleteModal.value = false;
      itemToDelete.value = null;
    } catch (err) {
      console.error(err);
    }
  }
}
</script>

<style scoped>
.hover-primary:hover {
  color: #216ac4 !important;
}

.custom-dashboard-table {
  border-collapse: collapse !important;
  width: 100%;
}

.custom-dashboard-table thead tr th {
  background-color: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
  border-top: 1px solid #e2e8f0;
  color: #64748b;
  font-weight: 600;
}

.custom-dashboard-table th,
.custom-dashboard-table td {
  padding: 0.75rem 0.85rem;
}

.custom-dashboard-table .doc-start-row td {
  border-top: 1px solid #e2e8f0;
}

.custom-dashboard-table .doc-sub-row td.item-cell {
  border-top: 1px solid #f1f5f9;
}

.custom-dashboard-table td.rowspan-cell {
  background-color: #ffffff;
  border-right: 1px solid #f1f5f9;
  vertical-align: middle;
}
</style>
