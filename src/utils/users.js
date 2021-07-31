const users = [];

//add, delete, getUser, getUsersInRoom user

const addUser = ({ id, username, room }) => {
  // Validate the data
  if (!username || !room) {
    return {
      error: "Username and room are required!",
    };
  }
  // Check for existing user
  const existingUser = users.find((user) => {
    return (
      user.room.trim().toLowerCase() === room.trim().toLowerCase() &&
      user.username.trim().toLowerCase() === username.trim().toLowerCase()
    );
  });
  // Validate username is unique
  if (existingUser) {
    return {
      error: "Username already exists in this room",
    };
  }
  // Store the user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

const deleteUser = (id) => {
  const userIndex = users.findIndex((user) => user.id === id);
  if (userIndex !== -1) return users.splice(userIndex, 1)[0];
};

const getUser = (id) => {
  return users.find((user) => user.id === id);
};

const getUsersInRoom = (room) => {
  const usersInRoom = users.filter((user) => user.room === room);
  return usersInRoom;
};

module.exports = {
  addUser,
  deleteUser,
  getUser,
  getUsersInRoom,
};
