const http = require('http');
const fs = require('fs');
const PORT = 5000;

const { game } = require('./controllers/game-controller');
const { socketHandler } = require('./controllers/socket-controller');

const httpServer = http.createServer(handler);

httpServer.listen(PORT, () => {
  console.log(`app listening on http://localhost:${PORT}  🚀`);
});

const socketServer = require('socket.io')(httpServer, { cors: {} });

socketHandler(socketServer);
game();

// ------------ http static ---------- //

function handler(req, res) {

  if (req.url === "/") req.url = "index.html";

  fs.readFile(__dirname + '/views/' + req.url, function(err, data) {
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
            '.js': 'text/javascript'
          }[req.url.substr(dotoffset)];
        res.setHeader('Content-type', mimetype);
        res.end(data);
        console.log(req.url, mimetype);
    } else {
        console.log ('file not found: ' + req.url);
        res.writeHead(404, "Not Found");
        res.end();
    }
  });
}
