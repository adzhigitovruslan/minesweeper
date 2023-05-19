export class Cell {
  constructor({
    x,
    y,
    isMine = false,
    isOpened = false,
    isFlagged = false,
    value = 0,
  }) {
    Object.assign(this, {
      x, y, isMine, isOpened, isFlagged, value,
    })
  }

  getElement() {
    const button = document.querySelector(`.button[data-x="${this.x}"][data-y="${this.y}"]`)
    return button;
  }
}