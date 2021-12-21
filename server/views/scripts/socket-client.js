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
  console.log("toast received");
  Toastify({
    text: data,
    duration: 3000
  }).showToast();
});

socket.on("init", (data) => {
  fieldX = data.fX;
  fieldY = data.fY;
  console.log("Field-size: ", data.fX, data.fY);
});

socket.on('newGame', (data) => {
  myShip.x = data.x;
  myShip.y = data.y;
  myShip.velocity = new Vector(3 * Math.PI / 2, 20);

  // purge ships[]
  ships.length = 0;
  // repopulate ships[]
  // data.shipList.forEach((ship) => {
  //   let newShip = new Ship;
  //   newShip.socket = ship.socket;
  //   newShip.user = ship.user;
  //   newShip.x = ship.x;
  //   newShip.y = ship.y;
  //   newShip.direction = ship.direction;
  //   newShip.thruster = ship.thruster;
  // });

});

socket.on('ship', (pushedShip) => {
  let thisShip = ships.find(ship => {
    return ship.socket === pushedShip.socket;
  })

  if (thisShip === undefined) {
    console.log("unknown ship data received", pushedShip.socket, ships);
    // don't add ship.. causes multiple crashes
    // refactor
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
    console.log('valid ship data received');
  }
});

socket.on("die", () => {
  exitGame();
  // change to die();
});

socket.on("boot", () => {
  console.log("booted from server");
  exitGame();
});

socket.on('deadShip', (pushedShip) => {
  console.log(pushedShip.socket);
  let thisShip = ships.findIndex(ship => {
    return ship.socket === pushedShip.socket;
  })
  if (thisShip !== -1) ships.splice([thisShip], 1);
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




