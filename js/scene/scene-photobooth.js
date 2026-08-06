import { RECIPIENT_NAME, GIFT_CREATOR_WHATSAPP_NUMBER } from "../config.js";
import { typeSequence, wait } from "../animation.js";
import {
  PHOTOBOOTH_INTRO_HEADING,
  PHOTOBOOTH_INTRO_LINES,
  PHOTOBOOTH_CAMERA_ERROR_MESSAGE,
  PHOTOBOOTH_POSE_PROMPTS,
  PHOTOBOOTH_GENERATING_MESSAGES,
  PHOTOBOOTH_SHARE_DIALOG_TEXT,
  PHOTOBOOTH_SHARE_MESSAGE,
} from "../data/photobooth-data.js";
import { PHOTOBOOTH_LAYOUTS, getLayoutById } from "../data/photobooth-layouts.js";
import { setCapturedPhoto } from "../state/session-photo.js";
import { setSelectedLayoutId, getSelectedLayoutId } from "../state/photobooth-layout.js";

const FLASH_DURATION_MS = 220;
const COUNTDOWN_STEPS = ["3", "2", "1", "📸"];
const COUNTDOWN_STEP_DURATION_MS = 700;
const GENERATING_STEP_DURATION_MS = 650;
// Rasio potret standar tiap jepretan mentah (sebelum dikomposit ke frame).
// 3:4 dipakai konsisten di seluruh project.
const SHOT_ASPECT_RATIO = 3 / 4;
const SHOT_OUTPUT_WIDTH = 960;
// Lebar minimum hasil ekspor akhir — brief minta 1080×1920 atau lebih
// tinggi. Kalau frame asli lebih kecil dari ini, canvas di-scale up
// proporsional; kalau frame asli sudah lebih besar, dipakai apa adanya.
const MIN_EXPORT_WIDTH = 1080;

/**
 * Scene 14 — Photo Booth. State machine dengan 9 panel (intro,
 * layoutChoose, camera, error, shotPreview, generating, preview, share,
 * continue), cuma satu yang aktif di satu waktu. Alur: pilih layout →
 * tiap foto didahului countdown (3-2-1-📸) + pose prompt acak → preview
 * per-shot (retake/lanjut) → setelah semua foto layout terkumpul, animasi
 * "generating" sesaat → dikomposit ke <canvas> resolusi tinggi (setiap
 * foto masuk slot masing-masing) dengan frame PNG di atasnya (border
 * SELALU ikut ke file yang didownload, frame-nya "clean" — semua teks
 * termasuk tanggal adalah bagian dari artwork PNG, tidak ada teks yang
 * digambar lewat kode).
 *
 * @param {{ onFinished?: () => void }} handlers
 * @returns {{ onEnter: () => void, onExit: () => void }}
 */
export function createPhotoboothScene({ onFinished } = {}) {
  const panels = {
    intro: document.getElementById("photobooth-intro"),
    layoutChoose: document.getElementById("photobooth-layout-choose"),
    camera: document.getElementById("photobooth-camera"),
    error: document.getElementById("photobooth-error"),
    shotPreview: document.getElementById("photobooth-shot-preview"),
    generating: document.getElementById("photobooth-generating"),
    preview: document.getElementById("photobooth-preview"),
    share: document.getElementById("photobooth-share"),
    continue: document.getElementById("photobooth-continue"),
  };

  const introHeadingElement = document.getElementById("photobooth-intro-heading");
  const introTextElement = document.getElementById("photobooth-intro-text");
  const startButton = document.getElementById("photobooth-start-button");
  const layoutCardsContainer = document.getElementById("photobooth-layout-cards");
  const errorTextElement = document.getElementById("photobooth-error-text");
  const retryButton = document.getElementById("photobooth-retry-button");

  const frameWrapElement = document.getElementById("photobooth-frame-wrap");
  const videoElement = document.getElementById("photobooth-video");
  const frameImageElement = document.getElementById("photobooth-frame-image");
  const flashElement = document.getElementById("photobooth-flash");
  const countdownElement = document.getElementById("photobooth-countdown");
  const progressElement = document.getElementById("photobooth-progress");
  const posePromptElement = document.getElementById("photobooth-pose-prompt");
  const captureButton = document.getElementById("photobooth-capture-button");

  const shotProgressElement = document.getElementById("photobooth-shot-progress");
  const shotPreviewImageElement = document.getElementById("photobooth-shot-preview-image");
  const shotRetakeButton = document.getElementById("photobooth-shot-retake-button");
  const shotContinueButton = document.getElementById("photobooth-shot-continue-button");

  const generatingTextElement = document.getElementById("photobooth-generating-text");

  const previewImageElement = document.getElementById("photobooth-preview-image");
  const retakeButton = document.getElementById("photobooth-retake-button");
  const downloadButton = document.getElementById("photobooth-download-button");

  const shareTextElement = document.getElementById("photobooth-share-text");
  const whatsappButton = document.getElementById("photobooth-whatsapp-button");
  const skipShareButton = document.getElementById("photobooth-skip-share-button");

  const continueButton = document.getElementById("photobooth-continue-button");

  const canvasElement = document.getElementById("photobooth-canvas");

  let mediaStream = null;
  let previewObjectUrl = null;
  let currentLayout = null;
  let currentShotIndex = 0;
  let capturedShots = [];
  let pendingShotCanvas = null;
  let isCountingDown = false;

  function setState(nextState) {
    Object.values(panels).forEach((panel) => panel.classList.remove("is-active"));
    panels[nextState].classList.add("is-active");
  }

  function ensureFrameAspectRatio() {
    if (frameImageElement.naturalWidth > 0) {
      frameWrapElement.style.aspectRatio = `${frameImageElement.naturalWidth} / ${frameImageElement.naturalHeight}`;
      return;
    }
    frameImageElement.addEventListener("load", ensureFrameAspectRatio, { once: true });
  }

  async function startCamera(onSuccess) {
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1080 },
          height: { ideal: 1440 },
        },
        audio: false,
      });
      videoElement.srcObject = mediaStream;
      onSuccess();
    } catch (error) {
      setState("error");
    }
  }

  function stopCamera() {
    if (!mediaStream) return;
    mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = null;
  }

  /**
   * Ambil satu jepretan MENTAH dari video kamera (crop "cover" ke rasio
   * potret + mirror), disimpan sebagai canvas tersendiri. Belum ada frame
   * di sini — cuma fotonya. Dipanggil sekali per shot dalam sesi
   * multi-foto.
   */
  function captureRawShot() {
    const videoWidth = videoElement.videoWidth;
    const videoHeight = videoElement.videoHeight;
    const videoRatio = videoWidth / videoHeight;

    let sourceWidth = videoWidth;
    let sourceHeight = videoHeight;
    if (videoRatio > SHOT_ASPECT_RATIO) {
      sourceWidth = videoHeight * SHOT_ASPECT_RATIO;
    } else {
      sourceHeight = videoWidth / SHOT_ASPECT_RATIO;
    }
    const sourceX = (videoWidth - sourceWidth) / 2;
    const sourceY = (videoHeight - sourceHeight) / 2;

    const shotCanvas = document.createElement("canvas");
    shotCanvas.width = SHOT_OUTPUT_WIDTH;
    shotCanvas.height = Math.round(SHOT_OUTPUT_WIDTH / SHOT_ASPECT_RATIO);

    const ctx = shotCanvas.getContext("2d");
    ctx.save();
    ctx.translate(shotCanvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(
      videoElement,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      shotCanvas.width,
      shotCanvas.height
    );
    ctx.restore();

    return shotCanvas;
  }

  /**
   * Gambar satu shot ke area tujuan dengan crop "cover" (mengisi penuh
   * tanpa gepeng, kelebihannya dipotong tengah) — dipakai berulang untuk
   * tiap slot di frame.
   */
  function drawShotCover(ctx, shotCanvas, destX, destY, destWidth, destHeight) {
    const destRatio = destWidth / destHeight;
    const sourceRatio = shotCanvas.width / shotCanvas.height;

    let sourceWidth = shotCanvas.width;
    let sourceHeight = shotCanvas.height;
    if (sourceRatio > destRatio) {
      sourceWidth = shotCanvas.height * destRatio;
    } else {
      sourceHeight = shotCanvas.width / destRatio;
    }
    const sourceX = (shotCanvas.width - sourceWidth) / 2;
    const sourceY = (shotCanvas.height - sourceHeight) / 2;

    ctx.drawImage(shotCanvas, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);
  }

  /**
   * Komposit akhir: tiap foto di `capturedShots` digambar ke slot
   * masing-masing (`currentLayout.slots`, posisi dalam persen), baru
   * frame PNG di atasnya. Canvas di-scale up ke minimal `MIN_EXPORT_WIDTH`
   * supaya hasil ekspor tetap resolusi tinggi walau asset frame-nya kecil.
   *
   * Return Promise yang baru resolve setelah `previewImageElement.src`
   * benar-benar terisi (toBlob async) — dipanggil dengan `await` di
   * `finalizePhotoBooth()` supaya panel preview tidak sempat tampil
   * sebelum gambar final benar-benar siap (celah ini sebelumnya bisa
   * memperlihatkan gambar sisa sesi sebelumnya sesaat, terutama kalau
   * user retake berkali-kali).
   */
  function composeFinalPreview() {
    return new Promise((resolve) => {
      const frameNaturalWidth = frameImageElement.naturalWidth;
      const frameNaturalHeight = frameImageElement.naturalHeight;
      const scale = Math.max(1, MIN_EXPORT_WIDTH / frameNaturalWidth);
      const canvasWidth = Math.round(frameNaturalWidth * scale);
      const canvasHeight = Math.round(frameNaturalHeight * scale);

      canvasElement.width = canvasWidth;
      canvasElement.height = canvasHeight;
      const ctx = canvasElement.getContext("2d");

      currentLayout.slots.forEach((slot, index) => {
        const shotCanvas = capturedShots[index];
        if (!shotCanvas) return;

        drawShotCover(
          ctx,
          shotCanvas,
          (slot.xPercent / 100) * canvasWidth,
          (slot.yPercent / 100) * canvasHeight,
          (slot.widthPercent / 100) * canvasWidth,
          (slot.heightPercent / 100) * canvasHeight
        );
      });

      // Frame (border, ornamen, judul, dsb) digambar di atas — semua teks
      // (termasuk tanggal) sudah jadi bagian dari artwork PNG-nya sendiri,
      // area transparan otomatis memperlihatkan foto-foto yang sudah
      // digambar duluan. TIDAK ADA teks yang digambar lewat kode di sini
      // (keputusan user: frame harus clean, tanpa campur tangan kode).
      ctx.drawImage(frameImageElement, 0, 0, canvasWidth, canvasHeight);

      canvasElement.toBlob((blob) => {
        if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
        previewObjectUrl = URL.createObjectURL(blob);
        previewImageElement.src = previewObjectUrl;
        resolve();
      }, "image/png");
    });
  }

  function renderLayoutCards() {
    layoutCardsContainer.innerHTML = PHOTOBOOTH_LAYOUTS.map((layout) => {
      const totalSlots = layout.previewColumns * layout.previewRows;
      const slotsMarkup = Array.from({ length: totalSlots })
        .map(() => `<span class="photobooth__layout-card-preview-slot"></span>`)
        .join("");

      return `
        <button type="button" class="photobooth__layout-card" data-layout-id="${layout.id}">
          <div
            class="photobooth__layout-card-preview"
            style="grid-template-columns: repeat(${layout.previewColumns}, 1fr); grid-template-rows: repeat(${layout.previewRows}, 1fr);"
          >
            ${slotsMarkup}
          </div>
          <div class="photobooth__layout-card-body">
            <p class="photobooth__layout-card-title">${layout.icon} ${layout.label}</p>
            <p class="photobooth__layout-card-description">${layout.description}</p>
            <p class="photobooth__layout-card-result">${layout.resultLabel}</p>
          </div>
        </button>
      `;
    }).join("");
  }

  function pickRandomPosePrompt() {
    const randomIndex = Math.floor(Math.random() * PHOTOBOOTH_POSE_PROMPTS.length);
    return PHOTOBOOTH_POSE_PROMPTS[randomIndex];
  }

  function updateProgressIndicator() {
    const progressLabel = `Foto ${currentShotIndex + 1} / ${currentLayout.photoCount}`;
    progressElement.textContent = progressLabel;
    shotProgressElement.textContent = progressLabel;
  }

  function prepareShot() {
    updateProgressIndicator();
    posePromptElement.textContent = pickRandomPosePrompt();
    captureButton.disabled = false;
    setState("camera");
  }

  async function runCountdown() {
    for (const step of COUNTDOWN_STEPS) {
      countdownElement.textContent = step;
      countdownElement.classList.remove("is-popping");
      // Trigger reflow supaya animasi bisa retrigger walau isi teksnya
      // beda tiap step.
      void countdownElement.offsetWidth;
      countdownElement.classList.add("is-popping");
      await wait(COUNTDOWN_STEP_DURATION_MS);
    }
    countdownElement.textContent = "";
    countdownElement.classList.remove("is-popping");
  }

  function startShotSequence() {
    currentLayout = getLayoutById(getSelectedLayoutId());
    currentShotIndex = 0;
    capturedShots = [];
    prepareShot();
  }

  function selectLayout(layout) {
    setSelectedLayoutId(layout.id);
    frameImageElement.src = layout.frameImage;
    ensureFrameAspectRatio();
    startCamera(startShotSequence);
  }

  function handleLayoutCardsClick(event) {
    const card = event.target.closest(".photobooth__layout-card");
    if (!card) return;
    const layout = getLayoutById(card.dataset.layoutId);
    if (!layout) return;
    selectLayout(layout);
  }

  function handleStartClick() {
    setState("layoutChoose");
  }

  function handleRetryClick() {
    // Kalau error terjadi di tengah sesi (currentLayout sudah ke-set),
    // lanjutkan dari shot yang sedang berjalan, bukan mulai dari 0 lagi.
    startCamera(currentLayout ? prepareShot : startShotSequence);
  }

  async function handleCaptureClick() {
    if (isCountingDown) return;
    isCountingDown = true;
    captureButton.disabled = true;

    await runCountdown();

    flashElement.classList.add("is-flashing");
    setTimeout(() => {
      flashElement.classList.remove("is-flashing");
    }, FLASH_DURATION_MS);

    pendingShotCanvas = captureRawShot();
    shotPreviewImageElement.src = pendingShotCanvas.toDataURL("image/png");
    updateProgressIndicator();
    isCountingDown = false;
    shotContinueButton.disabled = false;
    setState("shotPreview");
  }

  function handleShotRetakeClick() {
    pendingShotCanvas = null;
    prepareShot();
  }

  async function playGeneratingAnimation() {
    setState("generating");
    for (const message of PHOTOBOOTH_GENERATING_MESSAGES) {
      generatingTextElement.classList.remove("is-visible");
      generatingTextElement.textContent = message;
      // Trigger reflow supaya transisi fade bisa retrigger tiap ganti pesan.
      void generatingTextElement.offsetWidth;
      generatingTextElement.classList.add("is-visible");
      await wait(GENERATING_STEP_DURATION_MS);
    }
  }

  async function finalizePhotoBooth() {
    stopCamera();
    await playGeneratingAnimation();
    await composeFinalPreview();
    setState("preview");
  }

  function handleShotContinueClick() {
    // Guard dwi-tap: tanpa ini, dua tap cepat di shot terakhir bisa
    // memicu finalizePhotoBooth() dua kali bersamaan (beda dari
    // captureButton yang sudah di-disable saat countdown, tombol ini
    // sebelumnya tidak pernah di-disable sama sekali).
    if (shotContinueButton.disabled) return;
    shotContinueButton.disabled = true;

    capturedShots.push(pendingShotCanvas);
    pendingShotCanvas = null;
    currentShotIndex += 1;

    if (currentShotIndex < currentLayout.photoCount) {
      prepareShot();
      return;
    }

    finalizePhotoBooth();
  }

  function handleRetakeClick() {
    // "Ambil Ulang Semua" — ulang dari shot pertama, layout tetap sama.
    startCamera(startShotSequence);
  }

  function handleDownloadClick() {
    const link = document.createElement("a");
    link.href = previewObjectUrl;
    link.download = `photobooth-${RECIPIENT_NAME.toLowerCase()}-${Date.now()}.png`;
    link.click();
    setState("share");
  }

  function handleWhatsappClick() {
    const waUrl = `https://wa.me/${GIFT_CREATOR_WHATSAPP_NUMBER}?text=${encodeURIComponent(PHOTOBOOTH_SHARE_MESSAGE)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
    setState("continue");
    continueButton.classList.add("is-visible");
  }

  function handleSkipShareClick() {
    setState("continue");
    continueButton.classList.add("is-visible");
  }

  function handleContinueClick() {
    // Pindahkan kepemilikan object URL ke scene-scrapbook — set null di
    // sini supaya onExit di bawah TIDAK ikut me-revoke-nya.
    setCapturedPhoto(previewObjectUrl);
    previewObjectUrl = null;
    onFinished?.();
  }

  function resetScene() {
    setState("intro");
    introTextElement.textContent = "";
    startButton.classList.remove("is-visible");
    continueButton.classList.remove("is-visible");
    shotContinueButton.disabled = false;
    if (previewObjectUrl) {
      URL.revokeObjectURL(previewObjectUrl);
      previewObjectUrl = null;
    }
    previewImageElement.src = "";
    shotPreviewImageElement.src = "";
    generatingTextElement.textContent = "";
    generatingTextElement.classList.remove("is-visible");
    countdownElement.textContent = "";
    countdownElement.classList.remove("is-popping");
    progressElement.textContent = "";
    shotProgressElement.textContent = "";
    posePromptElement.textContent = "";
    currentLayout = null;
    currentShotIndex = 0;
    capturedShots = [];
    pendingShotCanvas = null;
    isCountingDown = false;
  }

  return {
    onEnter() {
      resetScene();
      errorTextElement.textContent = PHOTOBOOTH_CAMERA_ERROR_MESSAGE;
      shareTextElement.textContent = PHOTOBOOTH_SHARE_DIALOG_TEXT;
      introHeadingElement.textContent = PHOTOBOOTH_INTRO_HEADING;
      renderLayoutCards();

      startButton.addEventListener("click", handleStartClick);
      layoutCardsContainer.addEventListener("click", handleLayoutCardsClick);
      retryButton.addEventListener("click", handleRetryClick);
      captureButton.addEventListener("click", handleCaptureClick);
      shotRetakeButton.addEventListener("click", handleShotRetakeClick);
      shotContinueButton.addEventListener("click", handleShotContinueClick);
      retakeButton.addEventListener("click", handleRetakeClick);
      downloadButton.addEventListener("click", handleDownloadClick);
      whatsappButton.addEventListener("click", handleWhatsappClick);
      skipShareButton.addEventListener("click", handleSkipShareClick);
      continueButton.addEventListener("click", handleContinueClick);

      typeSequence(introTextElement, PHOTOBOOTH_INTRO_LINES).then(() => {
        startButton.classList.add("is-visible");
      });
    },
    onExit() {
      stopCamera();
      if (previewObjectUrl) {
        URL.revokeObjectURL(previewObjectUrl);
        previewObjectUrl = null;
      }
      startButton.removeEventListener("click", handleStartClick);
      layoutCardsContainer.removeEventListener("click", handleLayoutCardsClick);
      retryButton.removeEventListener("click", handleRetryClick);
      captureButton.removeEventListener("click", handleCaptureClick);
      shotRetakeButton.removeEventListener("click", handleShotRetakeClick);
      shotContinueButton.removeEventListener("click", handleShotContinueClick);
      retakeButton.removeEventListener("click", handleRetakeClick);
      downloadButton.removeEventListener("click", handleDownloadClick);
      whatsappButton.removeEventListener("click", handleWhatsappClick);
      skipShareButton.removeEventListener("click", handleSkipShareClick);
      continueButton.removeEventListener("click", handleContinueClick);
    },
  };
}
