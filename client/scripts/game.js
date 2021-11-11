'use strict';

// Debug
const debug = document.getElementById('debug-content');
const mouse = document.getElementById("mouse");

// init canvas
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', { alpha: false }); // alpha false for performance reasons (not tested without)

// animation
let lastRender = 0;


// window dimensions in global scope
let viewportWidth; // from browser
let viewportHeight;
let viewportX; // top left of viewport
let viewportY;
const viewportBuffer = 100;

// size of asteroids
const asteroidScale = 20; // 20
const asteroidMaxSize = 5;


// init field - may come from backend
const fieldX = 5000; // 5000 x 5000
const fieldY = 5000;
const fieldBuffer = 50; // to make sure nothing is spawned too close to edge
if (fieldBuffer > 0.5 * Math.min(fieldX, fieldY)) { console.warn("fieldBuffer too large") };
if (viewportBuffer > 0.5 * Math.min(fieldX, fieldY)) { console.warn("viewportBuffer too large") };
const asteroids = [];
const aliens = [];
const ships = [];

// define ship
let myShip = { // x & y are center point
  x: null,
  y: null,
  direction: 0,
  speed: 0,
  width: 10,
  height: 30,
  maxSpeed: 20,
  lives: 5,
  score: 0,

  shoot: function () {
    let x = this.x;
    let y = this.y;
    let direction = this.direction;
  shoot(x,y,direction);
  },

  thrust: function () {
    // simply translates for testing
    myShip.y = myShip.y - myShip.maxSpeed;
    perimeterCheck();
  },

  warp: function () {
    // simply translates for testing
    myShip.y = myShip.y + myShip.maxSpeed;
    perimeterCheck();
  },

  rotateL: function () {
    // simply translates for testing
    myShip.x = myShip.x - myShip.maxSpeed;
    perimeterCheck();
  },

  rotateR: function () {
    // simply translates for testing
    myShip.x = myShip.x + myShip.maxSpeed;
    perimeterCheck();
  },

  hit: function () {
    // if hit, lose a life
  }
}

const controller = {
  rotateL: {pressed: false, func: myShip.rotateL},
  rotateR: {pressed: false, func: myShip.rotateR},
  thrust: {pressed: false, func: myShip.thrust},
  warp: {pressed: false, func: myShip.warp},
  shoot: {pressed: false, func: myShip.shoot}
}

class Asteroid {
  constructor() {
    this.x = Math.floor(randomX());
    this.y = Math.floor(randomY());

    // need to change to vectore: direction and speed
    this.dx = (Math.random() * 40) - 20;
    this.dy = (Math.random() * 40) - 20;

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

window.onload = () => {
  controls();
  randomPlacement();
  resizeCanvas();
  window.requestAnimationFrame(gameLoop);
}

function gameLoop(timestamp) {
  // https://stackoverflow.com/questions/38709923/why-is-requestanimationframe-better-than-setinterval-or-settimeout
  let progress = timestamp - lastRender;
  positionMyShip();
  updatePositions(progress);
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

function positionMyShip() {
// iterate over object
  //   rotateL: {pressed: false, func: myShip.rotateL},

  Object.values(controller).forEach(property => {
    if (property.pressed === true) property.func();
  });


}

function perimeterCheck() {

  // change to clamp
  myShip.x = clamp(myShip.x, myShip.width/2, fieldX - myShip.width/2);
  myShip.y = clamp(myShip.y, myShip.height/2, fieldY - myShip.height/2);

  debug.innerHTML = `myShip.x = ${myShip.x}<br>myShip.y = ${myShip.y}`;
}

function randomPlacement() {

  // asteroids
  for (let x = 0; x < 10; x++) {
    asteroids.push(new Asteroid());
  }
  // myShip
  myShip.x = Math.floor(randomX());
  myShip.y = Math.floor(randomY());

  // check that ship is not too close to an astroid
  // TODO
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

function updatePositions(progress) {

  let fps = 1000 / progress;
  asteroids.forEach((el)=> {
    el.x = el.x + el.dx / fps;
    el.y = el.y + el.dy / fps;
    if(el.x < -asteroidMaxSize * asteroidScale) el.x = fieldX + asteroidMaxSize * asteroidScale;
  if (el.x > fieldX + asteroidMaxSize * asteroidScale) el.x = - asteroidMaxSize * asteroidScale;
  if (el.y < -asteroidMaxSize * asteroidScale) el.y = fieldY + asteroidMaxSize * asteroidScale;
  if (el.y > fieldY + asteroidMaxSize * asteroidScale) el.y = - asteroidMaxSize * asteroidScale;
  })
  perimeterCheck();
}

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

function drawShip(x, y) {

  // plot in center of canvas
  let plotX = (viewportWidth - myShip.width) / 2;
  let plotY = (viewportHeight - myShip.height) / 2;

  // unless ship is close to edge of arena

  if (myShip.x < viewportWidth/2 || myShip.x > fieldX - (viewportWidth - myShip.width) / 2) {
    plotX = myShip.x - myShip.width/2 - viewportX;
  }

  if (myShip.y < viewportHeight/2 || myShip.y > fieldY - (viewportHeight - myShip.height) / 2) {
    plotY = myShip.y - myShip.height/2 - viewportY;
  }

  ctx.beginPath();
  ctx.strokeStyle = "red";
  ctx.lineWidth = "1";
  ctx.rect(plotX, plotY, myShip.width, myShip.height);
  ctx.stroke();
}

function randomX() {

  return fieldBuffer + Math.random() * (fieldX - 2 * fieldBuffer);
}

function randomY() {

  return fieldBuffer + Math.random() * (fieldY - 2 * fieldBuffer);
}

function clamp(num, min, max) {

  return Math.min(Math.max(num, min), max);
}

function shoot() {

}
