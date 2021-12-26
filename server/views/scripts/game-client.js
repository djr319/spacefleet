
// ----------------------    Start Game   ----------------------------//

let reportRate = 60;

// ---------------------    Initial Listener     --------------------- //
// ---------------------    LOGIC STARTS HERE    --------------------- //

window.addEventListener('DOMContentLoaded', () => {

  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d', { alpha: false });
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  makeStarField();

  document.getElementById('name').value = sessionStorage.getItem('name') || "noob";

  document.getElementById('join').addEventListener('click', () => {
    joinGame();
  });
});

// ------------------    User name / Join game    ------------------ //

function joinGame() {
  getShip();
  resizeCanvas();
  makeStarField();
  setEventListeners();
  // canvas.requestFullscreen()
  // hideMouse();
  resetStatus();
  resizeCanvas();
  hudInit();

  setInterval(() => {
    reportToServer();
  }, 1000 / reportRate);

  window.requestAnimationFrame(gameLoop);
}

function getShip() {
  let name = document.getElementById('name').value || '';
  sessionStorage.setItem('name', name);
  document.getElementById('splash').style.display = "none";
  sendStatus('join', name);   // ---> Server
}

// ----------------------    GAME LOOP    ---------------------------- //

function gameLoop(timestamp) {
  fps = 1000 / (timestamp - lastRender);
  checkControls();
  updatePositions();
  drawAll();

  debug();
  lastRender = timestamp;
  window.requestAnimationFrame(gameLoop);
}

function makeStarField() {
  starfield.length = 0;
  for (let x = 0; x < noOfStars; x++) {
    starfield.push(new Star());
  }
}

// function rejoin() {
//   setEventListeners()
// };

function reportToServer() {
  if (myShip.alive === true) {
  sendUpdate('ship', {
    x: myShip.x,
    y: myShip.y,
    direction: myShip.direction,
    thruster: myShip.thruster
  });
}
}

function checkControls() {
  Object.values(controller).forEach(property => {
    if (property.pressed === true) property.func();
  });
  if (controller.thrust.pressed === false) {
    myShip.coast();
  }
}

function updatePositions() {
  if (myShip.alive === true) {
    updateMyShip();
  }
  updateBullets();
  updateExplosions();
  updateViewport();
};

// -----------    functions: update positions    ------------------//

function warp() {

    sendStatus('warp', '');
}

function updateMyShip() {

  myShip.x = myShip.x + myShip.velocity.x / fps;
  myShip.y = myShip.y + myShip.velocity.y / fps;

  // wall collision: vector to push away from walls
  switch (true) {
    case myShip.x < myShip.size / 2:
      myShip.velocity = new Vector(0, 20);
      break;

    case myShip.x > fieldX - myShip.size / 2:
      myShip.velocity = new Vector(Math.PI, 20);
      break;

    case myShip.y < myShip.size / 2:
      myShip.velocity = new Vector(Math.PI * 0.5, 20);
      break;

    case myShip.y > fieldY - myShip.size / 2:
      myShip.velocity = new Vector(Math.PI * 1.5, 20);
      break;
  }
}

function updateBullets() {
  bullets.forEach((bullet) => {
    bullet.x = bullet.x + bullet.velocity.x / fps;
    bullet.y = bullet.y + bullet.velocity.y / fps;
  });
}

function updateExplosions() {
  explosions.forEach((explosion) => {
    explosion.size = explosion.size + 50 / fps;
    if (explosion.size > explosion.end) {
      explosions.splice(explosions.indexOf(explosion.id, 1))
    }
  });
}

// -----------    functions: draw on screen    ------------------//

function drawAll() {
  // clear canvas ready for next frame
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, viewportWidth, viewportHeight);

  drawStars();
  drawBullets();
  drawAsteroids();
  drawShips();
  drawPerimeter();
  drawExplosions();
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

  if (myShip.alive === true) {
    drawShip(myShip);
  }

  ships.forEach((ship) => {
    drawShip(ship);
  });
}

function drawShip(ship) {
  // need to add oversize buffer so that ships are drawn if slightly off screen

  // guard clause to check if ship is in the viewport
  if (ship.x < viewportX || ship.x > viewportX + viewportWidth || ship.y < viewportY || ship.y > viewportY + viewportHeight) return;

  // Canvas must be positioned and rotated before rotated items are draw, the canvas is rotated, not the object
  ctx.translate(ship.x - viewportX, ship.y - viewportY);

  if (ship !== myShip) {
    // label:
    ctx.font = "10px Space Mono";
    ctx.fillStyle = "red";
    ctx.fillText(ship.user || "unknown", 20 , 20);
  }

  ctx.rotate(ship.direction);
  // Draw ship
  ctx.beginPath();
  ctx.strokeStyle = 'white';
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
}

function drawAsteroids() {

  asteroids.forEach((asteroid) => {

    // guard clause to check if ship is in the viewport
    if (asteroid.x < viewportX - viewportBuffer || asteroid.x > viewportX + viewportWidth + viewportBuffer || asteroid.y < viewportY - viewportBuffer || asteroid.y > viewportY + viewportHeight + viewportBuffer) return;

    ctx.beginPath();
    ctx.arc(asteroid.x - viewportX, asteroid.y - viewportY, asteroid.size * asteroidScale, 0, 2 * Math.PI, false);
    ctx.fillStyle = '#222';
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#555';
    ctx.stroke();
  });
}

function drawExplosions() {
  explosions.forEach((exp) => {
    console.log('explosion!!!', exp.x, exp.y - viewportY);

    ctx.beginPath();
    ctx.arc(exp.x - viewportX, exp.y - viewportY, Math.abs(exp.size), 0, 2 * Math.PI, false);
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
    ctx.fillRect(0, 0, 0 - viewportX, viewportHeight);
  }

  if (viewportY < 0) {
    ctx.fillStyle = border;
    ctx.fillRect(0, 0, viewportWidth, 0 - viewportY);
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

function updateViewport() {

  if (myShip.alive === true) {
    // follow ship
    camera.x = myShip.x;
    camera.y = myShip.y;
  }

  // restrict viewport at bounderies
  viewportX = clamp(camera.x - viewportWidth / 2, -viewportBuffer, fieldX - viewportWidth + viewportBuffer);
  viewportY = clamp(camera.y - viewportHeight / 2, -viewportBuffer, fieldY - viewportHeight + viewportBuffer);
}

// -----------    functions: game control     ------------------//

function hudInit() {

  let hud = document.createElement('div');
  hud.id = 'hud';
  document.body.appendChild(hud);

  let p = document.createElement('p');
  p.id = 'hud-score';
  p.innerText = `Score: ${myScore}`;
  hud.appendChild(p);
}

function scoreUpdate() {
  let score = document.getElementById('hud-score');
  score.innerText = `Score: ${myScore}`;
}

function die(bigHole = 0) {
  myShip.alive = false;
  if (bigHole = 0) bigHole = new Explosion(myShip.x, myShip.y, new Vector(0, 0))
  bigHole.end = 50;
  explosions.push(bigHole);
  playSound(fireball);

  setTimeout(() => {
    gameOver();
  }, 2000);
}

function exitGame() {
  gameOver();
  // go to lobby
}

function gameOver() {

  let hud = document.getElementById('hud');
  document.body.removeChild(hud);
  showMouse();
  // local storage
  const pb = localStorage.getItem('pb');
  if (myScore > pb) {
    localStorage.setItem('pb', myScore);
    alert("New personal best!" + myScore);
  }

  setTimeout(() => {
    document.getElementById('splash').style.display = "flex";
  }, 2000);
}

function debug() {
  let bugbox = document.getElementById('debug');
  bugbox.innerHTML = `x: ${myShip.x}<br>y: ${myShip.y}<br>`
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.strokeStyle = 'black';
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  viewportWidth = window.innerWidth;
  viewportHeight = window.innerHeight;
}


// -----------    functions: helper function     ------------------//

function clamp(num, min, max) {
  // limits num to between min and max
  return Math.min(Math.max(num, min), max);
}
