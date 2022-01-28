# Description

This is a remake of one of the earliest games available on Atari computers, Asteroids. Refactored as a MMO game though the wonders of socket.io.

# Install

- Fork this project
- Clone to you local machine
- Install dependencies
- Edit line 1 of `/server/views/scripts/socket-client.js` to reflect the server IP, or localhost as required (I must refactor this to a .env, I'm currently testing on the local network)

# Run

- The server can be started by running `Nodemon` from the `/server` folder
- Navigate in browser to http://localhost:5000

# About

- The front end uses canvas API
- The client connects to the backend server with `socket.io` (v4.3.2)
- The backend creates the gaming environment and physics
- Project uses vanilla JS rather than any library as it is a project I am making to further my knowledge and experience of game design

## Further Reading

If you are interested in forking and taking this further, the following libraries may be of interest:

- https://brm.io/matter-js/ (2D physics engine)
- https://threejs.org/ (3D rendering)
- https://phaser.io/ (HTML5 Game framework)
