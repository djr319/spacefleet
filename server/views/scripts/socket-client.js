const socket = io("http://localhost:5000"); // io("http://192.168.1.103:5000");

socket.on("connect", () => {
  console.log("Connected to server, id: ", socket.id)
  if (myShip.alive === true) die();
});

socket.on("connect_error", () => {
  console.log('connection error!!!!');
  socket.connect();
});

socket.on("disconnect", (reason) => {
  let today = new Date();
  let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  console.log("disconnected from server", time, reason); // undefined
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
   // for testing purposes
function sendPurge() {
  console.log("purge request sent!");
  console.table(ships);
  // socket.emit("purge", "") // request game reset
  socket.emit("print", "") // request game reset
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

socket.on("reset", () => {
  console.log("all reset!!!");
  asteroids.length = 0;
  console.table(asteroids);
  ships.length = 0;
  bullets.length = 0;
});

socket.on('deadShip', (deadshipId) => {
  if (deadshipId === socket.id) {
    console.log("KIA");
    die();
  } else {
    let deadShip = ships.find(ship => ship.socket === deadshipId);
    if (deadShip !== undefined) {
      Toastify({
        text: `${deadShip.user} has died`,
        duration: 3000
      }).showToast();
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

socket.on('scoreBoard', (scores) => {
  if (myShip.alive === false) return;

  let me = scores.find((el) => {
    return el.id === socket.id;
  })
  myScore = me.score;
});
