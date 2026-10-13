/**
 * Formats a number to Indonesian Rupiah string (e.g. 5000000 -> "Rp 5.000.000")
 */
export function formatRupiah(value, withPrefix = true) {
  if (value === null || value === undefined || value === '') return withPrefix ? 'Rp 0' : '0';
  const num = typeof value === 'string' ? parseInt(value.replace(/\D/g, ''), 10) || 0 : Math.round(value);
  const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return withPrefix ? `Rp ${formatted}` : formatted;
}

/**
 * Parses a formatted rupiah string or raw input to integer
 */
export function parseRupiah(value) {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const cleaned = value.toString().replace(/\D/g, '');
  return parseInt(cleaned, 10) || 0;
}

/**
 * Formats date string (YYYY-MM-DD) to Indonesian formatted date (e.g. 13 Okt 2026)
 */
export function formatDateIndo(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(d);
}

/**
 * Formats date to formal Indonesian string for letters (e.g. 13 Oktober 2026)
 */
export function formatDateFormal(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(d);
}
