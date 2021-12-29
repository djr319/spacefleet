const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log("Connected to server, id: ", socket.id)
});

// -------------       Send       -----------  //

function sendStatus(type, object) { // join, warp,
  socket.emit(type, object) // buffered & assured
}

function sendUpdate(type, object) { // ship,
    socket.volatile.emit(type, object) // only lastest, no buffering
}
// for testing
function sendPurge() {
  console.log("purge request sent!");
  console.table(ships);
  socket.emit("purge", "") // request game reset
}

// -------------       Listeners       -----------  //

socket.on('toast', (data) => {
  console.log("toast: ", data);
  Toastify({
    text: data,
    duration: 3000
  }).showToast();
});

socket.on("init", (data) => {
  fieldX = data.fX;
  fieldY = data.fY;
});

socket.on('newGame', (data) => {
  myShip.x = data.x;
  myShip.y = data.y;
  myShip.velocity = new Vector(3 * Math.PI / 2, 20);
  myShip.alive = true;
  ships.length = 0;
});

socket.on('ship', (pushedShip) => {
  if (myShip.alive === false) {
    return;
  }
  let thisShip = ships.find(ship => {
    return ship.socket === pushedShip.socket;
  })

  if (thisShip === undefined) {
    console.log("data received from new ship", pushedShip.socket, ships);
    ships.push(new Ship(
      pushedShip.x,
      pushedShip.y,
      pushedShip.socket,
      pushedShip.user
    ));
  } else {
    thisShip.x = pushedShip.x;
    thisShip.y = pushedShip.y;
    thisShip.direction = pushedShip.direction;
    thisShip.thruster = pushedShip.thruster;
  }
});

socket.on("die", (data) => {
  console.log("I'm dead! ", data);
  die();
});

socket.on("boot", () => {
  console.log("booted from server");
  boot();
});

socket.on('deadShip', (deadshipId) => {
  console.log(deadshipId, " has been reported dead");
  let deadShip = ships.findIndex(ship => {
    return ship.socket === deadshipId;
  })
  console.log('deadship index: ', deadShip);

  if (deadShip !== -1) ships.splice([deadShip], 1);
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

socket.on('newExplosion', (data) => {
  let newExplosion = new Explosion(data.x, data.y, new Vector(data.angle, data.size));
  explosions.push(newExplosion);
  console.log("new explosion received on socket-client");
})

// socket.on('score', (data) => {
//   let tempScores = [];
//   for (let [key, value] of Object.entries(data)) {
//     if (key = socket.id) {
//       myScore = value;
//     } else {
//       scores.push({
//         userName: key,
//         Score: value
//       });
//     }
//   }
//   scores = tempScores;
// });

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
