const WORK_PRESETS = [25, 45, 60];
const BREAK_PRESETS = [5, 10, 15];

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

let currentMode = "work";
let totalTime = WORK_PRESETS[0] * 60;
let timeLeft = WORK_PRESETS[0] * 60;
let timerId = null;
let currentTaskItem = null;
let selectedWorkMinutes = WORK_PRESETS[0];
let selectedBreakMinutes = BREAK_PRESETS[0];

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

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

function setModeButtonState(mode) {
  if (mode === "work") {
    workBtn.classList.add("active");
    breakBtn.classList.remove("active");
  } else {
    breakBtn.classList.add("active");
    workBtn.classList.remove("active");
  }
}

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

function completeCurrentTask() {
  if (currentTaskItem) {
    currentTaskItem.classList.remove("active-task");
    currentTaskItem.classList.add("completed-task");
    currentTaskItem = null;
  }
}

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

function switchModeAfterFinish() {
  if (currentMode === "work") {
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
        alert("Work session finished! Starting break.");
      } else {
        alert("Break finished! Starting work session.");
      }

      switchModeAfterFinish();
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerId);
  timerId = null;
  statusText.textContent = "Paused.";
}

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

function addTask() {
  const text = taskInput.value.trim();

  if (!text) return;

  const li = document.createElement("li");
  li.textContent = text;

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

renderTimeButtons("work");
setModeButtonState("work");
updateDisplay();