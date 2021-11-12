'use strict';

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

const aliens = [];
const ships = [];

// Vectors

class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  add(v) {
    return new Vector(this.x + v.x, this.y + v.y);
  }

  speed() {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  direction() {
    // returns in radians
  }
}

// asteroids
const asteroids = [];
const asteroidScale = 20; // 20
const asteroidMaxSize = 5;

class Asteroid {
  constructor(name) {
    this.name,
    this.x = Math.floor(randomX());
    this.y = Math.floor(randomY());
    this.velocity = new Vector((Math.random() * 40) - 20, (Math.random() * 40) - 20);
    this.size = asteroidMaxSize;
    this.strength = asteroidMaxSize;
  }

  hit() {
    // if shot at, decrease strength
    // if strength = 0, split()
  }

  split() {
    // TODO
  }


}

for (let x = 0; x < 10; x++) {
  asteroids.push(new Asteroid(`asteroid-${x}`));
}

// define ship
const myShip = { // x & y are center point
  x: null,
  y: null,
  velocity: new Vector(0, 0),
  direction: 0,
  width: 20,
  height: 40,
  maxSpeed: 20,
  lives: 5,
  score: 0,
  maxSpeed: 5,
  rotationRate: 150,

  shoot: function () {
    let x = this.x;
    let y = this.y;
    let direction = this.direction;
    shoot(x,y,direction);
  },

  thrust: function (x,y,fps) {
    myShip.velocity.x = myShip.velocity.x + x/fps;
    myShip.velocity.y = myShip.velocity.y + y / fps;

    if (myShip.speed > myShip.maxSpeed) myShip.speed = myShip.maxSpeed;
  },

  decay() { // % of 1.00, expect 0.1 as a standard input
    const friction = 0.1;
    this.velocity.x < 0.5 ? this.velocity.x = 0 : this.velocity.x = this.velocity.x - friction * this.velocity.x;
    this.velocity.y < 0.5 ? this.velocity.y = 0 : this.velocity.y = this.velocity.y - friction * this.velocity.y;
  },

  respawn: function () {
    myShip.x = Math.floor(randomX());
    myShip.y = Math.floor(randomY());

    // check that ship is not too close to an astroid
  },

  rotateL: function (fps) {
    myShip.direction = myShip.direction - myShip.rotationRate/fps;
    if (myShip.direction < 0) myShip.direction = 360;
  },

  rotateR: function (fps) {
    myShip.direction = myShip.direction + myShip.rotationRate/fps;
    if (myShip.direction > 360) myShip.direction = 0;
  },

  hit: function () {
    // if hit, lose a life
  }
}

const controller = {
  rotateL: {pressed: false, func: myShip.rotateL},
  rotateR: {pressed: false, func: myShip.rotateR},
  thrust: {pressed: false, func: myShip.thrust},
  warp: {pressed: false, func: myShip.respawn},
  shoot: {pressed: false, func: myShip.shoot}
}

window.onload = () => {
  controls();
  myShip.respawn();
  resizeCanvas();
  window.requestAnimationFrame(gameLoop);
}

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

// -----------------------------//

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
      case 's': controller.warp.pressed = true; break;

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

      case 'S':
      case 'ArrowDown':
      case 's': controller.warp.pressed = false; break;

      case 'D':
      case 'ArrowRight':
      case 'd': controller.rotateR.pressed = false; break;

      case ' ': controller.shoot.pressed = false; break;
      default: break;
    }
  });

  document.addEventListener('mousedown', () => { controller.shoot.pressed = false });
  document.addEventListener('mouseup', () => { controller.shoot.pressed = false });

  document.onmousemove = (e) => {
    mouse.innerText = `Mouse x: ${viewportX + e.clientX}, y: ${viewportY + e.clientY}`;
  };
}

function positionMyShip(fps) {

  Object.values(controller).forEach(property => {
    if (property.pressed === true) property.func(fps);
  });
  if (controller.thrust.pressed = false) { }
}

function shoot() {

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
  asteroids.forEach((el)=> {
    el.x = el.x + el.dx / fps;
    el.y = el.y + el.dy / fps;
    if(el.x < -asteroidMaxSize * asteroidScale) el.x = fieldX + asteroidMaxSize * asteroidScale;
    if (el.x > fieldX + asteroidMaxSize * asteroidScale) el.x = - asteroidMaxSize * asteroidScale;
    if (el.y < -asteroidMaxSize * asteroidScale) el.y = fieldY + asteroidMaxSize * asteroidScale;
    if (el.y > fieldY + asteroidMaxSize * asteroidScale) el.y = - asteroidMaxSize * asteroidScale;
    ctx.fillStyle = 'white';
    ctx.fillText(el.name, el.x, el.y);
  })
}


// Draw functions

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

function drawShip(x, y) {

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
  ctx.rotate(myShip.direction * Math.PI / 180);
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
    ctx.fillStyle = 'green';
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

// Helper Position Functions

function randomX() {
  return fieldBuffer + Math.random() * (fieldX - 2 * fieldBuffer);
}

function randomY() {
  return fieldBuffer + Math.random() * (fieldY - 2 * fieldBuffer);
}

function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}
