
exports.socketRouter = (socket) => {
  console.log('A user connected, id: ' + socket.id);

  // ---------- receive ---------- //
  socket.on('join', (name) => {
    sendToast(name + ' joined the game');
    // create new user
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
}
