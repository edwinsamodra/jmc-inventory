import ExcelJS from 'exceljs';

/**
 * Generate Excel workbook untuk ekspor daftar Barang Masuk
 * @param {Array} dataList - Daftar transaksi barang masuk
 * @returns {Promise<ExcelJS.Workbook>}
 */
export const generateBarangMasukExcel = async (dataList) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'JMC Inventory System';
  workbook.lastModifiedBy = 'JMC Inventory System';
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet('Barang Masuk', {
    views: [{ showGridLines: true }]
  });

  // Judul Sheet / Header Laporan
  worksheet.mergeCells('A1:K1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'LAPORAN DAFTAR TRANSAKSI BARANG MASUK';
  titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FF1E293B' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getRow(1).height = 30;

  worksheet.mergeCells('A2:K2');
  const subTitleCell = worksheet.getCell('A2');
  subTitleCell.value = `Dicetak pada: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} | Total Data: ${dataList.length}`;
  subTitleCell.font = { name: 'Arial', size: 9, italic: true, color: { argb: 'FF64748B' } };
  subTitleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getRow(2).height = 20;

  // Header Table Columns (Row 4)
  const columns = [
    { header: 'No', key: 'no', width: 6 },
    { header: 'Nomor Surat', key: 'nomorSurat', width: 22 },
    { header: 'Tanggal', key: 'tanggal', width: 14 },
    { header: 'Tahun', key: 'tahun', width: 10 },
    { header: 'Asal Barang', key: 'asalBarang', width: 32 },
    { header: 'Kategori', key: 'kategori', width: 24 },
    { header: 'Sub Kategori', key: 'subKategori', width: 30 },
    { header: 'Operator', key: 'operator', width: 20 },
    { header: 'Jumlah Item', key: 'itemCount', width: 14 },
    { header: 'Total Harga (Rp)', key: 'totalHarga', width: 22 },
    { header: 'Status Verifikasi', key: 'statusVerifikasi', width: 18 }
  ];

  const headerRow = worksheet.getRow(4);
  headerRow.height = 26;

  columns.forEach((col, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = col.header;
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E3A8A' } // Brand Navy Blue
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF0F172A' } },
      left: { style: 'thin', color: { argb: 'FF0F172A' } },
      bottom: { style: 'medium', color: { argb: 'FF0F172A' } },
      right: { style: 'thin', color: { argb: 'FF0F172A' } }
    };
    worksheet.getColumn(index + 1).width = col.width;
  });

  // Isi Data Table
  let grandTotal = 0;
  dataList.forEach((bm, idx) => {
    const rowIndex = 5 + idx;
    const row = worksheet.getRow(rowIndex);
    row.height = 22;

    const totalVal = parseFloat(bm.totalHarga || 0);
    grandTotal += totalVal;

    const rowData = [
      idx + 1,
      bm.nomorSurat || '-',
      bm.tanggal || '-',
      bm.tahun || '-',
      bm.asalBarang || '-',
      bm.kategori?.nama || bm.kategoriNama || '-',
      bm.subKategori?.nama || bm.subKategoriNama || '-',
      bm.operator?.nama || bm.operatorNama || '-',
      bm.items?.length || 0,
      totalVal,
      bm.isVerified ? 'Terverifikasi' : 'Belum Verifikasi'
    ];

    rowData.forEach((val, colIdx) => {
      const cell = row.getCell(colIdx + 1);
      cell.value = val;
      cell.font = { name: 'Arial', size: 9 };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };

      // Alignment per kolom
      if (colIdx === 0 || colIdx === 2 || colIdx === 3 || colIdx === 8 || colIdx === 10) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else if (colIdx === 9) {
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        cell.numFmt = '#,##0';
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      }

      // Zebra striping
      if (idx % 2 === 1) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8FAFC' }
        };
      }

      // Status Verifikasi color
      if (colIdx === 10) {
        cell.font = {
          name: 'Arial',
          size: 9,
          bold: true,
          color: { argb: bm.isVerified ? 'FF16A34A' : 'FFD97706' }
        };
      }
    });
  });

  // Footer / Total Row
  const footerRowIndex = 5 + dataList.length;
  const footerRow = worksheet.getRow(footerRowIndex);
  footerRow.height = 24;

  worksheet.mergeCells(`A${footerRowIndex}:I${footerRowIndex}`);
  const summaryLabelCell = worksheet.getCell(`A${footerRowIndex}`);
  summaryLabelCell.value = 'TOTAL KESELURUHAN';
  summaryLabelCell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF1E293B' } };
  summaryLabelCell.alignment = { vertical: 'middle', horizontal: 'center' };
  summaryLabelCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE2E8F0' }
  };
  summaryLabelCell.border = {
    top: { style: 'medium', color: { argb: 'FF0F172A' } },
    bottom: { style: 'medium', color: { argb: 'FF0F172A' } },
    left: { style: 'thin', color: { argb: 'FF0F172A' } },
    right: { style: 'thin', color: { argb: 'FF0F172A' } }
  };

  const totalAmountCell = footerRow.getCell(10);
  totalAmountCell.value = grandTotal;
  totalAmountCell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF1E293B' } };
  totalAmountCell.alignment = { vertical: 'middle', horizontal: 'right' };
  totalAmountCell.numFmt = '#,##0';
  totalAmountCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE2E8F0' }
  };
  totalAmountCell.border = {
    top: { style: 'medium', color: { argb: 'FF0F172A' } },
    bottom: { style: 'medium', color: { argb: 'FF0F172A' } },
    left: { style: 'thin', color: { argb: 'FF0F172A' } },
    right: { style: 'thin', color: { argb: 'FF0F172A' } }
  };

  const emptyFooterCell = footerRow.getCell(11);
  emptyFooterCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE2E8F0' }
  };
  emptyFooterCell.border = {
    top: { style: 'medium', color: { argb: 'FF0F172A' } },
    bottom: { style: 'medium', color: { argb: 'FF0F172A' } },
    left: { style: 'thin', color: { argb: 'FF0F172A' } },
    right: { style: 'thin', color: { argb: 'FF0F172A' } }
  };

  return workbook;
};

export default {
  generateBarangMasukExcel
};
