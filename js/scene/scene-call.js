import { SENDER_NAME } from "../config.js";

const NAG_VISIBLE_MS = 2600;
const RINGING_RESUME_DELAY_MS = 1400;

/**
 * Scene 9 — Phone Call. Layar penuh meniru incoming call di smartphone.
 * Menolak panggilan TIDAK memindahkan scene — ia hanya memicu dialog nag
 * lucu, lalu panggilan "berdenyut" lagi, berulang sampai user menekan
 * Terima. Ini sesuai keputusan user: loop tanpa batas.
 *
 * @param {{ onFinished?: () => void }} handlers
 * @returns {{ onEnter: () => void, onExit: () => void }}
 */
export function createCallScene({ onFinished } = {}) {
  const sceneElement = document.getElementById("scene-call");
  const nameElement = document.getElementById("call-name");
  const acceptButton = document.getElementById("call-accept");
  const declineButton = document.getElementById("call-decline");

  const chatNag = document.getElementById("chat-nag");
  const chatNagSenderElement = document.getElementById("chat-nag-sender");

  let nagTimeoutId = null;
  let resumeTimeoutId = null;

  function resetScene() {
    clearTimeout(nagTimeoutId);
    clearTimeout(resumeTimeoutId);
    sceneElement.classList.remove("is-declined");
    chatNag.classList.remove("is-visible");
    nameElement.textContent = SENDER_NAME;
    chatNagSenderElement.textContent = SENDER_NAME;
  }

  function handleAccept() {
    clearTimeout(nagTimeoutId);
    clearTimeout(resumeTimeoutId);
    onFinished?.();
  }

  function handleDecline() {
    sceneElement.classList.add("is-declined");
    chatNag.classList.add("is-visible");

    nagTimeoutId = setTimeout(() => {
      chatNag.classList.remove("is-visible");
      resumeTimeoutId = setTimeout(() => {
        sceneElement.classList.remove("is-declined");
      }, RINGING_RESUME_DELAY_MS);
    }, NAG_VISIBLE_MS);
  }

  return {
    onEnter() {
      resetScene();
      acceptButton.addEventListener("click", handleAccept);
      declineButton.addEventListener("click", handleDecline);
    },
    onExit() {
      clearTimeout(nagTimeoutId);
      clearTimeout(resumeTimeoutId);
      chatNag.classList.remove("is-visible");
      acceptButton.removeEventListener("click", handleAccept);
      declineButton.removeEventListener("click", handleDecline);
    },
  };
}
