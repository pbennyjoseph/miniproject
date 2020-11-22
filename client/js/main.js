const socket = io.connect("http://localhost:3000");
const DEFAULT_TIME_SECONDS = 60;
var player;
var room;
var message;

function MoveOpponent(ii, jj) {
  MakeMove(ii, jj, true);
}

function endGame(msg) {
  if (room === undefined) return false;
  // alert(message);

  socket.emit("gameEnded", {
    room: room,
    msg: msg,
  });
  $("#container_2").hide();
  $("#Msg").val("Game Ended");
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

socket.on("gameEnded", (data) => {
  // alert(data.msg);
  $("#container_2").hide();
  startstop();
  $("#Msg").innerHTML = "Game Ended";
});

socket.emit("createOrJoinGame", {
  nsps: "10",
});

$("#throbber").show();
$("#container_2").hide();

// time in tenths of a second
var time = 600;
var running = 0;

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
      time--;
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
        if (player) {
          endGame("Red has won on time!");
        } else endGame("Blue has won on time!");
        return;
      }
      decrement();
    }, 100);
  }
}
