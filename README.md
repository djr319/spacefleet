# Description

Based on one of the earliest games available on Atari computers, Asteroids, the game has been reborn as a MMO game though the wonders of socket.io.

# Play now

The project is deployed and ready to play at https://space-fleet.herokuapp.com/

# Local Install

- Fork this project if wished (button above right)
- Clone to you local machine: From your command line, in the desired directory, run `git clone <url of your fork>`
- Install dependencies: `npm i` from the project root folder

## Configure
The project will run out of the box, but is currently set up for deployment on Heroku. The client should be pointed to your local server. To do this:
- Open `server/views/scripts/socket-client.js`in your code editor
- uncomment line 1 (reference to local server)
- comment out line 2 (reference to heroku domain)

# Run

- The server can be started by running `npm run server` from the root folder
- Navigate in browser to http://localhost:5000

# About

- The front end uses canvas API
- The client connects to the backend server with `socket.io`
- The backend creates the gaming environment and physics
- Project uses vanilla JS rather than any library as it is a project I am making to further my knowledge and experience of game design

<p align="center">
  <img src="./screenshots/screenshot.png" alt="Starfleet screenshot" />
</p>

## Further Reading

If you are interested in forking and taking this further, the following libraries may be of interest:

- https://brm.io/matter-js/ (2D physics engine)
- https://threejs.org/ (3D rendering)
- https://phaser.io/ (HTML5 Game framework)
