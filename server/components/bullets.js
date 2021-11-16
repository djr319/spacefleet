const Vector = require('./Vector');

const bullets = [];
const explosions = [];

class Bullet extends Entity {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.velocity = new Vector(0, 0);
    this.originX = 0;
    this.originY = 0;
    this.reach = Math.min(viewportWidth / 1.5, viewportHeight / 1.5, 600);
    this.owner;
  }
}

export {
  Bullet,
  bullets,
  explosions
};
