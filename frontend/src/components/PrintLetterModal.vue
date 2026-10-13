<template>
  <div v-if="show && item" class="modal modal-blur fade show d-block" tabindex="-1" role="dialog" style="background-color: rgba(0, 0, 0, 0.5);">
    <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
      <div class="modal-content shadow-lg">
        <!-- Modal Toolbar (Hidden when printing) -->
        <div class="modal-header d-print-none bg-light">
          <div class="d-flex align-items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon text-primary" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M17 17h2a2 2 0 0 0 2 -2v-4a2 2 0 0 0 -2 -2h-14a2 2 0 0 0 -2 2v4a2 2 0 0 0 2 2h2" />
              <path d="M17 9v-4a2 2 0 0 0 -2 -2h-6a2 2 0 0 0 -2 2v4" />
              <rect x="7" y="13" width="10" height="8" rx="2" />
            </svg>
            <h3 class="modal-title fw-bold">Pratinjau Cetak Surat Masuk</h3>
          </div>
          <div class="d-flex align-items-center gap-2">
            <button
              @click="triggerPrint"
              type="button"
              class="btn btn-primary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="icon me-1" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M17 17h2a2 2 0 0 0 2 -2v-4a2 2 0 0 0 -2 -2h-14a2 2 0 0 0 -2 2v4a2 2 0 0 0 2 2h2" />
                <path d="M17 9v-4a2 2 0 0 0 -2 -2h-6a2 2 0 0 0 -2 2v4" />
                <rect x="7" y="13" width="10" height="8" rx="2" />
              </svg>
              Cetak Dokumen
            </button>
            <button
              @click="$emit('close')"
              type="button"
              class="btn btn-outline-secondary"
            >
              Tutup
            </button>
          </div>
        </div>

        <!-- Printable Document Canvas -->
        <div class="modal-body p-4 p-md-5 printable-document bg-white text-dark">
          <!-- Letterhead / Kop Surat -->
          <div class="border-bottom border-dark border-3 pb-3 mb-4 text-center">
            <h2 class="h1 fw-bold text-uppercase mb-1 tracking-wide">JMC LOGISTIK & PENGELOLAAN BARANG</h2>
            <p class="text-secondary small mb-0">Jl. Jenderal Sudirman No. 88, Kawasan Niaga Terpadu | Telp: (021) 555-8899 | Email: logistik@jmc.co.id</p>
          </div>

          <div class="text-center mb-4">
            <h3 class="h2 fw-bold text-uppercase text-decoration-underline mb-1">SURAT TANDA PENERIMAAN BARANG MASUK</h3>
            <div class="text-secondary">Nomor: {{ item.nomorSurat || '-' }}</div>
          </div>

          <!-- Metadata Table -->
          <div class="card bg-light border mb-4">
            <div class="card-body py-3">
              <div class="row g-2">
                <div class="col-md-6">
                  <div class="row">
                    <div class="col-4 text-secondary">Tanggal:</div>
                    <div class="col-8 fw-semibold">{{ formatDateFormal(item.tanggal) }}</div>
                  </div>
                  <div class="row mt-1">
                    <div class="col-4 text-secondary">Asal / Rekanan:</div>
                    <div class="col-8 fw-bold">{{ item.asalBarang }}</div>
                  </div>
                  <div class="row mt-1">
                    <div class="col-4 text-secondary">Lampiran:</div>
                    <div class="col-8">{{ item.lampiranName || '-' }}</div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="row">
                    <div class="col-4 text-secondary">Kategori:</div>
                    <div class="col-8">{{ item.kategoriNama }}</div>
                  </div>
                  <div class="row mt-1">
                    <div class="col-4 text-secondary">Sub Kategori:</div>
                    <div class="col-8 fw-semibold">{{ item.subKategoriNama }}</div>
                  </div>
                  <div class="row mt-1">
                    <div class="col-4 text-secondary">Petugas Penerima:</div>
                    <div class="col-8 fw-bold text-primary">{{ item.operatorNama }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Items Table -->
          <div class="table-responsive mb-4">
            <table class="table table-bordered border-dark align-middle">
              <thead class="table-light border-dark">
                <tr>
                  <th class="text-center w-1">No</th>
                  <th>Nama Barang</th>
                  <th class="text-end">Harga Satuan</th>
                  <th class="text-center">Jumlah</th>
                  <th>Satuan</th>
                  <th class="text-end">Total Harga</th>
                  <th class="text-center">Tgl Expired</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(it, idx) in item.items" :key="idx">
                  <td class="text-center">{{ idx + 1 }}</td>
                  <td class="fw-semibold">{{ it.namaBarang }}</td>
                  <td class="text-end">{{ formatRupiah(it.harga) }}</td>
                  <td class="text-center fw-bold">{{ it.jumlah }}</td>
                  <td>{{ it.satuan }}</td>
                  <td class="text-end fw-bold">{{ formatRupiah(it.total) }}</td>
                  <td class="text-center small">{{ it.expiredDate || '-' }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="table-light border-dark">
                  <td colspan="5" class="text-end fw-bold">TOTAL KESELURUHAN:</td>
                  <td class="text-end fw-bold fs-4 text-primary">{{ formatRupiah(item.totalHarga) }}</td>
                  <td></td>
                </tr>
                <tr>
                  <td colspan="7" class="small text-secondary">
                    <em>Terbilang: Lima Puluh Empat Juta Empat Ratus Ribu Rupiah (Plafon Sub Kategori: {{ formatRupiah(item.batasHargaSubKategori) }})</em>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Signatures Section -->
          <div class="row mt-5 pt-3">
            <div class="col-6 text-center">
              <p class="mb-1 text-secondary">Diserahkan oleh (Rekanan / Vendor):</p>
              <div class="fw-bold mt-1">{{ item.asalBarang }}</div>
              <div style="height: 70px;"></div>
              <div class="fw-bold text-decoration-underline">(...............................................)</div>
              <div class="small text-secondary">Tanda Tangan & Nama Terang</div>
            </div>

            <div class="col-6 text-center">
              <p class="mb-1 text-secondary">Diterima oleh Petugas Logistik:</p>
              <div class="fw-bold mt-1 text-primary">JMC Inventory Management</div>
              <div style="height: 70px;"></div>
              <div class="fw-bold text-decoration-underline">({{ item.operatorNama }})</div>
              <div class="small text-secondary">Petugas Penerimaan Barang</div>
            </div>
          </div>
        </div>

        <div class="modal-footer d-print-none">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">
            Tutup
          </button>
          <button type="button" class="btn btn-primary" @click="triggerPrint">
            Cetak Dokumen
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatRupiah } from '../utils/formatters';

const props = defineProps({
  show: Boolean,
  item: Object
});

defineEmits(['close']);

function formatDateFormal(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return d.toLocaleDateString('id-ID', options);
}

function triggerPrint() {
  window.print();
}
</script>
