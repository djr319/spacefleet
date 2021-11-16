
const Vector = require('./Vector');
const ships = [];

class Ship {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.velocity = new Vector(0, 0);
    this.direction = 0;
    this.width = 20;
    this.height = 40;
    this.thruster = true;
    this.shields = 10;
    this.user;
    this.socket;
  }

  get size() {
    return Math.max(this.width, this.height);
  }
}

export {
  Ship,
  ships
};
