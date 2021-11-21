
// function updateBullets() {

//   bullets.forEach((bullet) => {
//     bullet.x = bullet.x + bullet.velocity.x / fps;
//     bullet.y = bullet.y + bullet.velocity.y / fps;
//     checkAsteroidHit();
//     checkEnemyHit();
//   });
// }

// function checkEnemyHit() {
//   // ship / bullet collision detection
//   bullets.forEach((bullet, bulletIndex) => {
//     ships.forEach((ship, shipIndex) => {
//       let distance = Math.sqrt((bullet.x - ship.x) ** 2 + (bullet.y - ship.y) ** 2) - ship.size;
//       if (distance < 0) {
//         ship.shield--;
//         if (ship.shields < 1) {
//           // ship has been killed
//           die(shipIndex);
//           // add score to the one shooting
//           users[bullet.owner].score += score.killEnemy;
//           explosions.push(new Explosion(bullet.x, bullet.y, ship.velocity));
//           ships.splice(shipIndex,1);
//         } else {
//           users[bullet.owner].score += score.hurtEnemy;
//         }
//         bullets.splice(bulletIndex, 1);
//       }
//     });
//   });
// }

// function checkAsteroidHit() {
//   // asteroid / bullet collision detection
//   bullets.forEach((bullet, bulletIndex) => {
//   asteroids.forEach((asteroid, asteroidIndex) => {

//     let distance = Math.sqrt((bullet.x - asteroid.x) ** 2 + (bullet.y - asteroid.y) ** 2) - asteroid.size * asteroidScale;
//     if (distance < 0) {
//       myStatus.score = myStatus.score + scoreTable[asteroid.size];
//       if (asteroid.size === 1) {
//         explosions.push(new Explosion(bullet.x, bullet.y, asteroid.velocity));
//         asteroids.splice(asteroidIndex,1);
//         bullets.splice(bulletIndex, 1);
//       } else {
//         asteroid.hit();
//         if (asteroid.strength === 0) asteroids.splice(asteroidIndex, 1);
//         explosions.push(new Explosion(bullet.x, bullet.y, asteroid.velocity));
//       }
//       bullets.splice(bulletIndex, 1);
//     };
//   });
// });
// };
