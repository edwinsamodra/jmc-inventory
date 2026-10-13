<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <RouterLink
          to="/barang-masuk"
          class="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          title="Kembali ke Daftar"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </RouterLink>
        <div>
          <h1 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {{ isEditMode ? 'Edit Data Barang Masuk' : 'Tambah Barang Masuk' }}
          </h1>
          <p class="text-xs sm:text-sm text-slate-500">
            {{ isEditMode ? 'Perbarui informasi transaksi dan item barang masuk' : 'Formulir input data penerimaan barang dan rincian item' }}
          </p>
        </div>
      </div>

      <div class="flex items-center space-x-2">
        <RouterLink
          to="/barang-masuk"
          class="px-4 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
        >
          Batal
        </RouterLink>
        <button
          @click="handleSubmit"
          type="button"
          :disabled="isOverLimit || form.items.length === 0"
          class="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          :class="isOverLimit ? 'bg-slate-400' : 'bg-brand-600 hover:bg-brand-700'"
        >
          {{ isEditMode ? 'Simpan Perubahan' : 'Simpan Transaksi' }}
        </button>
      </div>
    </div>

    <!-- Live Budget Validation Banner (Crucial Requirement) -->
    <div
      v-if="selectedSubKategori"
      class="p-4 rounded-2xl border transition-all"
      :class="isOverLimit ? 'bg-rose-50 border-rose-300 text-rose-900 shadow-sm' : 'bg-emerald-50 border-emerald-300 text-emerald-900'"
    >
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div class="flex items-start space-x-3">
          <div
            class="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
            :class="isOverLimit ? 'bg-rose-200 text-rose-700' : 'bg-emerald-200 text-emerald-700'"
          >
            <svg v-if="isOverLimit" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <div class="font-bold text-sm">
              {{ isOverLimit ? 'VALIDASI GAGAL: Total Harga Melebihi Batas Anggaran Sub Kategori!' : 'VALIDASI LOLOS: Total Harga Sesuai Batas Anggaran Sub Kategori' }}
            </div>
            <p class="text-xs mt-0.5 opacity-90">
              <span v-if="isOverLimit">
                Total item bernilai <strong>{{ formatRupiah(grandTotal) }}</strong>, melebihi batas harga Sub Kategori <strong>{{ formatRupiah(batasHargaSubKategori) }}</strong> sebesar <strong class="underline">{{ formatRupiah(grandTotal - batasHargaSubKategori) }}</strong>. Form tidak dapat disimpan.
              </span>
              <span v-else>
                Total saat ini <strong>{{ formatRupiah(grandTotal) }}</strong> dari pagu anggaran <strong>{{ formatRupiah(batasHargaSubKategori) }}</strong> (Sisa alokasi: <strong>{{ formatRupiah(batasHargaSubKategori - grandTotal) }}</strong>).
              </span>
            </p>
          </div>
        </div>

        <div class="text-right sm:border-l sm:pl-4" :class="isOverLimit ? 'border-rose-200' : 'border-emerald-200'">
          <div class="text-2xs font-bold uppercase tracking-wider opacity-75">Batas Harga Sub Kategori</div>
          <div class="text-base font-extrabold">{{ formatRupiah(batasHargaSubKategori) }}</div>
        </div>
      </div>
    </div>

    <!-- Card 1: Informasi Umum -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5">
      <div class="border-b border-slate-100 pb-3">
        <h2 class="text-base font-bold text-slate-800 flex items-center">
          <span class="w-2 h-2 rounded-full bg-brand-600 mr-2"></span>
          Informasi Umum
        </h2>
        <p class="text-xs text-slate-500 mt-0.5">Lengkapi informasi dasar penerimaan dan vendor pengirim</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <!-- 1. Operator -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Operator <span class="text-rose-500">*</span>
          </label>
          <div v-if="isAdmin">
            <select
              v-model="form.operatorId"
              class="block w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
              required
            >
              <option :value="''">-- Pilih Operator --</option>
              <option v-for="op in operatorUsers" :key="op.id" :value="op.id">
                {{ op.nama }} (@{{ op.username }})
              </option>
            </select>
            <p class="text-2xs text-slate-400 mt-1">Admin dapat memilih nama operator yang bertugas.</p>
          </div>
          <div v-else>
            <input
              type="text"
              :value="store.currentUser?.nama"
              readonly
              disabled
              class="block w-full px-3 py-2.5 text-sm bg-slate-100 border border-slate-200 rounded-xl text-slate-600 cursor-not-allowed font-medium"
            />
            <p class="text-2xs text-slate-400 mt-1">Operator otomatis terkunci pada diri sendiri.</p>
          </div>
        </div>

        <!-- 2. Kategori -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Kategori <span class="text-rose-500">*</span>
          </label>
          <select
            v-model="form.kategoriId"
            @change="handleKategoriChange"
            class="block w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
            required
          >
            <option :value="''">-- Pilih Kategori --</option>
            <option v-for="k in store.kategoriList" :key="k.id" :value="k.id">
              {{ k.kode }} - {{ k.nama }}
            </option>
          </select>
          <p v-if="errors.kategoriId" class="text-2xs text-rose-500 mt-1">{{ errors.kategoriId }}</p>
        </div>

        <!-- 3. Sub Kategori -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Sub Kategori <span class="text-rose-500">*</span>
          </label>
          <select
            v-model="form.subKategoriId"
            :disabled="!form.kategoriId"
            class="block w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition disabled:opacity-50 disabled:cursor-not-allowed"
            required
          >
            <option :value="''">
              {{ form.kategoriId ? '-- Pilih Sub Kategori --' : '-- Pilih Kategori Terlebih Dahulu --' }}
            </option>
            <option v-for="s in filteredSubKategori" :key="s.id" :value="s.id">
              {{ s.nama }}
            </option>
          </select>
          <p v-if="errors.subKategoriId" class="text-2xs text-rose-500 mt-1">{{ errors.subKategoriId }}</p>
        </div>

        <!-- 4. Batas Harga (Readonly text) -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Batas Harga Sub Kategori
          </label>
          <div class="relative">
            <input
              type="text"
              :value="formatRupiah(batasHargaSubKategori)"
              readonly
              class="block w-full px-3 py-2.5 text-sm bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-800 cursor-not-allowed"
            />
          </div>
          <p class="text-2xs text-slate-400 mt-1">Plafon anggaran maksimum pengadaan per sub kategori.</p>
        </div>

        <!-- 5. Tanggal Masuk -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Tanggal Masuk <span class="text-rose-500">*</span>
          </label>
          <input
            v-model="form.tanggal"
            type="date"
            class="block w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
            required
          />
          <p v-if="errors.tanggal" class="text-2xs text-rose-500 mt-1">{{ errors.tanggal }}</p>
        </div>

        <!-- 6. Asal Barang (Textbox, max 200 char) -->
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Asal Barang <span class="text-rose-500">*</span>
            </label>
            <span class="text-2xs" :class="form.asalBarang.length > 200 ? 'text-rose-500 font-bold' : 'text-slate-400'">
              {{ form.asalBarang.length }}/200
            </span>
          </div>
          <input
            v-model="form.asalBarang"
            type="text"
            maxlength="200"
            placeholder="Nama vendor / rekanan / asal instansi"
            class="block w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
            required
          />
          <p v-if="errors.asalBarang" class="text-2xs text-rose-500 mt-1">{{ errors.asalBarang }}</p>
        </div>

        <!-- 7. Nomor Surat (Textbox, opsional, max 100 char) -->
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Nomor Surat <span class="text-slate-400 font-normal lowercase">(opsional)</span>
            </label>
            <span class="text-2xs text-slate-400">{{ form.nomorSurat.length }}/100</span>
          </div>
          <input
            v-model="form.nomorSurat"
            type="text"
            maxlength="100"
            placeholder="Contoh: SRT/2026/04/001"
            class="block w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
          />
        </div>

        <!-- 8. Lampiran (File, opsional, doc/docx/zip) -->
        <div class="md:col-span-2 lg:col-span-2">
          <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Lampiran Dokumen <span class="text-slate-400 font-normal lowercase">(opsional, ekstensi doc, docx, zip)</span>
          </label>
          <div class="flex items-center space-x-3">
            <label class="cursor-pointer inline-flex items-center px-4 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition shadow-2xs">
              <svg class="w-4 h-4 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              <span>Pilih File Lampiran</span>
              <input
                type="file"
                accept=".doc,.docx,.zip"
                class="hidden"
                @change="handleFileUpload"
              />
            </label>

            <div v-if="form.lampiranName" class="flex items-center space-x-2 text-xs text-brand-700 bg-brand-50 px-3 py-2 rounded-xl border border-brand-200">
              <span class="font-medium truncate max-w-xs">{{ form.lampiranName }}</span>
              <button
                type="button"
                @click="removeFile"
                class="text-rose-500 hover:text-rose-700 p-0.5"
                title="Hapus Lampiran"
              >
                &times;
              </button>
            </div>
            <span v-else class="text-xs text-slate-400 italic">Belum ada file dipilih</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Card 2: Informasi Barang (Multi-line Items Table) -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h2 class="text-base font-bold text-slate-800 flex items-center">
            <span class="w-2 h-2 rounded-full bg-brand-600 mr-2"></span>
            Informasi Barang
          </h2>
          <p class="text-xs text-slate-500 mt-0.5">Masukkan rincian item pengadaan. Total akumulasi otomatis dihitung.</p>
        </div>

        <!-- Tombol + (Tambah baris item) -->
        <button
          @click="addItemRow"
          type="button"
          class="inline-flex items-center px-3.5 py-2 border border-brand-300 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-xl text-xs font-bold transition shadow-2xs"
        >
          <svg class="w-4 h-4 mr-1 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Tambah Baris Item (+)
        </button>
      </div>

      <!-- Items Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-2xs uppercase tracking-wider font-bold text-slate-500">
              <th class="p-3 text-center w-10">No</th>
              <th class="p-3 min-w-[200px]">Nama Barang <span class="text-rose-500">*</span></th>
              <th class="p-3 min-w-[150px]">Harga Satuan (Rp) <span class="text-rose-500">*</span></th>
              <th class="p-3 w-28">Jumlah (Qty) <span class="text-rose-500">*</span></th>
              <th class="p-3 w-32">Satuan <span class="text-rose-500">*</span></th>
              <th class="p-3 min-w-[150px] text-right">Total (Readonly)</th>
              <th class="p-3 w-36 text-center">Tgl Expired</th>
              <th class="p-3 text-center w-12">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="(item, idx) in form.items" :key="item.id" class="hover:bg-slate-50/50">
              <!-- No -->
              <td class="p-3 text-center text-slate-400 font-semibold">{{ idx + 1 }}</td>

              <!-- Nama Barang (Textbox, max 200 char) -->
              <td class="p-3">
                <input
                  v-model="item.namaBarang"
                  type="text"
                  maxlength="200"
                  placeholder="Nama barang..."
                  class="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  required
                />
              </td>

              <!-- Harga (Rupiah masking) -->
              <td class="p-3">
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-2 flex items-center text-slate-400 text-2xs font-semibold">Rp</span>
                  <input
                    type="text"
                    :value="formatRupiah(item.harga, false)"
                    @input="handlePriceInput(item, $event)"
                    placeholder="0"
                    class="w-full pl-7 pr-2.5 py-1.5 text-right border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    required
                  />
                </div>
              </td>

              <!-- Jumlah Barang (Numerik) -->
              <td class="p-3">
                <input
                  v-model.number="item.jumlah"
                  type="number"
                  min="1"
                  placeholder="1"
                  @input="recalculateRow(item)"
                  class="w-full px-2.5 py-1.5 text-center border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  required
                />
              </td>

              <!-- Satuan (Textbox, maks 40 char) -->
              <td class="p-3">
                <input
                  v-model="item.satuan"
                  type="text"
                  maxlength="40"
                  placeholder="Pcs/Box/Rim"
                  class="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  required
                />
              </td>

              <!-- Total (Readonly, Rupiah, = Harga * Jumlah) -->
              <td class="p-3 text-right">
                <div class="font-bold text-slate-900 text-xs px-2 py-1.5 bg-slate-100 rounded-lg">
                  {{ formatRupiah(item.total) }}
                </div>
              </td>

              <!-- Tgl Expired (Date, opsional) -->
              <td class="p-3 text-center">
                <input
                  v-model="item.expiredDate"
                  type="date"
                  class="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-2xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </td>

              <!-- Tombol x (Hapus baris item) -->
              <td class="p-3 text-center">
                <button
                  type="button"
                  @click="removeItemRow(idx)"
                  :disabled="form.items.length <= 1"
                  class="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Hapus baris item ini (&times;)"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>

          <!-- Table Summary Footer -->
          <tfoot>
            <tr class="bg-slate-50 font-bold border-t-2 border-slate-200 text-xs text-slate-800">
              <td colspan="5" class="p-3 text-right uppercase tracking-wider text-slate-600">
                TOTAL KESELURUHAN PENGADAAN:
              </td>
              <td class="p-3 text-right text-sm" :class="isOverLimit ? 'text-rose-600 font-extrabold' : 'text-brand-700 font-extrabold'">
                {{ formatRupiah(grandTotal) }}
              </td>
              <td colspan="2" class="p-3 text-2xs font-normal text-slate-500 text-center">
                ({{ form.items.length }} jenis barang)
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- Bottom Actions -->
    <div class="flex items-center justify-end space-x-3 pt-2">
      <RouterLink
        to="/barang-masuk"
        class="px-5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
      >
        Batalkan
      </RouterLink>
      <button
        @click="handleSubmit"
        type="button"
        :disabled="isOverLimit || form.items.length === 0"
        class="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        :class="isOverLimit ? 'bg-slate-400' : 'bg-brand-600 hover:bg-brand-700'"
      >
        {{ isEditMode ? 'Simpan Perubahan' : 'Simpan Transaksi Barang Masuk' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { store } from '../store/mockStore';
import { formatRupiah, parseRupiah } from '../utils/formatters';

const route = useRoute();
const router = useRouter();

const isEditMode = computed(() => !!route.params.id);
const isAdmin = computed(() => store.currentUser?.role === 'Admin');

// Operator users list for admin combobox
const operatorUsers = computed(() => store.userList.filter(u => u.role === 'Operator' && !u.isLocked));

// Form State
const form = reactive({
  operatorId: '',
  kategoriId: '',
  subKategoriId: '',
  tanggal: new Date().toISOString().slice(0, 10),
  asalBarang: '',
  nomorSurat: '',
  lampiranName: '',
  items: [
    {
      id: 1,
      namaBarang: '',
      harga: 0,
      jumlah: 1,
      satuan: 'Pcs',
      total: 0,
      expiredDate: ''
    }
  ]
});

const errors = reactive({
  kategoriId: '',
  subKategoriId: '',
  asalBarang: '',
  tanggal: ''
});

// Dynamic sub categories filtered by category
const filteredSubKategori = computed(() => {
  if (!form.kategoriId) return [];
  return store.subKategoriList.filter(s => s.kategoriId === Number(form.kategoriId));
});

const selectedSubKategori = computed(() => {
  if (!form.subKategoriId) return null;
  return store.subKategoriList.find(s => s.id === Number(form.subKategoriId));
});

const batasHargaSubKategori = computed(() => {
  return selectedSubKategori.value ? selectedSubKategori.value.batasHarga : 0;
});

// Grand total calculation
const grandTotal = computed(() => {
  return form.items.reduce((acc, it) => acc + (Number(it.total) || 0), 0);
});

// Over budget limit check (Critical requirement!)
const isOverLimit = computed(() => {
  if (!selectedSubKategori.value) return false;
  return grandTotal.value > batasHargaSubKategori.value;
});

function handleKategoriChange() {
  form.subKategoriId = '';
}

// Item row actions
let nextItemId = 2;
function addItemRow() {
  form.items.push({
    id: nextItemId++,
    namaBarang: '',
    harga: 0,
    jumlah: 1,
    satuan: 'Pcs',
    total: 0,
    expiredDate: ''
  });
}

function removeItemRow(index) {
  if (form.items.length > 1) {
    form.items.splice(index, 1);
  }
}

function handlePriceInput(item, event) {
  const raw = event.target.value;
  const num = parseRupiah(raw);
  item.harga = num;
  recalculateRow(item);
}

function recalculateRow(item) {
  const qty = Number(item.jumlah) || 0;
  item.total = (Number(item.harga) || 0) * qty;
}

// File upload mockup
function handleFileUpload(event) {
  const file = event.target.files?.[0];
  if (file) {
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['doc', 'docx', 'zip'].includes(ext)) {
      alert('Format file tidak didukung! Harap unggah file dengan ekstensi .doc, .docx, atau .zip');
      event.target.value = '';
      return;
    }
    form.lampiranName = file.name;
  }
}

function removeFile() {
  form.lampiranName = '';
}

// Load data if edit mode
onMounted(() => {
  // If not admin, lock operator to current user
  if (!isAdmin.value) {
    form.operatorId = store.currentUser?.id;
  } else if (!form.operatorId) {
    form.operatorId = operatorUsers.value[0]?.id || store.currentUser?.id;
  }

  if (isEditMode.value) {
    const id = Number(route.params.id);
    const existing = store.barangMasukList.find(b => b.id === id);
    if (existing) {
      form.operatorId = existing.operatorId;
      form.kategoriId = existing.kategoriId;
      form.subKategoriId = existing.subKategoriId;
      form.tanggal = existing.tanggal;
      form.asalBarang = existing.asalBarang;
      form.nomorSurat = existing.nomorSurat || '';
      form.lampiranName = existing.lampiranName || '';
      form.items = existing.items.map((it, idx) => ({
        id: idx + 1,
        namaBarang: it.namaBarang,
        harga: it.harga,
        jumlah: it.jumlah,
        satuan: it.satuan,
        total: it.total,
        expiredDate: it.expiredDate || ''
      }));
    } else {
      store.showToast('Data barang masuk tidak ditemukan!', 'error');
      router.push('/barang-masuk');
    }
  }
});

// Submit form
function handleSubmit() {
  errors.kategoriId = '';
  errors.subKategoriId = '';
  errors.asalBarang = '';
  errors.tanggal = '';

  let valid = true;
  if (!form.kategoriId) {
    errors.kategoriId = 'Kategori wajib dipilih!';
    valid = false;
  }
  if (!form.subKategoriId) {
    errors.subKategoriId = 'Sub Kategori wajib dipilih!';
    valid = false;
  }
  if (!form.asalBarang.trim()) {
    errors.asalBarang = 'Asal Barang wajib diisi!';
    valid = false;
  }
  if (!form.tanggal) {
    errors.tanggal = 'Tanggal Masuk wajib diisi!';
    valid = false;
  }

  // Check item rows
  for (let i = 0; i < form.items.length; i++) {
    const it = form.items[i];
    if (!it.namaBarang.trim() || it.harga <= 0 || it.jumlah <= 0 || !it.satuan.trim()) {
      alert(`Harap lengkapi baris item #${i + 1} (Nama barang, harga > 0, jumlah > 0, dan satuan wajib diisi).`);
      return;
    }
  }

  // Crucial validation: Cannot exceed batas harga
  if (isOverLimit.value) {
    alert(`Total harga pengadaan (${formatRupiah(grandTotal.value)}) melebihi batas harga Sub Kategori (${formatRupiah(batasHargaSubKategori.value)})!`);
    return;
  }

  if (!valid) return;

  const payload = {
    operatorId: form.operatorId,
    kategoriId: Number(form.kategoriId),
    subKategoriId: Number(form.subKategoriId),
    tanggal: form.tanggal,
    asalBarang: form.asalBarang,
    nomorSurat: form.nomorSurat,
    lampiranName: form.lampiranName,
    items: form.items.map(it => ({
      namaBarang: it.namaBarang,
      harga: Number(it.harga),
      jumlah: Number(it.jumlah),
      satuan: it.satuan,
      total: Number(it.total),
      expiredDate: it.expiredDate
    })),
    totalHarga: grandTotal.value
  };

  if (isEditMode.value) {
    store.updateBarangMasuk(Number(route.params.id), payload);
  } else {
    store.addBarangMasuk(payload);
  }

  router.push('/barang-masuk');
}
</script>
