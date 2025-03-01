export function createTimer() {
  let hours = 0;
  let minutes = 0;
  let seconds = 0;
  let timerId = null;

  function updateTimer(timerDiv) {
    seconds++;

    if (seconds === 60) {
      seconds = 0;
      minutes++;
    }

    if (minutes === 60) {
      minutes = 0;
      hours++;
    }

    timerDiv.textContent =
      (hours < 10 ? "0" + hours : hours) +
      ":" +
      (minutes < 10 ? "0" + minutes : minutes) +
      ":" +
      (seconds < 10 ? "0" + seconds : seconds);
  }

  function startTimer(timerDiv) {
    if (timerId === null) {
      timerDiv.style.display = "block";
      timerId = setInterval(() => {
        updateTimer(timerDiv);
      }, 1000);
    }
  }

  function stopTimer(timerDiv) {
    if (timerId !== null) {
      timerDiv.style.display = "none";
      clearInterval(timerId);
      timerId = null;

      hours = 0;
      minutes = 0;
      seconds = 0;
    }
  }

  return {
    startTimer,
    stopTimer,
  };
}
