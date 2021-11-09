const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;

//This represents the file path starting from the src folder, then out using (..) then into the public folder
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

let message = 'Welcome!';

//Listens for a given event to trigger
//'connection' will fire when a connection is made
//io.on is only used to listen for new connections
io.on('connection', (socket) => {
  console.log('New WebSocket connection');

  //emit is used to send the event to the client
  socket.emit('message', message);
  //broadcast is used to emit a message to all users EXCEPT the person sending the message
  socket.broadcast.emit('message', 'A new user has joined!!!');

  //on is used to recieve the event sent form the client
  //emits to the person updating the count in real time

  //io.emit sends to all users vs sokcet.io which is only visible to user that sent message
  //This sends the updated count back to ALL clients
  socket.on('sendMessage', (userMessage) => {
    //The userMessage is then emitted back to the client via the 'message' event
    io.emit('message', userMessage);
  });

  //Listens for share location button
  socket.on('sendLocation', (userCoordinates) => {
    //https://www.google.com/maps/?=q=0,0
    io.emit('message', 'https://www.google.com/maps/?=q=' + userCoordinates.latitude + ',' + userCoordinates.longitude);
  });

  //Code that runs whenver a user disconnects i.e closing their browser
  socket.on('disconnect', () => {
    io.emit('message', 'User has been disconnected');
  });
});

server.listen(port, () => {
  console.log('Started on port 3000');
});
