const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;

//This represents the file path starting from the src folder, then out using (..) then into the public folder
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

//Listens for a given event to trigger
//'connection' will fire when a connection is made
//io.on is only used to listen for new connections
io.on('connection', (socket) => {
  //We can use socket.id in all children functions to look up users with the util functions
  console.log('New WebSocket connection');

  //When a user joins with a username and a requested chat room
  socket.on('join', ({ username, room }, callback) => {
    //Well get the error prop is things went wrong
    const { user, error } = addUser({ id: socket.id, username, room });

    if (error) {
      return callback(error);
    }
    //.join allows us to emit events to a specific room
    socket.join(user.room);

    //emit is used to send the event to the client
    socket.emit('message', generateMessage('Admin', 'Welcome'));
    //broadcast is used to emit a message to all users EXCEPT the person sending the message
    socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined.`));

    //Sending list of users in room to client
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    });

    callback();
    //io.to.emit emits event to everyone in a specific room
    //socket.broadcast.to.emit same as above EXCEPT person sending event in a specific room
  });

  //io.emit sends to all users vs sokcet.io which is only visible to user that sent message
  //This sends the updated count back to ALL clients
  socket.on('sendMessage', (userMessage, callback) => {
    //loading in the filter function and passing in the message to check for bad words
    const filter = new Filter();
    if (filter.isProfane(userMessage)) {
      return callback('Be kind, please dont swear.');
    }

    //getUser will return a object
    const user = getUser(socket.id);

    //The userMessage is then emitted back to the client via the 'message' event if no bad lang was found
    io.to(user.room).emit('message', generateMessage(user.username, userMessage));
    callback();
  });

  //Renders a link when user shares location
  // socket.emit('locationMessage', url);

  //Listens for share location button
  socket.on('sendLocation', (userCoordinates, callback) => {
    const user = getUser(socket.id);

    //'https://www.google.com/maps/?=q=' + userCoordinates.latitude + ',' + userCoordinates.longitude
    io.to(user.room).emit(
      'locationMessage',
      generateLocationMessage(user.username, 'https://www.google.com/maps/?=q=' + userCoordinates.latitude + ',' + userCoordinates.longitude)
    );
    //io.emit('message', 'https://www.google.com/maps/?=q=' + userCoordinates.latitude + ',' + userCoordinates.longitude);
    callback();
  });

  //Code that runs whenver a user disconnects i.e closing their browser
  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left ${user.room}`));
      //Sending list of users in room to client
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      });
    }
  });
});

server.listen(port, () => {
  console.log('Started on port 3000');
});
