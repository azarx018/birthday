import { typeText } from "../animation.js";

const INTRO_TEXT = "Aku masih punya sesuatu.";

/**
 * Scene 8 — Video Message. Tugasnya cuma memutar video pesan lalu
 * menyerahkan alur ke scene berikutnya (Scene 9 — Phone Call) lewat
 * onFinished, baik karena video selesai maupun karena user menekan
 * "Lewati" (video gagal dimuat).
 *
 * @param {{ onFinished?: () => void }} handlers
 * @returns {{ onEnter: () => void, onExit: () => void }}
 */
export function createVideoScene({ onFinished } = {}) {
  const introElement = document.getElementById("video-intro");
  const introTextElement = document.getElementById("video-intro-text");
  const playButton = document.getElementById("video-play-button");
  const skipButton = document.getElementById("video-skip-button");
  const playerWrap = document.getElementById("video-player-wrap");
  const videoElement = document.getElementById("video-player");

  let hasVideoError = false;

  function resetScene() {
    hasVideoError = false;
    introElement.classList.remove("is-hidden");
    playButton.classList.remove("is-visible");
    skipButton.hidden = true;
    skipButton.classList.remove("is-visible");
    playerWrap.classList.remove("is-active");

    typeText(introTextElement, INTRO_TEXT).then(() => {
      if (!hasVideoError) playButton.classList.add("is-visible");
    });
  }

  function handlePlayClick() {
    introElement.classList.add("is-hidden");
    playerWrap.classList.add("is-active");
    videoElement.play().catch(() => {
      // Autoplay diblokir browser — biarkan user tap video utk mulai manual.
    });
  }

  function handleVideoTap() {
    if (videoElement.paused) {
      videoElement.play();
    } else {
      videoElement.pause();
    }
  }

  function handleVideoError() {
    hasVideoError = true;
    playButton.classList.remove("is-visible");
    skipButton.hidden = false;
    skipButton.classList.add("is-visible");
  }

  function handleVideoEnded() {
    onFinished?.();
  }

  function handleSkipClick() {
    onFinished?.();
  }

  return {
    onEnter() {
      resetScene();
      playButton.addEventListener("click", handlePlayClick);
      videoElement.addEventListener("click", handleVideoTap);
      videoElement.addEventListener("error", handleVideoError);
      videoElement.addEventListener("ended", handleVideoEnded);
      skipButton.addEventListener("click", handleSkipClick);
    },
    onExit() {
      videoElement.pause();
      playButton.removeEventListener("click", handlePlayClick);
      videoElement.removeEventListener("click", handleVideoTap);
      videoElement.removeEventListener("error", handleVideoError);
      videoElement.removeEventListener("ended", handleVideoEnded);
      skipButton.removeEventListener("click", handleSkipClick);
    },
  };
}
