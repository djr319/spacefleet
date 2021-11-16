const {io} = require('../index');
const connections = [];

function playersOnline() {
  return connections.length;
}

function INCOMING_REQUEST_FROM_GAME(data) {
  // called by a game method when it wants to transmit to clients
  // io.emit(data);
}

io.on('connection', (socket) => {
  connections.push(socket.id);

  socket.on('disconnect', function () {
    console.log('User disconnected: ' + socket.id);
    connections.splice(connections.indexOf(socket), 1);
  });

  socket.on('join', (name) => {
    console.log('User connected: ' + socket.id);
    sendToast(io, `${name} joined the game`);
  });

});

// ---------- receive ---------- //


function socketRouter() {

  socket.on('shipUpdate', (ship) => {

  });

  socket.on('shoot', (bullet) => {

  });

  // ---------- send ---------- //

  // function (message) {
  //   io.broadcast.emit('toast', message);
  // };

  // function sendToast(message) {
  //   socket.broadcast.emit('toast', message);
  //   console.log('toast sent');
  // }

  function sendShips(positions) {
    io.broadcast.emit('ships', positions);
  }

  function sendAsteroids(positions) {
    io.broadcast.emit('asteroids', positions);
  }

  function sendBullets(positions) {
    io.broadcast.emit('bullets', positions);
  }

  function sendExplosions(positions) {
    io.broadcast.emit('explosions', positions);
  }

  function sendScores(scores) {
    io.broadcast.emit('scores', scores);
  }
}
Modules.export = socketRouter;
