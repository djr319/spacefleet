const { Vector } = require("./vector");

class Ship {
  constructor() {
    this.x;
    this.y;
    this.direction = 0;
    this.velocity = new Vector(0, 0);
    this.shield = 10;
    this.socket;
    this.user;
    this.thruster = false;
    this.width = 20;
    this.height = 40;
    this.score = 0;
    this.rank = 0;
    this.bot = false;
    this.active = false;
  }

  get size() {
    return Math.max(this.width, this.height);
  }
}

module.exports = Ship;
