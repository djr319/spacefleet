'use strict';

// Debug
const debug = document.getElementById('debug-content');
const mouse = document.getElementById("mouse");

// init canvas
let lastRender = 0;
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', { alpha: false }); // alpha false for performance reasons (not tested without)

// animation
let start, previousTimeStamp;

// window dimensions in global scope
let viewportWidth; // from browser
let viewportHeight;
let viewportX; // top left of viewport,
let viewportY; // top - usually ship.y - h/2
let viewportBuffer = 200;

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
let myShip = { // x & y are center point
  x: null,
  y: null,
  direction: 0,
  dX: 0,
  dY: 0,
  width: 10,
  height: 30,
  maxSpeed: 20,

  fire: function () {
    console.log("GUNS FIRED!!!");
  },

  power: function () {
    // simply translates for testing
    myShip.y = myShip.y - myShip.maxSpeed;
    perimeterCheck();
  },

  back: function () {
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
  }
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
      case 'w': myShip.power(); break;

      case 'A':
      case 'ArrowLeft':
        case 'a': myShip.rotateL(); break;

      case 'S':
      case 'ArrowDown':
      case 's': myShip.back(); break;

      case 'D':
      case 'ArrowRight':
      case 'd': myShip.rotateR(); break;

      case ' ': myShip.fire();
      default: break;
    }
  });
  document.addEventListener('mousedown', myShip.fire);

  document.onmousemove = (e) => {
    console.log("mousin around");
    mouse.innerText = `Mouse x: ${viewportX + e.clientX}, y: ${viewportY + e.clientY}`;
  };
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
  myShip.x = 4500 // Math.floor(randomX());
  myShip.y = 4500 // Math.floor(randomY());

  // check that ship is not too close to an astroid
  // TODO
}

function resizeCanvas () { // incase window size changes during play
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
  ctx.fillRect(0, 0, viewportWidth, viewportHeight);
  viewportX = clamp(myShip.x - viewportWidth / 2, -viewportBuffer, fieldX - viewportWidth + viewportBuffer);
  viewportY = clamp(myShip.y - viewportHeight / 2, -viewportBuffer, fieldY - viewportHeight + viewportBuffer);
  drawPerimeter();
  drawShip();
  drawAsteroids();
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

function randomX () {
  return fieldBuffer + Math.random() * (fieldX - 2 * fieldBuffer);
}

function randomY () {
  return fieldBuffer + Math.random() * (fieldY - 2 * fieldBuffer);
}

function clamp (num, min, max) {
  return Math.min(Math.max(num, min), max);
}
