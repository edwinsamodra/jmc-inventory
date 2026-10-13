import * as XLSX from 'xlsx';
import { formatRupiah, formatDateIndo } from './formatters';

export function exportBarangMasukToExcel(dataList, filterSummary = {}) {
  // Format rows matching table view
  const rows = dataList.map((item, index) => ({
    'No': index + 1,
    'Tanggal Masuk': formatDateIndo(item.tanggal),
    'Nomor Surat': item.nomorSurat || '-',
    'Asal Barang': item.asalBarang,
    'Kategori': item.kategoriNama,
    'Sub Kategori': item.subKategoriNama,
    'Operator': item.operatorNama,
    'Jumlah Item': item.items?.length || 0,
    'Total Harga': formatRupiah(item.totalHarga),
    'Batas Harga Sub Kategori': formatRupiah(item.batasHargaSubKategori),
    'Status Verifikasi': item.isVerified ? 'Terverifikasi' : 'Belum Diverifikasi',
    'Lampiran': item.lampiranName || '-'
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Auto-fit column widths
  const colWidths = [
    { wch: 6 },  // No
    { wch: 15 }, // Tanggal
    { wch: 20 }, // Nomor Surat
    { wch: 25 }, // Asal Barang
    { wch: 22 }, // Kategori
    { wch: 25 }, // Sub Kategori
    { wch: 18 }, // Operator
    { wch: 12 }, // Jumlah Item
    { wch: 18 }, // Total Harga
    { wch: 22 }, // Batas Harga
    { wch: 18 }, // Verifikasi
    { wch: 20 }, // Lampiran
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Barang Masuk');

  const nowStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `Data_Barang_Masuk_${nowStr}.xlsx`);
}
