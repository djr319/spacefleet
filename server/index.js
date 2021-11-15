
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer);
const { socketRouter } = require('./socketRouter');
require('./game');

// ------------ sockets ---------- //
io.on('connection', (socket) => {
  socketRouter(socket);
});

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
