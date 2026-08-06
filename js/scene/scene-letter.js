import { RECIPIENT_NAME, SENDER_NAME } from "../config.js";
import { typeText, wait } from "../animation.js";
import { LETTER_PARAGRAPHS } from "../data/letter-data.js";

const PARAGRAPH_PAUSE_MS = 900;

// Auto-scroll sengaja pelan (brief: "scrolling sangat pelan"), bukan
// snap-to-bottom. Nilainya px per frame (~60fps).
const AUTO_SCROLL_PX_PER_FRAME = 0.6;
// Kalau user baru saja sentuh/scroll manual, auto-scroll jeda dulu
// sebentar sebelum lanjut, supaya tidak "ngerebut" kendali dari user.
const USER_SCROLL_PAUSE_MS = 2500;

/**
 * Scene 11 — Letter. Paragraf surat diketik satu per satu (menambah
 * elemen baru tiap paragraf, bukan menimpa yang sebelumnya), sementara
 * area surat auto-scroll pelan mengikuti paragraf yang sedang aktif.
 * User tetap bisa scroll manual kapan saja — auto-scroll otomatis jeda
 * begitu ada sentuhan/scroll manual, lalu lanjut lagi setelah tenang.
 *
 * @param {{ onFinished?: () => void }} handlers
 * @returns {{ onEnter: () => void, onExit: () => void }}
 */
export function createLetterScene({ onFinished } = {}) {
  const salutationElement = document.getElementById("letter-salutation");
  const bodyElement = document.getElementById("letter-body");
  const signatureElement = document.getElementById("letter-signature");
  const continueButton = document.getElementById("letter-continue-button");

  let lastManualScrollAt = 0;
  let autoScrollRafId = null;

  function handleManualScrollIntent() {
    lastManualScrollAt = performance.now();
  }

  function autoScrollLoop() {
    const now = performance.now();
    const isPausedByUser = now - lastManualScrollAt < USER_SCROLL_PAUSE_MS;
    const maxScrollTop = bodyElement.scrollHeight - bodyElement.clientHeight;

    if (!isPausedByUser && bodyElement.scrollTop < maxScrollTop) {
      bodyElement.scrollTop += AUTO_SCROLL_PX_PER_FRAME;
    }

    autoScrollRafId = requestAnimationFrame(autoScrollLoop);
  }

  async function typeLetterBody() {
    for (const paragraphText of LETTER_PARAGRAPHS) {
      const paragraphElement = document.createElement("p");
      paragraphElement.className = "letter__paragraph";
      bodyElement.appendChild(paragraphElement);
      await typeText(paragraphElement, paragraphText);
      await wait(PARAGRAPH_PAUSE_MS);
    }

    signatureElement.classList.add("is-visible");
    continueButton.classList.add("is-visible");
  }

  function resetScene() {
    salutationElement.textContent = `Untuk ${RECIPIENT_NAME},`;
    bodyElement.textContent = "";
    signatureElement.textContent = SENDER_NAME;
    signatureElement.classList.remove("is-visible");
    continueButton.classList.remove("is-visible");
    lastManualScrollAt = 0;
  }

  function handleContinueClick() {
    onFinished?.();
  }

  return {
    onEnter() {
      resetScene();
      bodyElement.addEventListener("touchstart", handleManualScrollIntent, { passive: true });
      bodyElement.addEventListener("wheel", handleManualScrollIntent, { passive: true });
      continueButton.addEventListener("click", handleContinueClick);

      autoScrollRafId = requestAnimationFrame(autoScrollLoop);
      typeLetterBody();
    },
    onExit() {
      if (autoScrollRafId) cancelAnimationFrame(autoScrollRafId);
      autoScrollRafId = null;
      bodyElement.removeEventListener("touchstart", handleManualScrollIntent);
      bodyElement.removeEventListener("wheel", handleManualScrollIntent);
      continueButton.removeEventListener("click", handleContinueClick);
    },
  };
}
