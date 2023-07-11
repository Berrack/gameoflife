const DEFAULT_FIELD_WIDTH = process.stdout.columns - 3; // X-axis
const DEFAULT_FIELD_HEIGHT = process.stdout.rows - 4; // Y-axis
const DEFAULT_POPULATION_SPREAD = 0.5;
const DEFAULT_DECISION_FUNCTION = (s) => {
  const amIAlive = s[4] === '*';
  const aliveNeighbours = s.split('*').length - 1 - amIAlive;
  if (aliveNeighbours <= 1 || aliveNeighbours >=4) {
    return ' ';
  };
  if (!amIAlive && aliveNeighbours === 3) {
    return '*';
  }
  return s[4];
}

"123".replace()

function sleep(ms = 5) {
  return new Promise(r => setTimeout(r, ms));
}

class Field {
  constructor(width, height) {
    this.width = width || process.env.FIELD_WIDTH || DEFAULT_FIELD_WIDTH;
    this.height = height || process.env.FIELD_HEIGHT || DEFAULT_FIELD_HEIGHT;
    this.field = Array.from({ length: this.width }, () => (
      Array.from({ length: this.height }, () => Math.random() >= DEFAULT_POPULATION_SPREAD ? ' ' : '*')
    ));
    this.dead = false;
    this.balanced = false;
    this.decisionFunction = DEFAULT_DECISION_FUNCTION;
    this.epoch = 0;
  }

  display() {
    console.clear();
    let displayString = ' ' + ''.padStart(this.width, '_') + '\n';
    for (let i = 0; i < this.height; i++) {
      displayString += '|';
      for (let j = 0; j < this.width; j++) {
        displayString += this.field[j][i];
      }
      displayString += '|\n';
    }
    console.log(displayString);
    console.log(`epoch #${this.epoch}|dead = ${+this.dead}|balanced = ${+this.balanced}${this.dead || this.balanced ? "|end state, press Enter to exit :)": ""}`);
  }

  getCell(x, y) {
    return x < this.width && x >= 0 && y < this.height && y >= 0 ? this.field[x][y] : ' ';
  }

  /**
    |012|
    |345| <-- 4 = (x,y)
    |678|
  */
  update(x, y) {
    // console.log(x, y);
    let surroundings = '';
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        surroundings += this.getCell(x+j,y+i);
      }
    }
    return this.decisionFunction(surroundings);
  }

  iterate() {
    const newField = JSON.parse(JSON.stringify(this.field));
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
    const delay = 100;
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
