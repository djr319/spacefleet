const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log("Connected to server, id: ", socket.id)
});

// -------------       Send       -----------  //

function sendStatus(type, object, callback = () => { }) {
  socket.emit(type, object) // buffered & assured
}

function sendUpdate(type, object) {
  socket.volatile.emit(type, object) // only lastest, no buffering
}
// for testing
function sendPurge() {
  console.log("purge request sent!");
  socket.emit("purge", "") // request game reset
}

// -------------       Receive       -----------  //

socket.on('toast', (data) => {
  console.log("toast received");
  Toastify({
    text: data,
    duration: 3000
  }).showToast();
});

socket.on('newGame', (data) => {
  myShip.x = data.x;
  myShip.y = data.y;
  myShip.velocity = new Vector(data.velocity.angle, data.velocity.size);
  ships.splice(0, ships.length);
});

socket.on('newShip', (pushedShip) => {
  ships.push(new Ship(
    pushedShip.x,
    pushedShip.y,
    pushedShip.id,
    pushedShip.user
  ))
});

socket.on('deadShip', (pushedShip) => {
  console.log(pushedShip.socket);
  let thisShip = ships.findIndex(ship => {
    return ship.socket === pushedShip.socket;
  })
  ships.splice([thisShip], 1);
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

// socket.on('bullets', (data) => {
//   // TODO
// });

socket.on('ship', (pushedShip) => {
  let thisShip = ships.findIndex(ship => {
    return ship.socket === pushedShip.socket;
  })
  if (thisShip === -1) {
    console.log("unknown ship data received");
  } else {
    ships[thisShip].x = pushedShip.x;
    ships[thisShip].y = pushedShip.y;
    ships[thisShip].direction = pushedShip.direction;
    ships[thisShip].thruster = pushedShip.thruster;
  }
});


