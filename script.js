const WORK_PRESETS = [25, 45, 60];
const BREAK_PRESETS = [5, 10, 15];
const THEME_STORAGE_KEY = "preferred-theme";

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

const taskInput = document.getElementById("task-input");
const addTaskBtn = document.getElementById("add-task-btn");
const taskList = document.getElementById("task-list");
const themeToggleBtn = document.getElementById("theme-toggle");

let currentMode = "work";
let totalTime = WORK_PRESETS[0] * 60;
let timeLeft = WORK_PRESETS[0] * 60;
let timerId = null;
let currentTaskItem = null;
let selectedWorkMinutes = WORK_PRESETS[0];
let selectedBreakMinutes = BREAK_PRESETS[0];

// Plays an alaram when timer finish
function playAlarm() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const audioContext = new AudioCtx();
  const oscillator = audioContext.createOscillator();

  oscillator.type = "sine";
  oscillator.frequency.value = 880;
  oscillator.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.35);
  oscillator.onended = () => audioContext.close();
}

// Dark mode
function applyTheme(theme) {
  const isDarkMode = theme === "dark";
  document.body.classList.toggle("dark-mode", isDarkMode);
  themeToggleBtn.textContent = isDarkMode ? "Light mode" : "Dark mode";
}

// Theme 
function initializeTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const prefersDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const startingTheme = savedTheme || (prefersDarkMode ? "dark" : "light");
  applyTheme(startingTheme);
}

// Seconds into minutes:seconds
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

// Timer and progress ring
function updateDisplay() {
  timerDisplay.textContent = formatTime(timeLeft);
  const progressPercent = ((totalTime - timeLeft) / totalTime) * 100;
  const circle = document.querySelector(".progress-ring-circle");
const radius = 100;
const circumference = 2 * Math.PI * radius;

circle.style.strokeDasharray = circumference;

const offset = circumference - (timeLeft / totalTime) * circumference;
circle.style.strokeDashoffset = offset;
}

// Highlight the selected button
function setModeButtonState(mode) {
  if (mode === "work") {
    workBtn.classList.add("active");
    breakBtn.classList.remove("active");
  } else {
    breakBtn.classList.add("active");
    workBtn.classList.remove("active");
  }
}

// Select the preset time
function renderTimeButtons(mode) {
  timeOptionsContainer.innerHTML = "";

  const presets = mode === "work" ? WORK_PRESETS : BREAK_PRESETS;
  const selectedMinutes = mode === "work" ? selectedWorkMinutes : selectedBreakMinutes;

  presets.forEach((minutes) => {
    const button = document.createElement("button");

    button.textContent = `${minutes} min`;
    button.className = "time-btn";

    if (minutes === selectedMinutes) {
      button.classList.add("active-time");
    }

    button.addEventListener("click", () => {
      document.querySelectorAll(".time-btn").forEach((btn) => {
        btn.classList.remove("active-time");
      });

      button.classList.add("active-time");

      clearInterval(timerId);
      timerId = null;

      if (mode === "work") {
        selectedWorkMinutes = minutes;
      } else {
        selectedBreakMinutes = minutes;
      }

      totalTime = minutes * 60;
      timeLeft = minutes * 60;

      statusText.textContent = `${mode} timer set for ${minutes} minutes`;
      updateDisplay();
    });

    timeOptionsContainer.appendChild(button);
  });
}

// Set the mode to either work or break
function setMode(mode) {
  clearInterval(timerId);
  timerId = null;

  currentMode = mode;
  setModeButtonState(mode);

  if (mode === "work") {
    totalTime = selectedWorkMinutes * 60;
    timeLeft = selectedWorkMinutes * 60;
    statusText.textContent = "Ready to focus?";
  } else {
    totalTime = selectedBreakMinutes * 60;
    timeLeft = selectedBreakMinutes * 60;
    statusText.textContent = "Time for a break.";
  }

  renderTimeButtons(mode);
  updateDisplay();
}

// Marks the currently active task as completed
function completeCurrentTask() {
  if (currentTaskItem) {
    currentTaskItem.classList.remove("active-task");
    currentTaskItem.classList.add("completed-task");
    currentTaskItem = null;
  }
}

// When task is done, go to next
function selectNextAvailableTask() {
  const nextTask = document.querySelector("#task-list li:not(.completed-task)");
  if (nextTask) {
    document.querySelectorAll("#task-list li").forEach((item) => {
      item.classList.remove("active-task");
    });

    nextTask.classList.add("active-task");
    currentTaskItem = nextTask;
  }
}

// When session ends, switch to either break or work mode 
function switchModeAfterFinish() {
  if (currentMode === "work") {
    pomodoroCount++;
    pomodoroDisplay.textContent = pomodoroCount;
    completeCurrentTask();
    selectNextAvailableTask();
    currentMode = "break";
    document.body.classList.add("break-mode");
    setModeButtonState("break");
    totalTime = selectedBreakMinutes * 60;
    timeLeft = selectedBreakMinutes * 60;
    renderTimeButtons("break");
    statusText.textContent = "Work finished. Break started.";
  } else {
    currentMode = "work";
    document.body.classList.remove("break-mode");
    setModeButtonState("work");
    totalTime = selectedWorkMinutes * 60;
    timeLeft = selectedWorkMinutes * 60;
    renderTimeButtons("work");
    statusText.textContent = "Break finished. Back to work.";
  }

  updateDisplay();
  startTimer();
}

// Countdown timer
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
      playAlarm();

      const message =
        currentMode === "work"
          ? "Work session finished! Starting break."
          : "Break finished! Starting work session.";

      setTimeout(() => {
        alert(message);
      }, 400);

      switchModeAfterFinish();
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

  if (currentMode === "work") {
    totalTime = selectedWorkMinutes * 60;
    timeLeft = selectedWorkMinutes * 60;
    statusText.textContent = "Ready to focus?";
  } else {
    totalTime = selectedBreakMinutes * 60;
    timeLeft = selectedBreakMinutes * 60;
    statusText.textContent = "Time for a break.";
  }

  updateDisplay();
}

// Add new task to list
function addTask() {
  const text = taskInput.value.trim();

  if (!text) return;

  const li = document.createElement("li");
  const taskText = document.createElement("span");
  const deleteBtn = document.createElement("button");
  taskText.textContent = text;
  deleteBtn.textContent = "✕";
  deleteBtn.className = "delete-task-btn";

    taskText.addEventListener("click", () => {
    if (li.classList.contains("completed-task")) return;

    document.querySelectorAll("#task-list li").forEach((item) => {
      item.classList.remove("active-task");
    });

    li.classList.add("active-task");
    currentTaskItem = li;
  });

  deleteBtn.addEventListener("click", () => {
    if (currentTaskItem === li) {
      currentTaskItem = null;
    }
    li.remove();
  });
  li.textContent = text;

  li.appendChild(deleteBtn);
  taskList.appendChild(li);

  li.addEventListener("click", () => {
    if (li.classList.contains("completed-task")) return;

    document.querySelectorAll("#task-list li").forEach((item) => {
      item.classList.remove("active-task");
    });

    li.classList.add("active-task");
    currentTaskItem = li;
  });

  taskList.appendChild(li);

  if (!currentTaskItem) {
    li.classList.add("active-task");
    currentTaskItem = li;
  }

  taskInput.value = "";
}

setCustomBtn.addEventListener("click", () => {
  const minutes = Number(customMinutesInput.value);

  if (!minutes || minutes < 1) return;

  clearInterval(timerId);
  timerId = null;

  document.querySelectorAll(".time-btn").forEach((btn) => {
    btn.classList.remove("active-time");
  });

  if (currentMode === "work") {
    selectedWorkMinutes = minutes;
  } else {
    selectedBreakMinutes = minutes;
  }

  totalTime = minutes * 60;
  timeLeft = minutes * 60;

  statusText.textContent = `${currentMode} timer set for ${minutes} minutes`;
  updateDisplay();

  customMinutesInput.value = "";
});

addTaskBtn.addEventListener("click", addTask);

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);

workBtn.addEventListener("click", () => {
  currentMode = "work";
  setMode("work");
});

breakBtn.addEventListener("click", () => {
  currentMode = "break";
  setMode("break");
});

themeToggleBtn.addEventListener("click", () => {
  const isDarkMode = document.body.classList.contains("dark-mode");
  const nextTheme = isDarkMode ? "light" : "dark";
  localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  applyTheme(nextTheme);
});

initializeTheme();
renderTimeButtons("work");
setModeButtonState("work");
updateDisplay();
//Coffee counter
let coffeeCount = 0;
const maxCoffee = 8;

const coffeeBtn = document.getElementById("coffee-btn");
const coffeeDisplay = document.getElementById("coffee-display");
const coffeeProgress = document.getElementById("coffee-progress-bar");
coffeeBtn.addEventListener("click", () => {

  coffeeCount++;

  const coffee = document.createElement("span");
  coffee.textContent = "☕";

  coffeeDisplay.appendChild(coffee);

  const percent = (coffeeCount / maxCoffee) * 100;
  coffeeProgress.style.width = percent + "%";
});

let pomodoroCount = 0;
const pomodoroDisplay = document.getElementById("pomodoro-count");
