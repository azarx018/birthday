/**
 * Registry layout Photo Booth. SATU sumber kebenaran untuk semua hal
 * yang beda per layout — nambah/ubah layout cukup edit array ini, tidak
 * perlu sentuh scene-photobooth.js (sesuai requirement brief: "must
 * support easily swapping placeholder frames without changing
 * application logic").
 *
 * `frameImage` MASIH PLACEHOLDER untuk ketiganya — belum ada asset asli
 * satupun (termasuk Layout C/"korean-six", karena gambar 6-kotak yang user
 * lampirkan cuma referensi visual, bukan asset final). Begitu asset asli
 * ada, ganti path di sini saja.
 *
 * `slots` = posisi tiap foto di dalam frame, dalam PERSEN dari ukuran
 * frame (bukan pixel), supaya tahan banting kalau resolusi frame beda.
 * Nilai sekarang cuma pembagian rata (grid sederhana) karena belum ada
 * frame asli buat dikalibrasi — WAJIB dihitung ulang dari posisi asli
 * begitu asset final datang (sama seperti kalibrasi mata di Scene 10).
 */
export const PHOTOBOOTH_LAYOUTS = [
  {
    id: "single",
    icon: "📷",
    label: "Single Frame",
    description: "Ambil satu foto terbaikmu. Cocok buat kenangan yang simpel.",
    resultLabel: "1 Foto",
    photoCount: 1,
    previewColumns: 1,
    previewRows: 1,
    frameImage: "assets/images/photobooth/frame-single.png",
    slots: [{ xPercent: 8, yPercent: 10, widthPercent: 84, heightPercent: 80 }],
  },
  {
    id: "triple",
    icon: "📷📷📷",
    label: "Triple Strip",
    description: "Ambil tiga foto berturut-turut, jadi satu strip vertikal.",
    resultLabel: "Photo Strip Vertikal · 3 Foto",
    photoCount: 3,
    previewColumns: 1,
    previewRows: 3,
    frameImage: "assets/images/photobooth/frame-triple.png",
    slots: [
      { xPercent: 8, yPercent: 4, widthPercent: 84, heightPercent: 29 },
      { xPercent: 8, yPercent: 35.5, widthPercent: 84, heightPercent: 29 },
      { xPercent: 8, yPercent: 67, widthPercent: 84, heightPercent: 29 },
    ],
  },
  {
    id: "korean-six",
    icon: "📷×6",
    label: "Korean Booth",
    description: "Ambil enam foto berturut-turut, gaya photo strip Korea klasik.",
    resultLabel: "Photo Strip Korea Klasik · 6 Foto",
    photoCount: 6,
    previewColumns: 2,
    previewRows: 3,
    frameImage: "assets/images/photobooth/frame-six.png",
    slots: [
      { xPercent: 6, yPercent: 4, widthPercent: 41, heightPercent: 29 },
      { xPercent: 53, yPercent: 4, widthPercent: 41, heightPercent: 29 },
      { xPercent: 6, yPercent: 35.5, widthPercent: 41, heightPercent: 29 },
      { xPercent: 53, yPercent: 35.5, widthPercent: 41, heightPercent: 29 },
      { xPercent: 6, yPercent: 67, widthPercent: 41, heightPercent: 29 },
      { xPercent: 53, yPercent: 67, widthPercent: 41, heightPercent: 29 },
    ],
  },
];

export function getLayoutById(layoutId) {
  return PHOTOBOOTH_LAYOUTS.find((layout) => layout.id === layoutId) ?? null;
}
