const { colorize } = require('./colorize');

const DEFAULT_FIELD_WIDTH = process.stdout.columns - 3; // X-axis
const DEFAULT_FIELD_HEIGHT = process.stdout.rows - 4; // Y-axis
const DEFAULT_POPULATION_SPREAD = 0.4;
const CELL_SYMBOL = 'O';
const NO_COLOR = !!process.argv.find((arg) => arg === 'NO_COLOR');
const DEFAULT_DECISION_FUNCTION = (s) => {
  const amIAlive = s[4] === CELL_SYMBOL;
  const aliveNeighbours = s.split(CELL_SYMBOL).length - 1 - amIAlive;
  if (aliveNeighbours <= 1 || aliveNeighbours >=4) {
    return ' ';
  };
  if (!amIAlive && aliveNeighbours === 3) {
    return CELL_SYMBOL;
  }
  return s[4];
}

class Field {
  constructor(width, height) {
    this.width = width || process.env.FIELD_WIDTH || DEFAULT_FIELD_WIDTH;
    this.height = height || process.env.FIELD_HEIGHT || DEFAULT_FIELD_HEIGHT;
    this.field = Array.from({ length: this.width }, () => (
      Array.from({ length: this.height }, () => Math.random() >= DEFAULT_POPULATION_SPREAD ? ' ' : CELL_SYMBOL)
    ));
    this.dead = false;
    this.balanced = false;
    this.decisionFunction = DEFAULT_DECISION_FUNCTION;
    this.epoch = 0;
    this.colorMap = {
      0: 'default',
      1: 'default',
      2: 'blue',
      3: 'cyan',
      4: 'green',
      5: 'yellow',
      6: 'magenta',
      7: 'crimson',
      8: 'red',
      9: 'white',
    }
  }

  chooseColor(surroundings) {
    const aliveNeighbours = surroundings.split(CELL_SYMBOL).length - 1;
    return this.colorMap[aliveNeighbours];
  }

  display() {
    console.clear();
    let displayString = ' ' + ''.padStart(this.width, '_') + '\n';
    for (let i = 0; i < this.height; i++) {
      displayString += '|';
      for (let j = 0; j < this.width; j++) {
        if (NO_COLOR || this.field[j][i] === ' ') {
          displayString += this.field[j][i];
        } else {
          const surroundings = this.getSurroundingsString(j, i);
          const color = this.chooseColor(surroundings);
          displayString += `${colorize(this.field[j][i], color)}`;
        }
      }
      displayString += '|\n';
    }
    displayString += '|' + ''.padStart(this.width, '_') + '|';
    console.log(displayString);
    console.log(`epoch #${this.epoch}|dead = ${+this.dead}|balanced = ${+this.balanced}${this.dead || this.balanced ? "|end state :)": ""}`);
  }

  getCell(x, y) {
    return x < this.width && x >= 0 && y < this.height && y >= 0 ? this.field[x][y] : ' ';
  }


  update(x, y) {
    const surroundings = this.getSurroundingsString(x, y);
    return this.decisionFunction(surroundings);
  }
  /**
    |012|
    |345| <-- 4 = (x,y)
    |678|
    to
    '012345678'
  */
  getSurroundingsString(x, y) {
    let surroundings = '';

    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        surroundings += this.getCell(x+j,y+i);
      }
    }

    return surroundings;
  }

  iterate() {
    const newField = JSON.parse(JSON.stringify(this.field)); //deep copy for dummies, fockoff
    let updated = false;
    let dead = true;
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        const update = this.update(i, j);
        updated = updated || update !== newField[i][j];
        dead = dead && update === ' ';
        newField[i][j] = update;
      }
    }
    this.field = newField;
    this.dead = dead;
    this.balanced = !updated;
    this.epoch++;
  }

  async iterateUntilDead() {
    const delay = 30;
    setTimeout(() => {
      if (!this.dead && !this.balanced) {
        this.iterate();
        this.display();
        setTimeout(() => this.iterateUntilDead(), delay);
      }
    }, delay)
  }
}

const defaultField = new Field();
defaultField.display();
defaultField.iterateUntilDead();
