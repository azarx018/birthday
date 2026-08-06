const INDONESIAN_MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

/**
 * Format tanggal jadi "4 Agustus 2026" (bukan format bawaan JS/Inggris).
 */
export function formatIndonesianDate(date) {
  return `${date.getDate()} ${INDONESIAN_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}
