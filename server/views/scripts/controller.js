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
controller.input = function (e) { // was controls
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

controller.keyupControls = function (e) { // was keyupControls

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
