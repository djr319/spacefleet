// ---------------   imports  --------------- //

const { nanoid } = require('nanoid');
const { Vector } = require('../components/vector');
const {
  asteroids,
  bullets,
  ships,
  obituries,
  broadcasts,
  explosions,
  garbageCollectionList,
} = require('../models/storage');

const {
  Asteroid,
  asteroidScale,
  noOfAsteroids,
  biggestAsteroid
} = require('../components/asteroids');

const Ship = require('../components/ships');

// ---------------   Variables  --------------- //

const fieldX = 5000;
const fieldY = 5000;
const fieldBuffer = Math.max(50, biggestAsteroid); // buffer width to avoid spawning anything too close to edge of field
if (fieldBuffer > 0.5 * Math.min(fieldX, fieldY)) {
  console.warn('fieldBuffer too large')
}
let updatesPerSecond = 1;
const idleRefresh = 1;
const fullRefresh = 60;

const SPAWN_BUFFER = 400;
const WARP_BUFFER = 100;

let currentPlayers = 0;
let maxPlayers = 25;
let minPlayers = 7;
let scoreTable = {
  5: 50,
  4: 100,
  3: 200,
  2: 300,
  1: 500,
  'hurtEnemy': 1000,
  'killEnemy': 5000
}

function game() {
  initServer();
  gameLoop();
}

function initServer() {
  updatesPerSecond = fullRefresh;
  asteroids.splice(0, asteroids.length);
  spawnAsteroids();
  bullets.splice(0, bullets.length);
  broadcasts.push(['boot', 'all']);
  ships.splice(0, ships.length);
  console.log('Server initialized');
  manageBots();
  setBotScores();
  debugReport();
}

function debugReport() {
  // setInterval(() => {
    // console.table(ships);
    // console.log('No of users: ', noOfPlayers());
    // console.table(ships, ['user','bot', 'score']);
  // }, 10000);
}

function serverSpeed() {
  let users = noOfPlayers();
  if (users === 0 && updatesPerSecond != idleRefresh) {
    updatesPerSecond = idleRefresh;
    console.log('server spinning down, update rate: ', updatesPerSecond);

  } else if (users > 0 && updatesPerSecond != fullRefresh) {
    updatesPerSecond = fullRefresh;
    console.log('server spinning up, update rate: ', updatesPerSecond);
  }
}

function gameLoop() {
  updateAsteroids();
  updateBullets();
  updateShips();
  checkShipAsteroidCollisions();
  checkShipCollisions();
  checkShots();
  checkOutOfBounds();
  rankByScore();
  setTimeout(gameLoop, 1000 / updatesPerSecond);
}

function joinGame(username, socketId) { // called from socket
  let newShip = initShip();
  newShip.user = username;
  newShip.socket = socketId;
  serverSpeed();
  return newShip;
}

function initShip() {
  let newShip = new Ship();
  getSafePosition(newShip, SPAWN_BUFFER);
  newShip.direction = randomAngle();
  let vectorAngle = newShip.direction - 1 / 2 * Math.PI;
  vectorAngle = vectorAngle < 0 ? vectorAngle + 2 * Math.PI : vectorAngle;
  newShip.velocity = new Vector(vectorAngle, 20);
  ships.push(newShip);
  return newShip;
}

function warp(ship) {
  ship.score = ship.score - 1000; // a negative score is checked in
  getSafePosition(ship);
}

function getSafePosition(ship, buffer = WARP_BUFFER) {
  ship.x = randomX();
  ship.y = randomY();

  if (buffer > Math.min(
    distToNearestAsteroid(ship),
    distToNearestShip(ship),
  )) {
    getSafePosition(ship, buffer)
  }
}

function checkOutOfBounds() {
  ships.forEach((ship) => {
    if (ship.x < 0 || ship.x > fieldX || ship.y < 0 || ship.y > fieldY) {
      die(ship);
    }
  });
}

function updateShips() {
  controlBots();
  moveBots();
  applyGravity();
}

// ---------------   Bots  --------------- //

function noOfPlayers() {
  let realUsers = ships.filter(ship => ship.bot === false );
  return realUsers.length;
}

function manageBots() {
  let usersOnline = noOfPlayers();
  switch (true) {
    case usersOnline > maxPlayers - 2:
      killBot();
      break;
    case ships.length < minPlayers:
      spawnBots(minPlayers - ships.length);
  }
  setTimeout(() => {
    manageBots();
  }, 5000 + Math.random() * 25000);
}

function spawnBots(quantity) {
  for (let i = 0; i < quantity; i++) {
    let newBot = initShip();
    newBot.bot = true;
    getBotName(newBot);
    console.log('spawn: ', newBot.user);

  }
}

function killBot() {
  let poorBot = ships.indexOf((bot) => { bot.bot === true });
  if (poorBot !== -1) {
    poorBot.velocity.angle = 0;
    poorBot.velocity.size = 0;
    die(poorBot);
  }
}

function setBotScores() {
  let bots = ships.filter((ship) => ship.bot === true );
  bots.forEach(bot => {
    bot.score = 100 * Math.floor(Math.random() * 100)
  });
}

function getBotName(bot) {
  bot.user = 'bot_' + Math.floor(Math.random() * 99);
  bot.socket = nanoid();
}

function controlBots() {
  let bots = ships.filter(ship => ship.bot === true);
  bots = bots.filter(ship => ship.active === false);
  bots.forEach(bot => {
    bot.active = true;
    let burnDelay = Math.random() * 2000;
    let burnDuration = Math.random() * 1000;
    let coastTime = Math.random() * 10000;

    turnBot(bot);

    setTimeout(() => {
      bot.thruster = true;
      let vectorAngle = bot.direction - 1 / 2 * Math.PI;
      vectorAngle = vectorAngle < 0 ? vectorAngle + 2 * Math.PI : vectorAngle;
      bot.velocity.add(new Vector(vectorAngle, 200));

      setTimeout(() => {
        bot.thruster = false;

        setTimeout(() => {
          bot.active = false;
        }, coastTime);

      }, burnDuration);

    }, burnDelay);
  });
}

function moveBots() {
  let bots = ships.filter(ship => ship.bot === true);

  bots.forEach(bot => {

    if (bot.thruster === false) {
      bot.velocity.size *= 0.998;
    }

    // move
    bot.x = bot.x + bot.velocity.x / updatesPerSecond;
    bot.y = bot.y + bot.velocity.y / updatesPerSecond;

    // wall collision: vector to push away from walls
    switch (true) {
      case bot.x < bot.size / 2:
        bot.velocity = new Vector(0, 20);
        bot.thruster === false;
        break;

      case bot.x > fieldX - bot.size / 2:
        bot.velocity = new Vector(Math.PI, 20);
        bot.thruster === false
        break;

      case bot.y < bot.size / 2:
        bot.velocity = new Vector(Math.PI * 0.5, 20);
        bot.thruster === false
        break;

      case bot.y > fieldY - bot.size / 2:
        bot.velocity = new Vector(Math.PI * 1.5, 20);
        bot.thruster === false
        break;
    }
  });
}

function turnBot(bot) {
  let botRotationRate = 8 / updatesPerSecond;
  let targetAngle = randomAngle(); // 0 - 2*PI
  let difference = targetAngle - bot.direction;

  if (difference < -Math.PI || difference > Math.PI) {
    // anticlockwise
    difference = Math.abs(difference);
    while (difference >= botRotationRate) {
      bot.direction = bot.direction - botRotationRate;
      if (bot.direction < 0) bot.direction = 2 * Math.PI;
      difference = Math.abs(targetAngle - bot.direction);
    }

  } else {
    // clockwise
    difference = Math.abs(difference);
    while (difference >= botRotationRate) {
      bot.direction = bot.direction + botRotationRate;
      if (bot.direction > 2 * Math.PI) bot.direction = 0;
      difference = Math.abs(targetAngle - bot.direction);
    }
  }
}

function checkShipAsteroidCollisions() {
  ships.forEach((ship) => {
    if (distToNearestAsteroid(ship) < 0) {
      die(ship);
    }
  })
}

function applyGravity() {
  ships.forEach((ship) => {
    let gravity = new Vector();

    asteroids.forEach((asteroid) => {
      let gravityComponent = new Vector();
      gravityComponent.angle = bearing(asteroid, ship);

      let gravitySettings = {
        min: 0,
        max: 4,
        multiple: 400,
        proximityFactor: 0.85
      }

      let grav =
        gravitySettings.multiple * asteroid.size / (
          (ship.x - asteroid.x) ** 2
          + (ship.y - asteroid.y) ** 2
          - asteroid.size * asteroidScale
          - ship.size / 2 - 0.5
          * (ship.size - asteroid.size)
        ) ** gravitySettings.proximityFactor;

      gravityComponent.size = bracket(gravitySettings.min, grav, gravitySettings.max);
      gravity.add(gravityComponent);
    });

    broadcasts.push(['gravity', {
      ship: ship.socket,
      gravity: {
        angle: gravity.angle,
        size: gravity.size
      }
    }]);
  });
}

function distToNearestAsteroid(ship) {
  return nearestAsteroid(ship).dist;
}

function nearestAsteroid(ship) {
  let nearestDist = Infinity;
  let nearestAst;

  asteroids.forEach((asteroid) => {
    let dist = distanceBetween(ship, asteroid) - asteroid.size * asteroidScale - ship.size / 2 - 0.5 * (ship.size - asteroid.size);
    if (dist < nearestDist) {
      nearestDist = dist;
      nearestAst = asteroid.id;
    }
  });

  return {
    id: nearestAst,
    dist: nearestDist
  }
}

function distToNearestShip(ship) {
  return nearestShip(ship).dist;
}

function nearestShip(thisShip) {
  let nearestDist = Infinity;
  let nearestShip = {};

  ships.forEach((ship) => {
    if (ship === thisShip) return;
    let dist = distanceBetween(thisShip, ship);

    if (dist < nearestDist) {
      nearestDist = dist;
      nearestShip = ship;
    }
  });

  return {
    dist: nearestDist,
    ship: nearestShip
  };
}

function checkShots() {
  checkAsteroidHit();
  checkEnemyHit();
}

function checkAsteroidHit() {
  // asteroid / bullet collision detection
  bullets.forEach((bullet, bulletIndex) => {
    asteroids.forEach((asteroid) => {

      if (clearance(bullet, asteroid) < 0) {
        explosions.push({
          x: bullet.x,
          y: bullet.y,
          angle: asteroid.velocity.angle,
          size: asteroid.velocity.size
        });

        if (asteroid.size === 1) {
          addToScore(bullet.user, asteroid.size);
          removeAsteroid(asteroid);
        } else {
          asteroid.strength--;

          if (asteroid.strength === 0) {
            addToScore(bullet.user, asteroid.size);
            splitAsteroid(asteroid);
          }
        }
        bullets.splice(bulletIndex, 1);
      }
    });
  });
}

function splitAsteroid(asteroid) {
  if (asteroid.size > 3) {
    let child1 = new Asteroid(asteroid.x, asteroid.y, new Vector(asteroid.velocity.angle - 0.5, 40), asteroid.size - 1);
    let child2 = new Asteroid(asteroid.x, asteroid.y, new Vector(asteroid.velocity.angle + 0.5, 40), asteroid.size - 1);
    asteroids.push(child1, child2);
  } else if (asteroid.size > 1) {
    let child1 = new Asteroid(asteroid.x, asteroid.y, new Vector(randomAngle(), asteroid.velocity.size * 3), asteroid.size - 1);
    let child2 = new Asteroid(asteroid.x, asteroid.y, new Vector(randomAngle(), asteroid.velocity.size * 1.5), asteroid.size - 1);
    let child3 = new Asteroid(asteroid.x, asteroid.y, new Vector(randomAngle(), asteroid.velocity.size * 1.7), asteroid.size - 1);
    let child4 = new Asteroid(asteroid.x, asteroid.y, new Vector(randomAngle(), asteroid.velocity.size * 1), asteroid.size - 1);
    asteroids.push(child1, child2, child3, child4);
  }

  removeAsteroid(asteroid);
}

function removeAsteroid(asteroid) {
  let i = asteroids.indexOf(asteroid);
  asteroids.splice(i, 1);
  garbageCollectionList.push(asteroid);
}

function clearance(bullet, asteroid) {
  return Math.sqrt((bullet.x - asteroid.x) ** 2 + (bullet.y - asteroid.y) ** 2) - asteroid.size * asteroidScale;
}

function checkEnemyHit() {
  bullets.forEach((bullet, bulletIndex) => {

    ships.forEach((ship) => {
      if (ship.socket === bullet.user) return;

      // replace with checkDistance f()
      let distance = Math.sqrt((bullet.x - ship.x) ** 2 + (bullet.y - ship.y) ** 2) - ship.size;
      if (distance < ship.size) {
        ship.shield--;
        // transmit to ship
        if (ship.shield < 1) {
          die(ship);
          addToScore(bullet.user, 'killEnemy');
        } else {
          addToScore(bullet.user, 'hurtEnemy');
        }
        bullets.splice(bulletIndex, 1);
      }
    });
  });
}

function addToScore(userSocket, points) {
  let shooter = ships.find((ship) => {
    return ship.socket === userSocket;
  });

  if (shooter !== undefined) {
    shooter.score = shooter.score + scoreTable[points];
  }
}

function checkShipCollisions() {
  if (ships.length < 2) return;
  let collisionList = [];
  ships.forEach((ship) => {
    if (distToNearestShip(ship) < 2 * ship.size) {
      collisionList.push(ship);
    }
  });
  collisionList.forEach((ship) => {
    die(ship);
  });
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
  asteroids.forEach((el) => {
    // move
    el.x = el.x + el.velocity.x / updatesPerSecond;
    el.y = el.y + el.velocity.y / updatesPerSecond;

    // asteroids going off-field re-enter on the other side
    if (el.x < -fieldBuffer) el.x = fieldX + fieldBuffer;
    if (el.x > fieldX + fieldBuffer) el.x = - fieldBuffer;
    if (el.y < -fieldBuffer) el.y = fieldY + fieldBuffer;
    if (el.y > fieldY + fieldBuffer) el.y = - fieldBuffer;
  });
}

function updateBullets() {
  bullets.forEach((bullet, bulletIndex) => {
    bullet.remainingRange = bullet.remainingRange - bullet.velocity.size / updatesPerSecond;
    bullet.x = bullet.x + bullet.velocity.x / updatesPerSecond;
    bullet.y = bullet.y + bullet.velocity.y / updatesPerSecond;

    if (bullet.x < 0 || bullet.x > fieldX || bullet.y < 0 || bullet.y > fieldY || bullet.remainingRange < 0) {
      bullets.splice(bulletIndex, 1);
    }
  });
}

function rankByScore() {
  ships.sort((a, b) => {
    if (b.score > a.score) return 1;
    return -1;
  });

  let rank = 1;

  for (let i = 0; i < ships.length; i++) {
    ships[i].rank = rank;
    if (ships[i + 1] && ships[i + 1].score !== ships[i].score) rank++;
    if (ships[i].score < 0) die(ships[i]);
  }
}

function die(ship) {
  if (obituries.indexOf(ship) === -1) {
    obituries.push(ship);
    ships.splice(ships.indexOf(ship), 1);
  }
  serverSpeed();
}

// helper functions
function bracket(min, x, max) {
  return Math.max(Math.min(x, max), min)
}

function distanceBetween(obj1, obj2) {
  return Math.sqrt(
    (obj1.x - obj2.x) ** 2
    + (obj1.y - obj2.y) ** 2
  );
}

function bearing(obj1, obj2) {
  return Math.atan2(obj1.y - obj2.y, obj1.x - obj2.x);
}

function randomAngle() {
  return Math.random() * 2 * Math.PI;
}

function randomX() {
  // returns a random x value on the field
  return fieldBuffer + Math.floor(Math.random() * (fieldX - 2 * fieldBuffer));
}

function randomY() {
  // returns a random y value on the field
  return fieldBuffer + Math.floor(Math.random() * (fieldY - 2 * fieldBuffer));
}

module.exports = { game, joinGame, warp, updatesPerSecond, fieldX, fieldY, maxPlayers, currentPlayers, die };
