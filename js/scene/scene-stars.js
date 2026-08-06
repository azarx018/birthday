import { starMemories } from "../data/stars-data.js";

const DECORATIVE_STAR_COUNT = 35;
const SKY_MARGIN_PERCENT = 6; // jarak dari tepi kiri/kanan layar

/**
 * @param {{ onAllCollected?: () => void }} handlers
 * @returns {{ onEnter: () => void, onExit: () => void }}
 */
export function createStarsScene({ onAllCollected } = {}) {
  const skyElement = document.getElementById("stars-sky");
  const counterElement = document.getElementById("stars-counter");
  const overlayElement = document.getElementById("memory-card-overlay");
  const cardBodyElement = document.getElementById("memory-card-body");
  const closeButton = document.getElementById("memory-card-close");
  const continueButton = document.getElementById("stars-continue");

  let built = false;
  let collectedCount = 0;

  function buildSky() {
    spawnDecorativeStars(skyElement, DECORATIVE_STAR_COUNT);
    spawnMoon(skyElement);
    spawnInteractiveStars(skyElement, starMemories, handleStarActivate);
    built = true;
  }

  function updateCounter() {
    counterElement.textContent = `Bintang terkumpul: ${collectedCount}/${starMemories.length}`;
  }

  function handleStarActivate(starElement, memory) {
    if (!starElement.classList.contains("is-collected")) {
      starElement.classList.add("is-collected");
      collectedCount += 1;
      updateCounter();

      if (collectedCount === starMemories.length) {
        continueButton.classList.add("is-visible");
      }
    }

    openCard(memory);
  }

  function openCard(memory) {
    cardBodyElement.innerHTML = renderMemoryCardContent(memory);
    overlayElement.classList.add("is-open");
  }

  function closeCard() {
    overlayElement.classList.remove("is-open");
  }

  function handleOverlayClick(event) {
    if (event.target === overlayElement) closeCard();
  }

  function handleKeydown(event) {
    if (event.key === "Escape") closeCard();
  }

  function handleContinueClick() {
    onAllCollected?.();
  }

  return {
    onEnter() {
      if (!built) buildSky();
      updateCounter();
      closeButton.addEventListener("click", closeCard);
      overlayElement.addEventListener("click", handleOverlayClick);
      document.addEventListener("keydown", handleKeydown);
      continueButton.addEventListener("click", handleContinueClick);
    },
    onExit() {
      closeCard();
      closeButton.removeEventListener("click", closeCard);
      overlayElement.removeEventListener("click", handleOverlayClick);
      document.removeEventListener("keydown", handleKeydown);
      continueButton.removeEventListener("click", handleContinueClick);
    },
  };
}

function renderMemoryCardContent(memory) {
  switch (memory.type) {
    case "photo":
      return `
        <img src="${memory.image}" alt="${memory.caption ?? "Kenangan"}" />
        ${memory.caption ? `<p class="memory-card__caption">${memory.caption}</p>` : ""}
      `;
    case "video":
      return `<video src="${memory.video}" controls playsinline></video>`;
    case "voice":
      return `
        <audio src="${memory.audio}" controls></audio>
        ${memory.caption ? `<p class="memory-card__caption">${memory.caption}</p>` : ""}
      `;
    case "text":
    default:
      return `<p class="memory-card__text">${memory.text}</p>`;
  }
}

function spawnDecorativeStars(container, count) {
  for (let i = 0; i < count; i += 1) {
    const star = document.createElement("span");
    star.className = "star-deco";
    star.style.setProperty("--top", `${randomBetween(2, 72)}%`);
    star.style.setProperty("--left", `${randomBetween(2, 96)}%`);
    star.style.setProperty("--size", `${randomBetween(1.5, 3)}px`);
    star.style.setProperty("--duration", `${randomBetween(2, 5)}s`);
    star.style.setProperty("--delay", `${randomBetween(0, 4)}s`);
    container.appendChild(star);
  }
}

function spawnMoon(container) {
  const moon = document.createElement("div");
  moon.className = "moon";
  container.appendChild(moon);
}

function spawnInteractiveStars(container, memories, onActivate) {
  const positions = generateStarPositions(memories.length);

  memories.forEach((memory, index) => {
    const star = document.createElement("div");
    star.className = "star-interactive";
    star.setAttribute("role", "button");
    star.setAttribute("tabindex", "0");
    star.setAttribute("aria-label", "Buka kenangan");
    star.style.setProperty("--top", `${positions[index].top}%`);
    star.style.setProperty("--left", `${positions[index].left}%`);
    star.style.setProperty("--delay", `${randomBetween(0, 2)}s`);
    star.innerHTML = `<span class="star-interactive__shape"></span>`;

    const activate = () => onActivate(star, memory);
    star.addEventListener("click", activate);
    star.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activate();
      }
    });

    container.appendChild(star);
  });
}

/**
 * Membagi area langit jadi grid sel, satu bintang per sel dengan
 * jitter acak — hasilnya terasa random tapi tidak saling menumpuk.
 */
function generateStarPositions(count) {
  const columns = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / columns);
  const cellWidth = (100 - SKY_MARGIN_PERCENT * 2) / columns;
  const cellHeight = 55 / rows; // dibatasi ke area atas layar

  const cells = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < columns; col += 1) {
      cells.push({ row, col });
    }
  }

  shuffleArray(cells);

  return cells.slice(0, count).map(({ row, col }) => ({
    left: SKY_MARGIN_PERCENT + col * cellWidth + randomBetween(0.15, 0.85) * cellWidth,
    top: 8 + row * cellHeight + randomBetween(0.15, 0.85) * cellHeight,
  }));
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}
