const generateMessage = (message, username) => {
  return {
    message,
    username,
    createdAt: new Date().getTime(),
  };
};

const generateLocationMessage = (locationName, googleMapURL, username) => {
  return {
    locationName,
    googleMapURL,
    username,
    createdAt: new Date().getTime(),
  };
};

module.exports = {
  generateMessage,
  generateLocationMessage,
};
