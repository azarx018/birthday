/**
 * Data Memory Timeline.
 *
 * memoryHighlights: 5 foto dengan cerita, ditampilkan satu per satu
 * dengan caption di bawahnya.
 *   - image: taruh file foto asli di assets/images/memories/ dengan
 *     nama persis seperti di bawah.
 *   - caption: ganti teks "[Isi cerita foto ke-N]" dengan cerita asli.
 *
 * galleryPhotos: 10 foto tanpa caption, ditampilkan sebagai grid di
 * slide terakhir ("Galeri Kita"). Taruh file di assets/images/gallery/.
 */

export const memoryHighlights = [
  {
    id: "memory-1",
    image: "assets/images/memories/memory-1.jpg",
    caption: "Waktu pertama kita kenal.",
  },
  {
    id: "memory-2",
    image: "assets/images/memories/memory-2.jpg",
    caption: "[Isi cerita foto ke-2]",
  },
  {
    id: "memory-3",
    image: "assets/images/memories/memory-3.jpg",
    caption: "[Isi cerita foto ke-3]",
  },
  {
    id: "memory-4",
    image: "assets/images/memories/memory-4.jpg",
    caption: "[Isi cerita foto ke-4]",
  },
  {
    id: "memory-5",
    image: "assets/images/memories/memory-5.jpg",
    caption: "[Isi cerita foto ke-5]",
  },
];

export const galleryPhotos = Array.from({ length: 10 }, (_, index) => ({
  id: `gallery-${index + 1}`,
  image: `assets/images/gallery/gallery-${index + 1}.jpg`,
}));
