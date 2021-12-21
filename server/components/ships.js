const { Vector } = require("./vector");

class Ship {
  constructor() {
    this.x;
    this.y;
    this.direction = 0;
    this.velocity = new Vector(0, 0);
    this.strength = 5;
    this.socket;
    this.user;
    this.thruster = false;
    this.width = 20;
    this.height = 40;
  }

  get size() {
    return Math.max(this.width, this.height);
  }

}

module.exports = Ship;
