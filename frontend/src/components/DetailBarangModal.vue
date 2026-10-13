<template>
  <div v-if="show && item" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-center justify-center min-h-screen p-4 text-center sm:p-0">
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" @click="$emit('close')"></div>

      <div class="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-slate-100 p-6">
        <div class="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span class="text-xs font-semibold text-brand-600 uppercase tracking-wider">Detail Transaksi</span>
            <h3 class="text-lg font-bold text-slate-900">
              {{ item.nomorSurat || 'Tanpa Nomor Surat' }}
            </h3>
          </div>
          <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="mt-4 space-y-4">
          <!-- Metadata grid -->
          <div class="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl text-xs">
            <div>
              <span class="text-slate-500">Tanggal Masuk:</span>
              <p class="font-semibold text-slate-800 mt-0.5">{{ formatDateIndo(item.tanggal) }} (Tahun: {{ item.tahun }})</p>
            </div>
            <div>
              <span class="text-slate-500">Asal Barang / Rekanan:</span>
              <p class="font-semibold text-slate-800 mt-0.5">{{ item.asalBarang }}</p>
            </div>
            <div>
              <span class="text-slate-500">Kategori & Sub Kategori:</span>
              <p class="font-semibold text-slate-800 mt-0.5">{{ item.kategoriNama }} &rarr; {{ item.subKategoriNama }}</p>
            </div>
            <div>
              <span class="text-slate-500">Operator Input:</span>
              <p class="font-semibold text-slate-800 mt-0.5">{{ item.operatorNama }}</p>
            </div>
            <div>
              <span class="text-slate-500">Batas Harga Sub Kategori:</span>
              <p class="font-semibold text-emerald-700 mt-0.5">{{ formatRupiah(item.batasHargaSubKategori) }}</p>
            </div>
            <div>
              <span class="text-slate-500">Status Verifikasi:</span>
              <div class="mt-0.5">
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold"
                  :class="item.isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'"
                >
                  <svg v-if="item.isVerified" class="w-3 h-3 mr-1 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  {{ item.isVerified ? 'Terverifikasi' : 'Menunggu Verifikasi' }}
                </span>
              </div>
            </div>
            <div class="col-span-2">
              <span class="text-slate-500">File Lampiran:</span>
              <p class="font-semibold text-slate-800 mt-0.5 flex items-center">
                <svg class="w-4 h-4 mr-1 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                {{ item.lampiranName || 'Tidak ada lampiran yang diunggah' }}
              </p>
            </div>
          </div>

          <!-- Items list -->
          <div>
            <h4 class="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Daftar Barang ({{ item.items?.length || 0 }} item)</h4>
            <div class="border border-slate-200 rounded-xl overflow-hidden">
              <table class="w-full text-xs text-left">
                <thead class="bg-slate-100 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th class="p-2.5">No</th>
                    <th class="p-2.5">Nama Barang</th>
                    <th class="p-2.5 text-right">Harga</th>
                    <th class="p-2.5 text-center">Qty</th>
                    <th class="p-2.5">Satuan</th>
                    <th class="p-2.5 text-right">Total</th>
                    <th class="p-2.5 text-center">Expired</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-for="(sub, i) in item.items" :key="i">
                    <td class="p-2.5 text-slate-500 text-center">{{ i + 1 }}</td>
                    <td class="p-2.5 font-medium text-slate-800">{{ sub.namaBarang }}</td>
                    <td class="p-2.5 text-right">{{ formatRupiah(sub.harga) }}</td>
                    <td class="p-2.5 text-center font-semibold">{{ sub.jumlah }}</td>
                    <td class="p-2.5">{{ sub.satuan }}</td>
                    <td class="p-2.5 text-right font-semibold text-slate-900">{{ formatRupiah(sub.total) }}</td>
                    <td class="p-2.5 text-center text-slate-500">{{ formatDateIndo(sub.expiredDate) || '-' }}</td>
                  </tr>
                </tbody>
                <tfoot class="bg-slate-50 font-bold border-t border-slate-200">
                  <tr>
                    <td colspan="5" class="p-2.5 text-right text-slate-700">Total Transaksi:</td>
                    <td class="p-2.5 text-right text-brand-700 text-sm">{{ formatRupiah(item.totalHarga) }}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-end space-x-3">
          <button
            @click="$emit('close')"
            class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatRupiah, formatDateIndo } from '../utils/formatters';

defineProps({
  show: Boolean,
  item: Object
});

defineEmits(['close']);
</script>
