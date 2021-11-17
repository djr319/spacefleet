class Ship {
  constructor() {
    this.x;
    this.y;
    this.direction = 0;
    this.alive = true;
    this.socket;
    this.user;
    this.thruster = true;
  }
}

module.exports = Ship;
