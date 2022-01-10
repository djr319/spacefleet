const { nanoid } = require('nanoid');

module.exports = class Bullet {
  constructor(x,y,user) {
    this.x = x;
    this.y = y;
    this.range = 200;
    this.user = user;
    this.id = nanoid();
  }
}
