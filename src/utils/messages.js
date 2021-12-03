//Generating an object with a message along with a timestamp
const generateMessage = (username, text) => {
  return {
    username: username,
    text: text,
    createdAt: new Date().getTime()
  };
};

const generateLocationMessage = (username, url) => {
  return {
    username: username,
    url: url,
    createdAt: new Date().getTime()
  };
};

module.exports = {
  generateMessage,
  generateLocationMessage
};
