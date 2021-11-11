'use strict';

// init canvas
let lastRender = 0;
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', { alpha: false }); // alpha false for performance reasons (not tested without)

// animation
let start, previousTimeStamp;

// window dimensions in global scope
let windowWidth;
let windowHeight;
let viewportX; // left - usually ship.x - w/2
let viewportY; // top - usually ship.y - h/2
let canvasX;
let canvasY;

// size of asteroids
let asteroidScale = 20;
let asteroidMaxSize = 5;


// init field - may come from backend
const fieldX = 5000;
const fieldY = 5000;
const fieldBuffer = 400; // to make sure nothing is spawned too close to edge
const asteroids = [];
const aliens = [];
const ships = [];

// define ship
let myShip = {
  x: null,
  y: null,
  direction: 0,
  dX: 0,
  dY: 0,
  width: 10,
  height: 30,
  maxSpeed: 20
}

class Asteroid {
  constructor() {
    this.x = Math.floor(randomX());
    this.y = Math.floor(randomY());
    this.dx = 0 // Math.round(Math.random()*2-1);
    this.dy = 0 // Math.round(Math.random()*2-1);
    this.size = asteroidMaxSize;
    this.strength = asteroidMaxSize;
  }

  dummyMethods() {
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
  updatePositions(progress);
  draw();

  lastRender = timestamp;
  // https://dev.to/macroramesh6/are-you-facing-high-cpu-usage-on-animation-requestanimationframe-3c94
  window.requestAnimationFrame(gameLoop)

}

// -----------------------------//

function controls() {
  document.addEventListener('keydown', (e) => {
    // will later perhaps absorb the various function into this one, as the ccontrols will not be complicated... Just split for testing
    // CAPSLOCK??
    switch (e.key) {
      case 'W':
      case 'ArrowUp':
      case 'w': power(); break;

      case 'A':
      case 'ArrowLeft':
        case 'a': rotateL(); break;

      case 'S':
      case 'ArrowDown':
      case 's': back(); break;

      case 'D':
      case 'ArrowRight':
      case 'd': rotateR();
      case ' ': fire();
      default: break;
    }
    document.addEventListener('mousedown', fire);
  });
}

function fire() {
  console.log("GUNS FIRED!!!");
}

function power() {
  // simply translates for testing
  myShip.y = myShip.y - myShip.maxSpeed;
  perimeterCheck();
}

function back() {
  // simply translates for testing
  myShip.y = myShip.y + myShip.maxSpeed;
  perimeterCheck();
}

function rotateL() {
  // simply translates for testing
  myShip.x = myShip.x - myShip.maxSpeed;
  perimeterCheck();
}

function rotateR() {
  // simply translates for testing
  myShip.x = myShip.x + myShip.maxSpeed;
  perimeterCheck();
}

function perimeterCheck() {
  if (myShip.y < 0) myShip.y = 0;
  if (myShip.x < 0) myShip.x = 0;
  if (myShip.x > fieldX-myShip.width) myShip.x = fieldX-myShip.width;
  if (myShip.y > fieldY-myShip.height) myShip.y = fieldY-myShip.height;
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

function resizeCanvas () { // incase window size changes during play
  ctx.strokeStyle = 'black';
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, windowWidth, windowHeight);
  windowWidth = window.innerWidth;
  windowHeight = window.innerHeight;
  canvas.height = windowHeight;
  canvas.width = windowWidth;
  draw();
}

function updatePositions(progress) {
  let fps = 1000 / progress;
  asteroids.forEach((el)=> {
    el.x = Math.floor(el.x + el.dx / fps);
    el.y = Math.floor(el.y + el.dy / fps);
    if(el.x < -asteroidMaxSize * asteroidScale) el.x = fieldX + asteroidMaxSize * asteroidScale;
  if (el.x > fieldX + asteroidMaxSize * asteroidScale) el.x = - asteroidMaxSize * asteroidScale;
  if (el.y < -asteroidMaxSize * asteroidScale) el.y = fieldY + asteroidMaxSize * asteroidScale;
  if (el.y > fieldY + asteroidMaxSize * asteroidScale) el.y = - asteroidMaxSize * asteroidScale;
})
}

function draw () {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, windowWidth, windowHeight);
  viewportX = clamp(myShip.x - windowWidth / 2, 0, fieldX - windowWidth );
  viewportY = clamp(myShip.y - windowHeight / 2, 0, fieldY - windowHeight);
  drawShip();
  drawAsteroids();
  // drawBullets()
  // drawAliens()
}

function drawAsteroids () {
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


function drawShip (x, y) {
  let plotX;
  let plotY;
  // unless ship is close to edge of arena

  plotX = (windowWidth - myShip.width) / 2;
  plotY = (windowHeight - myShip.height) / 2;

  ctx.beginPath();
  ctx.strokeStyle = "red";
  ctx.lineWidth = "4";
  ctx.rect(plotX, plotY, myShip.width, myShip.height);
  ctx.stroke();
}

function randomX () {
  return fieldBuffer + Math.random() * (fieldX - 2 * fieldBuffer);
}

function randomY () {
  return fieldBuffer + Math.random() * (fieldY - 2 * fieldBuffer);
}

function clamp (num, min, max) {
  return Math.min(Math.max(num, min), max);
}
