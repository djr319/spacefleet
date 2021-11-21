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


socket.on('newGame', (data) => {
  myShip.x = data.x;
  myShip.y = data.y;
  newGame();
});

socket.on('asteroids', (incoming) => {
  asteroids = incoming;
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


socket.on('warp', (data) => {
  myShip.x = data.x;
  myShip.y = data.y;
  console.log('warp data received');
});

socket.on('bullets', (data) => {

});

socket.on('ships', (pushedShips) => {
  ships = [];
  pushedShips.forEach((el) => {
    if (el.socket === socket.id) {
      // do nothing
      } else {
      ships.push(el);
      }
  });


});




