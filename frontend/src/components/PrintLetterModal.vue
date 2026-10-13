<template>
  <div v-if="show && item" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-center justify-center min-h-screen p-4 text-center sm:p-0">
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" @click="$emit('close')"></div>

      <div class="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full border border-slate-100">
        <!-- Modal Toolbar (Hidden when printing) -->
        <div class="no-print bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <svg class="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <h3 class="text-base font-semibold text-slate-800">Pratinjau Cetak Surat Masuk</h3>
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="triggerPrint"
              type="button"
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-xs text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 transition"
            >
              <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Cetak Dokumen
            </button>
            <button
              @click="$emit('close')"
              type="button"
              class="px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
            >
              Tutup
            </button>
          </div>
        </div>

        <!-- Printable Document Canvas -->
        <div class="p-8 sm:p-12 printable-document font-serif text-slate-900 bg-white min-h-[500px]">
          <!-- Letterhead / Kop Surat -->
          <div class="border-b-2 border-slate-900 pb-4 mb-6 text-center">
            <h2 class="text-2xl font-bold tracking-wide uppercase font-sans text-slate-900">JMC LOGISTIK & PENGELOLAAN BARANG</h2>
            <p class="text-xs text-slate-600 font-sans mt-0.5">Jl. Jenderal Sudirman No. 88, Kawasan Niaga Terpadu | Telp: (021) 555-8899 | Email: logistik@jmc.co.id</p>
          </div>

          <div class="text-center mb-6">
            <h1 class="text-xl font-bold uppercase underline font-sans tracking-wide">SURAT TANDA PENERIMAAN BARANG MASUK</h1>
            <p class="text-xs font-mono mt-1 text-slate-600 font-sans">Nomor: {{ item.nomorSurat || '-' }}</p>
          </div>

          <!-- Metadata Grid -->
          <div class="grid grid-cols-2 gap-4 text-xs font-sans mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <div class="flex py-0.5"><span class="w-32 text-slate-500 font-medium">Tanggal Diterima</span><span class="mr-2">:</span><span class="font-semibold">{{ formatDateFormal(item.tanggal) }}</span></div>
              <div class="flex py-0.5"><span class="w-32 text-slate-500 font-medium">Asal Barang / Vendor</span><span class="mr-2">:</span><span class="font-semibold">{{ item.asalBarang }}</span></div>
              <div class="flex py-0.5"><span class="w-32 text-slate-500 font-medium">Lampiran Dokumen</span><span class="mr-2">:</span><span>{{ item.lampiranName || 'Tidak Ada Lampiran' }}</span></div>
            </div>
            <div>
              <div class="flex py-0.5"><span class="w-32 text-slate-500 font-medium">Kategori</span><span class="mr-2">:</span><span>{{ item.kategoriNama }}</span></div>
              <div class="flex py-0.5"><span class="w-32 text-slate-500 font-medium">Sub Kategori</span><span class="mr-2">:</span><span class="font-semibold">{{ item.subKategoriNama }}</span></div>
              <div class="flex py-0.5"><span class="w-32 text-slate-500 font-medium">Operator Penerima</span><span class="mr-2">:</span><span class="font-semibold text-brand-700">{{ item.operatorNama }}</span></div>
            </div>
          </div>

          <!-- Items Table -->
          <div class="mb-6 font-sans">
            <table class="w-full text-xs border-collapse border border-slate-300">
              <thead>
                <tr class="bg-slate-100 text-slate-700">
                  <th class="border border-slate-300 px-3 py-2 text-center w-10">No</th>
                  <th class="border border-slate-300 px-3 py-2 text-left">Nama Barang</th>
                  <th class="border border-slate-300 px-3 py-2 text-right w-24">Harga Satuan</th>
                  <th class="border border-slate-300 px-3 py-2 text-center w-20">Jumlah</th>
                  <th class="border border-slate-300 px-3 py-2 text-center w-20">Satuan</th>
                  <th class="border border-slate-300 px-3 py-2 text-right w-28">Total</th>
                  <th class="border border-slate-300 px-3 py-2 text-center w-24">Tgl Expired</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(b, idx) in item.items" :key="idx" class="hover:bg-slate-50">
                  <td class="border border-slate-300 px-3 py-2 text-center">{{ idx + 1 }}</td>
                  <td class="border border-slate-300 px-3 py-2 font-medium">{{ b.namaBarang }}</td>
                  <td class="border border-slate-300 px-3 py-2 text-right">{{ formatRupiah(b.harga) }}</td>
                  <td class="border border-slate-300 px-3 py-2 text-center font-semibold">{{ b.jumlah }}</td>
                  <td class="border border-slate-300 px-3 py-2 text-center">{{ b.satuan }}</td>
                  <td class="border border-slate-300 px-3 py-2 text-right font-medium">{{ formatRupiah(b.total) }}</td>
                  <td class="border border-slate-300 px-3 py-2 text-center text-slate-500">{{ formatDateIndo(b.expiredDate) || '-' }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="bg-slate-100 font-semibold text-slate-900">
                  <td colspan="5" class="border border-slate-300 px-3 py-2 text-right">TOTAL KESELURUHAN:</td>
                  <td class="border border-slate-300 px-3 py-2 text-right text-brand-700 font-bold">{{ formatRupiah(item.totalHarga) }}</td>
                  <td class="border border-slate-300 px-3 py-2"></td>
                </tr>
                <tr class="text-xs text-slate-500">
                  <td colspan="5" class="border border-slate-300 px-3 py-1.5 text-right italic">Batas Plafon Sub Kategori:</td>
                  <td class="border border-slate-300 px-3 py-1.5 text-right font-semibold">{{ formatRupiah(item.batasHargaSubKategori) }}</td>
                  <td class="border border-slate-300 px-3 py-1.5 text-center text-emerald-600 font-medium">MEMENUHI</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Signatures Section -->
          <div class="grid grid-cols-3 gap-6 text-center text-xs font-sans mt-12 pt-4 border-t border-dashed border-slate-200">
            <div>
              <p class="text-slate-600 mb-16">Diserahkan Oleh,</p>
              <div class="border-b border-slate-400 w-36 mx-auto mb-1"></div>
              <p class="font-semibold text-slate-800">{{ item.asalBarang }}</p>
              <p class="text-slate-400 text-2xs">Vendor / Ekspedisi</p>
            </div>
            <div>
              <p class="text-slate-600 mb-16">Diterima Oleh,</p>
              <div class="border-b border-slate-400 w-36 mx-auto mb-1"></div>
              <p class="font-semibold text-slate-800">{{ item.operatorNama }}</p>
              <p class="text-slate-400 text-2xs">Operator Gudang</p>
            </div>
            <div>
              <p class="text-slate-600 mb-16">Mengetahui & Verifikasi,</p>
              <div class="border-b border-slate-400 w-36 mx-auto mb-1"></div>
              <p class="font-semibold text-slate-800">{{ item.isVerified ? 'Kepala Gudang / Admin' : '(Belum Diverifikasi)' }}</p>
              <p class="text-slate-400 text-2xs">Supervisor Logistik</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatRupiah, formatDateIndo, formatDateFormal } from '../utils/formatters';

defineProps({
  show: Boolean,
  item: Object
});

defineEmits(['close']);

function triggerPrint() {
  window.print();
}
</script>
