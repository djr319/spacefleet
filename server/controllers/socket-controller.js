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
  messageQueue,
  obituries
} = require('../models/storage')

const { joinGame, warp, purge, fps: FPS } = require('./game-controller');

function socketHandler(socketServer) {

  // ---------- initialize  ---------- //
  socketServer.on('connection', (socket) => {
    console.log('User connected: ' + socket.id);

    socket.on('disconnect', function () {
      console.log(socket.id + " disconnected");
      // would be nice to try to rejoin on same socket
      let deadShips = ships.filter((el) => { return el.socket === socket.id });
      if (deadShips.length > 0) {
        socket.emit("toast", `${deadShips} lost connection`);
        deathAnnoucment(deadShips);
        deadShips.forEach((el) => {
          ships.splice(ships[ships.indexOf(el.socket)], 1);
        });

      } else {
        console.table(ships);
        console.warn("Unable to delete disconnected ship: ", socket.id);
      }
    });

    socket.on("reconnect", () => {
      console.log("reconnected");
    });

    socket.on('join', (name) => {
      console.log(name, 'joined');
      let newShip = joinGame(name, socket.id);

      socket.emit("toast", `Welcome, ${name}`);
      socket.emit("newGame", {
        x: newShip.x,
        y: newShip.y,
        velocity: { angle: 0, size: 0 }
      })
      // message all other users that user joined game
      socket.broadcast.emit("toast", `${name} joined the game`);
      socket.broadcast.emit("newShip", {
        x: newShip.x,
        y: newShip.y,
        socket: socket.id,
        user: name
      })


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
      socket.broadcast.emit("ship", {
        x: ship.x,
        y: ship.y,
        direction: ship.direction,
        thruster: ship.thruster,
        socket: socket.id
      });
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

    // socket.on('shot', (bullet) => {
    //   const newBullet = new Bullet();
    //   newBullet.x = bullet.x;
    //   newBullet.y = bullet.y;
    //   newBullet.velocity = bullet.velocity;
    //   newBullet.user = socket.id;
    //   newBullet.reach = bullet.reach
    //   bullets.push(newBullet);
    // });

    socket.on('purge', () => {
      purge();
      console.log(ships);
    });


    // ---------- send ---------- //

    setInterval(() => {
      pushAsteroids();
      checkObituries();
      // pushBullets();
    }, FPS);

    function pushAsteroids() {
      asteroids.forEach((asteroid) => {
        socketServer.emit('asteroid', {
          x: asteroid.x,
          y: asteroid.y,
          size: asteroid.size,
          id: asteroid.id
        });
      })

    }

    // ---------- send ---------- //

    // ships are sent by reflection

    function checkObituries() {
      while (obituries.length > 0) {
        let deadShip = obituries[0];
        deathAnnoucment(deadShip, 'loud');
      };
    }

    function deathAnnoucment(user, mode = 'silent') {
      console.log(user, "has died");
      mode !== 'silent' && socketServer.emit("toast", `${user} died`);
      socket.broadcast.emit("deadShip", { socket: socket.id });
    }
  });
};

module.exports = socketHandler;
