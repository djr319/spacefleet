sessionStorage = window.sessionStorage;
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d', { alpha: false });

window.addEventListener('DOMContentLoaded', () => {
  canvas.id = "banana";
  document.body.appendChild(canvas);
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  document.getElementById('join').addEventListener('click', () => {
    joinGame();
  });
});

function joinGame() {
  let name = document.getElementById('name').value || '';
  sessionStorage.setItem('name');
  document.getElementById('splash').style.display = "none";
  sendStatus('name', name);
  newGame();
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.strokeStyle = 'black';
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

