const Bullet = require('../components/bullets');
const Explosion = require('../components/explosions');
const {
  asteroids,
  bullets,
  ships,
  users,
  scores,
  obituries
} = require('../models/storage')

const { joinGame, warp, purge, die, fps: FPS, fieldX, fieldY } = require('./game-controller');

const blockList = [];

function socketHandler(socketServer) {

  // ---------- initialize  ---------- //
  socketServer.on('connection', (socket) => {
    console.log('User connected: ' + socket.id);
    socket.emit("init", {
      fX: fieldX,
      fY: fieldY
    })

    socket.on('join', (name) => {
      console.log(name, 'joined');
      let newShip = joinGame(name, socket.id);

      socket.emit("toast", `Welcome, ${name}`);
      socket.emit("newGame", {
        x: newShip.x,
        y: newShip.y,
      })

      // message all other users that user joined game
      socket.broadcast.emit("toast", `${name} joined the game`);
    });
    // ---------- listeners ---------- //

    socket.on('ship', (ship) => {
      let thisShip = ships.find(obj => {
        return obj.socket === socket.id;
      });
      if (thisShip === undefined) {
        if (blockList.indexOf(socket.id) === -1) {
          console.log("received data from unknown ship");
          blockList.push(socket.id);
          // socket.emit("boot", "");
          setTimeout(()=>{
            let deadShip = blockList.find(obj => {
              return obj === socket.id;
            });
            blockList.splice(blockList[deadShip], 1)
          }, 5000);
        }
      } else {
        // update server array
        thisShip.x = ship.x;
        thisShip.y = ship.y;
        thisShip.direction = ship.direction;
        thisShip.thruster = ship.thruster;

        // transmit to other players
        socket.broadcast.emit("ship", {
          x: thisShip.x,
          y: thisShip.y,
          direction: thisShip.direction,
          thruster: thisShip.thruster,
          socket: thisShip.socket,
          user: thisShip.user
        });
      };
    });

    socket.on('warp', () => {
      let thisShip = ships.find(obj => {
        return obj.socket === socket.id;
      })
      if (thisShip === undefined) {
        console.log('who said warp? ', socket.id);
        socket.emit("toast", "Can't warp!");
      } else {
        warp(thisShip);
        socket.emit("warp",
          {
            x: thisShip.x,
            y: thisShip.y
          }
        );
        console.log('warp details sent to ' + socket.id);

      }
    });

    socket.on('shot', (bullet) => {

      const newBullet = new Bullet();
      newBullet.x = bullet.x;
      newBullet.y = bullet.y;
      newBullet.velocity = bullet.velocity;
      newBullet.user = socket.id;
      newBullet.reach = bullet.reach;
      bullets.push(newBullet);

      socketServer.emit('bullet', {
        x: newBullet.x,
        y: newBullet.y,
        v: newBullet.velocity,
        id: newBullet.id
      })
    });

    socket.on('purge', () => {
      resetAll();
    });

    // ---------- send ---------- //

    setInterval(() => {
      pushAsteroids();
      checkObituries();
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

    function checkObituries() {
      while (obituries.length > 0) {
        let deadShip = obituries[0];
        console.log("obituries page ", deadShip.user);
        deathAnnouncement(deadShip, 'loud');
        let newExplosion = new Explosion(deadShip.x, deadShip.y, deadShip.velocity);
        socketServer.emit('newExplosion', {
          x: newExplosion.x,
          y: newExplosion.y,
          v: newExplosion.velocity,
          start: newExplosion.start,
          id: newExplosion.id
        });
        obituries.shift();
      };
    }

    function deathAnnouncement(deadship, mode = 'silent') {
      console.log("mode :", mode);
      console.log(deadship.user, "has died");
      // mode !== 'silent' &&
        socket.broadcast.emit("toast", `${deadship.user} died`);
        socket.broadcast.emit("deadShip", { socket: socket.id });
        socket.emit("die", "");
    }

    // ---------- connection issues ---------- //

    socket.on('disconnect', function () {

      console.log(socket.id + " disconnected");
      // would be nice to try to rejoin on same socket
      let deadShips = ships.filter((el) => { return el.socket === socket.id });
      if (deadShips.length > 0) {
        socket.emit("toast", `${deadShips} lost connection`);
        deathAnnouncement(deadShips);
        deadShips.forEach((el) => {
          ships.splice(ships[ships.indexOf(el.socket)], 1);
        });
        console.table(ships);
      } else {
        console.table(ships);
        console.warn("Unable to delete disconnected ship: ", socket.id);
      }
    });

    socket.on("reconnect", () => {
      console.log("reconnected");
    });
  });
};
module.exports = socketHandler;
