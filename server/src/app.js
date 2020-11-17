const { assert } = require("console");
const express = require("express");
const path = require("path");

const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

let currentRoom = 0;

app.use(express.static("./public"));

io.on("connection", (socket) => {
  socket.on("createOrJoinGame", (data) => {
    var room = io.nsps[data.nsps].adapter.rooms[currentRoom];
    if (room && room.length < 2) {
      socket.join(currentRoom);
      socket.emit("player2", {
        msg: "Game has begun. Waiting for opponent",
        id: currentRoom,
      });
      ++currentRoom;
    } else {
      ++currentRoom;
      socket.join(currentRoom);
      socket.emit("newGame", {
        id: currentRoom,
      });
    }
    // console.log('Creating new game');
  });

  socket.on("joinGame", function (data) {
    var room = io.nsps["/"].adapter.rooms[data.room];
    if (room && room.length <= 3) {
      socket.join(data.room);
      socket.emit("player2", {
        name: data.name,
        room: data.room,
        id: room.length - 1,
      });

      if (room.length === 4) {
        var color = CARDS[Math.floor(Math.random() * CARDS.length)];
        var digit = digits[Math.floor(Math.random() * 19)];
        var card = color + digit;
        socket.nsp.to(data.room).emit("player1", { card });
      }
    } else {
      socket.emit("err", {
        message: "Sorry, The room is full!",
      });
    }
    // console.log('joining new game');
  });

  socket.on("playTurn", (data) => {
    socket.broadcast.to(data.room).emit("turnPlayed", data);
  });

  socket.on("gameEnded", (data) => {
    socket.broadcast.to(data.room).emit("gameEnd", data);
  });
});

server.listen(process.env.PORT || 5000);
