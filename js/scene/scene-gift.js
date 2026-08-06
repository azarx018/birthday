import { typeSequence } from "../animation.js";
import { fireGiftGlowBurst } from "../effects/confetti-effects.js";

const GIFT_LINES = [
  "Hadiah ini...",
  "bukan sesuatu yang bisa dibeli.",
  "Tapi sesuatu...",
  "yang kita buat bersama.",
];

const BOX_OPEN_TRANSITION_MS = 700; // harus selaras dengan transition di scene-gift.css

/**
 * @param {{ onFinished?: () => void }} handlers
 * @returns {{ onEnter: () => void, onExit: () => void }}
 */
export function createGiftScene({ onFinished } = {}) {
  const boxElement = document.getElementById("gift-box");
  const hintElement = document.getElementById("gift-hint");
  const textElement = document.getElementById("gift-text");

  let hasOpened = false;

  function resetScene() {
    hasOpened = false;
    boxElement.classList.remove("is-opening", "is-hidden");
    hintElement.classList.remove("is-hidden");
    textElement.textContent = "";
  }

  function openGift() {
    if (hasOpened) return;
    hasOpened = true;

    boxElement.classList.add("is-opening");
    hintElement.classList.add("is-hidden");
    fireGiftGlowBurst();

    setTimeout(() => {
      boxElement.classList.add("is-hidden");
      typeSequence(textElement, GIFT_LINES).then(() => {
        onFinished?.();
      });
    }, BOX_OPEN_TRANSITION_MS);
  }

  function handleClick() {
    openGift();
  }

  function handleKeydown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openGift();
    }
  }

  return {
    onEnter() {
      resetScene();
      boxElement.addEventListener("click", handleClick);
      boxElement.addEventListener("keydown", handleKeydown);
    },
    onExit() {
      boxElement.removeEventListener("click", handleClick);
      boxElement.removeEventListener("keydown", handleKeydown);
    },
  };
}
