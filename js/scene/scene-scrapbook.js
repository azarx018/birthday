import { typeSequence, typeText, wait } from "../animation.js";
import { formatIndonesianDate } from "../date-format.js";
import { getCapturedPhoto, clearCapturedPhoto } from "../state/session-photo.js";

const NEW_PHOTO_DELAY_MS = 900;
const STICKER_STAGGER_MS = 160;
const AFTER_STICKERS_DELAY_MS = 500;
const CAPTION_LINES = [
  "Semua halaman sebelumnya adalah cerita yang pernah kita lalui.",
  "Dan foto ini...",
  "...menjadi awal dari cerita berikutnya.",
];

const BEFORE_CLOSING_DELAY_MS = 1400;
const AFTER_CLOSING_DELAY_MS = 900;
const ENDING_MESSAGE = "Terima kasih.\nSudah menjadi bagian dari cerita ini.\n❤️\nHappy Birthday Rizka.";
const BEFORE_CREDITS_DELAY_MS = 1000;
const BEFORE_RESTART_BUTTON_DELAY_MS = 900;

/**
 * Scene 15 — Final Scrapbook. Foto hasil Photo Booth (dari
 * state/session-photo.js) "ditempel" ke halaman scrapbook terakhir,
 * dikelilingi foto-foto lama (reuse dari Scene 4) yang mengintip di
 * pinggir sebagai representasi "halaman-halaman sebelumnya". Setelah
 * caption selesai, scrapbook menutup pelan, lalu pesan penutup → Credits
 * (Made with ❤️, versi, tanggal) → link kecil "Lihat Lagi Dari Awal"
 * (BUKAN tombol besar, sengaja halus karena fokus utamanya di Credits) —
 * SATU scene linear, bukan state machine bercabang seperti Photo Booth,
 * karena tidak ada keputusan user di tengah alur ini.
 *
 * @param {{ onFinished?: () => void }} handlers
 * @returns {{ onEnter: () => void, onExit: () => void }}
 */
export function createScrapbookScene({ onFinished } = {}) {
  const pageElement = document.getElementById("scrapbook-page");
  const newPhotoWrap = document.getElementById("scrapbook-new-photo-wrap");
  const newPhotoImage = document.getElementById("scrapbook-new-photo");
  const stickerElements = Array.from(document.querySelectorAll(".scrapbook__sticker"));
  const dateElement = document.getElementById("scrapbook-date");
  const labelElement = document.getElementById("scrapbook-label");
  const captionElement = document.getElementById("scrapbook-caption");

  const endingElement = document.getElementById("scrapbook-ending");
  const endingTextElement = document.getElementById("scrapbook-ending-text");
  const creditsElement = document.getElementById("scrapbook-credits");
  const restartButton = document.getElementById("scrapbook-restart-button");

  let sequenceTimeoutIds = [];

  function delay(ms) {
    return new Promise((resolve) => {
      const timeoutId = setTimeout(resolve, ms);
      sequenceTimeoutIds.push(timeoutId);
    });
  }

  async function playSequence() {
    newPhotoImage.src = getCapturedPhoto() ?? "";
    await delay(NEW_PHOTO_DELAY_MS);
    newPhotoWrap.classList.add("is-visible");

    for (const sticker of stickerElements) {
      await delay(STICKER_STAGGER_MS);
      sticker.classList.add("is-visible");
    }

    await delay(AFTER_STICKERS_DELAY_MS);
    dateElement.textContent = formatIndonesianDate(new Date());
    dateElement.classList.add("is-visible");
    labelElement.classList.add("is-visible");

    await typeSequence(captionElement, CAPTION_LINES);
    await delay(BEFORE_CLOSING_DELAY_MS);

    pageElement.classList.add("is-closing");
    await delay(AFTER_CLOSING_DELAY_MS);

    endingElement.classList.add("is-visible");
    await typeText(endingTextElement, ENDING_MESSAGE);
    await delay(BEFORE_CREDITS_DELAY_MS);
    creditsElement.classList.add("is-visible");
    await delay(BEFORE_RESTART_BUTTON_DELAY_MS);
    restartButton.classList.add("is-visible");
  }

  function resetScene() {
    pageElement.classList.remove("is-closing");
    newPhotoWrap.classList.remove("is-visible");
    stickerElements.forEach((sticker) => sticker.classList.remove("is-visible"));
    dateElement.classList.remove("is-visible");
    dateElement.textContent = "";
    labelElement.classList.remove("is-visible");
    captionElement.textContent = "";
    endingElement.classList.remove("is-visible");
    endingTextElement.textContent = "";
    creditsElement.classList.remove("is-visible");
    restartButton.classList.remove("is-visible");
  }

  function handleRestartClick() {
    clearCapturedPhoto();
    onFinished?.();
  }

  return {
    onEnter() {
      resetScene();
      restartButton.addEventListener("click", handleRestartClick);
      playSequence();
    },
    onExit() {
      sequenceTimeoutIds.forEach(clearTimeout);
      sequenceTimeoutIds = [];
      restartButton.removeEventListener("click", handleRestartClick);
    },
  };
}
