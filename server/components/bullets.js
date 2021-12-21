const { nanoid } = require('nanoid');

module.exports = class Bullet {
  constructor(x,y,reach,user) {
    this.x = x;
    this.y = y;
    this.reach = reach
    this.user = user;
    this.id = nanoid();
  }
}
