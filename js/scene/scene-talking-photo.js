import { typeText } from "../animation.js";
import { TALKING_PHOTO_SUBTITLES } from "../data/talking-photo-data.js";

const BLINK_MIN_INTERVAL_MS = 2500;
const BLINK_MAX_INTERVAL_MS = 6000;
const BLINK_DURATION_MS = 260;

// Seberapa keras audio harus terdengar (RMS 0-1) untuk dianggap "sedang
// bicara" dan menampilkan foto mangap. TODO: kalibrasi ulang angka ini
// setelah assets/audio/message.mp3 asli direkam — rekaman yang lebih
// pelan/keras dari perkiraan bisa butuh threshold berbeda.
const SPEAKING_RMS_THRESHOLD = 0.045;

// Jarak minimum antar pergantian status bicara/diam, supaya foto tidak
// "kedip-kedip" cepat akibat noise audio sesaat.
const MIN_STATE_HOLD_MS = 120;

const PULSE_DURATION_MS = 350;

/**
 * Scene 10 — Talking Photo. Foto pengirim baru muncul begitu audio
 * BENAR-BENAR mulai bersuara (tidak ada foto "standby" sebelum itu).
 * Selama audio berbunyi, foto mangap ditampilkan (lebih terang + sedikit
 * membesar + denyut sesaat di awal bicara); saat audio diam, foto mingkem
 * yang tampil (lebih redup, ukuran normal). Mata tetap berkedip otomatis
 * di interval acak, independen dari status bicara.
 *
 * @param {{ onFinished?: () => void }} handlers
 * @returns {{ onEnter: () => void, onExit: () => void }}
 */
export function createTalkingPhotoScene({ onFinished } = {}) {
  const frameElement = document.getElementById("talking-photo-frame");
  const closedImage = document.getElementById("talking-photo-closed");
  const eyelidLeft = document.getElementById("talking-photo-eyelid-left");
  const eyelidRight = document.getElementById("talking-photo-eyelid-right");
  const subtitleElement = document.getElementById("talking-photo-subtitle");
  const audioElement = document.getElementById("talking-photo-audio");
  const startButton = document.getElementById("talking-photo-start-button");

  let audioContext = null;
  let analyser = null;
  let dataArray = null;
  let hasAnalyserSetup = false;
  let hasColorSampled = false;

  let rafId = null;
  let blinkTimeoutId = null;
  let pulseTimeoutId = null;
  let nextSubtitleIndex = 0;

  let isSpeaking = false;
  let lastStateChangeAt = 0;

  /**
   * Mengambil warna kulit di sekitar tiap mata langsung dari foto mingkem
   * (bukan warna hardcode), supaya overlay kelopak menyatu walau foto
   * berganti. Sample diambil sedikit di BAWAH mata (area pipi atas) agar
   * tidak kena piksel alis/bola mata yang gelap.
   */
  function sampleEyelidColors() {
    if (hasColorSampled) return;

    const doSample = () => {
      const canvas = document.createElement("canvas");
      canvas.width = closedImage.naturalWidth;
      canvas.height = closedImage.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(closedImage, 0, 0);

      const sample = (xPercent, yPercent) => {
        const x = Math.round((xPercent / 100) * canvas.width);
        const y = Math.round((yPercent / 100) * canvas.height);
        const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
        return `rgb(${r}, ${g}, ${b})`;
      };

      eyelidLeft.style.backgroundColor = sample(37, 43);
      eyelidRight.style.backgroundColor = sample(63, 43);
      hasColorSampled = true;
    };

    if (closedImage.complete && closedImage.naturalWidth > 0) {
      doSample();
    } else {
      closedImage.addEventListener("load", doSample, { once: true });
    }
  }

  function scheduleNextBlink() {
    const delay =
      BLINK_MIN_INTERVAL_MS + Math.random() * (BLINK_MAX_INTERVAL_MS - BLINK_MIN_INTERVAL_MS);
    blinkTimeoutId = setTimeout(triggerBlink, delay);
  }

  function triggerBlink() {
    eyelidLeft.classList.add("is-blinking");
    eyelidRight.classList.add("is-blinking");
    setTimeout(() => {
      eyelidLeft.classList.remove("is-blinking");
      eyelidRight.classList.remove("is-blinking");
    }, BLINK_DURATION_MS);
    scheduleNextBlink();
  }

  function setupAnalyser() {
    if (hasAnalyserSetup) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContextClass();
    const sourceNode = audioContext.createMediaElementSource(audioElement);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    dataArray = new Uint8Array(analyser.frequencyBinCount);
    sourceNode.connect(analyser);
    analyser.connect(audioContext.destination);
    hasAnalyserSetup = true;
  }

  function getCurrentVolume() {
    analyser.getByteTimeDomainData(dataArray);
    let sumSquares = 0;
    for (let i = 0; i < dataArray.length; i += 1) {
      const normalized = (dataArray[i] - 128) / 128;
      sumSquares += normalized * normalized;
    }
    return Math.sqrt(sumSquares / dataArray.length);
  }

  function setSpeaking(nextIsSpeaking) {
    isSpeaking = nextIsSpeaking;
    frameElement.classList.toggle("is-speaking", isSpeaking);

    if (isSpeaking) {
      // Denyut sesaat, cuma di momen mulai bicara.
      clearTimeout(pulseTimeoutId);
      frameElement.classList.remove("is-pulsing");
      // Reflow supaya animation bisa retrigger walau class sama.
      void frameElement.offsetWidth;
      frameElement.classList.add("is-pulsing");
      pulseTimeoutId = setTimeout(() => {
        frameElement.classList.remove("is-pulsing");
      }, PULSE_DURATION_MS);
    }
  }

  function updateSpeakingState() {
    const now = performance.now();
    if (now - lastStateChangeAt < MIN_STATE_HOLD_MS) return;

    const rawIsSpeaking = getCurrentVolume() > SPEAKING_RMS_THRESHOLD;
    if (rawIsSpeaking !== isSpeaking) {
      lastStateChangeAt = now;
      setSpeaking(rawIsSpeaking);
    }
  }

  function updateSubtitle() {
    if (nextSubtitleIndex >= TALKING_PHOTO_SUBTITLES.length) return;
    const nextLine = TALKING_PHOTO_SUBTITLES[nextSubtitleIndex];

    if (audioElement.currentTime >= nextLine.time) {
      typeText(subtitleElement, nextLine.text);
      nextSubtitleIndex += 1;
    }
  }

  function animationLoop() {
    updateSpeakingState();
    updateSubtitle();
    rafId = requestAnimationFrame(animationLoop);
  }

  function stopAnimationLoop() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  function handleAudioPlaying() {
    // Foto baru ditampilkan begitu audio benar-benar bersuara — tidak
    // ada state "standby" sebelum ini.
    frameElement.classList.add("is-visible");
  }

  function handleAudioEnded() {
    stopAnimationLoop();
    onFinished?.();
  }

  function startPlayback() {
    setupAnalyser();
    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    audioElement.currentTime = 0;
    nextSubtitleIndex = 0;
    subtitleElement.textContent = "";

    audioElement
      .play()
      .then(() => {
        startButton.classList.remove("is-visible");
        rafId = requestAnimationFrame(animationLoop);
      })
      .catch(() => {
        // Autoplay diblokir, atau file belum ada — tampilkan tombol
        // fallback. Foto TETAP tidak muncul sampai audio benar-benar
        // jalan (lihat handleAudioPlaying).
        startButton.classList.add("is-visible");
      });
  }

  function handleStartClick() {
    startPlayback();
  }

  return {
    onEnter() {
      sampleEyelidColors();
      frameElement.classList.remove("is-visible", "is-speaking", "is-pulsing");
      startButton.classList.remove("is-visible");
      startButton.addEventListener("click", handleStartClick);
      audioElement.addEventListener("playing", handleAudioPlaying);
      audioElement.addEventListener("ended", handleAudioEnded);
      isSpeaking = false;
      lastStateChangeAt = 0;
      scheduleNextBlink();
      startPlayback();
    },
    onExit() {
      clearTimeout(blinkTimeoutId);
      clearTimeout(pulseTimeoutId);
      stopAnimationLoop();
      audioElement.pause();
      frameElement.classList.remove("is-visible", "is-speaking", "is-pulsing");
      startButton.removeEventListener("click", handleStartClick);
      audioElement.removeEventListener("playing", handleAudioPlaying);
      audioElement.removeEventListener("ended", handleAudioEnded);
      eyelidLeft.classList.remove("is-blinking");
      eyelidRight.classList.remove("is-blinking");
    },
  };
}
