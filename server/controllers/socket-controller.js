const { bulletRange, Bullet } = require('../components/bullets');
const { Vector } = require('../components/vector');

const {
  asteroids,
  bullets,
  ships,
  obituries,
  oldBullets,
  broadcasts,
  explosions,
  garbageCollectionList
} = require('../models/storage')

const {
  joinGame,
  warp,
  updatesPerSecond,
  fieldX,
  fieldY
} = require('./game-controller');

function socketHandler(socketServer) {

  // ---------- initialize  ---------- //
  socketServer.on('connection', (socket) => {
    console.log('User connected: ' + socket.id);

    socket.emit("init", {
      fX: fieldX,
      fY: fieldY,
      bulletRange
    });

    socket.on('join', (name) => {
      console.log(name || "unknown", 'joined');
      let newShip = joinGame(name || "unknown", socket.id);

      socket.emit("toast", `Welcome, ${name || "???"}`);

      socket.emit("newGame", {
        x: newShip.x,
        y: newShip.y,
        direction: newShip.direction,
        angle: newShip.velocity.angle,
        size: newShip.velocity.size
      });

      // message all other users that user joined game
      socket.broadcast.emit("toast", `${name} joined the game`);
    });

    // ---------- listeners ---------- //

    socket.on('ship', (ship) => {
      let thisShip = ships.find(obj => {
        return obj.socket === socket.id;
      });

      if (thisShip) {
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
          user: thisShip.user,
          score: thisShip.score,
          rank: thisShip.rank
        });

        socket.emit("myScore", {
          score: thisShip.score,
          rank: thisShip.rank
        })

      } else {
        // ship unknown... if not already killed... kill
        if (obituries.indexOf(socket.id) !== -1) {
          socket.emit("die", "not listed on server");
        }
      }
    });

    socket.on('warp', () => {
      let thisShip = ships.find(obj => {
        return obj.socket === socket.id;
      });
      console.log("warp requested by", thisShip.socket);
      if (thisShip === undefined) {
        console.log('who said warp? ', socket.id);
        socket.emit("toast", "Can't warp! - ship not registered on server");
      } else {
        warp(thisShip);
        socket.emit('warp',
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
      newBullet.velocity = new Vector(bullet.angle, bullet.size);
      newBullet.user = socket.id;
      bullets.push(newBullet);

      socketServer.emit('bullet', {
        x: newBullet.x,
        y: newBullet.y,
        v: newBullet.velocity,
        id: newBullet.id
      })
    });

    // for testing purposes
    socket.on('purge', () => {
      console.table(ships);
      // boots everone else
      socketServer.broadcast.emit("boot", "purge all ships");
    })

    socket.on('print', () => {
      console.table(ships);
    })

    // ---------- connection issues ---------- //

    socket.on('disconnect', function () {

      console.log(socket.id + " disconnected");
      // would be nice to try to rejoin on same socket
      let deadShips = ships.filter((el) => { return el.socket === socket.id });
      if (deadShips.length > 0) {
        socket.emit("toast", `${deadShips} lost connection`);
        deadShips.forEach((ship) => {
          deathAnnouncement(ship);
          ships.splice(ships.indexOf(ship), 1);
        });
        console.table(ships);
      }
    });

    socket.on("reconnect", () => {
      console.log("reconnected");
    });
  });

      // ---------- send ---------- //

      serverBroadcasts();

      function serverBroadcasts() {
        pushAsteroids();
        checkObituries();
        checkExplosions();
        sendBroadcasts();
        takeOutTheTrash();
        setTimeout(serverBroadcasts, updatesPerSecond);
      }

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
          let deadShip = obituries.shift();
          console.log("obituries page ", deadShip.user);
          deathAnnouncement(deadShip, 'loud');
          explosions.push({
            x: deadShip.x,
            y: deadShip.y,
            angle: deadShip.velocity.angle,
            size: deadShip.velocity.size
          });

        };
      }

      function checkExplosions() {
        while (explosions.length > 0) {
          let bang = explosions.shift();
          socketServer.emit('newExplosion', {
            x: bang.x,
            y: bang.y,
            angle: bang.angle,
            size: bang.size
          });
        };

      }
      function sendBroadcasts() {
        while (broadcasts.length > 0) {
        socketServer.emit(broadcasts[0][0], broadcasts[0][1]);
        broadcasts.shift();
        }
      }

      function deathAnnouncement(deadship, mode = 'silent') {
        console.log("mode :", mode);
        console.log(deadship);
        console.log(deadship.user, "has died");
        // mode !== 'silent' &&
        socketServer.emit("deadShip", deadship.socket);
      }

  function takeOutTheTrash() {
    while (garbageCollectionList.length > 0) {
      let trash = garbageCollectionList.shift();
      socketServer.emit("trash", trash.id);
    };
  }
};
module.exports = { socketHandler };
