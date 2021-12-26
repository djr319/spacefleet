const { nanoid } = require('nanoid');

class Explosion {
  constructor(x, y, v) {
    this.x = x;
    this.y = y;
    this.velocity = v;
    this.start = -5;
    // this.end = 15;
    // this.size = this.start;
    this.id = nanoid();
  }
}

module.exports = Explosion;
