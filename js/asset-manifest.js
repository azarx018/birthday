/**
 * Daftar asset yang wajib selesai di-load sebelum preloader menghilang.
 *
 * Format tiap entry:
 *   { type: "image" | "audio" | "video", src: "path/relatif/dari/index.html" }
 *
 * Kosongkan hanya jika memang belum ada asset. Jangan isi dengan path
 * dummy/placeholder — tambahkan entry di sini hanya saat file asli
 * sudah diletakkan di folder assets/ yang sesuai.
 *
 * Contoh (jangan dihapus komentarnya, dipakai sebagai referensi format):
 * export const assetManifest = [
 *   { type: "image", src: "assets/images/scene-2-balloon.png" },
 *   { type: "audio", src: "assets/audio/ambience-scene-1.mp3" },
 * ];
 */

export const assetManifest = [];
