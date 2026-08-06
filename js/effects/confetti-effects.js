import confetti from "https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.module.mjs";
import { getThemeColors } from "./palette.js";

/**
 * Ledakan confetti tunggal dari bawah layar. Dipakai saat Scene 2 dibuka.
 */
export function fireConfettiBurst() {
  confetti({
    particleCount: 120,
    spread: 80,
    startVelocity: 45,
    origin: { y: 0.65 },
    colors: getThemeColors(),
    scalar: 0.9,
  });
}

/**
 * Burst partikel kecil dan lembut, dipakai saat gift box terbuka
 * (efek "cahaya keluar"). Lebih halus dan lebih sedikit partikel
 * dibanding confetti/firework karena ini bukan perayaan besar,
 * tapi momen intim pembuka kotak.
 */
export function fireGiftGlowBurst() {
  confetti({
    particleCount: 40,
    spread: 70,
    startVelocity: 25,
    gravity: 0.5,
    ticks: 150,
    origin: { y: 0.55 },
    colors: getThemeColors(),
    scalar: 0.7,
  });
}

/**
 * Beberapa ledakan kecil di posisi acak (meniru firework), berjeda waktu.
 *
 * @param {{ count?: number, interval?: number }} options
 * @returns {number[]} array timeout id, berguna untuk dibatalkan saat onExit
 */
export function fireFireworkBursts({ count = 3, interval = 1400 } = {}) {
  const colors = getThemeColors();
  const timeoutIds = [];

  for (let i = 0; i < count; i += 1) {
    const timeoutId = setTimeout(() => {
      confetti({
        particleCount: 60,
        spread: 360,
        startVelocity: 35,
        gravity: 0.6,
        ticks: 200,
        origin: {
          x: 0.2 + Math.random() * 0.6,
          y: 0.2 + Math.random() * 0.3,
        },
        colors,
      });
    }, i * interval);

    timeoutIds.push(timeoutId);
  }

  return timeoutIds;
}
