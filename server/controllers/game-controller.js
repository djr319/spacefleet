const {
  asteroids,
  bullets,
  explosions,
  ships,
  users,
  scores
} = require('../models/storage');

const { Vector } = require ( '../components/vector');
const { Asteroid, asteroidScale, asteroidMaxSize, noOfAsteroids, biggestAsteroid } = require ( '../components/asteroids');
const Ship = require ( '../components/ships');
// // const { User } = require ( '../components/users');
// // const { Bullet } = require ( '../components/bullets');
//   require('./socket-controller.js'); // ./socket-controller');

// // ---------------   Variables  --------------- //

const fieldX = 5000;
const fieldY = 5000;

const fieldBuffer = Math.max(50, biggestAsteroid); // buffer width to avoid spawning anything too close to edge of field
if (fieldBuffer > 0.5 * Math.min(fieldX, fieldY)) { console.warn("fieldBuffer too large") };


function game() {
  console.log('Game started');
  gameLoop();
};
const fps = 1; // 60
function gameLoop() {

  // updateShips();
  updateAsteroids();
  // updateBullets();

  // calculateCollisions();
  // updateScores();
  setTimeout(gameLoop, 1000 / fps);
}

function joinGame(username, socketId) {
  let newShip = new Ship();
  newShip.x = randomX();
  newShip.y = randomY();
  newShip.alive = true;
  newShip.user = username;
  newShip.socket = socketId;

  // check for proximity of asteroids
  if (distToNearestObj(newShip, 400).collision === true) warp(400);
  newShip.velocity = new Vector(3 / 2 * Math.PI, 20);
  return newShip;
}

function warp(ship, buffer) {
  do {
    ship.x = randomX();
    ship.y = randomY();
  }
  while (distToNearestObj(buffer).collision === true)
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

// function updateShips() {
    // ships.forEach((ship) => {
  //     if (ship.alive = true) {
  //       updateShip();
  //     }
    // });
// }

// };

function spawnAsteroids(offscreen = false) {
  while (asteroids.length < noOfAsteroids) {
    let newAsteroid = new Asteroid(randomX(), randomY());
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

    // push asteroids to storage !
  })
}

function randomX() {
  // returns a random x value on the field
  return fieldBuffer + Math.floor(Math.random() * (fieldX - 2 * fieldBuffer));
}

function randomY() {
  // returns a random y value on the field
  return fieldBuffer + Math.floor(Math.random() * (fieldY - 2 * fieldBuffer));
}
module.exports = { game, joinGame };
