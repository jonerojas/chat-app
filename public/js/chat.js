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
  //target represents the target we are listening for the event on which is the form
  //elements represents the inputs within the form
  const message = e.target.elements.userMessage.value;

  socket.emit('sendMessage', message);
});

document.querySelector('#send-location').addEventListener('click', (e) => {
  // console.log(Geolocation.getCurrentPosition());
  // console.log('Hello');
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser');
  }
  navigator.geolocation.getCurrentPosition((position) => {
    const userLocation = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };
    //console.log(position.coords.longitude);
    socket.emit('sendLocation', userLocation);
  });
});
