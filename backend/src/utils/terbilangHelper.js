/**
 * Helper konversi nominal angka rupiah ke kalimat terbilang Bahasa Indonesia
 */

const satuan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];

function konversiBilangan(nilai) {
  const n = Math.floor(Math.abs(nilai));

  if (n < 12) {
    return satuan[n];
  } else if (n < 20) {
    return konversiBilangan(n - 10) + ' Belas';
  } else if (n < 100) {
    return konversiBilangan(Math.floor(n / 10)) + ' Puluh ' + konversiBilangan(n % 10);
  } else if (n < 200) {
    return 'Seratus ' + konversiBilangan(n - 100);
  } else if (n < 1000) {
    return konversiBilangan(Math.floor(n / 100)) + ' Ratus ' + konversiBilangan(n % 100);
  } else if (n < 2000) {
    return 'Seribu ' + konversiBilangan(n - 1000);
  } else if (n < 1000000) {
    return konversiBilangan(Math.floor(n / 1000)) + ' Ribu ' + konversiBilangan(n % 1000);
  } else if (n < 1000000000) {
    return konversiBilangan(Math.floor(n / 1000000)) + ' Juta ' + konversiBilangan(n % 1000000);
  } else if (n < 1000000000000) {
    return konversiBilangan(Math.floor(n / 1000000000)) + ' Milyar ' + konversiBilangan(n % 1000000000);
  } else if (n < 1000000000000000) {
    return konversiBilangan(Math.floor(n / 1000000000000)) + ' Triliun ' + konversiBilangan(n % 1000000000000);
  }

  return '';
}

export const terbilangRupiah = (nominal) => {
  if (nominal === 0 || !nominal) return 'Nol Rupiah';
  const hasil = konversiBilangan(nominal).replace(/\s+/g, ' ').trim();
  return `${hasil} Rupiah`;
};

export default {
  terbilangRupiah
};
