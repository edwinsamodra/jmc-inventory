<template>
  <div class="py-2">
    <!-- Card 1: INFORMASI UMUM -->
    <div class="card shadow-sm border-0 mb-4 bg-white rounded-2">
      <div class="card-header bg-white border-bottom py-3 px-4">
        <h4 class="fw-bold text-dark m-0" style="font-size: 0.9rem; letter-spacing: 0.05em;">
          INFORMASI UMUM
        </h4>
      </div>
      <div class="card-body px-4 py-4">
        <!-- 1. Operator -->
        <div class="mb-3" style="max-width: 250px;">
          <label class="form-label text-dark fw-medium small mb-1">
            Operator
          </label>
          <select
            v-if="isAdmin"
            v-model="form.operatorId"
            class="form-select bg-white"
          >
            <option v-for="op in operatorList" :key="op.id" :value="op.id">
              {{ op.nama }}
            </option>
          </select>
          <input
            v-else
            type="text"
            :value="store.currentUser?.nama"
            readonly
            class="form-control bg-light"
          />
        </div>

        <!-- 2. Kategori -->
        <div class="mb-3" style="max-width: 250px;">
          <label class="form-label text-dark fw-medium small mb-1">
            Kategori
          </label>
          <select
            v-model="form.kategoriId"
            @change="handleKategoriChange"
            class="form-select bg-white"
          >
            <option value="">Pilih Kategori</option>
            <option v-for="kat in store.kategoriList" :key="kat.id" :value="kat.id">
              {{ kat.nama }}
            </option>
          </select>
        </div>

        <!-- 3. Sub Kategori & Batas Harga (Side-by-Side) -->
        <div class="d-flex flex-wrap gap-4 align-items-start mb-3">
          <div style="width: 250px;">
            <label class="form-label text-dark fw-medium small mb-1">
              Sub Kategori
            </label>
            <select
              v-model="form.subKategoriId"
              :disabled="!form.kategoriId"
              class="form-select bg-white"
            >
              <option value="">Pilih Sub Kategori</option>
              <option v-for="sub in filteredSubKategori" :key="sub.id" :value="sub.id">
                {{ sub.nama }}
              </option>
            </select>
          </div>

          <div style="width: 250px;">
            <label class="form-label text-dark fw-medium small mb-1">
              Batas Harga
            </label>
            <input
              type="text"
              :value="selectedSubKategori ? formatNumberOnly(selectedSubKategori.batasHarga) : ''"
              readonly
              class="form-control bg-light"
              placeholder="500.000"
            />
          </div>
        </div>

        <!-- 4. Asal Barang -->
        <div class="mb-3" style="max-width: 520px;">
          <label class="form-label text-dark fw-medium small mb-1">
            Asal Barang
          </label>
          <input
            v-model="form.asalBarang"
            type="text"
            maxlength="200"
            class="form-control bg-white"
          />
        </div>

        <!-- 5. Nomor Surat & Lampiran (Side-by-Side) -->
        <div class="d-flex flex-wrap gap-4 align-items-start">
          <div style="width: 250px;">
            <label class="form-label text-dark fw-medium small mb-1">
              Nomor Surat
            </label>
            <input
              v-model="form.nomorSurat"
              type="text"
              maxlength="100"
              class="form-control bg-white"
            />
          </div>

          <div style="width: 260px;">
            <label class="form-label text-dark fw-medium small mb-1">
              Lampiran
            </label>
            <input
              type="file"
              accept=".doc,.docx,.zip,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/zip"
              @change="handleFileUpload"
              class="form-control bg-white"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Card 2: INFORMASI BARANG -->
    <div class="card shadow-sm border-0 mb-4 bg-white rounded-2">
      <div class="card-header bg-white border-bottom py-3 px-4">
        <h4 class="fw-bold text-dark m-0" style="font-size: 0.9rem; letter-spacing: 0.05em;">
          INFORMASI BARANG
        </h4>
      </div>
      <div class="card-body px-4 py-4">
        <!-- Item Table / Row Grid matching Screenshot -->
        <div class="table-responsive">
          <table class="table table-borderless align-middle mb-0" style="border-collapse: separate; border-spacing: 0 10px;">
            <thead>
              <tr class="text-secondary small fw-medium" style="font-size: 0.85rem;">
                <th style="min-width: 220px; padding: 0 6px 8px 0;">Nama Barang</th>
                <th style="width: 170px; padding: 0 6px 8px 6px;">Harga (Rp.)</th>
                <th style="width: 90px; padding: 0 6px 8px 6px;">Jumlah</th>
                <th style="width: 100px; padding: 0 6px 8px 6px;">Satuan</th>
                <th style="width: 170px; padding: 0 6px 8px 6px;">Total</th>
                <th style="width: 180px; padding: 0 6px 8px 6px;">Tgl. Ekspired</th>
                <th style="width: 55px; padding: 0 0 8px 6px;"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in form.items" :key="item.id || idx">
                <!-- Nama Barang -->
                <td style="padding: 0 6px 0 0;">
                  <input
                    v-model="item.namaBarang"
                    type="text"
                    maxlength="200"
                    class="form-control bg-white"
                  />
                </td>

                <!-- Harga (Rp.) with Rp. prefix (di kiri) -->
                <td style="padding: 0 6px;">
                  <div class="input-group">
                    <span class="input-group-text bg-white border-end-0 text-muted small px-2">
                      Rp.
                    </span>
                    <input
                      :value="formatNumberOnly(item.harga)"
                      @input="e => onHargaInput(idx, e.target.value)"
                      type="text"
                      class="form-control bg-white border-start-0 text-end pe-2"
                    />
                  </div>
                </td>

                <!-- Jumlah -->
                <td style="padding: 0 6px;">
                  <input
                    v-model.number="item.jumlah"
                    @input="recalculateItemTotal(idx)"
                    type="number"
                    min="1"
                    class="form-control bg-white text-center"
                  />
                </td>

                <!-- Satuan -->
                <td style="padding: 0 6px;">
                  <input
                    v-model="item.satuan"
                    type="text"
                    maxlength="40"
                    placeholder="Buah"
                    class="form-control bg-white text-center"
                  />
                </td>

                <!-- Total with Rp. prefix (di kiri) -->
                <td style="padding: 0 6px;">
                  <div class="input-group">
                    <span class="input-group-text bg-white border-end-0 text-muted small px-2">
                      Rp.
                    </span>
                    <input
                      :value="formatNumberOnly(item.total)"
                      readonly
                      type="text"
                      class="form-control bg-white border-start-0 text-end pe-2"
                    />
                  </div>
                </td>

                <!-- Tgl. Ekspired -->
                <td style="padding: 0 6px;">
                  <input
                    v-model="item.expiredDate"
                    type="date"
                    class="form-control bg-white"
                  />
                </td>

                <!-- Action Button (+) on row 0, (x) on subsequent rows -->
                <td style="padding: 0 0 0 6px;" class="text-center align-middle">
                  <!-- Row 1: Add Row (+) Button -->
                  <button
                    v-if="idx === 0"
                    type="button"
                    @click="addItemRow"
                    class="btn-action-add"
                    title="Tambah Item"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </button>

                  <!-- Subsequent Rows: Remove Row (x) Button -->
                  <button
                    v-else
                    type="button"
                    @click="removeItemRow(idx)"
                    class="btn-action-remove"
                    title="Hapus Item"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Bottom Actions (Kembali & Simpan) -->
    <div class="d-flex align-items-center gap-3 pt-1 pb-4">
      <RouterLink
        to="/barang-masuk"
        class="btn bg-white text-dark d-inline-flex align-items-center gap-2 px-3 py-2 fw-medium border shadow-none"
        style="border-color: #cbd5e1 !important;"
      >
        <span>&larr;</span>
        <span>Kembali</span>
      </RouterLink>

      <button
        type="button"
        @click="handleSubmit"
        :disabled="isOverLimit || form.items.length === 0"
        class="btn text-white px-4 py-2 fw-semibold shadow-none"
        style="background-color: #2b708b; border-color: #2b708b;"
      >
        Simpan
      </button>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { store } from '../store/mockStore';
import api from '../services/api';
import { formatRupiah } from '../utils/formatters';

const route = useRoute();
const router = useRouter();

const isEditMode = computed(() => Boolean(route.params.id));
const isAdmin = computed(() => store.currentUser?.role === 'Admin');

const operatorList = computed(() => {
  return (store.userList || []).filter(u => !u.isLocked);
});

const form = reactive({
  operatorId: store.currentUser?.id || 1,
  tanggal: new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' }),
  kategoriId: '',
  subKategoriId: '',
  asalBarang: '',
  nomorSurat: '',
  lampiranName: '',
  items: [
    {
      id: 'item-1',
      namaBarang: '',
      harga: 0,
      hargaFormatted: 'Rp 0',
      jumlah: 1,
      satuan: 'Unit',
      total: 0,
      expiredDate: ''
    }
  ]
});

// Filter subkategori
const filteredSubKategori = computed(() => {
  if (!form.kategoriId) return [];
  return store.subKategoriList.filter(s => s.kategoriId === Number(form.kategoriId));
});

const selectedSubKategori = computed(() => {
  if (!form.subKategoriId) return null;
  return store.subKategoriList.find(s => s.id === Number(form.subKategoriId));
});

function handleKategoriChange() {
  form.subKategoriId = '';
}

// Format numeric to rupiah input mask
function formatMaskRupiah(val) {
  const num = typeof val === 'number' ? val : parseInt(String(val).replace(/\D/g, ''), 10) || 0;
  return 'Rp ' + num.toLocaleString('id-ID');
}

function onHargaInput(idx, rawValue) {
  const cleanNumber = parseInt(String(rawValue).replace(/\D/g, ''), 10) || 0;
  form.items[idx].harga = cleanNumber;
  form.items[idx].hargaFormatted = formatMaskRupiah(cleanNumber);
  recalculateItemTotal(idx);
}

function recalculateItemTotal(idx) {
  const item = form.items[idx];
  const jml = Number(item.jumlah) || 0;
  item.total = item.harga * jml;
}

const totalKeseluruhan = computed(() => {
  return form.items.reduce((sum, it) => sum + (it.total || 0), 0);
});

// Important validation rule: Total cannot exceed Batas Harga
const isOverLimit = computed(() => {
  if (!selectedSubKategori.value) return false;
  return totalKeseluruhan.value > selectedSubKategori.value.batasHarga;
});

function addItemRow() {
  form.items.push({
    id: 'item-' + Date.now(),
    namaBarang: '',
    harga: 0,
    hargaFormatted: 'Rp 0',
    jumlah: 1,
    satuan: 'Unit',
    total: 0,
    expiredDate: ''
  });
}

function removeItemRow(idx) {
  if (form.items.length > 1) {
    form.items.splice(idx, 1);
  }
}

const selectedFile = ref(null);

function handleFileUpload(e) {
  const file = e.target.files[0];
  if (file) {
    form.lampiranName = file.name;
    selectedFile.value = file;
  }
}

// Prefill if edit mode
onMounted(async () => {
  if (isEditMode.value) {
    let existing = store.barangMasukList.find(b => b.id === Number(route.params.id));
    if (!existing) {
      try {
        const res = await api.barangMasuk.getById(Number(route.params.id));
        if (res.success && res.data) {
          existing = res.data;
        }
      } catch (e) {
        console.warn('Gagal memuat barang masuk by ID:', e);
      }
    }

    if (existing) {
      form.operatorId = existing.operatorId;
      form.tanggal = existing.tanggal;
      form.kategoriId = existing.kategoriId;
      form.subKategoriId = existing.subKategoriId;
      form.asalBarang = existing.asalBarang;
      form.nomorSurat = existing.nomorSurat || '';
      form.lampiranName = existing.lampiranName || '';
      form.items = (existing.items || []).map(it => ({
        ...it,
        hargaFormatted: formatMaskRupiah(it.harga),
        total: it.harga * it.jumlah
      }));
    } else {
      store.showToast('Data barang masuk tidak ditemukan', 'error');
      router.push('/barang-masuk');
    }
  } else {
    // default operator to current logged in
    form.operatorId = store.currentUser?.id || 1;
  }
});

// Format numbers with thousand separator dots (e.g. 500.000)
function formatNumberOnly(val) {
  if (val === null || val === undefined || val === '') return '';
  const num = typeof val === 'string' ? parseInt(val.replace(/\D/g, ''), 10) || 0 : Math.round(val);
  return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '';
}

async function handleSubmit() {
  if (!form.kategoriId) {
    store.showToast('Kategori wajib dipilih!', 'error');
    return;
  }
  if (!form.subKategoriId) {
    store.showToast('Sub Kategori wajib dipilih!', 'error');
    return;
  }
  if (!form.asalBarang.trim()) {
    store.showToast('Asal barang wajib diisi!', 'error');
    return;
  }

  // Check item rows
  for (let i = 0; i < form.items.length; i++) {
    const it = form.items[i];
    if (!it.namaBarang.trim()) {
      store.showToast(`Baris #${i + 1}: Nama barang wajib diisi!`, 'error');
      return;
    }
    if (it.harga <= 0) {
      store.showToast(`Baris #${i + 1}: Harga barang harus lebih dari 0!`, 'error');
      return;
    }
    if (it.jumlah <= 0) {
      store.showToast(`Baris #${i + 1}: Jumlah barang minimal 1!`, 'error');
      return;
    }
    if (!it.satuan.trim()) {
      store.showToast(`Baris #${i + 1}: Satuan barang wajib diisi!`, 'error');
      return;
    }
  }

  if (isOverLimit.value) {
    store.showToast('Validasi gagal: Total harga melebihi batas plafon sub kategori!', 'error');
    return;
  }

  const selectedKat = store.kategoriList.find(k => k.id === Number(form.kategoriId));
  const selectedSub = selectedSubKategori.value;
  const selectedOp = (store.userList || []).find(u => u.id === Number(form.operatorId)) || store.currentUser;
  const nowJakarta = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' });
  const finalTanggal = isEditMode.value ? form.tanggal : nowJakarta;
  const yearStr = new Date(finalTanggal).getFullYear().toString();

  const payload = {
    tanggal: finalTanggal,
    tahun: yearStr,
    nomorSurat: form.nomorSurat.trim(),
    asalBarang: form.asalBarang.trim(),
    kategoriId: Number(form.kategoriId),
    kategoriNama: selectedKat?.nama || '',
    subKategoriId: Number(form.subKategoriId),
    subKategoriNama: selectedSub?.nama || '',
    batasHargaSubKategori: selectedSub?.batasHarga || 0,
    operatorId: Number(form.operatorId),
    operatorNama: selectedOp?.nama || store.currentUser?.nama,
    lampiranName: form.lampiranName,
    items: form.items.map(it => ({
      id: it.id,
      namaBarang: it.namaBarang.trim(),
      harga: Number(it.harga),
      jumlah: Number(it.jumlah),
      satuan: it.satuan.trim(),
      total: it.harga * it.jumlah,
      expiredDate: it.expiredDate || ''
    })),
    totalHarga: totalKeseluruhan.value
  };

  try {
    if (isEditMode.value) {
      await store.updateBarangMasuk(Number(route.params.id), payload, selectedFile.value);
    } else {
      await store.addBarangMasuk(payload, selectedFile.value);
    }
    router.push('/barang-masuk');
  } catch (err) {
    console.error('Gagal menyimpan barang masuk:', err);
  }
}
</script>

<style scoped>
.btn-action-add,
.btn-action-remove {
  width: 36px;
  height: 36px;
  min-width: 36px;
  min-height: 36px;
  border-radius: 50% !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 0 !important;
  line-height: 1 !important;
  cursor: pointer;
  outline: none;
  border: none;
}

.btn-action-add svg,
.btn-action-remove svg {
  display: block !important;
  margin: 0 !important;
  padding: 0 !important;
  flex-shrink: 0;
}

.btn-action-add {
  border: 1.5px solid #63b3ed !important;
  background-color: #ebf8ff;
  color: #3182ce;
  transition: all 0.2s ease;
}

.btn-action-add:hover {
  background-color: #bee3f8;
  color: #2b6cb0;
}

.btn-action-remove {
  background-color: #e53e3e;
  color: #ffffff;
  transition: all 0.2s ease;
}

.btn-action-remove:hover {
  background-color: #c53030;
}
</style>
