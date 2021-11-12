'use strict';

// -----------    Variables    ------------------//

// Debug info box
const debug = document.getElementById('debug-content');
const mouse = document.getElementById("mouse");

// window dimensions in global scope
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

// init field - may come from backend
const fieldX = 5000; // 5000 x 5000
const fieldY = 5000;
const fieldBuffer = 50; // to make sure nothing is spawned too close to edge
if (fieldBuffer > 0.5 * Math.min(fieldX, fieldY)) { console.warn("fieldBuffer too large") };
if (viewportBuffer > 0.5 * Math.min(fieldX, fieldY)) { console.warn("viewportBuffer too large") };


// -----------    Objects    ------------------//
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Vector {
  constructor(angle, size) {
    this.angle = angle;
    this.size = size;
  }

  x() {
    return this.size * Math.cos(this.angle);
  }

  y() {
    return this.size * Math.sin(this.angle);
  }

  add(v) {
    return new Vector(
      Math.atan2(this.x + v.x, this.y + v.y),
      Math.sqrt(
        (this.x + v.x) ** 2 +
        (this.y + v.y) ** 2
      )
    )
  };

  factor(factor) {
    return new Vector(this.angle, this.size * factor);
  }
}

class Entity {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.velocity = new Vector(0, 0);
  }
}

// ships
const ships = [];

class Ship extends Entity {
  constructor() {
    super();
    this.vector = new Vector(0, 0);
    this.direction = 0;
    this.thrust = 0;
    this.width = 20;
    this.height = 40;
    this.maxSpeed = 20;
    this.lives = 5;
    this.score = 0;
    this.rotationRate = 3;
  }

  shoot() {
    // TODO
    // give 5 shots then need to repress
  }

  thrust() {
    console.log(this.thrust);
    this.thrust = Math.min(this.thrust++, this.maxSpeed);
    let thrustVector = new Vector(this.direction, this.thrust);
    this.vector.add(thrustVector);
  }

  coast() {
    this.thrust--;
    this.vector.size < 0.5 ? this.vector.size = 0 : this.vector.factor(0.9);
  }

  respawn() {
    this.x = Math.floor(randomX());
    this.y = Math.floor(randomY());
    // check for collision and respawn again if necessary
  }

  rotateL(fps) {
    console.log(this.direction);
    this.direction = this.direction - this.rotationRate // fps;
    if (this.direction < 0) this.direction = 2*Math.PI;
  }

  rotateR(fps) {
    console.log(this.direction);
    this.direction = this.direction + this.rotationRate/fps;
    if (this.direction > 2*Math.PI) this.direction = 0;
  }

  hit() {
    // if hit, lose a life
  }

  die() {

  }
}

let myShip = new Ship;


// asteroids
const asteroids = [];
const asteroidScale = 20; // 20
const asteroidMaxSize = 5;
const noOfAsteroids = 10;

class Asteroid extends Entity {
  constructor() {
    super();
    this.x = randomX();
    this.y = randomY();
    this.vector = new Vector(Math.random() * 40 - 20, Math.random() * 40 - 20);
    this.size = asteroidMaxSize;
    this.strength = this.size;
  }

  hit() {
    this.strength--;
    if (this.strength === 0 && this.size !== 1) this.split();
    // needs collecting in gameloop
  }

  split() {
    let child1 = new Asteroid();
    let child2 = new Asteroid();
    child1.x = child2.x = this.x;
    child1.y = child2.y = this.y;
    child1.vector.angle = this.vector.angle - 0.5;
    child2.vector.angle = this.vector.angle + 0.5;
    child1.vector.size = this.vector.size * 1.2;
    child2.vector.size = this.vector.size * 1.2;
    child1.size = this.size - 1;
    child2.size = this.size - 1;
    asteroids.push(child1, child2);
  }
}

for (let x = 0; x < noOfAsteroids; x++) {
  asteroids.push(new Asteroid());
}

// Aliens
const aliens = [];
class Aliens extends Entity {
  // maybe don't need alients if multiplayer
}

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

function controls() {
  document.addEventListener("keydown", (e) => {
    switch (e.key) {
      case 'W':
      case 'ArrowUp':
      case 'w': controller.thrust.pressed = true; break;

      case 'A':
      case 'ArrowLeft':
      case 'a': controller.rotateL.pressed = true; break;

      case 'S':
      case 'ArrowDown':
      case 's': {
        if (!e.repeat) { myShip.respawn() };
        break;
      }

      case 'D':
      case 'ArrowRight':
      case 'd': controller.rotateR.pressed = true; break;

      case ' ': controller.shoot.pressed = true; break;
      default: break;
    }
  });

  document.addEventListener("keyup", (e) => {
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
    }
  });

  document.addEventListener('mousedown', () => { controller.shoot.pressed = true });
  document.addEventListener('mouseup', () => { controller.shoot.pressed = false });

  document.onmousemove = (e) => {
    mouse.innerText = `Mouse x: ${viewportX + e.clientX}, y: ${viewportY + e.clientY}`;
  };
}

// Start Game
window.onload = () => {
  controls();
  myShip.respawn();
  resizeCanvas();
  window.requestAnimationFrame(gameLoop);
}

// Game Loop
function gameLoop(timestamp) {
  // https://stackoverflow.com/questions/38709923/why-is-requestanimationframe-better-than-setinterval-or-settimeout
  let fps = 1000 / (timestamp - lastRender);
  positionMyShip(fps);
  updatePositions(fps);
  perimeterCheck();
  draw();

  lastRender = timestamp;
  // https://dev.to/macroramesh6/are-you-facing-high-cpu-usage-on-animation-requestanimationframe-3c94
  window.requestAnimationFrame(gameLoop)
}

// -----------    functions: calculate positions    ------------------//

function positionMyShip() {
  // check user inputs
  Object.values(controller).forEach(property => {
    if (property.pressed === true) property.func();
  });
  if (controller.thrust.pressed = false) { myShip.coast() }
}

function perimeterCheck() {

  myShip.x = clamp(myShip.x, myShip.width/2, fieldX - myShip.width/2);
  myShip.y = clamp(myShip.y, myShip.height/2, fieldY - myShip.height/2);
  debug.innerHTML = `myShip.x = ${myShip.x}<br>myShip.y = ${myShip.y}<br>myShip.direction = ${myShip.direction}`;
}

function resizeCanvas() { // incase window size changes during play

  ctx.strokeStyle = 'black';
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, viewportWidth, viewportHeight);
  viewportWidth = window.innerWidth;
  viewportHeight = window.innerHeight;
  canvas.height = viewportHeight;
  canvas.width = viewportWidth;
  draw();
}

function updatePositions(fps) {
  // branch to various functions for aliens / asteroids / other ships
  asteroids.forEach((el, index) => {
    if (el.strenth = 0) {
      // make explosion TODO
      asteroids.splice(index, 1);
    }
    el.x = el.x + el.vector.x / fps;
    el.y = el.y + el.vector.y / fps;
    if(el.x < -asteroidMaxSize * asteroidScale) el.x = fieldX + asteroidMaxSize * asteroidScale;
    if (el.x > fieldX + asteroidMaxSize * asteroidScale) el.x = - asteroidMaxSize * asteroidScale;
    if (el.y < -asteroidMaxSize * asteroidScale) el.y = fieldY + asteroidMaxSize * asteroidScale;
    if (el.y > fieldY + asteroidMaxSize * asteroidScale) el.y = - asteroidMaxSize * asteroidScale;
  })

  myShip.x = myShip.x + myShip.vector.x / fps;
  myShip.y = myShip.y + myShip.vector.y / fps;

}

// -----------    functions: draw on screen    ------------------//

function draw() {

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, viewportWidth, viewportHeight);
  viewportX = clamp(myShip.x - viewportWidth / 2, -viewportBuffer, fieldX - viewportWidth + viewportBuffer);
  viewportY = clamp(myShip.y - viewportHeight / 2, -viewportBuffer, fieldY - viewportHeight + viewportBuffer);
  drawShip();
  drawAsteroids();
  drawPerimeter();
  // drawBullets()
  // drawAliens()
}

function drawShip() {

  // the usual position for the ship is plotted in center of canvas, and the environment moves behind
  let plotX = (viewportWidth - myShip.width) / 2;
  let plotY = (viewportHeight - myShip.height) / 2;


  // If ship is close to edge of arena, the viewport should clamp, and myShip will diverge from center of screen.
  if (myShip.x < viewportWidth/2 || myShip.x > fieldX - (viewportWidth - myShip.width) / 2) {
    plotX = myShip.x - myShip.width/2 - viewportX;
  }

  if (myShip.y < viewportHeight/2 || myShip.y > fieldY - (viewportHeight - myShip.height) / 2) {
    plotY = myShip.y - myShip.height/2 - viewportY;
  }

  ctx.translate(plotX + myShip.width / 2, plotY + myShip.height / 4);
  ctx.rotate(myShip.vector.angle);
  ctx.beginPath();
  ctx.strokeStyle = "red";
  ctx.lineWidth = "1";
  ctx.moveTo(0, -myShip.height / 4);
  ctx.lineTo(myShip.width / 2, myShip.height * 3/4);
  ctx.lineTo(0, myShip.height / 4);
  ctx.lineTo(-myShip.width / 2, myShip.height * 3/4);
  ctx.lineTo(0, -myShip.height / 4);
  ctx.closePath();
  ctx.stroke();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function drawAsteroids() {

  asteroids.forEach((el) => {
    ctx.beginPath();
    ctx.arc(el.x-viewportX, el.y-viewportY, el.size * asteroidScale, 0, 2 * Math.PI, false);
    ctx.fillStyle = '#222';
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#003300';
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

// -----------    functions: helper functions    ------------------//

function randomX() {
  return fieldBuffer + Math.floor(Math.random() * (fieldX - 2 * fieldBuffer));
}

function randomY() {
  return fieldBuffer + Math.floor(Math.random() * (fieldY - 2 * fieldBuffer));
}

function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

function DetectCollision(object, type) {
  // branch depending on ship or bullet
  // check for collisions
  return // the object with which collision occured
}
