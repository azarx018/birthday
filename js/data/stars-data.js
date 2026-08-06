/**
 * Data Memory Stars (Scene 6).
 * Setiap bintang = satu kenangan. Posisi di layar diacak lewat kode,
 * jadi urutan array ini tidak menentukan posisi tampil.
 *
 * type: "photo" | "text" | "video" | "voice"
 * - photo: butuh `image`, `caption` opsional
 * - text: butuh `text`
 * - video: butuh `video` (file singkat, taruh di assets/videos/stars/)
 * - voice: butuh `audio` (taruh di assets/audio/stars/), `caption` opsional
 *
 * Ganti semua teks "[Isi ...]" dengan kenangan asli kamu.
 */

export const starMemories = [
  {
    id: "star-1",
    type: "photo",
    image: "assets/images/stars/star-1.jpg",
    caption: "[Isi cerita foto bintang 1]",
  },
  {
    id: "star-2",
    type: "text",
    text: "[Isi kenangan teks bintang 2]",
  },
  {
    id: "star-3",
    type: "video",
    video: "assets/videos/stars/star-3.mp4",
  },
  {
    id: "star-4",
    type: "voice",
    audio: "assets/audio/stars/star-4.mp3",
    caption: "[Opsional: keterangan voice note ini]",
  },
  {
    id: "star-5",
    type: "photo",
    image: "assets/images/stars/star-5.jpg",
    caption: "[Isi cerita foto bintang 5]",
  },
  {
    id: "star-6",
    type: "text",
    text: "[Isi kenangan teks bintang 6]",
  },
  {
    id: "star-7",
    type: "video",
    video: "assets/videos/stars/star-7.mp4",
  },
];
