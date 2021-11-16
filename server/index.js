
import express from 'express';
import http from 'http';
import { Server } from "socket.io";

// const express = require ('express');
// const http = require('http');
// const { Server } = require('socket.io');

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer);
import socketRouter from './models/socket-controller.js';

// const game = require('./models/game-controller');
// import game from './models/game-controller';

// ------------ start game ---------- //
// game();

// within the game, you will be able to call socketFuncs.INCOMING_REQUEST_FROM_GAME()
// to update your clients with new game state

// ------------ sockets ---------- //
io.on('connection', (socket, io) => {
  socketRouter(socket);
  // const socketSet = addSocket(socket, io);
});

// ------------ http static ---------- //
const PORT = 5000;
app.use(express.static('./views'));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

httpServer.listen(PORT, () => {
  console.log(`app listening on http://localhost:${PORT}  🚀`);
});
