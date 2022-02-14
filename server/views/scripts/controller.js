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

function controls (e) {
  switch (e.key) {
    case 'm':
    case 'M':
      if (!e.repeat) toggleMusic();
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
      if (!e.repeat) warp();
      break;
    }

    case 'D':
    case 'ArrowRight':
    case 'd': controller.rotateR.pressed = true;
      break;

    case ' ': controller.shoot.pressed = true;
      break;

    case 'Escape':
      if (!e.repeat) exitGame();
      break;

    default: break;
  }
}

function keyupControls (e) {

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

function mouseDown(e) {
  e.preventDefault();
  controller.shoot.pressed = true;
}

function mouseUp() {
  controller.shoot.pressed = false;
}

function controlsNeutral () {
  controller.thrust.pressed = false;
  controller.rotateL.pressed = false;
  controller.rotateR.pressed = false;
  controller.shoot.pressed = false;
}

function setControlListeners () {

  controlsNeutral();
  document.addEventListener("keydown", controls);
  document.addEventListener("keyup", keyupControls);
  document.addEventListener('mousedown', mouseDown);
  document.addEventListener('mouseup', mouseUp);
}

function removeControlListeners() {

  controlsNeutral();
  document.removeEventListener("keydown", controls);
  document.removeEventListener("keyup", keyupControls);
  document.removeEventListener('mousedown', mouseDown);
  document.removeEventListener('mouseup', mouseUp);
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
