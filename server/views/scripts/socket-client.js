const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log("Connected to socket server");
  console.log('Socket ID:  ', socket.id)
});

// -------------       Send       -----------  //
  /*
  join, name
  */
function sendStatus(type, object) {
  socket.emit(type, object) // all buffered are sent
}
  /*
  ship: x,y,velocity, direction (socketId is automatic)
  shoot: x,y,velocity, (timestamp?)
  */
function sendUpdate(type, object) {
  socket.volatile.emit(type, object) // will only send lastest, no buffering
}

// -------------       Receive       -----------  //
/*
  toast:
  death:
  score:

  asteroids
  ships
  bullets
*/
socket.on('toast', (data) => {
  Toastify({
    text: data,
    duration: 3000
    }).showToast();
});

socket.on('death', (data) => {
  if (data.socket = socket.id) {
    console.log("killed");
    die();
  } else {
    ships.
    Toastify({
      text: `${data.userName} died`,
      duration: 3000
      }).showToast();
  }
});

socket.on('score', (data) => {
  let tempScores = [];
  for (let [key, value] of Object.entries(data)) {
    if (key = socket.id) {
      myScore = value;
    } else {
      scores.push({
        userName: key,
        Score: value
      });
    }
  }
  scores = tempScores;
});

socket.on('asteroids', (data) => {

});

socket.on('newGame', (data) => {
  myShip.x = data.x;
  myShip.y = data.y;
  newGame();
});

socket.on('warp', (data) => {
  myShip.x = data.x;
  myShip.y = data.y;
});

socket.on('bullets', (data) => {

});

socket.on('ship', (ship) => {
  let thisShip = ships.filter(obj => {
    return socket === ship.socket;
  })
  thisShip.x = ship.x;
  thisShip.y = ship.y;
  thisShip.direction = ship.direction;
  thisShip.socket = socket.id;
  thisShip.thruster = ship.thruster
});

socket.on('newShip', (ship) => {
  let thisShip = new Ship;
  thisShip.x = ship.x;
  thisShip.y = ship.y;
  thisShip.direction = ship.direction;
  thisShip.socket = socket.id;
  thisShip.user = ship.user;
  thisShip.thruster = ship.thruster
  ships.push(thisShip);
  console.log("New Version of SHIP array", ships);
});
