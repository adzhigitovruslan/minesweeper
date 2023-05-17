import './index.html';
import "./index.scss";
import Header from './components/header';
import Main from './components/main';
import Footer from './components/footer'
let game;

class Minesweeper {
  constructor(opts = {}) {
    let loadedData = {}

    Object.assign(
      this,
      {
        grid: [], //will hold an array of Cell objects
        minesFound: 0, //number of mines correctly flagged by user
        falseMines: 0, //number of mines incorrectly flagged
        status_msg: "Playing...", //game status msg, 'Won','Lost', or 'Playing'
        playing: true,
        movesMade: 0, //keep track of the number of moves
        options: {
          rows: 10, //number of rows in the grid
          cols: 10, //number of columns in the grid
          mines: 10 //number of mines in the grid
        }
      },
      { options: opts },
      loadedData
    );

    let rows = this.options["rows"];
    let cols = this.options['cols'];

    console.log(this, rows);
  }

  addHtml() {
    const body = document.querySelector("body");
    body.append(Header, Main, Footer)
  }
}

function newGame() {
  game = new Minesweeper();
}
newGame();

game.addHtml();