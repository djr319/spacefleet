
// ---------------------    Initial Listener     --------------------- //

window.addEventListener('DOMContentLoaded', () => {
  console.clear();
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  document.getElementById('name').value = sessionStorage.getItem('name') || "";
  document.getElementById('join').addEventListener('click', joinGame);
  window.requestAnimationFrame(gameLoop);
});

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.strokeStyle = 'black';
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  viewportWidth = window.innerWidth;
  viewportHeight = window.innerHeight;
}

function init() {
  purge();
  centerCamera();
  makeStarField();
};

function centerCamera() {
  camera.x = fieldX / 2;
  camera.y = fieldY / 2;
}

// ------------------    User name / Join game    ------------------ //
function joinGame () {
  let name = document.getElementById('name').value;
  if (name == "") return;
  lobby('hide');
  sessionStorage.setItem('name', name);
  sendStatus('join', name);   // ---> Server
}

function startGame () {
  setControlListeners();
  // resizeCanvas();
  reportInterval = setInterval(reportToServer, 1000 / reportRate);
}

function gameOver() {
  if (myShip.alive === true) {
    myShip.alive = false;
    clearInterval(reportInterval);
    removeControlListeners();
    // high score to local storage
    setTimeout(() => {
      if (myShip.score > localStorage.getItem('pb')) {
        localStorage.setItem('pb', myShip.score);
        alert("New personal best!" + myShip.score);
      }
      lobby('show');
    }, 2000);
    }
}

function lobby(displayState) {
  if (displayState === 'show') {
    // show lobby, remove scores
    splash.style.display = "flex";
    overlay.style.display = "none";
    // showMouse();
  } else {
    // hide lobby, show scores
    splash.style.display = "none";
    overlay.style.display = "block";
    // hideMouse();
  }
}


// ----------------------    GAME LOOP    ---------------------------- //

function gameLoop(timestamp) {
  if (lastRender === undefined) {
    lastRender = timestamp - 10;
  }
  fps = 1000 / (timestamp - lastRender);
  if (myShip.alive === true) {
    checkControls();
    updateScores();
    checkTips();
  }
  updatePositions();
  drawAll();
  lastRender = timestamp;
  window.requestAnimationFrame(gameLoop);
}

function checkTips() {

  if (Date.now() - tips.gameStartTime > 500000) return;

  if (tips.w === false && Date.now() - tips.gameStartTime > 5000) {
    showTip('w');
    tips.w = true;
  }

  if (tips.wasd === false && tips.ad === false && Date.now() - tips.gameStartTime > 10000) {
    showTip('ad');
    tips.ad = true;
  }

  if (tips.shotFired === false && Date.now() - tips.gameStartTime > 20000) {
    showTip('fire');
    tips.shotFired = true;
  }

  if (tips.wasd === false && tips.s === false && Date.now() - tips.gameStartTime > 30000) {
    showTip('s');
    tips.s = true;
  }

  if (tips.wasd === false && tips.m === false && Date.now() - tips.gameStartTime > 40000) {
    showTip('m');
    tips.m = true;
  }

}
function showTip(whichTip) {
  tipDiv = document.getElementById('instruction');
  tipDiv.innerHTML = tipMessage[whichTip];
  tipDiv.style.opacity = 1;
  hideTip();
}

function hideTip() {
  setTimeout(() => {
    tipDiv.style.opacity = 0;
    }, 4000);
}

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
}

// -----------    functions: update positions    ------------------//

function warp() {
  sendStatus('warp', '');
  if (tips.warp === false) tips.warp = true;
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
  bullets.forEach((bullet, bulletIndex) => {
    bullet.x = bullet.x + bullet.velocity.x / fps;
    bullet.y = bullet.y + bullet.velocity.y / fps;

    // update range remaining
    let distanceMoved = Math.sqrt((bullet.velocity.x / fps) ** 2 + (bullet.velocity.y / fps) ** 2)
    bullet.rangeRemaining = bullet.rangeRemaining - distanceMoved;
    // remove off-field and spent bullets
    if (
      bullet.x < 0 ||
      bullet.x > fieldX ||
      bullet.y < 0 ||
      bullet.y > fieldY ||
      bullet.rangeRemaining <= 0
    ) {
      bullets.splice(bulletIndex, 1);
    }
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
    ctx.beginPath();
    ctx.arc(bullet.x - viewportX, bullet.y - viewportY, 1, 0, 2 * Math.PI, false);
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
  // need to add oversize buffer so that other ships are drawn if slightly off screen

  // guard clause to check if ship is in the viewport
  if (ship.x < viewportX || ship.x > viewportX + viewportWidth || ship.y < viewportY || ship.y > viewportY + viewportHeight) return;

  // Canvas must be positioned and rotated before rotated items are drawn... the canvas is rotated, not the object
  ctx.translate(ship.x - viewportX, ship.y - viewportY);

  if (ship !== myShip) {
    // label:
    ctx.font = "10px Space Mono";
    ctx.fillStyle = "red";
    ctx.fillText(ship.user || "?", 20, 20);
  } else {
    // range circle to be used as visible shield when being shot
    // ctx.beginPath();
    // ctx.fillStyle = '#ccf5';
    // ctx.strokeStyle = 'blue';
    // ctx.lineWidth = 2;
    // ctx.arc(0, 0, bulletRange, 0, 2 * Math.PI);
    // ctx.fill();
    // ctx.stroke();
  }

  ctx.rotate(ship.direction);
  // Draw ship
  ctx.beginPath();
  ctx.strokeStyle = 'white';
  ctx.fillStyle = '#ccc';
  ctx.lineWidth = 1;
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
    // guard clause to check if asteroid is in the viewport
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

function clamp (num, min, max) {
  // limits num to between min and max
  return Math.min(Math.max(num, min), max);
}
// -----------    functions: game control     ------------------//

function die() {
  playSound(fireball);
  gameOver();
}

function boot() {
  // called if server is reset
  gameOver();
  purge();
}

function exitGame() {
  // called if browser tab loses focus
  // called if ESC is pressed
  sendStatus('exit', '');
  gameOver();
}

function purge() {
  asteroids.splice(0, asteroids.length);
  bullets.splice(0, bullets.length);
  explosions.splice(0, explosions.length);
  ships.splice(0, ships.length);
}

function updateScores() {
  let yOffset = 0.2;
  let spacer = document.getElementById('spacer');
  myScore.innerHTML = `<span>${myShip.rank}: ${myShip.user}</span><span>${myShip.score}</span>`;

  for (let i = 1; i <= leaderboardSize; i++) {

    if (myShip.rank === i) {
      if (spacer) spacer.style.display = 'none';
      myScore.style.top = `${yOffset * 1.5}rem`;
      yOffset++;
    }
    let list = ships.filter(ship => ship.rank === i);

    for (let j = 0; j < list.length; j++) {
      let ship = list[j];
      let thisScoreDiv = document.getElementById(`s${ship.socket}`);

      if (thisScoreDiv) {
        let rankLabel = ship.rank + ": ";

        if (myShip.rank === i || j !== 0) {
          rankLabel = '&nbsp;=';
        }
        thisScoreDiv.innerHTML = `<span>${rankLabel} ${ship.user}</span><span>${ship.score}</span>`;

        if (thisScoreDiv.style.display !== 'flex') thisScoreDiv.style.display = 'flex';
        thisScoreDiv.style.top = `${yOffset * 1.5}rem`;
        yOffset++;
      }
    }
  }

  let hideList = ships.filter(ship => ship.rank > leaderboardSize);
  hideList.forEach((ship) => {
    let div = document.getElementById(`s${ship.socket}`);
    div.style.display = 'none';
  });

  if (myShip.rank === 0 || myShip.rank > leaderboardSize) {
    if (!spacer) {
      spacer = document.createElement('div');
      spacer.id = 'spacer';
      spacer.classList.add('score');
      spacer.innerHTML = '---';
      spacer.style.textAlign = 'center';
      scoreWrapper.append(spacer);
    }
    spacer.style.top = `${yOffset * 1.5}rem`;
    spacer.style.display = 'block';
    yOffset++;
    myScore.style.top = `${yOffset * 1.5}rem`;
    yOffset++;
  }
  scoreWrapper.style.minHeight = `${yOffset * 1.5}rem`;
}
