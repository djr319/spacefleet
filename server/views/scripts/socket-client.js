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
  console.log(type + "update sent");
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
  console.log("toast received");
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
  console.log('myShip', myShip);
  newGame();
});

socket.on('warp', (data) => {
  myShip.x = data.x;
  myShip.y = data.y;
});

socket.on('bullets', (data) => {

});


