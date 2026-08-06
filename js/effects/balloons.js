import { getThemeColors } from "./palette.js";

const SIZE_RANGE_PX = [40, 58];
const DURATION_RANGE_S = [7, 11];

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Membuat elemen balon dengan variasi ukuran, posisi, warna, dan
 * kecepatan yang acak, supaya terasa organik (bukan pola berulang).
 *
 * @param {HTMLElement} container
 * @param {number} count
 */
export function spawnBalloons(container, count = 6) {
  const colors = getThemeColors();

  for (let i = 0; i < count; i += 1) {
    const balloon = document.createElement("div");
    balloon.className = "balloon";

    balloon.style.setProperty("--size", `${randomBetween(...SIZE_RANGE_PX)}px`);
    balloon.style.setProperty("--duration", `${randomBetween(...DURATION_RANGE_S)}s`);
    balloon.style.setProperty("--delay", `${randomBetween(0, 2.5)}s`);
    balloon.style.setProperty("--left", `${randomBetween(8, 88)}%`);
    balloon.style.setProperty("--drift", `${randomBetween(-40, 40)}px`);
    balloon.style.setProperty("--rotate", `${randomBetween(-8, 8)}deg`);
    balloon.style.setProperty("--balloon-color", colors[i % colors.length]);

    container.appendChild(balloon);
  }
}

/**
 * Membersihkan semua balon dari container (dipanggil saat scene onExit
 * supaya animasi berhenti dan DOM tidak menumpuk).
 */
export function clearBalloons(container) {
  container.replaceChildren();
}
