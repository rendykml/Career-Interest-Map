let currentQuestion = Number(localStorage.getItem("currentQuestion")) || 0;

const answers = JSON.parse(localStorage.getItem("answers")) || {};

const scores = JSON.parse(localStorage.getItem("scores")) || {
  realistic: 0,
  investigative: 0,
  artistic: 0,
  social: 0,
  enterprising: 0,
  conventional: 0,
};

const container = document.getElementById("question-container");

const nextBtn = document.getElementById("nextBtn");

const prevBtn = document.getElementById("prevBtn");

const progressText = document.getElementById("progress-text");

const progressPercent = document.getElementById("progress-percent");

const progressBar = document.getElementById("progress-bar");

function renderQuestion() {
  const section = sections[currentQuestion];

  const percent = Math.round(((currentQuestion + 1) / sections.length) * 100);

  progressText.innerText = `Section ${currentQuestion + 1} dari ${sections.length}`;

  progressPercent.innerText = `${percent}%`;

  progressBar.style.width = `${percent}%`;

  container.innerHTML = `

    <div class="flex flex-col gap-lg w-full max-w-3xl">

      ${section
        .map(
          (item, index) => `

        <div
          class="question-card w-full bg-surface-container-lowest rounded-xl p-lg shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-outline-variant/30 flex flex-col gap-lg items-center text-center transition-all duration-500"
        >

          <div class="flex flex-col gap-md">

            <h1 class="font-h3 text-h2 text-on-surface leading-tight px-md">
              ${item.question}
            </h1>

          </div>

          <div class="w-full max-w-xl py-4 px-2">

            <div
              class="flex justify-between items-start gap-xs md:gap-md"
            >

              ${generateOption(index, 1, "Sangat Tidak Setuju")}
              ${generateOption(index, 2, "Tidak Setuju")}
              ${generateOption(index, 3, "Ragu-Ragu")}
              ${generateOption(index, 4, "Setuju")}
              ${generateOption(index, 5, "Sangat Setuju")}

            </div>

          </div>

        </div>

      `,
        )
        .join("")}

    </div>

  `;

  container.classList.remove("opacity-70", "scale-[0.98]");

  addOptionListener();

  prevBtn.disabled = currentQuestion === 0;
}

function generateOption(questionIndex, value, label) {
  return `

    <button
      data-question="${questionIndex}"
      data-value="${value}"
      class="answer-btn scale-option flex flex-col items-center gap-sm group transition-all w-full"
    >

      <div
        class="scale-circle w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-outline flex items-center justify-center font-h3 text-on-surface transition-all"
      >
        ${value}
      </div>

      <span
        class="text-caption font-label-bold text-on-surface-variant opacity-60 group-hover:opacity-100"
      >
        ${label}
      </span>

    </button>

  `;
}

function addOptionListener() {
  const buttons = document.querySelectorAll(".answer-btn");

  const currentAnswers = {};

  Object.keys(answers).forEach((key) => {
    const [sectionIndex, questionIndex] = key.split("-");

    if (Number(sectionIndex) === currentQuestion) {
      currentAnswers[questionIndex] = answers[key].answer;

      const selectedButton = document.querySelector(
        `[data-question="${questionIndex}"][data-value="${answers[key].answer}"]`,
      );

      if (selectedButton) {
        selectedButton.classList.add("active");
      }
    }
  });

  const totalQuestions = sections[currentQuestion].length;

  if (Object.keys(currentAnswers).length === totalQuestions) {
    nextBtn.disabled = false;
  } else {
    nextBtn.disabled = true;
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const questionIndex = button.dataset.question;

      const selectedValue = Number(button.dataset.value);

      const item = sections[currentQuestion][questionIndex];

      document
        .querySelectorAll(`[data-question="${questionIndex}"]`)
        .forEach((btn) => {
          btn.classList.remove("active");
        });

      button.classList.add("active");

      if (currentAnswers[questionIndex]) {
        scores[item.type] -= currentAnswers[questionIndex];
      }

      currentAnswers[questionIndex] = selectedValue;

      scores[item.type] += selectedValue;

      // simpan ke answers
      answers[`${currentQuestion}-${questionIndex}`] = {
        question: item.question,
        type: item.type,
        answer: selectedValue,
      };

      // simpan localStorage
      localStorage.setItem("answers", JSON.stringify(answers));

      localStorage.setItem("scores", JSON.stringify(scores));

      localStorage.setItem("currentQuestion", currentQuestion);

      // cek apakah semua soal terjawab
      const totalQuestions = sections[currentQuestion].length;

      const answeredQuestions = Object.keys(currentAnswers).length;

      if (answeredQuestions === totalQuestions) {
        nextBtn.disabled = false;
      }
    });
  });
}

nextBtn.addEventListener("click", () => {
  container.classList.add("opacity-70", "scale-[0.98]");

  setTimeout(() => {
    container.classList.remove("opacity-70", "scale-[0.98]");

    currentQuestion++;

    localStorage.setItem("currentQuestion", currentQuestion);

    if (currentQuestion < sections.length) {
      renderQuestion();

      // Scroll ke atas
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } else {
      showResult();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, 300);
});

prevBtn.addEventListener("click", () => {
  if (currentQuestion > 0) {
    container.classList.add("opacity-70", "scale-[0.98]");

    setTimeout(() => {
      container.classList.remove("opacity-70", "scale-[0.98]");

      currentQuestion--;

      renderQuestion();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 300);
  }
});

function showResult() {
  localStorage.setItem("finalScores", JSON.stringify(scores));
  localStorage.setItem("finalAnswers", JSON.stringify(answers));

  // Reset agar kalau buka test lagi mulai dari awal
  localStorage.setItem("currentQuestion", 11);

  window.location.href = "result.html";
}

renderQuestion();
