const connections = [];

function addConnection(socket) {
  console.log('A user connected, id: ' + socket.id);
  connections.push(socket);
}

function removeConnection(socket) {
  connections.splice(connections.indexOf(socket), 1);
}

function playersOnline() {
  return connections.length;
}

function socketRouter(socket, io) {
  // socket.join('default-room');
  console.log('User connected: ' + socket.id);
  addConnection(socket.id);

  // ---------- receive ---------- //
  socket.on('join', (name) => {
    sendToast(name + ' joined the game');
  });

  socket.on('shipUpdate', (bullet) => {

  });

  socket.on('shoot', (bullet) => {

  });

  socket.on('disconnect', function (socket) {
    console.log('User disconnected: ' + socket.id);
    removeConnection(socket);
  });

  // ---------- send ---------- //

  function sendToast(message) {
    socket.broadcast.emit('toast', message);
  };

  // function sendToast(message) {
  //   socket.broadcast.emit('toast', message);
  //   console.log('toast sent');
  // }

  function sendShips(positions) {
    socket.broadcast.emit('ships', positions);
  }

  function sendAsteroids(positions) {
    socket.broadcast.emit('asteroids', positions);
  }

  function sendBullets(positions) {
    socket.broadcast.emit('bullets', positions);
  }

  function sendExplosions(positions) {
    socket.broadcast.emit('explosions', positions);
  }

  function sendScores(scores) {
    socket.broadcast.emit('scores', scores);
  }

  function INCOMING_REQUEST_FROM_GAME(data) {
    // called by a game method when it wants to transmit to clients
    socket.emit(data)
  }

  // return {
  // }

}
export default socketRouter;
