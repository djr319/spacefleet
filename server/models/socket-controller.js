
export default function socketRouter (socket) {
  console.log('A user connected, id: ' + socket.id);

  // ---------- receive ---------- //
  socket.on('join', (name) => {
    sendToast(name + ' joined the game');
    // joinGame(name, socket.id);
  });

  // ---------- send ---------- //

  // socket.on('disconnect', function (socket) {
  //   console.log('A user disconnected');
  // });
  // }
  // function sendToast (message) {
  //   socket.broadcast.emit('toast', message);

  // };

  function sendToast(message) {
    socket.broadcast.emit('toast', message);
    console.log('toast sent');
  }

  // function sendShips(positions) {
  //   socket.broadcast.emit('ships', positions);
  // }

  // function sendAsteroids(positions) {
  //   socket.broadcast.emit('asteroids', positions);
  // }

  // function sendBullets(positions) {
  //   socket.broadcast.emit('bullets', positions);
  // }

  // function sendExplosions(positions) {
  //   socket.broadcast.emit('explosions', positions);
  // }

  // function sendScores(scores) {
  //   socket.broadcast.emit('scores', scores);
  // }
}
