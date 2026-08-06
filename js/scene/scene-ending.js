import { FRIENDSHIP_START_DATE } from "../config.js";
import { typeText } from "../animation.js";

const COUNT_UP_DURATION_MS = 1200;
const MESSAGE_DELAY_MS = 700;
const CONTINUE_BUTTON_DELAY_MS = 1600;
const CLOSING_MESSAGE = "Semoga angka ini terus bertambah.";

function getDurationParts(startDate) {
  const diffMs = Math.max(Date.now() - startDate.getTime(), 0);
  const totalMinutes = Math.floor(diffMs / 60000);

  return {
    days: Math.floor(totalMinutes / (60 * 24)),
    hours: Math.floor((totalMinutes % (60 * 24)) / 60),
    minutes: totalMinutes % 60,
  };
}

/**
 * Scene 13 — Ending. Statistik "sudah berteman selama" dihitung dari
 * FRIENDSHIP_START_DATE, dianimasikan count-up sebentar lalu lanjut
 * live-ticking tiap detik (angka menit ikut jalan beneran, bukan angka
 * mati) selama scene ini aktif.
 *
 * @param {{ onFinished?: () => void }} handlers
 * @returns {{ onEnter: () => void, onExit: () => void }}
 */
export function createEndingScene({ onFinished } = {}) {
  const daysElement = document.getElementById("ending-days");
  const hoursElement = document.getElementById("ending-hours");
  const minutesElement = document.getElementById("ending-minutes");
  const messageElement = document.getElementById("ending-message");
  const continueButton = document.getElementById("ending-continue-button");

  let countUpRafId = null;
  let tickIntervalId = null;
  let messageTimeoutId = null;
  let continueButtonTimeoutId = null;

  function renderParts({ days, hours, minutes }) {
    daysElement.textContent = days;
    hoursElement.textContent = hours;
    minutesElement.textContent = minutes;
  }

  function startLiveTicking() {
    tickIntervalId = setInterval(() => {
      renderParts(getDurationParts(FRIENDSHIP_START_DATE));
    }, 1000);
  }

  function playCountUp() {
    const target = getDurationParts(FRIENDSHIP_START_DATE);
    const startedAt = performance.now();

    function step(now) {
      const progress = Math.min((now - startedAt) / COUNT_UP_DURATION_MS, 1);
      renderParts({
        days: Math.round(target.days * progress),
        hours: Math.round(target.hours * progress),
        minutes: Math.round(target.minutes * progress),
      });

      if (progress < 1) {
        countUpRafId = requestAnimationFrame(step);
      } else {
        renderParts(target);
        startLiveTicking();
      }
    }

    countUpRafId = requestAnimationFrame(step);
  }

  function handleContinueClick() {
    onFinished?.();
  }

  return {
    onEnter() {
      renderParts({ days: 0, hours: 0, minutes: 0 });
      messageElement.textContent = "";
      continueButton.classList.remove("is-visible");
      continueButton.addEventListener("click", handleContinueClick);

      playCountUp();

      messageTimeoutId = setTimeout(() => {
        typeText(messageElement, CLOSING_MESSAGE).then(() => {
          continueButtonTimeoutId = setTimeout(() => {
            continueButton.classList.add("is-visible");
          }, CONTINUE_BUTTON_DELAY_MS);
        });
      }, COUNT_UP_DURATION_MS + MESSAGE_DELAY_MS);
    },
    onExit() {
      if (countUpRafId) cancelAnimationFrame(countUpRafId);
      countUpRafId = null;
      clearInterval(tickIntervalId);
      tickIntervalId = null;
      clearTimeout(messageTimeoutId);
      clearTimeout(continueButtonTimeoutId);
      continueButton.removeEventListener("click", handleContinueClick);
    },
  };
}
