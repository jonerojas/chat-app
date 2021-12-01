const users = [];

//add user
const addUser = ({ id, username, room }) => {
  //Sanitize the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();
  //Check to see if room and username was given
  if (!username || !room) {
    return {
      error: 'Username and room are required.'
    };
  }

  //Check for existing users
  const existingUser = users.find((user) => {
    return user.username === username && user.room === room;
  });

  //Validate if username is taken in specific Room
  if (existingUser) {
    return {
      error: 'Username is already in use.'
    };
  }
  //Store user in array if no user is found
  const user = { id, username, room };
  users.push(user);
  return { user };
};

//remove users
const removeUser = (id) => {
  //will return -1 if no match
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    //This will return the user that was removed.
    return users.splice(index, 1)[0];
  }
};
//get specific user
const getUser = (id) => {
  const user = users.find((user) => user.id === id);
  if (user) {
    return user;
  }
  //return undefined
  return {
    error: 'No such user.'
  };
};

//get users in a specific room
const getUsersInRoom = (room) => {
  room = room.trim().toLowerCase();
  const usersInRoom = users.filter((user) => user.room === room);
  return usersInRoom.length > 1 ? usersInRoom : 'No users in ' + room;
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
};
