const socket = io.connect('http://localhost:3000');
var room = null;
var message = null;

var seconds = 60;
function msg() {
  // if (seconds == 0) {
  //   socket.on('gameEnded', (data) => {
  //     alert(data.msg);
  //     $('#container_2').hide();
  //   });
  // }
  document.getElementById('text2').innerHTML = seconds + ' Seconds';
  seconds--;
}
var id = 0;
function start() {
  console.log('Started');
  id = window.setInterval(msg, 1000);
}
function stop() {
  console.log('Stopped');
  window.clearInterval(id);
}

function MoveOpponent(ii, jj) {
  MakeMove(ii, jj, true);
}

socket.on('player2', (data) => {
  console.log('player2 received');
  Init(data.player);
  message = data.msg;
  room = data.id;
  $('#Msg').val('You are Blue. You play Second');
});

socket.on('newGame', (data) => {
  console.log('new game started');
  message = data.msg;
  Init(data.player);
  $('#Msg').val('You are Red. You move First');
  room = data.id;
});

socket.on('startGame', (_data) => {
  console.log('start game');
  alert(message);
  $('#throbber').hide();
  $('#container_2').show();
});

socket.on('turnPlayed', (data) => {
  start();
  MoveOpponent(data.i, data.j);
  //stop();
});

socket.on('gameEnded', (data) => {
  alert(data.msg);
  $('#container_2').hide();
});

socket.emit('createOrJoinGame', {
  nsps: '10',
});

$('#throbber').show();
$('#container_2').hide();
