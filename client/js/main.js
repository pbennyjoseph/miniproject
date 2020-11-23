const socket = io.connect("http://localhost:3000");
const DEFAULT_TIME_SECONDS = 60;
var player;
var room;
var message;

function MoveOpponent(ii, jj) {
  MakeMove(ii, jj, true);
}

socket.on("player2", (data) => {
  player = data.player;
  Init(data.player);
  message = data.msg;
  room = data.id;
  $("#Msg").val("You are Blue. You play Second");
});

socket.on("newGame", (data) => {
  player = data.player;
  Init(data.player);
  $("#Msg").val("You are Red. You move First");
  // alert(data.msg);
  room = data.id;
});

socket.on("startGame", (_data) => {
  $("#throbber").hide();
  $("#container_2").show();
  resetTimer();
  if (player === 0) startstop();
});

socket.on("turnPlayed", (data) => {
  startstop();
  MoveOpponent(data.i, data.j);
  //stop();
});



socket.emit("createOrJoinGame", {
  nsps: "10",
});

$("#throbber").show();
$("#container_2").hide();

// time in tenths of a second
var time = 600;
var running = 0;


function endGame(msg) {
  if(running === 1)
    startstop();
  if (room === undefined) return false;
  socket.emit("gameEnded", {
    room: room,
    msg: msg,
  });
}

socket.on("gameEnded", (data) => {
  if(running === 1)
    startstop();
  $("#Msg").val(data.msg);
});

function startstop() {
  if (running == 0) {
    running = 1;
    decrement();
  } else {
    running = 0;
  }
}

function resetTimer() {
  running = 0;
  time = DEFAULT_TIME_SECONDS * 10;
  var mins = Math.floor(time / 10 / 60);
  var secs = Math.floor((time / 10) % 60);
  var tenths = time % 10;
  if (mins < 10) {
    mins = "0" + mins;
  }
  if (secs < 10) {
    secs = "0" + secs;
  }
  $("#output").html(mins + ":" + secs + ":" + "0" + tenths);
}

function decrement() {
  if (running == 1) {
    setTimeout(function () {
      var mins = Math.floor(time / 10 / 60);
      var secs = Math.floor((time / 10) % 60);
      var tenths = time % 10;
      if (mins < 10) {
        mins = "0" + mins;
      }
      if (secs < 10) {
        secs = "0" + secs;
      }
      $("#output").html(mins + ":" + secs + ":" + "0" + tenths);
      if (mins <= 0 && secs <= 0 && tenths <= 0) {
        IsOver = 1;
        if (player) {
          endGame("Red has won on time!");
        } else endGame("Blue has won on time!");
        return;
      }
      time--;
      decrement();
    }, 100);
  }
}
