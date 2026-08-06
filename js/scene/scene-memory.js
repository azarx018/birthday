import { memoryHighlights, galleryPhotos } from "../data/memory-data.js";
import { FRIENDSHIP_YEARS } from "../config.js";

const ENTRANCE_THRESHOLD = 0.4;
const SLIDE_ACTIVE_THRESHOLD = 0.6;

/**
 * @param {{ onFinished?: () => void }} handlers
 * @returns {{ onEnter: () => void, onExit: () => void }}
 */
export function createMemoryScene({ onFinished } = {}) {
  const trackElement = document.getElementById("memory-track");
  const dotsElement = document.getElementById("memory-dots");

  let entranceObserver = null;
  let slideObserver = null;

  buildSlides(trackElement, onFinished);
  buildDots(dotsElement, trackElement.children.length);

  function handleEntranceIntersect(entries, observer) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }

  function handleSlideIntersect(entries) {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || entry.intersectionRatio < SLIDE_ACTIVE_THRESHOLD) return;

      const slideIndex = Number(entry.target.dataset.slideIndex);
      updateActiveDot(dotsElement, slideIndex);

      if (entry.target.classList.contains("memory-slide--gallery")) {
        entry.target.classList.add("is-visible");
      }
    });
  }

  return {
    onEnter() {
      entranceObserver = new IntersectionObserver(handleEntranceIntersect, {
        root: trackElement,
        threshold: ENTRANCE_THRESHOLD,
      });
      trackElement
        .querySelectorAll(".memory-photo-frame")
        .forEach((frame) => entranceObserver.observe(frame));

      slideObserver = new IntersectionObserver(handleSlideIntersect, {
        root: trackElement,
        threshold: SLIDE_ACTIVE_THRESHOLD,
      });
      trackElement.querySelectorAll(".memory-slide").forEach((slide) => slideObserver.observe(slide));
    },
    onExit() {
      entranceObserver?.disconnect();
      slideObserver?.disconnect();
    },
  };
}

function buildSlides(trackElement, onFinished) {
  trackElement.appendChild(createTitleSlide());

  memoryHighlights.forEach((memory) => {
    trackElement.appendChild(createPhotoSlide(memory));
  });

  trackElement.appendChild(createGallerySlide(galleryPhotos, onFinished));

  [...trackElement.children].forEach((slide, index) => {
    slide.dataset.slideIndex = String(index);
  });
}

function createTitleSlide() {
  const slide = document.createElement("div");
  slide.className = "memory-slide memory-slide--title";
  slide.innerHTML = `
    <h2 class="memory-slide__title">Memory kita selama ${FRIENDSHIP_YEARS} tahun</h2>
    <p class="memory-slide__hint">Geser untuk lihat ceritanya →</p>
  `;
  return slide;
}

function createPhotoSlide(memory) {
  const slide = document.createElement("div");
  slide.className = "memory-slide memory-slide--photo";

  const tilt = (Math.random() * 6 - 3).toFixed(1);

  slide.innerHTML = `
    <figure class="memory-photo-frame" style="--tilt: ${tilt}deg">
      <img src="${memory.image}" alt="${memory.caption}" loading="lazy" />
    </figure>
    <p class="memory-caption">${memory.caption}</p>
  `;
  return slide;
}

function createGallerySlide(photos, onFinished) {
  const slide = document.createElement("div");
  slide.className = "memory-slide memory-slide--gallery";

  const heading = document.createElement("h3");
  heading.className = "memory-gallery__heading";
  heading.textContent = "Galeri Kita";
  slide.appendChild(heading);

  const grid = document.createElement("div");
  grid.className = "memory-gallery__grid";

  photos.forEach((photo, index) => {
    const item = document.createElement("div");
    item.className = "memory-gallery-item";
    item.style.setProperty("--index", String(index));
    item.innerHTML = `<img src="${photo.image}" alt="Galeri kenangan" loading="lazy" />`;
    grid.appendChild(item);
  });

  slide.appendChild(grid);

  const continueButton = document.createElement("button");
  continueButton.type = "button";
  continueButton.className = "cta-button cta-button--fade cta-button--delayed";
  continueButton.textContent = "Lanjut";
  continueButton.addEventListener("click", () => onFinished?.());
  slide.appendChild(continueButton);

  return slide;
}

function buildDots(dotsElement, count) {
  for (let i = 0; i < count; i += 1) {
    const dot = document.createElement("span");
    dot.className = "memory-dots__dot";
    dotsElement.appendChild(dot);
  }
  dotsElement.children[0]?.classList.add("is-active");
}

function updateActiveDot(dotsElement, activeIndex) {
  [...dotsElement.children].forEach((dot, index) => {
    dot.classList.toggle("is-active", index === activeIndex);
  });
}
