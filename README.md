# Description

This is a remake of one of the earliest games available on Atari computers, Asteroids.

By the wonders of the modern internet, it would be great to be able to play this as a multiplayer game.

# Install

- Run `npm i` inside both the `/server` and `/client`
- The server runs on port 5000 and can be started by running `Nodemon` from the `/server` folder

- Client can be built with `npm run build` from the `/client`folder if required
- Client application is at `/client/index.html`

# About

- The front end is vanilla JS with `Canvas API`
- The client connects to the backend server with `socket.io`
- The backend creates the gaming environment and physics with pure vanilla JS

## Further Reading

If you are interested in forking and taking this further, the following libraries may be of interest:

- https://brm.io/matter-js/ (2D physics engine)
- https://threejs.org/ (3D rendering)
- https://phaser.io/ (HTML5 Game framework)
