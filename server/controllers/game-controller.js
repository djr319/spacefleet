let gameLoopInterval;
const FPS = 10; // 60
// (change to 0.1 if no ships)

const {
  asteroids,
  bullets,
  explosions,
  ships,
  users,
  scores,
  obituries
} = require('../models/storage');

const { Vector } = require('../components/vector');
const { Asteroid, asteroidScale, asteroidMaxSize, noOfAsteroids, biggestAsteroid } = require('../components/asteroids');
const Ship = require('../components/ships');
// const Explosion = require('../components/explosions');
// const { Bullet } = require ( '../components/bullets');

// ---------------   Variables  --------------- //

const fieldX = 5000;
const fieldY = 5000;

const fieldBuffer = Math.max(50, biggestAsteroid); // buffer width to avoid spawning anything too close to edge of field
if (fieldBuffer > 0.5 * Math.min(fieldX, fieldY)) { console.warn("fieldBuffer too large") };

const SPAWN_BUFFER = 400;
const WARP_BUFFER = 100;

// let scoreTable = {
//   5: 50,
//   4: 100,
//   3: 200,
//   2: 300,
//   1: 500,
//   'hurtEnemy': 1000,
//   'killEnemy': 5000
// }

function game() {
  console.log('Game started');
  spawnAsteroids();
  gameLoopInterval = setInterval(gameLoop, 1000 / FPS);
};

function gameLoop() {
  updateAsteroids();
  checkCollisions();
  updateBullets();
  // checkShots();
  checkShipCollisions();
  // updateScores();
}

function joinGame(username, socketId) { // from socket
  // spawn ship
  let newShip = new Ship();
  newShip.x = 100 // randomX();
  newShip.y = 100 // randomY();
  newShip.user = username;
  newShip.socket = socketId;

  // check for proximity of asteroids & ships
  // while (!freeSpace(newShip)) {
  //   warp(newShip, SPAWN_BUFFER);
  // };
  // newShip.velocity = new Vector(3 / 2 * Math.PI, 20);
  ships.push(newShip);
  console.table(ships);
  return newShip;
}

function warp(ship, buffer = WARP_BUFFER) {
  console.log('warped ', ship.socket);
  do {
    ship.x = randomX();
    ship.y = randomY();
  }
  while (!freeSpace(ship, buffer))
}

function freeSpace(ship, buffer) {

  if (buffer < Math.min(
    distToNearestAsteroid(ship),
    distToNearestShip(ship),
  )) {
    return true;
  }
  return false;
}

function checkCollisions() {

  ships.forEach((ship) => {
    if (distToNearestAsteroid(ship) < 0) {
      console.log('hit asteroid!');
      die(ship);
    }

    if (distToNearestShip(ship) < 0) {
      console.log('collision!');
      die(ship);
    }
  })
}

function distToNearestAsteroid(ship) {

  let nearestDist = Infinity;

  asteroids.forEach((asteroid) => {
    let dist = Math.sqrt((ship.x - asteroid.x) ** 2 + (ship.y - asteroid.y) ** 2) - asteroid.size * asteroidScale - ship.size / 2 - 0.5 * (ship.size - asteroid.size);
    if (dist < nearestDist) {
      nearestDist = dist;
    }
    if (nearestDist < 200) {
      console.log("closure: ", nearestDist - 0.5 * (ship.size - asteroid.size));
    }
  });
  return nearestDist;
}

function distToNearestShip(thisShip) {
  let nearestDist = Infinity;

  ships.forEach((ship) => {
    if (ship === thisShip) return Infinity;
    let dist = Math.sqrt((thisShip.x - ship.x) ** 2 + (thisShip.y - ship.y) ** 2) - ship.size;
    if (dist < nearestDist) {
      nearestDist = dist;
    }
  });
  return nearestDist;
}

function checkShipCollisions() {
  ships.forEach(() => {
    if (distToNearestShip < 0) {
      // kill both ships
    }
  });
}

function checkShots() {
  // checkAsteroidHit();
  // checkEnemyHit();
}

function spawnAsteroids(offscreen = false) {
  while (asteroids.length < noOfAsteroids) {
    let newAsteroid = new Asteroid(randomX(), randomY());
    if (offscreen === true) {
      newAsteroid.x = -fieldBuffer; // spawn just offscreen
    }
    asteroids.push(newAsteroid);
  }
}

function updateAsteroids() {
  spawnAsteroids(true);
  asteroids.forEach((el, index) => {
    if (el.strenth = 0) {
      el.split();
      asteroids.splice(index, 1);
    }

    // move
    el.x = el.x + el.velocity.x / FPS;
    el.y = el.y + el.velocity.y / FPS;

    // asteroids going off-field re-enter on the other side
    if (el.x < -asteroidMaxSize * asteroidScale) el.x = fieldX + asteroidMaxSize * asteroidScale;
    if (el.x > fieldX + asteroidMaxSize * asteroidScale) el.x = - asteroidMaxSize * asteroidScale;
    if (el.y < -asteroidMaxSize * asteroidScale) el.y = fieldY + asteroidMaxSize * asteroidScale;
    if (el.y > fieldY + asteroidMaxSize * asteroidScale) el.y = - asteroidMaxSize * asteroidScale;
  })
}

function updateBullets() {

  bullets.forEach((bullet) => {
    bullet.x = bullet.x + bullet.velocity.x / FPS;
    bullet.y = bullet.y + bullet.velocity.y / FPS;
    // check bullet range

  });
}

// function updateExplosions() {
//   if (explosions.length !== 0) {
//    explosions.forEach((exp, index) => {
//       exp.x = exp.x + exp.velocity.x / FPS;
//       exp.y = exp.y + exp.velocity.y / FPS;
//       exp.size = exp.size + 1;
//       if (exp.size > exp.end) {
//         explosions.splice(index, 1);
//       }
//     });
//   }
// }

function randomX() {
  // returns a random x value on the field
  return fieldBuffer + Math.floor(Math.random() * (fieldX - 2 * fieldBuffer));
}

function randomY() {
  // returns a random y value on the field
  return fieldBuffer + Math.floor(Math.random() * (fieldY - 2 * fieldBuffer));
}

function die(ship) {
  if (obituries.indexOf(ship) === -1) {
    obituries.push(ship);
    console.log("a death has occured");
    // explosions.push(newExplosion);
    ships.splice(ships.indexOf(ship), 1);
  }
}

function resetAll() {
  clearInterval(gameLoopInterval);
  asteroids.splice(0,asteroids.length);
  bullets.splice(0,bullets.length);
  explosions.splice(0, explosions.length);
  io.sockets.emit("boot", "everyone!");
  ships.splice(0, ships.length);
  game();
}

module.exports = { game, joinGame, warp, randomX, randomY, resetAll, die, FPS, fieldX, fieldY };
