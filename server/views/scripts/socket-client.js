// const socket = io("http://localhost:5000");
const socket = io("https://space-fleet.herokuapp.com/");

function toast(message) {
  if (myShip.alive === true) {
    Toastify({
      text: message,
      duration: 2500,
      position: "left",
      style: {
        background: "linear-gradient(to bottom, #367a72, #eeeeee)",
      }
    }).showToast();
  }
}

socket.on("connect", () => {
  console.log("Connected to server, id: ", socket.id)
  // if (myShip.alive === true) die();
});

socket.on("connect_error", () => {
  console.log('connection error!');
  socket.connect();
});

socket.on("disconnect", (reason) => {
  let today = new Date();
  let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  console.log("disconnected from server", time, reason);
  die();
});

// -------------       Send       -----------  //

function sendStatus(type, object) { // join, warp,
  socket.emit(type, object); // buffered & assured
}

function sendUpdate(type, object) { // ship,
    socket.volatile.emit(type, object) // only lastest, no buffering
}

// -------------       Listeners       -----------  //

socket.on('toast', (data) => {
  toast(data);
});

socket.on("init", (data) => {
  fieldX = data.fX;
  fieldY = data.fY;
  bulletRange = data.bulletRange;
  purge();
});

socket.on('newGame', (data) => {
  myShip.x = data.x;
  myShip.y = data.y;
  myShip.direction = data.direction;
  myShip.velocity = new Vector(data.angle, data.size);
  myShip.alive = true;
  myShip.user = sessionStorage.getItem('name');
});

socket.on('ship', (pushedShip) => {
  let thisShip = ships.find(ship => {
    return ship.socket === pushedShip.socket;
  })

  if (thisShip === undefined) {
    ships.push(new Ship(
      pushedShip.x,
      pushedShip.y,
      pushedShip.socket,
      pushedShip.user
    ));
    let scoreBoard = document.getElementById('score-wrapper');
    let newDiv = document.createElement('div');
    newDiv.id = `s${pushedShip.socket}`;
    newDiv.classList.add('score');
    scoreBoard.appendChild(newDiv);
  } else {
    thisShip.x = pushedShip.x;
    thisShip.y = pushedShip.y;
    thisShip.direction = pushedShip.direction;
    thisShip.thruster = pushedShip.thruster;
    thisShip.rank = pushedShip.rank;
    thisShip.score = pushedShip.score;
  }
});

socket.on("myScore", (data) => {
  myShip.score = data.score;
  myShip.rank = data.rank;
});

socket.on("denied", (reason) => {
  console.log('Not allowed in game', reason);
  die();
});

socket.on("die", (data) => {
  die();
});

socket.on("boot", () => {
  console.log("booted from server");
  boot();
});

socket.on('deadShip', (deadShipId) => {
  if (deadShipId === socket.id) {
    console.log("KIA");
    die();
  } else {
    let deadShip = ships.find(ship => ship.socket === deadShipId);
    if (deadShip !== undefined) {
      let deadShipScore = document.getElementById(`s${deadShipId}`);
      deadShipScore.remove();
      ships.splice(deadShip, 1)
    }
  }
});

socket.on('trash', (trashId) => {
  let trash = asteroids.findIndex((asteroid) => {
    return asteroid.id === trashId;
  })
  if (trash !== -1) {
    asteroids.splice(trash, 1);
  }
});

socket.on('asteroid', (incoming) => {
  let thisAsteroid = asteroids.findIndex(asteroid => {
    return asteroid.id === incoming.id;
  })
  if (thisAsteroid === -1) {
    asteroids.push(new Asteroid(
      incoming.x,
      incoming.y,
      incoming.size,
      incoming.id
      ))
  } else {
    asteroids[thisAsteroid].x = incoming.x;
    asteroids[thisAsteroid].y = incoming.y;
    asteroids[thisAsteroid].size = incoming.size;
  }
});

socket.on('gravity', (data) => {
  if (data.ship === socket.id) {
    myShip.velocity.add(new Vector(data.gravity.angle, data.gravity.size));
  }
})

socket.on('newExplosion', (data) => {
  let newExplosion = new Explosion(data.x, data.y, new Vector(data.angle, data.size));
  explosions.push(newExplosion);
})

socket.on('warp', (data) => {
  myShip.x = data.x;
  myShip.y = data.y;
});

socket.on('bullet', (data) => {
  let newBullet = new Bullet();
  newBullet.x = data.x;
  newBullet.y = data.y;
  newBullet.velocity = new Vector(data.v.angle, data.v.size)
  bullets.push(newBullet);
});
