const http = require('http');
const express = require('express');
var cors = require('cors');
const PORT = 5000;

const { game } = require('./controllers/game-controller');
const { socketHandler } = require('./controllers/socket-controller');
const app = express();
const httpServer = http.createServer(app);
const socketServer = require('socket.io')(httpServer, {
  cors: {

  }
});
// const socketServer = new io(httpServer);

socketHandler(socketServer);
game();

// ------------ http static ---------- //

app.use(express.static('./views'));
// app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

httpServer.listen(PORT, () => {
  console.log(`app listening on http://localhost:${PORT}  🚀`);
});



