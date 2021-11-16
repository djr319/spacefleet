// ---------------   Imports  --------------- //
const { socketRouter } = require('./socket-controller');
import { Vector, Entity } from './Vector';
const { Asteroid, asteroids, asteroidScale, asteroidMaxSize, noOfAsteroids, biggestAsteroid } = require('../components/asteroids');
const { Ship, ships } = require ('../components/ships')
const { User, users } = require ('../components/user')
const { Bullet, bullets, explosions } = require ('../components/bullets')


// ---------------   Variables  --------------- //
const fps = 1; // 60
const fieldX = 5000;
const fieldY = 5000;

const fieldBuffer = Math.max(50, biggestAsteroid); // buffer width to avoid spawning anything too close to edge of field
if (fieldBuffer > 0.5 * Math.min(fieldX, fieldY)) { console.warn("fieldBuffer too large") };

// ---------------   Game --------------- //

console.log('Game started');
setInterval(() => { console.log("Still here " + new Date().getMinutes() );}, 10000);
gameLoop();

function gameLoop() {
  // receiveData();
  updatePositions();
  // transmitData();
  setInterval(gameLoop, 1000 / fps);
}

function receiveData() {

 };
function transmitData() {

 };

let scoreTable = {
  5: 50,
  4: 100,
  3: 200,
  2: 300,
  1: 500,
  'hurtEnemy': 1000,
  'killEnemy': 5000
}

function JoinGame(userName, socketId) {
  let newShip = new Ship();
  newShip.x = randomX();
  newShip.y = randomY();
  newShip.alive = true;
  newShip.user = userName;
  newShip.socket = socketId;

  // check for proximity of asteroids
  if (distToNearestObj(newShip, 400).collision === true) warp(400);
  newShip.velocity = new Vector(3/2*Math.PI, 20);
}

function distToNearestObj(ship, buffer = 0) {
  let nearestDist = Infinity;
  let nearestObj = new Asteroid;
  asteroids.forEach((asteroid) => {
    let dist = Math.sqrt((ship.x - asteroid.x) ** 2 + (ship.y - asteroid.y) ** 2) - asteroid.size * asteroidScale - ship.size / 2;
    if (dist < nearestDist) {
      nearestObj = asteroid;
      nearestDist = dist
    }
  });
  let collision = nearestDist - buffer < 0 ? true : false;
  return {
    collision,
    nearestObj,
    // nearestDist
  }
}

function warp(ship, buffer) {
  do {
    ship.x = randomX();
    ship.y = randomY();
  }
  while (distToNearestObj(buffer).collision === true)
}

// -----------    functions: calculate positions    ------------------//

function updatePositions() {
  ships.forEach((ship) => {
    if (ship.alive = true) {
      updateShip();
    }
  });
  updateAsteroids();
  // updateBullets();
  // updateExplosion();
};

function spawnAsteroids(offscreen = false) {
  while (asteroids.length < noOfAsteroids) {
    let newAsteroid = new Asteroid();
    if (offscreen = true) {
      newAsteroid.x = -asteroidMaxSize * asteroidScale;
    }
    asteroids.push(newAsteroid);
  }
}

function updateAsteroids() {
  spawnAsteroids();
  asteroids.forEach((el, index) => {
    if (el.strenth = 0) {
      el.split();
      asteroids.splice(index, 1);
    }

    // move
    el.x = el.x + el.velocity.x / fps;
    el.y = el.y + el.velocity.y / fps;

    // asteroids going off-field re-enter on the other side
    if (el.x < -asteroidMaxSize * asteroidScale) el.x = fieldX + asteroidMaxSize * asteroidScale;
    if (el.x > fieldX + asteroidMaxSize * asteroidScale) el.x = - asteroidMaxSize * asteroidScale;
    if (el.y < -asteroidMaxSize * asteroidScale) el.y = fieldY + asteroidMaxSize * asteroidScale;
    if (el.y > fieldY + asteroidMaxSize * asteroidScale) el.y = - asteroidMaxSize * asteroidScale;
  })
}

function updateBullets() {

  bullets.forEach((bullet) => {
    bullet.x = bullet.x + bullet.velocity.x / fps;
    bullet.y = bullet.y + bullet.velocity.y / fps;
    checkAsteroidHit();
    checkEnemyHit();
  });
}

function checkEnemyHit() {
  // ship / bullet collision detection
  bullets.forEach((bullet, bulletIndex) => {
    ships.forEach((ship, shipIndex) => {
      let distance = Math.sqrt((bullet.x - ship.x) ** 2 + (bullet.y - ship.y) ** 2) - ship.size;
      if (distance < 0) {
        ship.shield--;
        if (ship.shields < 1) {
          // ship has been killed
          die(shipIndex);
          // add score to the one shooting
          users[bullet.owner].score += score.killEnemy;
          explosions.push(new Explosion(bullet.x, bullet.y, ship.velocity));
          ships.splice(shipIndex,1);
        } else {
          users[bullet.owner].score += score.hurtEnemy;
        }
        bullets.splice(bulletIndex, 1);
      }
    });
  });
}

function checkAsteroidHit() {
  // asteroid / bullet collision detection
  bullets.forEach((bullet, bulletIndex) => {
  asteroids.forEach((asteroid, asteroidIndex) => {

    let distance = Math.sqrt((bullet.x - asteroid.x) ** 2 + (bullet.y - asteroid.y) ** 2) - asteroid.size * asteroidScale;
    if (distance < 0) {
      myStatus.score = myStatus.score + scoreTable[asteroid.size];
      if (asteroid.size === 1) {
        explosions.push(new Explosion(bullet.x, bullet.y, asteroid.velocity));
        asteroids.splice(asteroidIndex,1);
        bullets.splice(bulletIndex, 1);
      } else {
        asteroid.hit();
        if (asteroid.strength === 0) asteroids.splice(asteroidIndex, 1);
        explosions.push(new Explosion(bullet.x, bullet.y, asteroid.velocity));
      }
      bullets.splice(bulletIndex, 1);
    };
  });
});
};

function randomX() {
  // returns a random x value on the field
  return fieldBuffer + Math.floor(Math.random() * (fieldX - 2 * fieldBuffer));
}

function randomY() {
    // returns a random y value on the field
  return fieldBuffer + Math.floor(Math.random() * (fieldY - 2 * fieldBuffer));
}
