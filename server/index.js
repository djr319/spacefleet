const {game} = require('./controllers/game-controller');
const http = require('http');
const express = require('express');
const io = require('socket.io').Server;
const PORT = 5000;

const socketHandler = require('./controllers/socket-controller');
const app = express();
const httpServer = http.createServer(app);
const socketServer = new io(httpServer);

socketHandler(socketServer);
game();

// ------------ http static ---------- //

app.use(express.static('./views'));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

httpServer.listen(PORT, () => {
  console.log(`app listening on http://localhost:${PORT}  🚀`);
});

// ------------   game   ---------- //



