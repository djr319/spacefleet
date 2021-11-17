const { Vector } = require('./Vector');
const asteroidScale = 20;
const asteroidMaxSize = 5;
const noOfAsteroids = 20;
const biggestAsteroid = asteroidMaxSize * asteroidScale;

class Asteroid {
  constructor(x,y,v,s) {
    this.x = 0;
    this.y = 0;
    this.velocity = v || new Vector(Math.random() * 2*Math.PI, Math.random() * 40);
    this.size = s || asteroidMaxSize;
    this.strength = 5 + this.size * 5;
  }

  hit() {
    this.strength--;
    if (this.strength === 0) this.split();
  }

  split() {
    if (this.size > 3) {
      let child1 = new Asteroid(this.x, this.y, new Vector(this.velocity.angle - 0.5, 40), this.size - 1);
      let child2 = new Asteroid(this.x, this.y, new Vector(this.velocity.angle + 0.5, 40), this.size - 1);
      asteroids.push(child1, child2);
    } else {
      let child1 = new Asteroid(this.x, this.y, new Vector(Math.random()*2*Math.PI, this.velocity.size * 3), this.size - 1);
      let child2 = new Asteroid(this.x, this.y, new Vector(Math.random()*2*Math.PI, this.velocity.size * 1.5), this.size - 1);
      let child3 = new Asteroid(this.x, this.y, new Vector(Math.random()*2*Math.PI, this.velocity.size * 1.7), this.size - 1);
      let child4 = new Asteroid(this.x, this.y, new Vector(Math.random()*2*Math.PI, this.velocity.size * 1), this.size - 1);
      asteroids.push(child1, child2, child3, child4);
    }
  }
}

module.exports = {
  Asteroid,
  asteroidScale,
  asteroidMaxSize,
  noOfAsteroids,
  biggestAsteroid
}

