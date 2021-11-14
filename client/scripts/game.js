'use strict';
// -----------    Variables    ------------------//

let viewportWidth; // from browser
let viewportHeight;
let viewportX; // top left of viewport
let viewportY;
const viewportBuffer = 100;

// init canvas
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', { alpha: false }); // alpha false for performance reasons (not tested without)

// animation
let lastRender = 0;
let fps = 0;
// init field - may come from backend
const bullets = [];
const explosions = [];
const aliens = [];
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

let scoreTable = {
  5: 50,
  4: 100,
  3: 200,
  2: 300,
  1: 500,
  'enemy': 5000
}

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

class Star extends Entity {
  constructor() {
    super();
    this.x = Math.floor(Math.random() * fieldX);
    this.y = Math.floor(Math.random() * fieldY);
    this.z = Math.random();
    let colorPicker = 2 + Math.floor(Math.random() * 5);
    this.color = `#${colorPicker}${colorPicker}${colorPicker}`;
  }
}

class Explosion extends Entity {
  constructor(x, y, v) {
    super();
    this.x = x;
    this.y = y;
    this.velocity = v;
    this.start = -5;
    this.end = 15;
    this.size = this.start;
    this.alive = true;
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

  shoot = () => {
    // rate control
    const now = new Date();
    if (now - lastShot < 20 || this.alive === false) {
      return;
    }

    // burst control
    this.ammo--;
    if (this.ammo < 0) {
      controller.shoot.pressed = false;
      document.removeEventListener('mousedown', () => { controller.shoot.pressed = true });
      this.ammo = 10;
      setTimeout(() => {
      document.addEventListener('mousedown', () => { controller.shoot.pressed = true });
      }, 200);
    } else {
      let bullet = new Bullet;
      bullet.x = this.x;
      bullet.y = this.y;
      bullet.velocity.angle = this.direction - 1 / 2 * Math.PI;
      bullet.velocity.size = this.velocity.size + 600;
      bullet.originX = bullet.x;
      bullet.originY = bullet.y;
      bullets.push(bullet);
    }
    lastShot = now;
  }

  thrust = () => {
    this.thruster = true;
    // Rebased vector angle for the atan2 method, where the angle is defined as that between the positive x axis and the point.
    let vectorAngle = this.direction - 1/2 * Math.PI;
    vectorAngle = vectorAngle < 0 ? vectorAngle + 2 * Math.PI : vectorAngle;

    this.thrustValue = Math.min(this.thrustMax, this.thrustValue +1);

    let thrustVector = new Vector(vectorAngle, this.thrustValue);

    this.velocity.add(thrustVector);
    this.velocity.size = Math.min(this.maxSpeed, this.velocity.size);
    }

  coast = () => {
    this.thruster = false;
      this.velocity.size *= 0.998;
  }

  rotateL = () => {
    this.direction = this.direction - this.rotationRate / fps;
    if (this.direction < 0) this.direction += 2*Math.PI;
  }

  rotateR = () => {
    this.direction = this.direction + this.rotationRate/fps;
    if (this.direction > 2*Math.PI) this.direction = 0;
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

// ----------------------    Start Game   ----------------------------//

let myShip = new Ship();
let camera = new Entity();

let myStatus = {
  score: 0,
  lives: 0
}

window.onload = () => { newGame() };

function newGame() {
  resizeCanvas();
  resetScore();
  spawnEnvironment();
  spawnMyShip()
  hudInit();
  window.requestAnimationFrame(gameLoop);
}

// ----------------------    GAME LOOP    ---------------------------- //

function gameLoop(timestamp) {
fps = 1000 / (timestamp - lastRender);
  checkControls();
  updatePositions();
  drawAll();
  if (myShip.alive === true) scoreUpdate();
  lastRender = timestamp;
  window.requestAnimationFrame(gameLoop)
}

// -----------    functions: Spawn Components    ------------------ //

function spawnEnvironment() {
  // stars
  for (let x = 0; x < noOfStars; x++) {
    starfield.push(new Star());
  }
  // asteroids
  for (let x = 0; x < noOfAsteroids; x++) {
    asteroids.push(new Asteroid());
  }
  // myShip
}

function spawnMyShip() {
  setEventListeners();
  myShip.x = randomX();
  myShip.y = randomY();
  myShip.alive = true;

  // check for proximity of asteroids
  if (distToNearestObj(400).collision === true) warp(400);
  myShip.velocity = new Vector(3/2*Math.PI, 20);
};

function distToNearestObj(buffer = 0) {
  let nearestDist = Infinity;
  let nearestObj = new Asteroid;
  asteroids.forEach((asteroid) => {
    let dist = Math.sqrt((myShip.x - asteroid.x) ** 2 + (myShip.y - asteroid.y) ** 2) - asteroid.size * asteroidScale - myShip.size / 2;
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

function warp(buffer) {
  do {
    myShip.x = randomX();
    myShip.y = randomY();
  }
  while (distToNearestObj(buffer).collision === true)
}

function checkControls() {
  Object.values(controller).forEach(property => {
    if (property.pressed === true) property.func();
  });
  if (controller.thrust.pressed === false) {
    myShip.coast();
  }
}

// -----------    functions: calculate positions    ------------------//

function updatePositions() {
  if (myShip.alive === true) updateMyShip();
  updateViewport();
  updateAsteroids();
  updateBullets();
  updateExplosion();
};

function updateMyShip() {
  myShip.x = myShip.x + myShip.velocity.x / fps;
  myShip.y = myShip.y + myShip.velocity.y / fps;
  // wall collision: vector to push away from walls
  switch (true) {
    case myShip.x < myShip.size/2: myShip.velocity = new Vector(0,20); break;
    case myShip.x > fieldX - myShip.size/2: myShip.velocity = new Vector(Math.PI,20); break;
    case myShip.y < myShip.size/2: myShip.velocity = new Vector(Math.PI * 0.5, 20); break;
    case myShip.y > fieldY - myShip.size/2: myShip.velocity = new Vector(Math.PI * 1.5,20); break;
  }

  if (distToNearestObj().collision === true) die(new Explosion(myShip.x, myShip.y, distToNearestObj().nearestObj.velocity));

}

function updateViewport() {

  if (myShip.alive === true) {
    // follow ship
    camera = myShip;
  }

  // restrict viewport at bounderies
  viewportX = clamp(camera.x - viewportWidth / 2, -viewportBuffer, fieldX - viewportWidth + viewportBuffer);
  viewportY = clamp(camera.y - viewportHeight / 2, -viewportBuffer, fieldY - viewportHeight + viewportBuffer);
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

// // -----------    functions: draw on screen    ------------------//

function drawAll() {
  // clear canvas ready for next frame
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, viewportWidth, viewportHeight);

  // render components
  drawStars();
  drawBullets();
  drawAsteroids();
  drawShips();
  drawPerimeter();
  drawExplosions();
}

function drawStars() {

  starfield.forEach(star => {
    // parallax effect
    let offsetX = star.x + star.z * (star.x - viewportX / 2) / 2;
    let offsetY = star.y + star.z * (star.y - viewportY / 2) / 2;

    // select only visible stars
    if (offsetX > viewportX && offsetX < viewportX + viewportWidth && offsetY > viewportY && offsetY < viewportY + viewportHeight) {
      ctx.beginPath();
      ctx.arc(offsetX - viewportX, offsetY - viewportY, Math.floor(3 * star.z), 0, 2 * Math.PI, false);
      ctx.fillStyle = star.color;
      ctx.fill();
    }
  });
}

function drawBullets() {

  bullets.forEach((bullet, index) => {
    // remove off-field and spent bullets
    if (
      bullet.x < 0 ||
      bullet.x > fieldX ||
      bullet.y < 0 ||
      bullet.y > fieldY ||
      Math.sqrt((bullet.x - bullet.originX)**2 + (bullet.y - bullet.originY)**2) > bullet.reach
      ) {
      bullets.splice(index, 1);
    }

    ctx.beginPath();
    ctx.arc(bullet.x-viewportX, bullet.y-viewportY, 1, 0, 2 * Math.PI, false);
    ctx.fillStyle = '#FFF';
    ctx.fill();
    });
}

function drawShips() {
  // will need to display all ships for multiplayer
  if (myShip.alive === true) ships.push(myShip);

  ships.forEach((ship) => {
    // guard clause to check if ship is in the viewport
    if (ship.x < viewportX || ship.x > viewportX + viewportWidth || ship.y < viewportY || ship.y > viewportY + viewportHeight) return;

    // Canvas must be positioned and rotated before rotated items are draw, the canvas is rotated, not the object
    ctx.translate(ship.x-viewportX, ship.y-viewportY);
    ctx.rotate(ship.direction);

    // Draw ship
    ctx.beginPath();
    ctx.strokeStyle = '#555';
    ctx.fillStyle = '#ccc';
    ctx.lineWidth = '1';
    ctx.moveTo(0, -ship.height / 2);
    ctx.lineTo(ship.width / 2, ship.height / 2);
    ctx.lineTo(0, ship.height * 0.3);
    ctx.lineTo(-ship.width / 2, ship.height / 2);
    ctx.lineTo(0, -ship.height / 2);
    ctx.fill();
    ctx.closePath();

    // Draw thrust flame
    if (ship.thruster) {
      ctx.beginPath();
      ctx.strokeStyle = "#FFA500";
      ctx.fillStyle = "#FF0";
      ctx.moveTo(0, 23);
      ctx.lineTo(ship.width / 4, 25);
      ctx.lineTo(0, 30);
      ctx.lineTo(-ship.width / 4, 25);
      ctx.lineTo(0, 23);
      ctx.fill();
      ctx.stroke();
      ctx.closePath();
    }

    // reset canvas position from rotation
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  });

  if (myShip.alive === true) ships.pop();
}

function drawAsteroids() {

  asteroids.forEach((asteroid) => {
    ctx.beginPath();
    ctx.arc(asteroid.x-viewportX, asteroid.y-viewportY, asteroid.size * asteroidScale, 0, 2 * Math.PI, false);
    ctx.fillStyle = '#222';
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#555';
    ctx.stroke();
    });
}

function drawExplosions() {
  explosions.forEach((exp) => {
    ctx.beginPath();
    ctx.arc(exp.x-viewportX, exp.y-viewportY, Math.abs(exp.size), 0, 2 * Math.PI, false);
    ctx.fillStyle = '#fcba03';
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
  });
}

function drawPerimeter() {

  const border = '#222'
  if (viewportX < 0) {
    ctx.fillStyle = border;
    ctx.fillRect(0, 0, 0-viewportX, viewportHeight);
  }

  if (viewportY < 0) {
    ctx.fillStyle = border;
    ctx.fillRect(0, 0, viewportWidth, 0-viewportY);
  }

  if (viewportX + viewportWidth > fieldX) {
    ctx.fillStyle = border;
    ctx.fillRect(fieldX - viewportX, 0, viewportWidth, viewportHeight);
  }

  if (viewportY + viewportHeight > fieldY) {
    ctx.fillStyle = border;
    ctx.fillRect(0, fieldY - viewportY, viewportWidth, viewportHeight);
  }
}

// -----------    functions: game control     ------------------//

function resetScore() {
  myStatus.score = 0;
  myStatus.lives = 5;
}

function hudInit() {

  let hud = document.createElement('div');
  hud.id = 'hud';
  document.body.appendChild(hud);

  let lives = document.createElement('div');
  lives.id = 'lives';
  hud.appendChild(lives);

  for (let i = 0; i < myStatus.lives; i++) {
    let heart = document.createElement('span');
    heart.classList.add('heart');
    heart.innerText = '♥';
    lives.appendChild(heart);
  }

  let p = document.createElement('p');
  p.id = 'hud-score';
  p.innerText = `Score: ${myStatus.score}`;
  hud.appendChild(p);
}

function scoreUpdate() {
  let score = document.getElementById('hud-score');
  score.innerText = `Score: ${myStatus.score}`;
}

function removeHeart() {
  let lives = document.getElementById('lives');
  while ( lives.childElementCount > myStatus.lives ) {
    lives.removeChild(lives.lastChild);
  }
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

function gameOver() {

  let hud = document.getElementById('hud');
  document.body.removeChild(hud);

  // local storage
  const pb = localStorage.getItem('pb');
  if (myStatus.score > pb) {
    localStorage.setItem('pb', myStatus.score);
    alert("New personal best!" + myStatus.score);
  }

  setTimeout(() => {
    newGame();
  }, 2000);
}

// -----------    functions: event listeners    ------------------//

// User Input object
const controller = {
  rotateL: {
    pressed: false,
    func: myShip.rotateL
  },
  rotateR: {
    pressed: false,
    func: myShip.rotateR
  },
  thrust: {
    pressed: false,
    func: myShip.thrust
  },
  shoot: {
    pressed: false,
    func: myShip.shoot
  }
}

// event listeners
function controls (e) {
  switch (e.key) {
    case 'm':
    case 'M':
      toggleMusic();
      break;

    case 'W':
    case 'ArrowUp':
    case 'w': controller.thrust.pressed = true;
      break;

    case 'A':
    case 'ArrowLeft':
    case 'a': controller.rotateL.pressed = true;
      break;

    case 'S':
    case 'ArrowDown':
    case 's': {
      if (!e.repeat) { warp() };
      break;
    }

    case 'D':
    case 'ArrowRight':
    case 'd': controller.rotateR.pressed = true;
      break;

    case ' ': controller.shoot.pressed = true;
      break;

    default: break;
  }
}

function keyupControls(e) {
  switch (e.key) {
    case 'W':
    case 'ArrowUp':
    case 'w': controller.thrust.pressed = false; break;

    case 'A':
    case 'ArrowLeft':
    case 'a': controller.rotateL.pressed = false; break;

    case 'D':
    case 'ArrowRight':
    case 'd': controller.rotateR.pressed = false; break;

    case ' ': controller.shoot.pressed = false; break;
    default: break;
  };
}

function setEventListeners() {
  controller.thrust.pressed = false;
  controller.rotateL.pressed = false;
  controller.rotateR.pressed = false;
  controller.shoot.pressed = false;

  document.addEventListener("keydown", controls);
  document.addEventListener("keyup", keyupControls);
  document.addEventListener('mousedown', () => { controller.shoot.pressed = true });
  document.addEventListener('mouseup', () => { controller.shoot.pressed = false });

  document.addEventListener('mousedown', (e) => {e.preventDefault();});
}

function removeEventListeners() {
  document.removeEventListener("keydown", controls);
  document.removeEventListener("keyup", keyupControls);
  document.removeEventListener('mousedown', () => { controller.shoot.pressed = true });
  document.removeEventListener('mouseup', () => { controller.shoot.pressed = false });
}

// -----------    functions: helper functions    ------------------//

function resizeCanvas() { // incase window size changes during play

  ctx.strokeStyle = 'black';
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, viewportWidth, viewportHeight);
  viewportWidth = window.innerWidth;
  viewportHeight = window.innerHeight;
  canvas.height = viewportHeight;
  canvas.width = viewportWidth;
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

let tunes = [];
let backgroundMusic = './assets/sounds/51239__rutgermuller__8-bit-electrohouse.wav';
let fireball = './assets/sounds/fireball.mp3';

function playSound(url, repeat) {
  const audio = new Audio(url);
  audio.play();
  if (repeat) audio.loop = true;
  tunes.push(audio);
}

let music = false;
function toggleMusic() {

  if (music === true) {
    music = false;
    tunes.map((tune) => { tune.pause(); tune.currentTime = 0; });
    tunes = [];
  } else {

    music = true;
    playSound(backgroundMusic);
    }
  }
