const slides = Array.from(document.querySelectorAll(".slide"));
const counter = document.querySelector(".counter");
const progress = document.querySelector(".progress-bar");
const buttons = document.querySelectorAll("[data-action]");

let current = 0;

function renderSlide(index) {
  current = (index + slides.length) % slides.length;

  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle("is-active", slideIndex === current);
  });

  const humanIndex = String(current + 1).padStart(2, "0");
  const total = String(slides.length).padStart(2, "0");
  counter.textContent = `${humanIndex} / ${total}`;
  progress.style.width = `${((current + 1) / slides.length) * 100}%`;
}

function goNext() {
  renderSlide(current + 1);
}

function goPrev() {
  renderSlide(current - 1);
}

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.action;
    if (action === "next") goNext();
    if (action === "prev") goPrev();
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") {
    event.preventDefault();
    goNext();
  }

  if (event.key === "ArrowLeft" || event.key === "PageUp") {
    event.preventDefault();
    goPrev();
  }

  if (event.key === "Home") {
    renderSlide(0);
  }

  if (event.key === "End") {
    renderSlide(slides.length - 1);
  }
});

renderSlide(0);
