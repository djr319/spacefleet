// const io = require("./socket.io.min.js");
// const socket = io('http://localhost:5000');

// socket.on("connect", () => {
//   console.log(socket.id); // "G5p5..."
//   console.log(socket.connected); // true
// });

document.body.addEventListener('resize', () => { resizeCanvas() });
const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d', { alpha: false });
resizeCanvas();

function resizeCanvas() {

 canvas.width = window.innerWidth;
 canvas.height = window.innerHeight;

  canvas.id = "banana";
  ctx.strokeStyle = 'black';
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function join() {
  console.log("only bananas here");
}
