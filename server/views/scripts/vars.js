'use strict'

// -----------    Variables    ------------------//
let viewportWidth = window.innerWidth; // from browser
let viewportHeight = window.innerHeight;
let viewportX = 0; // top left of viewport
let viewportY = 0;
const viewportBuffer = 100;

// init canvas when document loaded
let canvas;
let ctx;

// animation & background
let lastRender = 0;
let fps = 0;
const fieldX = 5000;
const fieldY = 5000;
const starfield = [];
const noOfStars = 1000;
const asteroidScale = 20;

// -----------    Storage    ------------------//
const ships = [];
const bullets = [];
const explosions = [];
const asteroids = [];
let scores = [];

// ship control
let lastShot = new Date();

// Local session storage
const sessionStorage = window.sessionStorage;

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
    this.socket;
    this.user;
    this.thruster = false;
  }
}

class MyShip extends Ship {
  constructor() {
    super();
    this.thrustValue = 0;
    this.thrustMax = 10;
    this.width = 20;
    this.height = 40;
    this.maxSpeed = 800;
    this.rotationRate = 8;
    this.ammo = 15;
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


const myStatus = {
  score: 0,
  lives: 0,
  alive: false,
}
let myShip = new MyShip;
