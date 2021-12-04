//socket allows us to send an recieve events from the client
const socket = io();
//const { generateMessage } = require('../../src/utils/messages');

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
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

//Options

//ignoreQuery removes the question mark from the query string. i.e ?username=Jonathan
//Qs.parse returns an object { username: Jonathan }
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

//Autoscroll
const autoScroll = () => {
  //New message element
  const $newMessage = messages.lastElementChild;

  //Height of new message element
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  //Visible Height
  const visibleHeight = messages.offsetHeight;

  //Height of message container
  const containerHeight = messages.scrollHeight;

  //How far has the user scrollled?
  const scrollOffset = messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    //This line is basically always scroll to the bottom
    messages.scrollTop = messages.scrollHeight;
  }
};

//Renders a users chat message to the console
socket.on('message', (messageObject) => {
  console.log(messageObject);
  console.log(room, username);

  const html = Mustache.render(messageTemplate, {
    username: messageObject.username,
    text: messageObject.text,
    createdAt: moment(messageObject.createdAt).format('dddd h:mma')
  });
  messages.insertAdjacentHTML('beforeend', html);
  autoScroll();
});

//Listens for location data from server then renders it to the chat
socket.on('locationMessage', (urlObject) => {
  const html = Mustache.render(locationMessageTemplate, {
    username: urlObject.username,
    coordinates: urlObject.url,
    createdAt: moment(urlObject.createdAt).format('dddd h:mma')
  });
  messages.insertAdjacentHTML('beforeend', html);
  autoScroll();
});

//Loads users to display in room
socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room: room,
    users: users
  });
  document.querySelector('#sidebar').innerHTML = html;
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
    console.log(position);
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

socket.emit('join', { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = '/';
  }
});
