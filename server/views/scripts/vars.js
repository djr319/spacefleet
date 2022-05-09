'use strict'

// -----------    Storage    ------------------//
const ships = [];
const bullets = [];
const explosions = [];
const asteroids = [];

// animation & background
let lastRender;
let fps = 0;
let fieldX;
let fieldY;

let leaderboardSize = 10;

// -----------    Viewport    ------------------//
let viewportWidth = window.innerWidth; // from browser
let viewportHeight = window.innerHeight;
let viewportX = 0; // top left of viewport
let viewportY = 0;
const viewportBuffer = 100;

// -----------------------    Objects    ------------------//
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
  }
}

class Entity {
  constructor() {
    this.x = 100;
    this.y = 100;
    this.velocity = new Vector(0, 0);
  }
}

class Star {
  constructor() {
    this.x = Math.floor(Math.random() * fieldX);
    this.y = Math.floor(Math.random() * fieldY);
    this.z = Math.random();
    let colorPicker = 2 + Math.floor(Math.random() * 5);
    this.color = `#${colorPicker}${colorPicker}${colorPicker}`;
  }
}

class Explosion {
  constructor(x, y, v) {
    this.x = x;
    this.y = y;
    this.velocity = v;
    this.start = -5;
    this.end = 15;
    this.size = this.start;
  }
}

class Ship {
  constructor(x, y, s, u) {
    this.x = x;
    this.y = y;
    this.direction = 0;
    this.socket = s;
    this.user = u;
    this.thruster = false;
    this.width = 20;
    this.height = 40;
    this.rank = 0;
    this.score = 0;
  }
}

class MyShip {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.direction = 0;
    this.thrustValue = 0;
    this.thrustMax = 10;
    this.velocity = new Vector(0, 0);
    this.width = 20;
    this.height = 40;
    this.maxSpeed = 800;
    this.rotationRate = 8;
    this.ammo = 15;
    this.alive = false;
    this.rank = 0;
    this.score = 0;
    this.user;
  }

  get size() {
    return Math.max(this.width, this.height);
  }

  shoot = () => {
    // rate control
    const now = new Date();
    if (tips.shotFired === false) tips.shotFired = true;
    if (now - lastShot < 20) {
      return;
    }

    // burst control
    this.ammo--;
    if (this.ammo < 0) {
      controller.shoot.pressed = false;
      this.ammo = 10;
    } else {
      sendUpdate('shot', {
        x: this.x,
        y: this.y,
        angle: this.direction - 1 / 2 * Math.PI,
        size: this.velocity.size + 600
      });
    }
    lastShot = now;
  }

  thrust = () => {
    this.thruster = true;
    // silence tips
    if (tips.w === false) tips.w = true;
    // Rebased vector angle for the atan2 method, where the angle is defined as that between the positive x axis and the point.
    let vectorAngle = this.direction - 1 / 2 * Math.PI;
    vectorAngle = vectorAngle < 0 ? vectorAngle + 2 * Math.PI : vectorAngle;

    this.thrustValue = Math.min(this.thrustMax, this.thrustValue + 1);

    let thrustVector = new Vector(vectorAngle, this.thrustValue);

    this.velocity.add(thrustVector);
    this.velocity.size = Math.min(this.maxSpeed, this.velocity.size);
  }

  coast = () => {
    this.thruster = false;
    this.velocity.size *= 0.998;
  }

  rotateL = () => {
    if (tips.ad === false) tips.ad = true;
    this.direction = this.direction - this.rotationRate / fps;
    if (this.direction < 0) this.direction += 2 * Math.PI;
  }

  rotateR = () => {
    if (tips.ad === false) tips.ad = true;
    this.direction = this.direction + this.rotationRate / fps;
    if (this.direction > 2 * Math.PI) this.direction = 0;
  }
}


class Asteroid {
  constructor(x, y, s, id) {
    this.x = x;
    this.y = y;
    this.size = s;
    this.id = id;
  }
}

class Bullet extends Entity {
  constructor() {
    super();
    this.id = '';
    this.rangeRemaining = bulletRange;
  }
}

// -----------    Asteroid    ------------------//
const asteroidScale = 20;
const asteroidMaxSize = 5;
const biggestAsteroid = asteroidMaxSize * asteroidScale;
const fieldBuffer = Math.max(50, biggestAsteroid);

// position reporting
let reportRate = 60;
let reportInterval;

// ship control
let myShip = new MyShip;
let lastShot = new Date();
let bulletRange;
const shieldSize = 50;

let camera = new Entity();

// -----------    tips    ------------------//

const tips = {
  gameStartTime: new Date(),
  w: false,
  ad: false,
  s: false,
  m: false,
  pro: false
}

const tipMessage = {
  w: 'Press <span>W</span> for thrust',
  ad: 'Press <span>A</span> / <span>D</span> to steer',
  s: 'Press <span>S</span> to warp.<br>(Penalty 1000 points)',
  fire: 'Press <span>[SPACE]</span> to fire',
  m: 'Toggle music <span>M</span>'
};

// canvas
let canvas = document.createElement('canvas');
canvas.id = 'canvas';
canvas.setAttribute('oncontextmenu', 'return false')
document.body.appendChild(canvas);
let ctx = canvas.getContext('2d', { alpha: false });

// Stars
const starfield = [];
const noOfStars = 1000;

function makeStarField() {
  starfield.length = 0;

  for (let x = 0; x < noOfStars; x++) {
    starfield.push(new Star());
  }
}

// splash page
let splash = document.createElement('div');
splash.id = 'splash';
document.body.appendChild(splash);
splash.innerHTML = `
<div class="dialog">
  <h1>Spacefleet</h1>
  <input id="name" type="text" placeholder="name"></text>
  </br>
  <button class="join-game" id="join">JOIN GAME</button>
</div>
<div class="dialog" id="brief">
  <ul>
    <li>🚀 Control your spaceship: WASD</li>
    <li>💥 Shoot asteroids: [space]</li>
    <li>😎 Score points</li>
</div>

`;

// score board
let overlay = document.createElement('div');
overlay.id = 'overlay';
document.body.appendChild(overlay);
overlay.innerHTML = `
<div id="score-wrapper">
  <div id="my-score"></div>
</div>
<div id="instruction">
</div>
`;

let scoreWrapper = document.getElementById('score-wrapper');
let myScore = document.getElementById('my-score');
let instruction = document.getElementById('instruction');
