const socket = io("http://localhost:5000");
// const socket = io("https://space-fleet.herokuapp.com/");

socket.on("connect", () => {
  console.log("Connected to server, id: ", socket.id)
  if (myShip.alive === true) die();
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
  console.log('status sent: ' + type);
  socket.emit(type, object); // buffered & assured
}

function sendUpdate(type, object) { // ship,
    socket.volatile.emit(type, object) // only lastest, no buffering
}

// -------------       Listeners       -----------  //

socket.on('toast', (data) => {
  console.log("toast: ", data);
  if (myShip.alive === true) {
    Toastify({
      text: data,
      duration: 3000
    }).showToast();
  }

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
});

socket.on('ship', (pushedShip) => {
  let thisShip = ships.find(ship => {
    return ship.socket === pushedShip.socket;
  })

  if (thisShip === undefined) {
    console.log("data received from new ship", pushedShip.socket);
    ships.push(new Ship(
      pushedShip.x,
      pushedShip.y,
      pushedShip.socket,
      pushedShip.user
    ));
    let scoreBoard = document.getElementById('score-board');

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

  // score (.score & .rank)
});

socket.on("myScore", (data) => {
  myScore = data.score;
  myRank = data.rank;
});

socket.on("die", (data) => {
  console.log("I'm dead! ", data);
  die();
});

socket.on("boot", () => {
  console.log("booted from server");
  boot();
});

socket.on("reset", () => {
  console.log("all reset!!!");
  asteroids.length = 0;
  console.table(asteroids);
  ships.length = 0;
  bullets.length = 0;
});

socket.on('deadShip', (deadShipId) => {
  if (deadShipId === socket.id) {
    console.log("KIA");
    die();
  } else {
    let deadShip = ships.find(ship => ship.socket === deadShipId);
    if (deadShip !== undefined) {
      Toastify({
        text: `${deadShip.user} has died`,
        duration: 3000
      }).showToast();
      let deadShipScore = document.getElementById(`s${deadShipId}`);
      console.log('remove div for deadship', deadShipId);
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
  console.log('warp data received');
});

socket.on('bullet', (data) => {
  let newBullet = new Bullet();
  newBullet.x = data.x;
  newBullet.y = data.y;
  newBullet.velocity = new Vector(data.v.angle, data.v.size)
  bullets.push(newBullet);
});
