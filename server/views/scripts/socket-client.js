const socket = io("http://localhost:5000");
let socketId = '';
socket.on("connect", () => {
  socketId = socket.id;
  console.log(socketId);
});

// -------------       Send       -----------  //

function sendStatus(type, object) {
  socket.emit(type, object) // all buffered are sent
}

function sendUpdate(type, object) {
  socket.volatile.emit(type, object) // will only send lastest, no buffering
}
// -------------       Receive       -----------  //

socket.on('payload', (data) => {

});


