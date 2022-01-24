const { Vector } = require('./Vector');
const { asteroids, garbageCollectionList } = require('../models/storage');
const asteroidScale = 20;
const asteroidMaxSize = 5;
const noOfAsteroids = 10;
const biggestAsteroid = asteroidMaxSize * asteroidScale;
const { nanoid } = require('nanoid');

class Asteroid {
  constructor(x, y, v, s) {
    this.x = x;
    this.y = y;
    this.velocity = v || new Vector(Math.random() * 2 * Math.PI, Math.random() * 40);
    this.size = s || asteroidMaxSize;
    this.strength = 5 + this.size * 5;
    this.id = nanoid();
  }
}

module.exports = {
  Asteroid,
  asteroidScale,
  asteroidMaxSize,
  noOfAsteroids,
  biggestAsteroid
}

