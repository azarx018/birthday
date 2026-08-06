import { RECIPIENT_NAME } from "../config.js";
import { typeSequence } from "../animation.js";
import { fireConfettiBurst, fireFireworkBursts } from "../effects/confetti-effects.js";
import { spawnBalloons, clearBalloons } from "../effects/balloons.js";

const THANKS_LINES = ["Terima kasih...", "Sudah menjadi bagian dari banyak cerita."];

// Jeda sebelum tombol "Lanjut" muncul, biar user sempat menikmati
// momen perayaannya dulu (sesuai keputusan user), bukan langsung diburu.
const CONTINUE_BUTTON_DELAY_MS = 2600;

/**
 * Scene 12 — Final Gift. Teks terima kasih diketik pelan dulu, baru
 * setelah itu "Happy Birthday" + confetti/firework/balon meletus
 * (reuse effects yang sama dari Scene 2, bukan implementasi baru).
 *
 * @param {{ onFinished?: () => void }} handlers
 * @returns {{ onEnter: () => void, onExit: () => void }}
 */
export function createFinalGiftScene({ onFinished } = {}) {
  const thanksElement = document.getElementById("final-gift-thanks");
  const celebrationElement = document.getElementById("final-gift-celebration");
  const nameElement = document.getElementById("final-gift-name");
  const balloonContainer = document.getElementById("final-gift-balloons");
  const continueButton = document.getElementById("final-gift-continue-button");

  let fireworkTimeoutIds = [];
  let continueButtonTimeoutId = null;

  async function playSequence() {
    await typeSequence(thanksElement, THANKS_LINES);

    celebrationElement.classList.add("is-visible");
    fireConfettiBurst();
    fireworkTimeoutIds = fireFireworkBursts({ count: 3, interval: 1400 });
    spawnBalloons(balloonContainer, 6);

    continueButtonTimeoutId = setTimeout(() => {
      continueButton.classList.add("is-visible");
    }, CONTINUE_BUTTON_DELAY_MS);
  }

  function handleContinueClick() {
    onFinished?.();
  }

  return {
    onEnter() {
      nameElement.textContent = RECIPIENT_NAME;
      thanksElement.textContent = "";
      celebrationElement.classList.remove("is-visible");
      continueButton.classList.remove("is-visible");
      continueButton.addEventListener("click", handleContinueClick);
      playSequence();
    },
    onExit() {
      fireworkTimeoutIds.forEach(clearTimeout);
      fireworkTimeoutIds = [];
      clearTimeout(continueButtonTimeoutId);
      clearBalloons(balloonContainer);
      continueButton.removeEventListener("click", handleContinueClick);
    },
  };
}
