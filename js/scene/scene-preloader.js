import { preloadAssets } from "../preload.js";
import { assetManifest } from "../asset-manifest.js";

const MINIMUM_DISPLAY_TIME_MS = 1200; // preloader tidak boleh terasa "berkedip"

/**
 * Pesan loading bertahap — berganti mengikuti progress ASLI (bukan timer
 * buatan), supaya kalau asset lambat/cepat, pesan tetap jujur dengan
 * kondisi sebenarnya. Ambang batas `at` adalah ratio minimum (0–1) untuk
 * pesan tsb mulai tampil.
 */
const LOADING_MESSAGES = [
  { at: 0, text: "Memuat Kenangan..." },
  { at: 0.25, text: "Mengumpulkan Momen Bahagia..." },
  { at: 0.5, text: "Menyiapkan Sesuatu yang Spesial..." },
  { at: 0.75, text: "Hampir Siap..." },
  { at: 1, text: "Kejutanmu Sudah Siap." },
];

function getMessageForRatio(ratio) {
  // Cari pesan dengan ambang batas tertinggi yang sudah terlampaui.
  return [...LOADING_MESSAGES].reverse().find((entry) => ratio >= entry.at).text;
}

/**
 * Mengganti teks dengan efek "rise-in" singkat, bukan potong langsung —
 * supaya tiap pergantian pesan terasa hidup. Pakai teknik "reset paksa":
 * matikan transition sesaat, lompat ke posisi awal, paksa reflow, baru
 * nyalakan lagi transition-nya supaya browser benar-benar menganimasikan
 * perpindahan ke posisi akhir (bukan cuma snap).
 */
function swapMessage(textElement, nextText) {
  if (textElement.textContent === nextText) return;

  textElement.style.transition = "none";
  textElement.textContent = nextText;
  textElement.classList.add("is-entering");
  void textElement.offsetHeight; // force reflow
  textElement.style.transition = "";
  textElement.classList.remove("is-entering");
}

/**
 * Menjalankan Scene 0 (Preloader): memuat semua asset wajib,
 * menganimasikan progress bar & pesan loading bertahap, lalu memberi
 * tahu bagian lain aplikasi bahwa aplikasi siap dimulai.
 *
 * @param {() => void} onComplete - dipanggil setelah preload + fade selesai
 */
export function initPreloaderScene(onComplete) {
  const fillElement = document.getElementById("preloader-fill");
  const textElement = document.getElementById("preloader-text");
  const sceneElement = document.getElementById("scene-preloader");
  const startedAt = performance.now();

  const handleProgress = (ratio) => {
    fillElement.style.width = `${Math.round(ratio * 100)}%`;
    swapMessage(textElement, getMessageForRatio(ratio));
  };

  handleProgress(0);

  preloadAssets(assetManifest, handleProgress).then(() => {
    swapMessage(textElement, getMessageForRatio(1));

    const elapsed = performance.now() - startedAt;
    const remainingDelay = Math.max(MINIMUM_DISPLAY_TIME_MS - elapsed, 0);

    setTimeout(() => {
      sceneElement.classList.remove("is-active");
      onComplete();
    }, remainingDelay);
  });
}
