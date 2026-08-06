import { achievements } from "../data/achievements-data.js";

/**
 * @param {{ onAllUnlocked?: () => void }} handlers
 * @returns {{ onEnter: () => void, onExit: () => void }}
 */
export function createFunMemoriesScene({ onAllUnlocked } = {}) {
  const listElement = document.getElementById("achievement-list");
  const continueButton = document.getElementById("fun-memories-continue");

  let unlockedCount = 0;
  let cardsBuilt = false;

  function handleContinueClick() {
    onAllUnlocked?.();
  }

  function unlockCard(card) {
    if (card.classList.contains("is-unlocked")) return;

    card.classList.add("is-unlocked", "is-unlocking");
    card.addEventListener("animationend", () => card.classList.remove("is-unlocking"), {
      once: true,
    });

    unlockedCount += 1;
    if (unlockedCount === achievements.length) {
      continueButton.classList.add("is-visible");
    }
  }

  function createCardElement(achievement) {
    const card = document.createElement("div");
    card.className = "achievement-card";
    card.dataset.id = achievement.id;
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", `Achievement: ${achievement.title}`);

    card.innerHTML = `
      <div class="achievement-card__icon-wrap">
        <img class="achievement-card__icon" src="${achievement.icon}" alt="" />
        <span class="achievement-card__lock" aria-hidden="true">?</span>
        <span class="achievement-card__glow" aria-hidden="true"></span>
      </div>
      <div class="achievement-card__text">
        <p class="achievement-card__title">${achievement.title}</p>
        <p class="achievement-card__desc">${achievement.description}</p>
      </div>
    `;

    card.addEventListener("click", () => unlockCard(card));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        unlockCard(card);
      }
    });

    return card;
  }

  function buildCards() {
    achievements.forEach((achievement) => {
      listElement.appendChild(createCardElement(achievement));
    });
    cardsBuilt = true;
  }

  return {
    onEnter() {
      if (!cardsBuilt) buildCards();
      continueButton.addEventListener("click", handleContinueClick);
    },
    onExit() {
      continueButton.removeEventListener("click", handleContinueClick);
    },
  };
}
