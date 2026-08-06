/**
 * Data personalisasi yang dipakai di banyak scene.
 * Ubah di sini saja, tidak perlu cari-cari ke tiap file scene.
 */
export const RECIPIENT_NAME = "Rizka";

// Nama pengirim, dipakai di popup telepon (Scene 8/9) dan nanti Talking Photo (Scene 10).
export const SENDER_NAME = "Azhar";

// TODO: ganti sesuai jumlah tahun pertemanan/hubungan yang asli.
export const FRIENDSHIP_YEARS = 1;

// Tanggal & jam mulai berhubungan, dipakai untuk hitung statistik live
// di Scene 13 (Ending) — "sudah berteman selama xxx hari xxx jam xxx menit".
// Ditulis pakai constructor Date(tahun, bulan, tanggal, jam, menit) —
// PERHATIKAN bulan 0-indexed (0 = Januari, jadi Oktober = 9) — supaya
// selalu ditafsirkan sebagai waktu lokal, bukan UTC (menghindari bug
// pergeseran tanggal/jam antar timezone).
export const FRIENDSHIP_START_DATE = new Date(2024, 9, 30, 20, 0, 0);

// Nomor WhatsApp pembuat hadiah, format internasional tanpa "+" atau "0"
// di depan. Dipakai di Scene 14 (Photo Booth) untuk tombol "Kirim ke
// Pembuat Kado" lewat wa.me link.
export const GIFT_CREATOR_WHATSAPP_NUMBER = "6285701422878";
