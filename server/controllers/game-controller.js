let gameLoopInterval;
let updatesPerSecond = 10; // 60
// (change to 0.1 if no ships)

const { Vector } = require('../components/vector')
const {
  asteroids,
  bullets,
  ships,
  users,
  scores,
  obituries,
  broadcasts
} = require('../models/storage');

const {
  Asteroid,
  asteroidScale,
  asteroidMaxSize,
  noOfAsteroids,
  biggestAsteroid
} = require('../components/asteroids');

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
  initServer();
  console.log('update rate: ', updatesPerSecond);
  gameLoop();
};

function initServer() {
  asteroids.splice(0,asteroids.length);
  spawnAsteroids();
  bullets.splice(0,bullets.length);
  ships.splice(0, ships.length);
  // broadcasts.push(["boot","all"]);
  console.log('Server initialized');
}

function gameLoop() {
  checkEmptyShipList();
  updateAsteroids();
  checkShipAsteroidCollisions();
  checkShipCollisions();
  updateBullets();
  // checkShots();
  checkOutOfBounds();
  // updateScores();
  setTimeout(gameLoop, 1000 / updatesPerSecond);
}

function checkEmptyShipList() {
  if (ships.length === 0 && updatesPerSecond > 1) {
    updatesPerSecond = 0.5;
    console.log('SHIP LIST IS EMPTY. Update rate: ', updatesPerSecond);
  } else if (ships.length > 0 && updatesPerSecond < 1) {
    updatesPerSecond = 10;
    console.log('GAME ON! Update rate: ', updatesPerSecond);
  }
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
  newShip.velocity = new Vector(1 / 2 * Math.PI, 20);
  ships.push(newShip);
  console.table(ships);
  return newShip;
}

function warp(ship, buffer = WARP_BUFFER) {
  do {
    ship.x = randomX();
    ship.y = randomY();
  } while (!freeSpace(ship, buffer))
  console.log('warped ', ship.socket);
}

function freeSpace(ship, buffer) {
  console.log("checking freespace");
  if (buffer < Math.min(
    distToNearestAsteroid(ship),
    distToNearestShip(ship)[0],
  )) {
    return true;
  }
  return false;
}

function checkShipAsteroidCollisions() {

  ships.forEach((ship) => {
    if (distToNearestAsteroid(ship) < 0) {
      console.log('hit asteroid!');
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
  });
  return nearestDist;
}

function distToNearestShip(thisShip) {
  let nearestDist = Infinity;
  let nearestShip = {};

  ships.forEach((ship) => {
    if (ship === thisShip) return;
    let dist = Math.sqrt((thisShip.x - ship.x) ** 2 + (thisShip.y - ship.y) ** 2) - ship.size;
    if (dist < nearestDist) {
      nearestDist = dist;
      nearestShip = ship;
    }
  });
  return [nearestDist, nearestShip];
}

// function checkEnemyHit() {
//   // ship / bullet collision detection
//   bullets.forEach((bullet, bulletIndex) => {
//     ships.forEach((ship, shipIndex) => {
//       let distance = Math.sqrt((bullet.x - ship.x) ** 2 + (bullet.y - ship.y) ** 2) - ship.size;
//       if (distance < 0) {
//         ship.shield--;
//         if (ship.shields < 1) {
//           // ship has been killed
//           die(shipIndex);
//           // add score to the one shooting
//           users[bullet.owner].score += score.killEnemy;
//           explosions.push(new Explosion(bullet.x, bullet.y, ship.velocity));
//           ships.splice(shipIndex,1);
//         } else {
//           users[bullet.owner].score += score.hurtEnemy;
//         }
//         bullets.splice(bulletIndex, 1);
//       }
//     });
//   });
// }

function checkShipCollisions() {
  let collisionList = [];
  ships.forEach((ship) => {
    if (distToNearestShip(ship)[0] < 0) {
      collisionList.push(ship);
    }
    });
    collisionList.forEach((ship) => {
      die(ship);
  });
}

function checkOutOfBounds() {
  ships.forEach((ship) => {
    if (ship.x < 0 || ship.x > fieldX || ship.y < 0 || ship.y > fieldY) {
      die(ship);
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
    el.x = el.x + el.velocity.x / updatesPerSecond;
    el.y = el.y + el.velocity.y / updatesPerSecond;

    // asteroids going off-field re-enter on the other side
    if (el.x < -asteroidMaxSize * asteroidScale) el.x = fieldX + asteroidMaxSize * asteroidScale;
    if (el.x > fieldX + asteroidMaxSize * asteroidScale) el.x = - asteroidMaxSize * asteroidScale;
    if (el.y < -asteroidMaxSize * asteroidScale) el.y = fieldY + asteroidMaxSize * asteroidScale;
    if (el.y > fieldY + asteroidMaxSize * asteroidScale) el.y = - asteroidMaxSize * asteroidScale;
  })
}

function updateBullets() {

  bullets.forEach((bullet) => {
    bullet.x = bullet.x + bullet.velocity.x / updatesPerSecond;
    bullet.y = bullet.y + bullet.velocity.y / updatesPerSecond;
    // check bullet range
  });
}

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
    ships.splice(ships.indexOf(ship), 1);
  }
}

module.exports = { game, joinGame, warp, updatesPerSecond, fieldX, fieldY };
