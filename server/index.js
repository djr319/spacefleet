
const express = require('express');
const http = require('http');
const { Server } = require( "socket.io");
const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer);

// const game = require('./models/game-controller.js');

// ------------ start game ---------- //
// initiate game
// game();
// within the game, you will be able to call socketFuncs.INCOMING_REQUEST_FROM_GAME()
// to update your clients with new game state

// ------------ sockets ---------- //

  // const socketSet = addSocket(socket, io);

// ------------ http static ---------- //
const PORT = 5000;
app.use(express.static('./views'));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

httpServer.listen(PORT, () => {
  console.log(`app listening on http://localhost:${PORT}  🚀`);
});

// io.on('connection', (socket) => {
//   connections.push(socket.id);

//   socket.on('disconnect', function () {
//     console.log('User disconnected: ' + socket.id);
//     connections.splice(connections.indexOf(socket), 1);
//   });

//   socket.on('join', (name) => {
//     console.log('User connected: ' + socket.id);
//     sendToast(io, `${name} joined the game`);
//   });

// });

module.export = io;
