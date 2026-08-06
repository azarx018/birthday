import { RECIPIENT_NAME } from "../config.js";
import { typeSequence } from "../animation.js";
import { createAmbientLayer } from "../effects/ambient.js";

const WELCOME_LINES = [
  `Halo, ${RECIPIENT_NAME}`,
  "Hari ini...",
  "adalah hari yang spesial.",
  "Karena seseorang yang luar biasa lahir hari ini.",
];

/**
 * @param {{ onFinished?: () => void }} handlers
 * @returns {{ onEnter: () => void, onExit: () => void }}
 */
export function createWelcomeScene({ onFinished } = {}) {
  const sceneElement = document.getElementById("scene-welcome");
  const textElement = document.getElementById("welcome-text");
  const ambient = createAmbientLayer(sceneElement, {
    count: 14,
    includeGlow: true,
    glowSize: 260,
  });

  return {
    onEnter() {
      ambient.mount();
      typeSequence(textElement, WELCOME_LINES, { pauseBetween: 1900 }).then(() => {
        onFinished?.();
      });
    },
    onExit() {
      textElement.textContent = "";
      ambient.destroy();
    },
  };
}
