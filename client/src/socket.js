const io = require("./socket.io.min.js");
const socket = io('http://localhost:5000');



// socket.emit("hello", { a: "b", c: [] });

socket.on("connect", () => {
  console.log(socket.id); // "G5p5..."
  console.log(socket.connected); // true
});

// socket.on("hey", (...args) => {
// // ...
// });

// socket.on("disconnect", () => {
//   socket.connect();
// });

// socket.send([...args][, ack])
// socket.emit(eventName[, ...args][, ack])

// socket.on("news", (data) => {
//   console.log(data);
// });

// socket.onAny((event, ...args) => {
//   console.log(`got ${event}`);
// });

// socket.disconnect()

// socket.on("connect_error", (error) => {
//   // ...
// });

export default socket;
