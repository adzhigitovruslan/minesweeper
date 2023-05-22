import './index.html';
import "./index.scss";
import { Minesweeper } from './modules/minesweeper';
import pickMp3 from './assets/pick.mp3';
import rightClick from './assets/rightClick.mp3';

let play;
let [seconds, minutes] = [0, 0, 0, 0];
let int = null;

function newGame(opts) {
  play = new Minesweeper(opts);
}

function startTimer() {
  if (int !== null) {
    clearInterval(int);
  }
  int = setInterval(displayTimer, 1000);
}

function displayTimer() {
  let timerRef = document.querySelector('#play-timer');

  seconds += 1;
  if (seconds == 60) {
    seconds = 0;
    minutes++;
    if (minutes == 60) {
      minutes = 0;
      hours++;
    }
  }

  let m = minutes < 10 ? "0" + minutes : minutes;
  let s = seconds < 10 ? "0" + seconds : seconds;

  let time = `${m} : ${s}`
  timerRef.innerHTML = time;

  play.showTime = time;

  if (!play.playing) {
    clearInterval(int);
  }
}

function resetTimer() {
  clearInterval(int);
  [seconds, minutes] = [0, 0, 0, 0];
  document.querySelector("#play-timer").textContent = '00 : 00';
}

function showSettings(event) {
  let elem = event.target
  if (elem.classList.contains("settings__close") || elem.classList.contains("settings-btn") || elem.classList.contains("background") || elem.classList.contains("block__button")) {
    const settingsPage = document.querySelector(".wrapper-settings");
    settingsPage.classList.toggle("show");
    document.body.classList.toggle('show');
  }
}

function switchTheme(event) {
  if (event.target.checked) {
    document.documentElement.setAttribute('dark-theme', 'dark');
    localStorage.setItem("theme", 'dark');
  } else {
    document.documentElement.setAttribute('dark-theme', 'light');
    localStorage.setItem("theme", 'light');
  }
}

window.onload = function () {
  newGame({ buttons: 10, mines: 10, size: "easy" })

  const radiobtn = document.querySelectorAll(".radio_input-btn")

  document.addEventListener("click", (event) => showSettings(event));

  document.querySelector(".reset").addEventListener("click", () => {
    if (hasLocalStorage) {
      localStorage.clear();
    }
    const opts = {
      mines: parseInt(document.querySelector("#input_mines").value, 10),
    }

    for (let i = 0; i < radiobtn.length; i++) {
      if (radiobtn[i].checked) {
        Object.assign(opts, {
          buttons: radiobtn[i].value,
        })
      }
      if (radiobtn[i].checked && radiobtn[i].value === '10') {
        Object.assign(opts, {
          size: "easy"
        })
      } else if (radiobtn[i].checked && radiobtn[i].value === '15') {
        Object.assign(opts, {
          size: "medium"
        })
      } else if (radiobtn[i].checked && radiobtn[i].value === '25') {
        Object.assign(opts, {
          size: "hard"
        })
      }
    }
    resetTimer()
    newGame(opts);
  });

  document.querySelector(".block__button").addEventListener("click", (event) => {
    const opts = {
      mines: parseInt(document.querySelector("#input_mines").value, 10),
    }

    for (let i = 0; i < radiobtn.length; i++) {
      if (radiobtn[i].checked) {
        Object.assign(opts, {
          buttons: radiobtn[i].value,
        })
      }
      if (radiobtn[i].checked && radiobtn[i].value === '10') {
        Object.assign(opts, {
          size: "easy"
        })
      } else if (radiobtn[i].checked && radiobtn[i].value === '15') {
        Object.assign(opts, {
          size: "medium"
        })
      } else if (radiobtn[i].checked && radiobtn[i].value === '25') {
        Object.assign(opts, {
          size: "hard"
        })
      }
    }

    if (hasLocalStorage) {
      localStorage.clear();
    }
    resetTimer();
    newGame(opts);
  })

  document.querySelector(".field").addEventListener("click", (event) => {
    const elem = event.target;

    if (play.playing) {
      startTimer()
      const gameStatus = document.querySelector("#game_status");
      play.status_msg = "Playing"
      gameStatus.textContent = play.status_msg
    }

    if (elem.classList.contains("button")) {
      const button = play.grid[elem.dataset.y][elem.dataset.x]
      if (!button.isOpened && play.playing) {
        play.movesMade++;
        document.querySelector("#moves").textContent = play.movesMade;
        play.openCell(button);
        const clickSound = new Audio(pickMp3);
        clickSound.play();
        play.saveGame();
      }
    }
  })

  document.querySelector(".field").addEventListener("contextmenu", (event) => {
    event.preventDefault();

    const elem = event.target;

    if (elem.classList.contains("button")) {
      const button = play.grid[elem.dataset.y][elem.dataset.x];

      if (!button.isOpened && play.playing) {
        play.movesMade++;
        document.querySelector("#moves").textContent = play.movesMade;
        play.placeFlag(button);
        const clickSound = new Audio(rightClick);
        clickSound.play();
        play.checkWin();
        play.saveGame()
      }
    }
  })

  const switchInput = document.querySelector(".switch__input")
  switchInput.addEventListener("change", switchTheme, false);

  const currentTheme = localStorage.getItem("theme") ? localStorage.getItem("theme") : null;

  if (currentTheme) {
    document.documentElement.setAttribute("dark-theme", currentTheme);
    currentTheme === "dark" ? switchInput.checked = true : switchInput.checked = false;
  } else {
    document.documentElement.setAttribute("dark-theme", "dark")
    if (currentTheme === 'dark') {
      switchInput.checked = true;
    }
  }
}


const hasLocalStorage = (function () {
  try {
    return "localStorage" in window && window["localStorage"] !== null;
  } catch (e) {
    return false;
  }
})();
