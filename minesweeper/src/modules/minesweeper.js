import { Cell } from './cell';
import Header from '../components/header';
import Main from '../components/main';
import Footer from '../components/footer';
import Settings from '../components/settings';

export class Minesweeper {
  constructor(opts) {
    let currentData = {}

    // if (isLocalStorage && localStorage["minesweeper.data"]) {
    //   currentData = JSON.parse(localStorage["minesweeper.data"]);
    //   this.currentGame = true;
    // }

    Object.assign(
      this,
      {
        grid: [], //will hold an array of Cell objects
        minesFound: 0, //number of mines correctly flagged by user
        falseMines: 0, //number of mines incorrectly flagged
        status_msg: "Playing", //game status msg, 'Won','Lost', or 'Playing'
        playing: true,
        movesMade: 0, //keep track of the number of moves
      },
      { options: opts },
      currentData
    );

    // if (isNaN(this.options["mines"])) {
    //   this.options["mines"] = 10;
    // }
    // if (this.options["mines"] < 0) {
    //   this.options["mines"] = 1;
    // } else if (
    //   this.options["mines"] >
    //   this.options["rows"] * this.options["cols"]
    // ) {
    //   this.options["mines"] = this.options["rows"] * this.options["cols"];
    // }

    if (this.currentGame) {
      this.loadData();
    } else {
      this.startGame();
    }
    // this.saveGame();
  }

  addHtml() {
    const body = document.querySelector("body");
    body.append(Header, Main, Footer, Settings);
    console.log(this.showFieldToConsole());
  }

  startGame() {
    for (let i = 0; i < this.options["buttons"]; i++) {
      this.grid[i] = [];
      for (let j = 0; j < this.options["buttons"]; j++) {
        this.grid[i].push(new Cell({ x: j, y: i }));
      }
    }


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

        let newClass = '';
        let innerText = '';

        if (cell.isFlagged) {
          newClass = "flagged";
        } else if (cell.isOpened) {
          newClass = `opened ${cell.value}`;
          innerText = (!cell.isMine ? cell.value || '' : '');
        }

        const button = document.createElement("button");
        button.classList.add("button");

        if (newClass) button.classList.add(newClass)
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
    const totalMines = document.querySelector("#totalMines");
    const gameStatus = document.querySelector("#game_status");
    const playTimer = document.querySelector("#play-timer");

    minesLeft.textContent = this.options.mines - (this.falseMines + this.minesFound)
    moves.textContent = this.movesMade;
    gameStatus.textContent = this.status_msg;
    totalMines.textContent = this.options.mines;
    playTimer.textContent = '00:00';
  }

  loadData() {
    for (let r = 0, r_len = this.grid.length; r < r_len; r++) {
      for (let c = 0, c_len = this.grid[r].length; c < c_len; c++) {
        this.grid[r][c] = new Cell(this.grid[r][c]);
      }
    }

    this.render();
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

  openCell(cell) {
    if (!cell.isOpened && !cell.isFlagged && this.playing) {
      const cellElem = cell.getElement();
      cell.isOpened = true;
      cellElem.classList.add("opened", `code-${cell.value}`);
      cellElem.textContent = (!cell.isMine ? cell.value || "" : "");

      if (cell.isMine) {
        this.status_msg = "Sorry, you lost!";
        this.playing = false;
        document.getElementById("game_status").textContent = this.status_msg;
        document.getElementById("game_status").style.color = "#EE0000";
      } else if (!cell.isFlagged && cell.value == 0) {
        const adjacentCells = this.getAdjacentCells(cell.y, cell.x);
        for (let i = 0; i < adjacentCells.length; i++) {
          this.openCell(adjacentCells[i]);
        }
      }
    }
  }

  placeFlag(cell) {
    if (!cell.isOpened && this.playing) {
      const cellElem = cell.getElement();
      console.log(cellElem);
      const minesLeft = document.querySelector("#mines-left");

      if (!cell.isFlagged) {
        cell.isFlagged = true;
        cellElem.classList.add("flagged");
        minesLeft.textContent = parseFloat(minesLeft.textContent) - 1;

        if (cell.isMine) {
          this.minesFound++;
        } else {
          this.falseMines++;
        }

      } else {
        cell.isFlagged = false;
        cellElem.classList.remove("flagged");
        cellElem.textContent = '';
        minesLeft.textContent = parseFloat(minesLeft.textContent) + 1;

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

  checkWin() {
    const gameStatus = document.querySelector("#game_status");

    if (this.minesFound === this.options.mines && this.falseMines === 0) {
      this.status_msg = 'You are the winner !';
      this.playing = false;
      gameStatus.textContent = this.status_msg;
      gameStatus.style.color = "#00c000";
    } else {
      this.status_msg = "You lose!";
      this.playing = false;
      gameStatus.textContent = this.status_msg;
      gameStatus.style.color = '#ee0000';
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


  // saveGame() {
  //   if (!isLocalStorage) {
  //     return false
  //   } else {
  //     localStorage["minesweeper.data"] = JSON.stringify(this);
  //   }
  // }
}