// const io = require("socket.io-client");
// const outbound = io("http://localhost:3000");
const Bullet = require('../components/bullets');
const Ship = require('../components/ships');
const {
  asteroids,
  bullets,
  explosions,
  ships,
  users,
  scores,
  messageQueue
} = require('../models/storage')

const { joinGame, warp } = require('./game-controller');

function socketHandler(socketServer) {

  // ---------- initialize  ---------- //
  socketServer.on('connection', (socket) => {
    console.log('User connected: ' + socket.id);

    socket.on('disconnect', function () {
      // would be nice to try to rejoin on same socket
      let oneDeadShip = ships.findIndex((el) => { return el.socket === socket.id });
      if (oneDeadShip !== -1) {
        socket.emit("toast", `${oneDeadShip} lost connection`);
        ships.splice(ships[oneDeadShip], 1);
      } else {
        console.warn("Unable to delete disconnected ship");
      }
    });

    socket.on('join', (name) => {
      // socket.data.username = name; // attach to socket
      console.log(name, 'joined');
      let newShip = joinGame(name, socket.id);

      // message all other users that user joined game
      socket.broadcast.emit("toast", `${name} joined the game`);
      socket.emit("toast", `Welcome, ${name}`);

      // message user with ship position
      socket.emit("newGame",
        {
          x: newShip.x,
          y: newShip.y,
        });
    });
    // ---------- receive ---------- //

    socket.on('ship', (ship) => {
      let thisShip = ships.find(obj => {
        return obj.socket === socket.id;
      });
      if (thisShip === undefined) {
        // do nothing
      } else {
        thisShip.x = ship.x;
        thisShip.y = ship.y;
        thisShip.direction = ship.direction;
        thisShip.thruster = ship.thruster;
        // array updated OK
      };
    });

    socket.on('warp', () => {
      let thisShip = ships.find(obj => {
        return obj.socket === socket.id;
      })
      if (thisShip === undefined) {
        console.log('who said warp?');

      } else {
        warp(thisShip);
        socket.emit("warp",
        {
          x: thisShip.x,
          y: thisShip.y
        }
        );
      }
    });

    socket.on('shot', (bullet) => {
      const newBullet = new Bullet();
      newBullet.x = bullet.x;
      newBullet.y = bullet.y;
      newBullet.velocity = bullet.velocity;
      newBullet.user = socket.id;
      newBullet.reach = bullet.reach
      bullets.push(newBullet);
    });
  });


  // ---------- send ---------- //

  setInterval(() => {
    pushAsteroids();
    pushShips();
    // pushBullets();
  }, 200);

  function pushAsteroids() {
        // need to be sent sperately
    socketServer.emit('asteroids', asteroids);
  }

  // ---------- send ---------- //

  function pushShips() {
    // need to be sent sperately
    socketServer.emit('ships', ships);
  }

  function deathNotice(user, mode='silent') {
    console.log(user, "has died");
    socketServer.emit("toast", `${user} died`);
  };
};

module.exports = socketHandler;
