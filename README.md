# Description

This is a remake of one of the earliest games available on Atari computers, Asteroids. Refactored as a MMO game though the wonders of socket.io.

# Install

- Run `npm i` inside `/server`

# Run

- The server can be started by running `Nodemon` from the `/server` folder
- Navigate in browser to http:/localhost:5000

# About

- The front end is vanilla JS with `Canvas API`
- The client connects to the backend server with `socket.io`
- The backend creates the gaming environment and physics with pure vanilla JS

## Further Reading

If you are interested in forking and taking this further, the following libraries may be of interest:

- https://brm.io/matter-js/ (2D physics engine)
- https://threejs.org/ (3D rendering)
- https://phaser.io/ (HTML5 Game framework)
