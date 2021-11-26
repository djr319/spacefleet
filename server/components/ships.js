const { Vector } = require("./vector");

class Ship {
  constructor() {
    this.x;
    this.y;
    this.direction = 0;
    this.velocity = new Vector(0, 20);
    this.alive = true;
    this.socket;
    this.user;
    this.thruster = true;
    this.width = 20;
    this.height = 40;
  }
}

module.exports = Ship;
