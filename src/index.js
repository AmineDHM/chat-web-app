require("dotenv").config();
const express = require("express");
const http = require("http");
const path = require("path");
const Filter = require("bad-words");
const socketio = require("socket.io");
const geocode = require("./utils/geocode");
const { generateMessage, generateLocationMessage } = require("./utils/message");
const {
  addUser,
  deleteUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");
const { UV_FS_O_FILEMAP } = require("constants");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, "../public")));

io.on("connection", (socket) => {
  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });
    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    socket.emit(
      "message",
      generateMessage(`Welcome ${user.username} to ${user.room}`)
    );

    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage(`${user.username} has joined ${user.room} !`)
      );

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
  });

  socket.on("sendMessage", (message, callback) => {
    const filter = new Filter();
    const user = getUser(socket.id);
    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed !");
    }
    io.to(user.room).emit("message", generateMessage(message, user.username));
    callback();
  });

  socket.on("location", (location, callback) => {
    const user = getUser(socket.id);
    const googleMapURL = `https://google.com/maps?q=${location.latitude},${location.longitude}`;
    geocode(location, (locationName) => {
      io.to(user.room).emit(
        "location",
        generateLocationMessage(locationName, googleMapURL, user.username)
      );
    });
    callback();
  });

  socket.on("disconnect", () => {
    const user = deleteUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage(`${user.username} has disconnected`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
});
