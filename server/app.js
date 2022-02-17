const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 5000;

const { game } = require('./controllers/game-controller');
const { socketHandler } = require('./controllers/socket-controller');

const httpServer = http.createServer(handler);

httpServer.listen(PORT, () => {
  console.log(`app listening on port ${PORT}  🚀`);
});

const socketServer = require('socket.io')(httpServer, { cors: {} });

socketHandler(socketServer);
game();

// ------------ http static ---------- //

function handler(req, res) {

  if (req.url === "/") {
    fs.readFile(path.join(__dirname, 'views/index.html'), function (err, data) {
      if (!err) {
        res.setHeader('Content-type', 'text/html');
        res.end(data);
      } else {
        console.log('error finding root index.html');
        res.writeHead(404, "Not Found");
        res.end();
      }
    });
   } else {

    fs.readFile(path.join(__dirname, 'views', req.url), function (err, data) {
      if (!err) {
        var dotoffset = req.url.lastIndexOf('.');
        var mimetype = dotoffset == -1
          ? 'text/plain'
          : {
            '.html': 'text/html',
            '.ico': 'image/x-icon',
            '.jpg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.css': 'text/css',
            '.js': 'text/javascript',
            '.mp3': 'audio/mpeg',
            '.wav': 'audio/wav'
          }[req.url.substr(dotoffset)];
        res.setHeader('Content-type', mimetype);
        res.end(data);
      } else {
        console.log('file not found: ' + req.url);
        res.writeHead(404, "Not Found");
        res.end();
      }
    });

  }
}
