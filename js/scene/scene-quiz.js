import { quizQuestions, scoreComments } from "../data/quiz-data.js";

/**
 * @param {{ onFinished?: () => void }} handlers
 * @returns {{ onEnter: () => void, onExit: () => void }}
 */
export function createQuizScene({ onFinished } = {}) {
  const progressElement = document.getElementById("quiz-progress");
  const cardElement = document.getElementById("quiz-card");

  let currentIndex = 0;
  let answers = [];

  function resetQuiz() {
    currentIndex = 0;
    answers = new Array(quizQuestions.length).fill(null);
    renderQuestion();
  }

  function renderQuestion() {
    const question = quizQuestions[currentIndex];
    const isLastQuestion = currentIndex === quizQuestions.length - 1;
    const selectedIndex = answers[currentIndex];

    progressElement.textContent = `Soal ${currentIndex + 1}/${quizQuestions.length}`;

    cardElement.innerHTML = `
      <p class="quiz-question">${question.question}</p>
      <div class="quiz-options">
        ${question.options
          .map(
            (option, index) => `
              <button
                type="button"
                class="quiz-option ${selectedIndex === index ? "is-selected" : ""}"
                data-index="${index}"
              >
                ${option}
              </button>
            `
          )
          .join("")}
      </div>
      <button type="button" class="cta-button quiz-next" id="quiz-next" ${
        selectedIndex === null ? "disabled" : ""
      }>
        ${isLastQuestion ? "Lihat Hasil" : "Selanjutnya"}
      </button>
    `;

    cardElement.querySelectorAll(".quiz-option").forEach((button) => {
      button.addEventListener("click", () => {
        answers[currentIndex] = Number(button.dataset.index);
        renderQuestion();
      });
    });

    document.getElementById("quiz-next").addEventListener("click", () => {
      if (answers[currentIndex] === null) return;

      if (isLastQuestion) {
        renderResults();
      } else {
        currentIndex += 1;
        renderQuestion();
      }
    });
  }

  function renderResults() {
    const score = answers.reduce((total, answer, index) => {
      return total + (answer === quizQuestions[index].correctIndex ? 1 : 0);
    }, 0);

    progressElement.textContent = "Hasil Kuis";

    const breakdownItems = quizQuestions
      .map((question, index) => {
        const isCorrect = answers[index] === question.correctIndex;
        return `
          <li class="quiz-result-item ${isCorrect ? "is-correct" : "is-wrong"}">
            <span class="quiz-result-item__icon" aria-hidden="true">${isCorrect ? "✓" : "✕"}</span>
            <span>${question.question}</span>
          </li>
        `;
      })
      .join("");

    cardElement.innerHTML = `
      <p class="quiz-score">${score}/${quizQuestions.length}</p>
      <p class="quiz-score-comment">${scoreComments[score] ?? ""}</p>
      <ul class="quiz-result-list">${breakdownItems}</ul>
      <button type="button" class="cta-button" id="quiz-continue">Lanjut</button>
    `;

    document.getElementById("quiz-continue").addEventListener("click", () => {
      onFinished?.();
    });
  }

  return {
    onEnter() {
      resetQuiz();
    },
    onExit() {
      // Konten di-generate ulang total tiap onEnter lewat resetQuiz(),
      // jadi listener lama otomatis lepas bareng elemen lama dibuang.
    },
  };
}
