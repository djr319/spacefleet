'use strict';

// -----------    Variables    ------------------//
let viewportWidth = window.innerWidth; // from browser
let viewportHeight = window.innerHeight;
let viewportX; // top left of viewport
let viewportY;
const viewportBuffer = 100;

// init canvas
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', { alpha: false }); // alpha false for performance reasons (not tested without)

// animation
let lastRender = 0;
let fps = 0;

// -----------------------    Objects    ------------------//
class Vector {
  constructor(angle, size) {
    this.angle = angle;
    this.size = size;
  }
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
  }
}

class Ship extends Entity {
  constructor() {
    super();
    this.direction = 0;
    this.alive = true;
  }
}

class myShip extends Ship {
  constructor() {
    super();
    this.thrustValue = 0;
    this.thrustMax = 10;
    this.width = 20;
    this.height = 40;
    this.maxSpeed = 800;
    this.rotationRate = 8;
    this.ammo = 15;
    this.thruster = true;
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



// ----------------------    Start Game   ----------------------------//

const myShip = new myShip();
let camera = new Entity();

const myStatus = {
  score: 0,
  lives: 0
}

function newGame() {
  hideMouse();
  resizeCanvas();

  spawnMyShip();
  hudInit();
  window.requestAnimationFrame(gameLoop);
}

// ----------------------    GAME LOOP    ---------------------------- //

function gameLoop(timestamp) {
fps = 1000 / (timestamp - lastRender);
  checkControls();
  updatePositions();
  drawAll();
  // if (myShip.alive === true) scoreUpdate();
  lastRender = timestamp;
  window.requestAnimationFrame(gameLoop)
}

// -----------    functions: Spawn Components    ------------------ //



function spawnMyShip() {
  setEventListeners();
};

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



function updateViewport() {

  if (myShip.alive === true) {
    // follow ship
    camera = myShip;
  }

  // restrict viewport at bounderies
  viewportX = clamp(camera.x - viewportWidth / 2, -viewportBuffer, fieldX - viewportWidth + viewportBuffer);
  viewportY = clamp(camera.y - viewportHeight / 2, -viewportBuffer, fieldY - viewportHeight + viewportBuffer);
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



function abortGame() {
// TODO Abort game
  showMouse();
  // go to lobby
}

function gameOver() {

  let hud = document.getElementById('hud');
  document.body.removeChild(hud);
  showMouse();
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
