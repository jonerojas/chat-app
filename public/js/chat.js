//socket allows us to send an recieve events from the client
const socket = io();

socket.on('message', (message) => {
  console.log(message);
});

const form = document.getElementById('userMessage');

document.querySelector('#message-form').addEventListener('submit', (e) => {
  //Prevents the page from refreshing when form is submitted
  e.preventDefault();

  //User input saved inside a const
  const message = e.target.elements.userMessage.value;

  //target represents the target which were the event on which is the form
  socket.emit('sendMessage', message);
});
