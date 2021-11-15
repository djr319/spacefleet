// init field - may come from backend
const fps = 60;
const bullets = [];
const explosions = [];
const ships = [];
const fieldX = 5000;
const fieldY = 5000;
const starfield = [];
const noOfStars = 1000;
const asteroids = [];
const asteroidScale = 20;
const asteroidMaxSize = 5;
const noOfAsteroids = 20;
const fieldBuffer = Math.max(50, asteroidMaxSize * asteroidScale); // buffer width to avoid spawning anything too close to edge of field
if (fieldBuffer > 0.5 * Math.min(fieldX, fieldY)) { console.warn("fieldBuffer too large") };
if (viewportBuffer > 0.5 * Math.min(fieldX, fieldY)) { console.warn("viewportBuffer too large") };
let lastShot = new Date();

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

    // move some of these into myShip.. other ships will simply post their values
    this.thrustValue = 0;
    this.thrustMax = 10;
    this.width = 20;
    this.height = 40;
    this.maxSpeed = 800;
    this.rotationRate = 8;
    this.ammo = 15;
    this.thruster = true;
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
    this.reach = Math.min(viewportWidth/1.5, viewportHeight/1.5, 600);
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
function game() {
  console.log('Game is running');
  spawnEnvironment();
  gameLoop();
};

function gameLoop() {
  // receiveData();
  updatePositions();
  // transmitData();
  setInterval(gameLoop, 1000 / fps);
}

function spawnEnvironment() {
  // stars
  for (let x = 0; x < noOfStars; x++) {
    starfield.push(new Star());
  }
  // asteroids
  for (let x = 0; x < noOfAsteroids; x++) {
    asteroids.push(new Asteroid());
  }
}

let scoreTable = {
  5: 50,
  4: 100,
  3: 200,
  2: 300,
  1: 500,
  'enemy': 5000
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
      updateMyShip();
    }
  });
  if (ship.alive === true) updateShip(ship);
  updateViewport();
  updateAsteroids();
  updateBullets();
  updateExplosion();
};

function updateShip(ship) {
  ship.x = ship.x + ship.velocity.x / fps;
  ship.y = ship.y + ship.velocity.y / fps;
  // wall collision: vector to push away from walls
  switch (true) {
    case ship.x < ship.size/2: ship.velocity = new Vector(0,20); break;
    case ship.x > fieldX - ship.size/2: ship.velocity = new Vector(Math.PI,20); break;
    case ship.y < ship.size/2: ship.velocity = new Vector(Math.PI * 0.5, 20); break;
    case ship.y > fieldY - ship.size/2: ship.velocity = new Vector(Math.PI * 1.5,20); break;
  }

  if (distToNearestObj().collision === true) die(new Explosion(ship.x, ship.y, distToNearestObj().nearestObj.velocity));
}

function updateAsteroids() {
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
    checkKills();
  });
}

function checkKills() {
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

function updateExplosion() {
  explosions.forEach((exp, index) => {
    exp.x = exp.x + exp.velocity.x / fps;
    exp.y = exp.y + exp.velocity.y / fps;
    exp.size = exp.size + 1;
    if (exp.size > exp.end) {
      explosions.splice(index, 1);
    }
  });
}

function die(bigHole) {
  myShip.alive = false;
  bigHole.end = 50;
  explosions.push(bigHole);
  playSound(fireball);
  myStatus.lives--;
  removeHeart();
  if (myStatus.lives < 1) {
  setTimeout(() => {
    gameOver();
  }, 2000);
} else {
  setTimeout(() => {
    spawnMyShip();
  }, 3000);
    }
}


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







module.exports = game;
