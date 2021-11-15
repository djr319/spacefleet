const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log("Connected to socket server");
});

// -------------       Send       -----------  //

function sendStatus(type, object) {
  socket.emit(type, object) // all buffered are sent
  console.log(type + "sent");
}

function sendUpdate(type, object) {
  socket.volatile.emit(type, object) // will only send lastest, no buffering
  console.log(type + "sent");
}
// -------------       Receive       -----------  //

socket.on('toast', (data) => {
  console.log("toast received");
  Toastify({
    text: data,
    duration: 3000
    }).showToast();
});


