import './index.html';
import "./index.scss";
import { Minesweeper } from './modules/minesweeper';
import { setTimer } from './modules/setTimer';
import pickMp3 from './assets/pick.mp3';
import rightClick from './assets/rightClick.mp3';

let play;
let running = false;
let paused = false;
let delayThen;
let runTimer = null;
// start timer

function start(int) {
  if (!running) {
    running = true;
    let delay = localStorage.getItem('delay') || 0;
    let then = localStorage.getItem('then') || Date.now();
    runTimer = setInterval(() => {
      run(delay, then)
    }, 1000);

  }
};

// run
function run(delay, then) {
  // const output = document.getElementById('timer');
  const output = document.querySelector("#play-timer");
  // get output array and print

  var elapsed = Date.now() - delay - then
  var d = [60000, 1000];
  var time = [];
  var i = 0;

  while (i < d.length) {
    var t = Math.floor(elapsed / d[i]);

    // remove parsed time for next iteration
    elapsed -= t * d[i];

    // add '0' prefix to m,s,d when needed
    t = (i >= 0 && t < 10) ? '0' + t : t;
    time.push(t);
    i++;
  }

  play.minutes = time[0]
  play.seconds = time[1]
  output.innerHTML = `${time[0]} : ${time[1]}`

  localStorage.setItem("minutes", time[0]);
  localStorage.setItem("seconds", time[1]);
  localStorage.setItem("delay", delay);
  localStorage.setItem("then", then);
  localStorage.setItem("isTimer", JSON.stringify(true));
};

// clear
function reset() {
  const output = document.getElementById('play-timer');
  running = false;
  clearInterval(runTimer);
  output.innerHTML = '00 : 00';
  localStorage.setItem("minutes", 0);
  localStorage.setItem("seconds", 0);
  localStorage.setItem("isTimer", false);
};


function newGame(opts) {
  play = new Minesweeper(opts);
}

function showSettings(event) {
  let elem = event.target
  if (elem.classList.contains("settings__close") || elem.classList.contains("settings-btn") || elem.classList.contains("background") || elem.classList.contains("block__button")) {
    const settingsPage = document.querySelector(".wrapper-settings");
    settingsPage.classList.toggle("show");
    document.body.classList.toggle('show');
  }
  if (elem.classList.contains("result__close")) {
    const resultPage = document.querySelector(".result")
    resultPage.classList.remove("show");
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
      localStorage.removeItem("minesweeper.data");
      localStorage.removeItem("seconds");
      localStorage.removeItem("minutes");
      localStorage.removeItem("then");
      localStorage.removeItem("delay");
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

    document.getElementById("game_status").style.color = "var(--textcolor)";

    reset()
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
    reset()
    newGame(opts);
  })

  document.querySelector(".field").addEventListener("click", (event) => {
    const elem = event.target;
    if (play.playing) {
      start()
      const gameStatus = document.querySelector("#game_status");
      play.status_msg = "Playing"
      gameStatus.textContent = play.status_msg
    }

    if (elem.classList.contains("button")) {
      const button = play.grid[elem.dataset.y][elem.dataset.x]
      if (!button.isOpened && !button.isFlagged && play.playing) {
        play.movesMade++;
        document.querySelector("#moves").textContent = play.movesMade;
        play.openCell(button);
        const clickSound = new Audio(pickMp3);
        clickSound.play();
        play.checkWin();
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

  if (JSON.parse(localStorage.getItem("isTimer") === "true")) {
    let sec = localStorage.getItem("seconds")
    let min = localStorage.getItem("minutes")
    document.querySelector("#play-timer").innerHTML = `${min} : ${sec}`
    start()
  }

}


const hasLocalStorage = (function () {
  try {
    return "localStorage" in window && window["localStorage"] !== null;
  } catch (e) {
    return false;
  }
})();
