const { nanoid } = require('nanoid');
const bulletRange = 500;

class Bullet {
  constructor(x,y,user) {
    this.x = x;
    this.y = y;
    this.remainingRange = bulletRange;
    this.user = user;
    this.id = nanoid();
  }
}

module.exports = { Bullet, bulletRange};
