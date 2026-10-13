<template>
  <div v-if="show && item" class="modal modal-blur fade show d-block" tabindex="-1" role="dialog" style="background-color: rgba(0, 0, 0, 0.5);">
    <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
      <div class="modal-content shadow-lg">
        <div class="modal-header">
          <div>
            <div class="text-secondary small fw-bold text-uppercase">Detail Transaksi</div>
            <h3 class="modal-title fw-bold text-primary">{{ item.nomorSurat || 'Tanpa Nomor Surat' }}</h3>
          </div>
          <button type="button" class="btn-close" aria-label="Close" @click="$emit('close')"></button>
        </div>

        <div class="modal-body">
          <!-- Metadata Table / Key-Values -->
          <div class="card mb-3">
            <div class="card-body">
              <div class="row g-3">
                <div class="col-sm-6">
                  <div class="text-secondary small">Tanggal Masuk:</div>
                  <div class="fw-bold">{{ formatDateIndo(item.tanggal) }} (Tahun: {{ item.tahun }})</div>
                </div>
                <div class="col-sm-6">
                  <div class="text-secondary small">Asal Barang / Rekanan:</div>
                  <div class="fw-bold">{{ item.asalBarang }}</div>
                </div>
                <div class="col-sm-6">
                  <div class="text-secondary small">Kategori & Sub Kategori:</div>
                  <div class="fw-bold">{{ item.kategoriNama }} &rarr; {{ item.subKategoriNama }}</div>
                </div>
                <div class="col-sm-6">
                  <div class="text-secondary small">Operator Input:</div>
                  <div class="fw-bold">{{ item.operatorNama }}</div>
                </div>
                <div class="col-sm-6">
                  <div class="text-secondary small">Batas Plafon Sub Kategori:</div>
                  <div class="fw-bold text-success">{{ formatRupiah(item.batasHargaSubKategori) }}</div>
                </div>
                <div class="col-sm-6">
                  <div class="text-secondary small">Status Verifikasi:</div>
                  <div>
                    <span
                      class="badge"
                      :class="item.isVerified ? 'bg-success text-white' : 'bg-warning text-dark'"
                    >
                      {{ item.isVerified ? 'Terverifikasi' : 'Menunggu Verifikasi' }}
                    </span>
                  </div>
                </div>
                <div class="col-12" v-if="item.lampiranName">
                  <div class="text-secondary small">File Lampiran:</div>
                  <div class="text-primary fw-medium small">
                    <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-sm me-1" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                      <path d="M15 7l-6.5 6.5a1.5 1.5 0 0 0 3 3l6.5 -6.5a3 3 0 0 0 -6 -6l-6.5 6.5a4.5 4.5 0 0 0 9 9l4 -4" />
                    </svg>
                    {{ item.lampiranName }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Items Table -->
          <h4 class="fw-bold mb-2">Daftar Item Barang ({{ item.items?.length || 0 }} item)</h4>
          <div class="table-responsive border rounded">
            <table class="table table-vcenter table-striped card-table">
              <thead>
                <tr>
                  <th class="w-1">No</th>
                  <th>Nama Barang</th>
                  <th class="text-end">Harga Satuan</th>
                  <th class="text-center">Jumlah</th>
                  <th>Satuan</th>
                  <th class="text-end">Total</th>
                  <th>Kadaluarsa</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(it, idx) in item.items" :key="it.id || idx">
                  <td>{{ idx + 1 }}</td>
                  <td class="fw-medium">{{ it.namaBarang }}</td>
                  <td class="text-end">{{ formatRupiah(it.harga) }}</td>
                  <td class="text-center fw-bold">{{ it.jumlah }}</td>
                  <td>{{ it.satuan }}</td>
                  <td class="text-end fw-bold">{{ formatRupiah(it.total) }}</td>
                  <td class="small text-secondary">{{ it.expiredDate ? formatDateIndo(it.expiredDate) : '-' }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="table-light">
                  <td colspan="5" class="text-end fw-bold">Grand Total:</td>
                  <td class="text-end fw-bold fs-3 text-primary">{{ formatRupiah(item.totalHarga) }}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-primary" @click="$emit('close')">
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
