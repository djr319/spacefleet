// const io = require("socket.io-client");
// const outbound = io("http://localhost:3000");
const Bullet = require('../components/bullets');
const {
  asteroids,
  bullets,
  explosions,
  ships,
  users,
  scores,
  messageQueue
} = require('../models/storage')

const { joinGame } = require('./game-controller');


function socketHandler(socketServer) {

  // ---------- initialize  ---------- //
  socketServer.on('connection', (socket) => {
    //   // connections.push(socket.id);
    console.log('User connected: ' + socket.id);

    socket.on('disconnect', function () {
      console.log('User disconnected: ' + socket.id);
    });

    socket.on('join', (name) => {
      socket.data.username = name; // attach to socket
      console.log(socket.data.username, 'joined');
      let myShip = joinGame(name, socket.id);
      // message user with ship position and status
      socket.emit("newGame",
        {
          x: myShip.x,
          y: myShip.y
        }
      );
      // message all other users that user joined game
      socket.broadcast.emit("toast", `${name} joined the game`);
      socket.broadcast.emit("newShip",
        {
          x: myShip.x,
          y: myShip.y,
          direction: 0,
          socket: socket.id,
          user: name,
          thruster: false
        }
      );
      socket.emit("toast", 'Game joined');
    });
// ---------- receive ---------- //

    socket.on('ship', (ship) => {

      let thisShip = ships.filter(obj => {
        return obj.id === socket.id;
      })

      thisShip.x = ship.x;
      thisShip.y = ship.y;
      thisShip.direction = ship.direction;
      thisShip.socket = socket.id;
      thisShip.thruster = ship.thruster
      // array updated OK
      socket.broadcast.emit("ship", {
        x: thisShip.x,
        y: thisShip.y,
        direction: thisShip.direction,
        socket: socket.id,
        thruster: thisShip.thruster
      });
    });

    socket.on('warp', (ship) => {
      let thisShip = ships.filter(obj => {
        return obj.id === socket.id;
      })
      warp(thisShip);
      socket.emit("warp",
        {
          x: myShip.x,
          y: myShip.y
        }
      );
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
};

module.exports = socketHandler;



//   //   // ---------- send ---------- //
// function socketSend(type, message) {
//   outbound.emit(`server-${type}`, message);
//   console.log('outbound sent');
// }

//     /*
//     emit('asteroids', positions);
//       emit('bullets', positions);
//     emit('explosions', positions);
//     io.broadcast.emit('scores', scores);
//     */

//     // socketSend('asteroids', asteroids);
//     // socketSend('bullets', bullets);
//     // socketSend('explosions', explosions);
//     // socketSend('scores', scores);
//     // socketSend('death', socketId);
//   }



// // const Bullet = require('./Components/bullets');
// // const { Vector } = require('./Vector');





function pushUpdates() {
  pushAsteroids();
}

function pushAsteroids () {
  socket.emit('asteroids', asteroids);
}
