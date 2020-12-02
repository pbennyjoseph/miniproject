const express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server, {
  cors: true,
  origins: ['https://hex-ai-7039a.web.app/',
            'http://127.0.0.1:5500/'],
});
let currentRoom = 0;

// app.use(express.static('../client'));
// app.get('/hex', (req, res) => {
//   res.sendFile("../client/Hex.html");
// });

io.on('connection', (socket) => {
  socket.on('createOrJoinGame', (data) => {
    var room = io._nsps.get('/').adapter.rooms.get(currentRoom);
    // console.log(io._nsps.get('/').adapter);
    // socket.on('disconnect', function () {
    //   socket.emit('isDisconnected');
    //   console.log('DISCONNETED!!! 1111');
    // });
    if (room) console.log('Size: ' + room.size);
    if (room && room.size < 2) {
      socket.join(currentRoom);
      socket.emit('player2', {
        msg: 'Game has begun. Waiting for opponent to play',
        player: 1,
        id: currentRoom,
      });
      socket.broadcast.to(currentRoom).emit('startGame');
      socket.emit('startGame');
      ++currentRoom;
      console.log('Joining room');
    } else {
      socket.join(currentRoom);
      socket.emit('newGame', {
        msg: 'Waiting for other players to join.',
        player: 0,
        id: currentRoom,
      });
      console.log('Creating new game');
    }
  });

  socket.on('playTurn', (data) => {
    socket.broadcast.to(data.room).emit('turnPlayed', data);
  });

  socket.on('gameEnded', (data) => {
    io.sockets.in(data.room).emit('gameEnded', data);
  });
});
server.listen(process.env.PORT || 3000);
console.log('listenting on port 3000');
