import { fireConfettiBurst, fireFireworkBursts } from "../effects/confetti-effects.js";
import { spawnBalloons, clearBalloons } from "../effects/balloons.js";
import { RECIPIENT_NAME } from "../config.js";

/**
 * @param {{ onOpenGift?: () => void }} handlers
 * @returns {{ onEnter: () => void, onExit: () => void }}
 */
export function createBirthdayScene({ onOpenGift } = {}) {
  const balloonContainer = document.getElementById("birthday-balloons");
  const giftButton = document.getElementById("gift-button");
  const nameElement = document.getElementById("birthday-name");

  nameElement.textContent = RECIPIENT_NAME;

  let fireworkTimeoutIds = [];

  function handleGiftButtonClick() {
    onOpenGift?.();
  }

  return {
    onEnter() {
      fireConfettiBurst();
      fireworkTimeoutIds = fireFireworkBursts({ count: 3, interval: 1400 });
      spawnBalloons(balloonContainer, 6);
      giftButton.addEventListener("click", handleGiftButtonClick);
    },
    onExit() {
      fireworkTimeoutIds.forEach(clearTimeout);
      fireworkTimeoutIds = [];
      clearBalloons(balloonContainer);
      giftButton.removeEventListener("click", handleGiftButtonClick);
    },
  };
}
