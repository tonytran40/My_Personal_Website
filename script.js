const WORK_PRESETS = [25, 45, 60];
const BREAK_PRESETS = [5, 10, 15];

// DOM Elements
const timerDisplay = document.getElementById("timer");
const statusText = document.getElementById("status");
const progressBar = document.getElementById("progress-bar");

const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const resetBtn = document.getElementById("reset-btn");

const workBtn = document.getElementById("work-btn");
const breakBtn = document.getElementById("break-btn");

const customMinutesInput = document.getElementById("custom-minutes");
const setCustomBtn = document.getElementById("set-custom-btn");

const timeOptionsContainer = document.getElementById("time-options");

let currentMode = "work";
let totalTime = WORK_PRESETS[0] * 60;
let timeLeft = WORK_PRESETS[0] * 60;
let timerId = null;

// Format seconds into mm:ss
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

// Update timer display
function updateDisplay() {
  timerDisplay.textContent = formatTime(timeLeft);

  const progressPercent = ((totalTime - timeLeft) / totalTime) * 100;
  progressBar.style.width = `${Math.max(progressPercent, 0)}%`;
}

// Create preset buttons dynamically
function renderTimeButtons(mode) {
  timeOptionsContainer.innerHTML = "";

  const presets = mode === "work" ? WORK_PRESETS : BREAK_PRESETS;

  presets.forEach((minutes, index) => {
    const button = document.createElement("button");

    button.textContent = `${minutes} min`;
    button.className = "time-btn";

    if (index === 0) {
      button.classList.add("active-time");
    }

    button.addEventListener("click", () => {
      clearInterval(timerId);
      timerId = null;

      totalTime = minutes * 60;
      timeLeft = minutes * 60;

      statusText.textContent = `${mode} timer set for ${minutes} minutes`;

      updateDisplay();
    });

    timeOptionsContainer.appendChild(button);
  });
}

// Switch between work and break mode
function setMode(mode) {
  clearInterval(timerId);
  timerId = null;

  currentMode = mode;

  if (mode === "work") {
    document.body.classList.remove("break-mode");
    workBtn.classList.add("active");
    breakBtn.classList.remove("active");

    statusText.textContent = "Ready to focus.";
  } else {
    document.body.classList.add("break-mode");
    workBtn.classList.remove("active");
    breakBtn.classList.add("active");

    statusText.textContent = "Time for a break.";
  }

  renderTimeButtons(mode);

  const defaultMinutes = mode === "work" ? WORK_PRESETS[0] : BREAK_PRESETS[0];

  totalTime = defaultMinutes * 60;
  timeLeft = defaultMinutes * 60;

  updateDisplay();
}

// Start timer
function startTimer() {
  if (timerId) return;

  statusText.textContent =
    currentMode === "work"
      ? "Focus time in progress..."
      : "Break time in progress...";

  timerId = setInterval(() => {
    timeLeft--;

    updateDisplay();

    if (timeLeft <= 0) {
      clearInterval(timerId);
      timerId = null;

      if (currentMode === "work") {
        statusText.textContent = "Work session finished!";
        alert("Pomodoro complete! Take a break.");
      } else {
        statusText.textContent = "Break finished!";
        alert("Break over! Back to work.");
      }
    }
  }, 1000);
}

// Pause timer
function pauseTimer() {
  clearInterval(timerId);
  timerId = null;
  statusText.textContent = "Paused.";
}

// Reset timer
function resetTimer() {
  clearInterval(timerId);
  timerId = null;

  const defaultMinutes =
    currentMode === "work" ? WORK_PRESETS[0] : BREAK_PRESETS[0];

  totalTime = defaultMinutes * 60;
  timeLeft = defaultMinutes * 60;

  statusText.textContent =
    currentMode === "work" ? "Ready to focus." : "Time for a break.";

  updateDisplay();
}

// Custom minutes
setCustomBtn.addEventListener("click", () => {
  const minutes = Number(customMinutesInput.value);

  if (!minutes || minutes < 1) {
    statusText.textContent = "Enter a valid number of minutes.";
    return;
  }

  clearInterval(timerId);
  timerId = null;

  totalTime = minutes * 60;
  timeLeft = minutes * 60;

  statusText.textContent = `Timer set for ${minutes} minutes`;

  updateDisplay();

  customMinutesInput.value = "";
});

// Event listeners
workBtn.addEventListener("click", () => setMode("work"));
breakBtn.addEventListener("click", () => setMode("break"));

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);

// Initialize page
renderTimeButtons("work");
updateDisplay();