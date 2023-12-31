import { Cell } from './cell';
import Header from '../components/header';
import Main from '../components/main';
import Settings from '../components/settings';
import themeToggle from '../components/switch-theme/';
import Result from '../components/results';
import Footer from '../components/footer';

export class Minesweeper {
  constructor(opts) {
    let currentData = {}

    if (hasLocalStorage && localStorage["minesweeper.data"]) {
      currentData = JSON.parse(localStorage["minesweeper.data"]);
      this.currentGame = true;
    }

    Object.assign(
      this,
      {
        grid: [], //will hold an array of Cell objects
        minesFound: 0, //number of mines correctly flagged by user
        falseMines: 0, //number of mines incorrectly flagged
        status_msg: "Minesweeper", //game status msg, 'Minesweeper', 'Won','Lost', or 'Playing'
        playing: true,
        movesMade: 0, //keep track of the number of moves
        result: [],
        showTime: '',
        minutes: '',
        seconds: '',
        firstClick: false,
      },
      { options: opts },
      currentData
    );

    if (this.currentGame) {
      this.loadData();
    } else {
      this.startGame();
    }
    this.saveGame();
  }

  addHtml() {
    const body = document.querySelector("body");
    body.append(Header, Main, Settings, Footer);
    Main.prepend(Result);
    Header.appendChild(themeToggle);
    console.log(this.showFieldToConsole());
  }

  startGame() {
    for (let i = 0; i < this.options["buttons"]; i++) {
      this.grid[i] = [];
      for (let j = 0; j < this.options["buttons"]; j++) {
        this.grid[i].push(new Cell({ x: j, y: i }));
      }
    }

    this.render();
  }

  render() {
    this.addHtml();

    const field = document.querySelector(".field");
    field.setAttribute("size", this.options.size);
    field.innerHTML = '';

    for (let i = 0; i < this.options["buttons"]; i++) {
      for (let j = 0; j < this.options["buttons"]; j++) {
        let cell = this.grid[i][j];

        let newClass = [];
        let innerText = '';

        if (cell.isFlagged) {
          newClass = ["flagged"];
        } else if (cell.isOpened) {
          newClass = [`opened`, `code-${cell.value}`]
          innerText = (!cell.isMine ? cell.value || '' : '');
        }

        const button = document.createElement("button");
        button.classList.add("button");

        if (newClass) {
          newClass.forEach((el) => {
            button.classList.add(...newClass)
          })
        }

        button.textContent = innerText;
        button.setAttribute('data-x', j)
        button.setAttribute('data-y', i)
        field.appendChild(button);
      }
    }

    document.querySelector("#input_mines").value = this.options["mines"];

    const radioButtons = document.querySelectorAll(".radio_input-btn");

    for (let i = 0; i < radioButtons.length; i++) {
      switch (this.options["size"]) {
        case "easy":
          radioButtons[i].value === '10' ? radioButtons[i].checked = true : false;
          break;
        case "medium":
          radioButtons[i].value === '15' ? radioButtons[i].checked = true : false;
          break;
        case "hard":
          radioButtons[i].value === '25' ? radioButtons[i].checked = true : false;
          break;
        default:
          break;
      }
    }

    const minesLeft = document.querySelector("#mines-left");
    const moves = document.querySelector("#moves");
    const gameStatus = document.querySelector("#game_status");
    const playTimer = document.querySelector("#play-timer");

    let content = this.options.mines - (this.falseMines + this.minesFound)
    minesLeft.textContent = content > 0 ? content : 0;
    moves.textContent = this.movesMade;
    gameStatus.textContent = this.status_msg;
    playTimer.textContent = '00 : 00';
  }

  loadData() {
    for (let r = 0, r_len = this.grid.length; r < r_len; r++) {
      for (let c = 0, c_len = this.grid[r].length; c < c_len; c++) {
        this.grid[r][c] = new Cell(this.grid[r][c]);
      }
    }
    this.render();

    const ulResult = document.querySelector(".list")
    const liArr = JSON.parse(localStorage.getItem("result"));

    if (liArr) {
      for (let i = 0; i < liArr.length; i++) {
        const li = document.createElement("li")
        li.innerHTML = liArr[i]
        li.classList.add("list__item");
        ulResult.append(li)
      }
    }
  }

  getAdjacentCells(row, col) {
    let result = [];
    for (let i = row > 0 ? -1 : 0; i <= (row < this.options.buttons - 1 ? 1 : 0); i++) {
      for (let j = col > 0 ? -1 : 0; j <= (col < this.options.buttons - 1 ? 1 : 0); j++) {
        result.push(this.grid[row + i][col + j]);
      }
    }
    return result;
  }

  openCell(cell, sound) {

    if (!cell.isOpened && !cell.isFlagged && this.playing) {
      const cellElem = cell.getElement();
      cell.isOpened = true;
      cellElem.classList.add("opened", `code-${cell.value}`);
      cellElem.textContent = (!cell.isMine ? cell.value || "" : "");

      if (cell.isMine) {
        this.status_msg = "You lost!";
        this.playing = false;
        setTimeout(() => {
          sound.play();
        }, 1000);

        document.getElementById("game_status").textContent = this.status_msg;
        document.getElementById("game_status").style.color = "#EE0000";
      } else if (!cell.isFlagged && cell.value == 0 && this.firstClick) {
        const adjacentCells = this.getAdjacentCells(cell.y, cell.x);
        for (let i = 0; i < adjacentCells.length; i++) {
          this.openCell(adjacentCells[i]);
        }
      }
      if (!this.firstClick) {
        let placedMines = 0;
        while (placedMines < this.options.mines) {
          let y = Math.floor(Math.random() * this.options.buttons);
          let x = Math.floor(Math.random() * this.options.buttons);

          let button = this.grid[x][y];
          if (!button.isMine) {
            button.isMine = true;
            button.value = "M";
            placedMines++;
          }
        }

        for (let i = 0; i < this.options["buttons"]; i++) {
          for (let j = 0; j < this.options["buttons"]; j++) {
            if (!this.grid[i][j].isMine) {
              let mineCount = 0;
              let adjCell = this.getAdjacentCells(i, j);
              for (let m = adjCell.length; m--;) {
                if (adjCell[m].isMine) {
                  mineCount++
                }
              }
              this.grid[i][j].value = mineCount;
            }
          }
        }
      }
    }
    this.firstClick = true;
    console.log(this.showFieldToConsole());
  }

  placeFlag(cell) {
    if (!cell.isOpened && this.playing) {
      const cellElem = cell.getElement();
      const minesLeft = document.querySelector("#mines-left");
      minesLeft.textContent = Number(minesLeft.textContent) > 0 ? minesLeft.textContent : 0;
      if (!cell.isFlagged) {
        cell.isFlagged = true;
        cellElem.classList.add("flagged");
        minesLeft.textContent = minesLeft.textContent > 0 ? parseFloat(minesLeft.textContent) - 1 : 0;
        if (cell.isMine) {
          this.minesFound++;
        } else {
          this.falseMines++;
        }

      } else {
        cell.isFlagged = false;
        cellElem.classList.remove("flagged");
        cellElem.textContent = '';
        minesLeft.textContent = minesLeft.textContent >= this.options.mines ? this.options.mines : parseFloat(minesLeft.textContent) + 1;

        if (cell.isMine) {
          this.minesFound--;
        } else {
          this.falseMines--;
        }

      }
    } else {
      return;
    }
  }

  checkWin(sound) {
    const gameStatus = document.querySelector("#game_status");

    if (this.minesFound === this.options.mines && this.falseMines === 0) {
      this.status_msg = 'The winner !';
      this.playing = false;
      this.saveResult()
      setTimeout(() => {
        sound.play();
      }, 1000);
      gameStatus.textContent = this.status_msg;
      gameStatus.style.color = "#00c000";
    }

    let noMinesCellCount = 0
    let allCells = Math.pow(this.options.buttons, 2)
    for (let i = 0; i < this.options.buttons; i++) {
      for (let j = 0; j < this.options.buttons; j++) {
        if (this.grid[i][j].isOpened && !this.grid[i][j].isMine) {
          noMinesCellCount++;
        }
        if (allCells - this.options.mines === noMinesCellCount) {
          this.status_msg = 'The winner !';
          this.playing = false;
          this.saveResult()
          setTimeout(() => {
            sound.play();
          }, 1000);
          gameStatus.textContent = this.status_msg;
          gameStatus.style.color = "#00c000";
        }
      }
    }
    this.saveGame();
  }

  showFieldToConsole() {
    let result = '';
    for (let i = 0; i < this.grid.length; i++) {
      for (let j = 0; j < this.grid.length; j++) {
        result += this.grid[i][j].value + ' ';
      }
      result += "\n"
    }
    return result;
  }

  saveGame() {
    if (!hasLocalStorage) {
      return false
    } else {
      localStorage["minesweeper.data"] = JSON.stringify(this);
    }
  }

  saveResult() {
    const resPage = document.querySelector(".result");
    resPage.classList.add("show");
    let ulResult = document.querySelector(".list")
    const ul = ulResult.children;
    let li = document.createElement("li")
    li.classList.add("list__item");
    li.innerHTML = `<span class"list__result">${this.status_msg}</span><span class"list__time">${this.minutes} : ${this.seconds}</span>`

    if (ul.length > 10) {
      ulResult.children[10].remove();
    }
    ulResult.prepend(li);
    let arr = []

    for (let i = 0; i < ulResult.children.length; i++) {
      arr.push(ulResult.children[i].innerHTML);
    }
    localStorage.setItem("result", JSON.stringify(arr));
  }
}

const hasLocalStorage = (function () {
  try {
    return "localStorage" in window && window["localStorage"] !== null;
  } catch (e) {
    return false;
  }
})();