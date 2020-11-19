const socket = io.connect("http://localhost:3000");

socket.on('player2', (data) => {
    
});

socket.emit('createorJoinGame', {
    nsps: "10",
})

