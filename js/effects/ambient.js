/**
 * Ambient Layer
 * -------------
 * Lapisan partikel dekoratif ringan (sparkle + glow) yang bisa dipasang
 * di scene manapun untuk memberi "kehidupan" halus di background, tanpa
 * mengganggu konten atau performa.
 *
 * Murni DOM + CSS animation (bukan canvas) — transform & opacity saja,
 * jadi ringan dan tetap GPU-friendly di Android kelas menengah. Warna
 * partikel otomatis mengikuti palet tema lewat getThemeColors(), sama
 * seperti confetti/balon, supaya tidak ada hardcode warna kedua kali.
 *
 * Pemakaian di sebuah scene (lifecycle onEnter/onExit dari router.js):
 *
 *   const ambient = createAmbientLayer(sceneElement, { count: 14 });
 *   // onEnter:
 *   ambient.mount();
 *   // onExit:
 *   ambient.destroy();
 */

import { getThemeColors } from "./palette.js";

const DEFAULTS = {
  count: 12,
  colors: null, // null -> pakai getThemeColors()
  sizeRange: [2, 6], // px
  durationRange: [6, 14], // detik
  driftYRange: [-140, -80], // px, negatif = melayang ke atas
  driftXRange: [-16, 16], // px
  opacityRange: [0.4, 0.85],
  includeGlow: false,
  glowColor: null,
  glowSize: 240,
};

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

/**
 * @param {HTMLElement} container - elemen scene tempat lapisan dipasang
 * @param {Partial<typeof DEFAULTS>} options
 */
export function createAmbientLayer(container, options = {}) {
  const config = { ...DEFAULTS, ...options };
  let layerElement = null;

  function buildParticle(colors) {
    const particle = document.createElement("span");
    particle.className = "ambient-particle";

    const size = randomBetween(...config.sizeRange);
    const duration = randomBetween(...config.durationRange);
    const color = colors[Math.floor(Math.random() * colors.length)];

    particle.style.setProperty("--pos-x", `${randomBetween(0, 100)}%`);
    particle.style.setProperty("--pos-y", `${randomBetween(0, 100)}%`);
    particle.style.setProperty("--particle-size", `${size}px`);
    particle.style.setProperty("--particle-color", color);
    particle.style.setProperty("--particle-duration", `${duration}s`);
    particle.style.setProperty("--particle-delay", `${randomBetween(0, duration)}s`);
    particle.style.setProperty("--drift-x", `${randomBetween(...config.driftXRange)}px`);
    particle.style.setProperty("--drift-y", `${randomBetween(...config.driftYRange)}px`);
    particle.style.setProperty("--particle-opacity", `${randomBetween(...config.opacityRange)}`);

    return particle;
  }

  function buildGlow(colors) {
    const glow = document.createElement("span");
    glow.className = "ambient-glow";

    glow.style.setProperty("--pos-x", `${randomBetween(20, 80)}%`);
    glow.style.setProperty("--pos-y", `${randomBetween(15, 60)}%`);
    glow.style.setProperty("--glow-size", `${config.glowSize}px`);
    glow.style.setProperty("--glow-color", config.glowColor || colors[0]);

    return glow;
  }

  /** Memasang lapisan ambient ke dalam container. Aman dipanggil berkali-kali. */
  function mount() {
    if (layerElement) return;

    const colors = config.colors || getThemeColors();

    layerElement = document.createElement("div");
    layerElement.className = "ambient-layer";
    layerElement.setAttribute("aria-hidden", "true");

    for (let i = 0; i < config.count; i += 1) {
      layerElement.appendChild(buildParticle(colors));
    }

    if (config.includeGlow) {
      layerElement.appendChild(buildGlow(colors));
    }

    container.prepend(layerElement);
  }

  /** Melepas lapisan ambient dari DOM sepenuhnya. */
  function destroy() {
    layerElement?.remove();
    layerElement = null;
  }

  return { mount, destroy };
}
