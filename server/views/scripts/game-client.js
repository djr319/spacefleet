
// ----------------------    Start Game   ----------------------------//

function resetStatus() {
  myStatus.score = 0;
  myStatus.lives = 5;
  myStatus.alive = true;
}

let camera = new Entity();

function newGame() {
  // canvas.requestFullscreen()
  // hideMouse();
  resetStatus();
  resizeCanvas();
  hudInit();

  window.requestAnimationFrame(gameLoop);
}

function exitGame() {
  // Document.exitFullscreen()
};
// ----------------------    GAME LOOP    ---------------------------- //

function gameLoop(timestamp) {
  fps = 1000 / (timestamp - lastRender);
  checkControls();
  updatePositions();
  drawAll();
  lastRender = timestamp;
  window.requestAnimationFrame(gameLoop)
}

// -----------    functions: Spawn Components    ------------------ //

window.addEventListener('DOMContentLoaded', () => {
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d', { alpha: false });
  makeStarField();
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  document.getElementById('name').value = sessionStorage.getItem('name');
  document.getElementById('join').addEventListener('click', () => {
    joinGame();
  });
});

function reportToServer() {

  sendUpdate('ship', {
    x : myShip.x,
    y : myShip.y,
    direction: myShip.direction,
    thruster: myShip.thruster
  });

}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.strokeStyle = 'black';
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function makeStarField() {
  for (let x = 0; x < noOfStars; x++) {
    starfield.push(new Star());
  }
}

function joinGame() {
  let name = document.getElementById('name').value || '';
  sessionStorage.setItem('name', name);
  document.getElementById('splash').style.display = "none";
  sendStatus('join', name);
  setEventListeners();
}

// function rejoin() {
//   setEventListeners()
// };

function checkControls() {
  Object.values(controller).forEach(property => {
    if (property.pressed === true) property.func();
  });
  if (controller.thrust.pressed === false) {
    myShip.coast();
  }
  reportToServer();
}

// -----------    functions: calculate positions    ------------------//

function warp() {
  // request from server
  sendStatus('warp', 'dummy');
}

function updatePositions() {
  updateMyShip();
  // if (myStatus.alive === true) updateMyShip();
  updateViewport();
//   updateAsteroids();
//   updateBullets();
//   updateExplosion();
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
// TODO serverside
  // if (distToNearestObj().collision === true) die(new Explosion(ship.x, ship.y, distToNearestObj().nearestObj.velocity));
}


function updateViewport() {

  if (myStatus.alive === true) {
    // follow ship
    camera.x = myShip.x;
    camera.y = myShip.y;
  }

  // restrict viewport at bounderies
  viewportX = clamp(camera.x - viewportWidth / 2, -viewportBuffer, fieldX - viewportWidth + viewportBuffer);
  viewportY = clamp(camera.y - viewportHeight / 2, -viewportBuffer, fieldY - viewportHeight + viewportBuffer);
}

// function updateExplosion() {
//   explosions.forEach((exp, index) => {
//     exp.x = exp.x + exp.velocity.x / fps;
//     exp.y = exp.y + exp.velocity.y / fps;
//     exp.size = exp.size + 1;
//     if (exp.size > exp.end) {
//       explosions.splice(index, 1);
//     }
//   });
// }

// -----------    functions: draw on screen    ------------------//

function drawAll() {
  // clear canvas ready for next frame
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, viewportWidth, viewportHeight);

  // render components
  drawStars();
  // drawBullets();
  // drawAsteroids();
  drawShips();
  drawPerimeter();
  // drawExplosions();
  updateViewport();
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

// function drawBullets() {

//   bullets.forEach((bullet, index) => {
//     // remove off-field and spent bullets
//     if (
//       bullet.x < 0 ||
//       bullet.x > fieldX ||
//       bullet.y < 0 ||
//       bullet.y > fieldY ||
//       Math.sqrt((bullet.x - bullet.originX)**2 + (bullet.y - bullet.originY)**2) > bullet.reach
//       ) {
//       bullets.splice(index, 1);
//     }

//     ctx.beginPath();
//     ctx.arc(bullet.x-viewportX, bullet.y-viewportY, 1, 0, 2 * Math.PI, false);
//     ctx.fillStyle = '#FFF';
//     ctx.fill();
//     });
// }

function drawShips() {
//   // will need to display all ships for multiplayer
  if (myStatus.alive === true) ships.push(myShip);

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

// function abortGame() {
// // TODO Abort game
//   showMouse();
//   // go to lobby
// }

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
    // newGame();
    location.reload();
  }, 2000);
}

function clamp(num, min, max) {
  // limits num to between min and max
  return Math.min(Math.max(num, min), max);
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
const controls = function (e) {
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

const keyupControls = function (e) { // was keyupControls

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

  document.addEventListener('mousedown', (e) => { e.preventDefault(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === 'Escape') {
      abortGame();
     }
  });
}

function removeEventListeners() {
  document.removeEventListener("keydown", controls);
  document.removeEventListener("keyup", keyupControls);
  document.removeEventListener('mousedown', () => { controller.shoot.pressed = true });
  document.removeEventListener('mouseup', () => { controller.shoot.pressed = false });
}

function hideMouse() {
  document.body.style.cursor = 'none';
}

function showMouse() {
  document.body.style.cursor = 'auto';
}


// -----------    Music / Sound Effects    ------------------//

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


