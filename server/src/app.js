const express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server, {
  cors:true,
  origins:["http://127.0.0.1:5500"],
 });  
let currentRoom = 0;

// app.use(express.static('../client'));
// app.get('/hex', (req, res) => {
//   res.sendFile("../client/Hex.html");
// });

io.on("connection", (socket) => {
  socket.on("createOrJoinGame", (data) => {
    var room = io._nsps.get('/').adapter.rooms.get(currentRoom);
    // console.log(io._nsps.get('/').adapter);
    if(room) console.log("Size: " + room.size);
    if (room && room.size < 2) {
      socket.join(currentRoom);
      socket.emit("player2", {
        msg: "Game has begun. Waiting for opponent to play",
        player: 1,
        id: currentRoom,
      });
      socket.broadcast.to(currentRoom).emit('startGame');
      socket.emit('startGame');
      ++currentRoom;
      console.log("Joining room");
    } else {
      socket.join(currentRoom);
      socket.emit("newGame", {
        msg: "Waiting for other players to join.",
        player: 0,
        id: currentRoom,
      });
      console.log('Creating new game');
    }
    
  });

  // socket.on("joinGame", function (data) {
  //   var room = io.nsps["/"].adapter.rooms[data.room];
  //   if (room && room.length <= 3) {
  //     socket.join(data.room);
  //     socket.emit("player2", {
  //       name: data.name,
  //       room: data.room,
  //       id: room.length - 1,
  //     });

  //     if (room.length === 4) {
  //       var color = CARDS[Math.floor(Math.random() * CARDS.length)];
  //       var digit = digits[Math.floor(Math.random() * 19)];
  //       var card = color + digit;
  //       socket.nsp.to(data.room).emit("player1", { card });
  //     }
  //   } else {
  //     socket.emit("err", {
  //       message: "Sorry, The room is full!",
  //     });
  //   }
  //   // console.log('joining new game');
  // });

  socket.on("playTurn", (data) => {
    socket.broadcast.to(data.room).emit("turnPlayed", data);
  });

  socket.on("gameEnded", (data) => {
    socket.broadcast.to(data.room).emit("gameEnd", data);
  });
});

server.listen(process.env.PORT || 3000);
console.log("listenting on port 3000");
