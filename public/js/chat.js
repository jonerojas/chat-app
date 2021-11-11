//socket allows us to send an recieve events from the client
const socket = io();

//HTML Elements
const messageForm = document.querySelector('#message-form');
const messageFormInput = messageForm.querySelector('input');
const messageFormButton = messageForm.querySelector('button');
const sendLocationButton = document.querySelector('#send-location');
const messages = document.querySelector('#messages');
const coords = document.querySelector('#coords');

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector('#location-template').innerHTML;

//Renders a users chat message to the console
socket.on('message', (message) => {
  console.log(message);

  const html = Mustache.render(messageTemplate, {
    text: message
  });
  messages.insertAdjacentHTML('beforeend', html);
});

//Listens for location data from server
socket.on('locationMessage', (url) => {
  const html = Mustache.render(locationMessageTemplate, {
    coordinates: url
  });
  coords.insertAdjacentHTML('beforeend', html);
});

//Event listener for when a user submits their message
messageForm.addEventListener('submit', (e) => {
  //Prevents the page from refreshing when form is submitted
  e.preventDefault();

  //disables submit button after sending to prevent spam sends
  messageFormButton.setAttribute('disabled', 'disabled');

  //User input saved inside a const
  //target represents the target we are listening for the event on which is the form
  //elements represents the inputs within the form
  const message = e.target.elements.userMessage.value;

  socket.emit('sendMessage', message, (error) => {
    //enables button once message has been sent to server
    messageFormButton.removeAttribute('disabled');
    //Clears input once message has been sent
    messageFormInput.value = '';
    //Moves focus back to text box input once message has been sent
    messageFormInput.focus();

    if (error) {
      return console.log(error);
    }
    console.log('Message delivered!');
  });
});

//Event listener for when user wants to send location
sendLocationButton.addEventListener('click', (e) => {
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser');
  }
  //disabling the weather button after being clicked
  sendLocationButton.setAttribute('disabled', 'disabled');

  navigator.geolocation.getCurrentPosition((position) => {
    const userLocation = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };
    //With coordinates fetched, we send this data back to server
    socket.emit('sendLocation', userLocation, () => {
      //enabling button
      //sendLocationButton.removeAttribute('disabled');

      //Sending event confirmation to console confirming everthing went fine
      console.log('Location shared!');
    });
  });
});

// const form = document.getElementById('userMessage');
