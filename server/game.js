const { socketRouter } = require('./socketRouter');

// init field
const fps = 60;
const bullets = [];
const explosions = [];
const ships = [];
const fieldX = 5000;
const fieldY = 5000;
const asteroids = [];
const asteroidScale = 20;
const asteroidMaxSize = 5;
const noOfAsteroids = 20;
const fieldBuffer = Math.max(50, asteroidMaxSize * asteroidScale); // buffer width to avoid spawning anything too close to edge of field
if (fieldBuffer > 0.5 * Math.min(fieldX, fieldY)) { console.warn("fieldBuffer too large") };


// -----------    Objects    ------------------//
class Vector {
  constructor(angle, size) {
    this.angle = angle;
    this.size = size;
  }

  get x() {
    return this.size * Math.cos(this.angle);
  }

  get y() {
    return this.size * Math.sin(this.angle);
  }

  add = (v) => {

    this.angle = Math.atan2(
      this.size * Math.sin(this.angle) + v.y,
      this.size * Math.cos(this.angle) + v.x
    )

    this.size = Math.sqrt(
      (this.x + v.x) ** 2 +
      (this.y + v.y) ** 2
    )
  };
}

class Entity {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.velocity = new Vector(0, 0);
  }
}

class Ship extends Entity {
  constructor() {
    super();
    this.direction = 0;
    this.width = 20;
    this.height = 40;
    this.thruster = true;
    this.shields = 10;
    this.user;
  }

  get size() {
    return Math.max(this.width, this.height);
  }
}

class Bullet extends Entity {
  constructor() {
    super();
    this.originX = 0;
    this.originY = 0;
    this.reach = Math.min(viewportWidth / 1.5, viewportHeight / 1.5, 600);
    this.owner;
  }
}

class Asteroid extends Entity {
  constructor(x,y,v,s) {
    super();
    this.x = x || randomX();
    this.y = y || randomY();
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

// ---------------   Game --------------- //
game();
function game() {
  console.log('Game is running');
  spawnAsteroids();
  gameLoop();
};

function gameLoop() {
  // receiveData();
  updatePositions();
  // transmitData();
  setInterval(gameLoop, 1000 / fps);
}

function receiveData() { };
function transmitData() { };

function spawnAsteroids(offscreen) {
  while (asteroids.length < noOfAsteroids) {
    let newAsteroid = new Asteroid()
    if (offscreen = true) {
      newAsteroid.x = -asteroidMaxSize * asteroidScale;
    }
    asteroids.push();
  }
}

let scoreTable = {
  5: 50,
  4: 100,
  3: 200,
  2: 300,
  1: 500,
  'hurtEnemy': 1000,
  'killEnemy': 5000
}

function spawnShip() {
  newShip = new Ship();
  newShip.x = randomX();
  newShip.y = randomY();
  newShip.alive = true;

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
  updateBullets();
  updateExplosion();
};

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

function clamp(num, min, max) {
  // limits num to between min and max
  return Math.min(Math.max(num, min), max);
}
