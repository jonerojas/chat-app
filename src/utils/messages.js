//Generating an object with a message along with a timestamp
const generateMessage = (text) => {
  return {
    text: text,
    createdAt: new Date().getTime()
  };
};

const generateLocationMessage = (url) => {
  return {
    url: url,
    createdAt: new Date().getTime()
  };
};

module.exports = {
  generateMessage,
  generateLocationMessage
};
