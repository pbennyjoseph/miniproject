var i,
  j,
  k,
  IsOver = true,
  IsStart0,
  Start,
  Start0,
  Size = 11,
  ruNing = false,
  NextEvent = '';
var MoveCount,
  MaxMoveCount,
  MaxColor = Size * Size,
  IsSwap,
  ActiveColor = 0;
IsPlayer = new Array(2);
Level = new Array(2);
ImgNum = new Array(Size);
for (i = 0; i < Size; i++) ImgNum[i] = new Array(Size);
Color = new Array(Size);
for (i = 0; i < Size; i++) Color[i] = new Array(Size);
ComputedValues = new Array(Size);
for (i = 0; i < Size; i++) ComputedValues[i] = new Array(Size);
for (i = 0; i < Size; i++) {
  for (j = 0; j < Size; j++) ComputedValues[i][j] = new Array(4);
}
CoNector = new Array(Size);
for (i = 0; i < Size; i++) CoNector[i] = new Array(Size);
for (i = 0; i < Size; i++) {
  for (j = 0; j < Size; j++) CoNector[i][j] = new Array(4);
}
Upd = new Array(Size);
for (i = 0; i < Size; i++) Upd[i] = new Array(Size);
History = new Array(MaxColor + 1);
for (i = 0; i < MaxColor + 1; i++) History[i] = new Array(2);
Pic = new Array(3);
Pic[0] = new Image();
Pic[0].src = './img/hex_r.png';
Pic[1] = new Image();
Pic[1].src = './img/hex_t.gif';
Pic[2] = new Image();
Pic[2].src = './img/hex_b.png';

IsStart0 = true;
IsPlayer[0] = true;
IsPlayer[1] = false;
Level[0] = 2;
Level[1] = 3;

function Init() {
  if (ruNing) {
    NextEvent = 'Init()';
    return;
  }
  var i_index, j_index;
  for (i_index = 0; i_index < Size; i_index++) {
    for (j_index = 0; j_index < Size; j_index++) Color[i_index][j_index] = 0;
  }
  if (IsStart0) Start0 = true;
  else Start0 = false;
  MoveCount = 0;
  MaxMoveCount = 0;
  UpdateScreen();
  WriteCompute(true);
  IsOver = false;
  if ((MoveCount+Start0)%2==0) window.document.OptionsForm.Msg.value=" Computer to move.";
  else window.document.OptionsForm.Msg.value=" Red to move.";
}

function SetOption(N, M) {
  if (ruNing) {
    NextEvent = 'SetOption(' + N + ',' + M + ')';
    return;
  }
  if (N < 2) {
    if (M == 0) IsPlayer[N] = true;
    else IsPlayer[N] = false;
  } else IsStart0 = M;
}

function SetLevel(N, M) {
  if (ruNing) {
    NextEvent = 'SetLevel(' + N + ',' + M + ')';
    return;
  }
  Level[N] = M;
}

var IsAI = 0;

function ShowAI(bb) {
  var ww;
  IsAI = bb;
  if (IsAI) {
    WriteCompute(true);
    document.getElementById('AI').style.display = 'inline';
    ww = parseInt(window.top.iNerWidth);
    if (ww < 840) window.top.resizeBy(840 - ww, 0);
  } else document.getElementById('AI').style.display = 'none';
}

function Timer() {
  if (NextEvent != '') {
    eval(NextEvent);
    NextEvent = '';
    return;
  }
  if (IsOver) return;
  if (ruNing) return;
  if (IsPlayer[(MoveCount + Start0 + 1) % 2]) {
    WriteCompute(true);
    return;
  }
  ruNing = true;
  var ll = Level[(MoveCount + Start0 + 1) % 2];
//   if (SwapTest()) return;
  ComputeData(ll);
  setTimeout(
    'GetBestMove(' +
      eval(((MoveCount + 1 + Start0) % 2) * 2 - 1) +
      ',' +
      ll +
      ')',
    800
  );
}

function Back() {
  if (ruNing) {
    NextEvent = 'Back()';
    return;
  }
  if (MoveCount > 0) {
    IsOver = false;
    MoveCount--;
    var i_index = History[MoveCount][0];
    var j_index = History[MoveCount][1];
    if (MoveCount == 1 && IsSwap) {
      Color[j_index][i_index] = 0;
      UpdatePic(j_index, i_index);
      Color[i_index][j_index] = ((MoveCount + Start0) % 2) * 2 - 1;
      UpdatePic(i_index, j_index);
    } else {
      Color[i_index][j_index] = 0;
      UpdatePic(i_index, j_index);
    }
    // if (MoveCount<10)
    //   window.document.OptionsForm.Moves.value=" "+eval(MoveCount)+" ";
    // else
    //   window.document.OptionsForm.Moves.value=MoveCount;
    if ((MoveCount+Start0)%2==0) window.document.OptionsForm.Msg.value=" Computer to move.";
    else window.document.OptionsForm.Msg.value=" Red to move.";
    WriteCompute(true);
  }
}

function Replay() {
  if (ruNing) {
    NextEvent = 'Replay()';
    return;
  }
  if (MoveCount < MaxMoveCount) {
    var i_index = History[MoveCount][0];
    var j_index = History[MoveCount][1];
    if (MoveCount < MaxMoveCount - 1) {
      MakeMove(i_index, j_index, false);
      WriteCompute(true);
    } else MakeMove(i_index, j_index, true);
  }
}

function GetMoveList() {
  var i_index,
    j_index,
    N,
    ss = '';
  for (N = 0; N < MaxMoveCount; N++) {
    i_index = History[N][0];
    j_index = History[N][1];
    if (N > 0) ss += ' ';
    ss += String.fromCharCode(65 + j_index) + eval(i_index + 1);
  }
  // window.document.OptionsForm.MoveList.value=ss;
}

function ApplyMoveList() {
  if (ruNing) {
    NextEvent = 'ApplyMoveList()';
    return;
  }
  Init();
  var i_index, j_index, N; //ss=window.document.OptionsForm.MoveList.value;
  ss = ss.split(' ');
  for (N = 0; N < ss.length; N++) {
    j_index = ss[N].charCodeAt(0) - 65;
    i_index = parseInt(ss[N].substr(1, 2)) - 1;
    if (isNaN(i_index) || isNaN(j_index) || i_index < 0 || j_index < 0 || i_index >= Size || j_index >= Size)
      return;
    if (N < ss.length - 1) MakeMove(i_index, j_index, false);
    else MakeMove(i_index, j_index, true);
  }
}

function SwapTest() {
  if (true) return false;
  var i_index, j_index;
  if (MoveCount == 0) {
    i_index = random(4);
    j_index = random(4 - i_index);
    if (random(2) < 1) {
      i_index = Size - 1 - i_index;
      j_index = Size - 1 - j_index;
    }
    MakeMove(i_index, j_index, false);
    WriteCompute(true);
    ruNing = false;
    return true;
  }
  if (MoveCount == 1) {
    for (i_index = 0; i_index < Size; i_index++) {
      for (j_index = 0; j_index < Size; j_index++) {
        if (Color[i_index][j_index] != 0) {
          if (i_index + j_index < 2 || i_index + j_index > 2 * Size - 4) return false;
          if (i_index + j_index == 2 || i_index + j_index == 2 * Size - 4) {
            if (random(2) < 1) return false;
          }
          MakeMove(i_index, j_index, false);
          WriteCompute(true);
          ruNing = false;
          return true;
        }
      }
    }
  }
  return false;
}

function MakeMove(i_index, j_index, oo) {
  var ccol,
    kk,
    i_indexs = i_index,
    j_indexs = j_index;
  if (MoveCount == 1) {
    if (Color[i_index][j_index] != 0) {
      Color[i_index][j_index] = 0;
      UpdatePic(i_index, j_index);
      i_indexs = j_index;
      j_indexs = i_index;
      IsSwap = 1;
    } else IsSwap = 0;
  }
  ccol = ((MoveCount + 1 + Start0) % 2) * 2 - 1;
  Color[i_indexs][j_indexs] = ccol;
  UpdatePic(i_indexs, j_indexs);
  if (History[MoveCount][0] != i_index) {
    History[MoveCount][0] = i_index;
    MaxMoveCount = MoveCount + 1;
  }
  if (History[MoveCount][1] != j_index) {
    History[MoveCount][1] = j_index;
    MaxMoveCount = MoveCount + 1;
  }
  MoveCount++;
  if (MaxMoveCount < MoveCount) MaxMoveCount = MoveCount;
  if ((MoveCount+Start0)%2==0) window.document.OptionsForm.Msg.value=" Computer to move.";
  else window.document.OptionsForm.Msg.value=" Red to move.";
  if (!oo) return;
  ComputeData(0);
  WriteCompute(true);
  if (ccol < 0) {
    if (ComputedValues[i_index][j_index][2] > 0 || ComputedValues[i_index][j_index][3] > 0) return;
    window.document.OptionsForm.Msg.value=" Red has won !";
    Blink(0);
  } else {
    if (ComputedValues[i_index][j_index][0] > 0 || ComputedValues[i_index][j_index][1] > 0) return;
    window.document.OptionsForm.Msg.value=" Computer has won !";
    Blink(0);
  }
  IsOver = true;
}

function random(N) {
  return Math.floor(Math.random() * 1000) % N;
}

function ShowComputedValues() {
  var i_index, j_index;
  for (i_index = 0; i_index < Size; i_index++) {
    for (j_index = 0; j_index < Size; j_index++)
      window.document.images[ImgNum[i_index][j_index]].title =
        Math.round(ComputedValues[i_index][j_index][2]) +
        '\n' +
        Math.round(ComputedValues[i_index][j_index][0]) +
        '|' +
        Math.round(ComputedValues[i_index][j_index][1]) +
        '->' +
        Math.round(ComputedValues[i_index][j_index][0] + ComputedValues[i_index][j_index][1]) +
        '\n' +
        Math.round(ComputedValues[i_index][j_index][3]) +
        '->' +
        Math.round(ComputedValues[i_index][j_index][2] + ComputedValues[i_index][j_index][3]) +
        '\n' +
        Math.round(
          ComputedValues[i_index][j_index][0] + ComputedValues[i_index][j_index][1] + ComputedValues[i_index][j_index][2] + ComputedValues[i_index][j_index][3]
        ) +
        '\n' +
        Math.round(CoNector[i_index][j_index][2]) +
        '\n' +
        Math.round(CoNector[i_index][j_index][0]) +
        '|' +
        Math.round(CoNector[i_index][j_index][1]) +
        '->' +
        Math.round(CoNector[i_index][j_index][0] + CoNector[i_index][j_index][1]) +
        '\n' +
        Math.round(CoNector[i_index][j_index][3]) +
        '->' +
        Math.round(CoNector[i_index][j_index][2] + CoNector[i_index][j_index][3]) +
        '\n' +
        Math.round(
          CoNector[i_index][j_index][0] +
            CoNector[i_index][j_index][1] +
            CoNector[i_index][j_index][2] +
            CoNector[i_index][j_index][3]
        ) +
        '\n' +
        Math.round(
          ComputedValues[i_index][j_index][0] +
            ComputedValues[i_index][j_index][1] +
            ComputedValues[i_index][j_index][2] +
            ComputedValues[i_index][j_index][3] -
            CoNector[i_index][j_index][0] -
            CoNector[i_index][j_index][1] -
            CoNector[i_index][j_index][2] -
            CoNector[i_index][j_index][3]
        );
  }
}

function ComputeRedData(vv) {
  var xx = 0,
    hh = '0123456789abcdef';
  if (vv > 0) xx = vv;
  var N = Math.floor(255 / (1 + xx / 255));
  return '#' + hh.charAt(Math.floor(N / 16)) + hh.charAt(N % 16) + '0000';
}

function ComputeBlueData(vv) {
  var xx = 0,
    hh = '0123456789abcdef';
  if (vv > 0) xx = vv;
  var N = Math.floor(255 / (1 + xx / 255));
  return '#0000' + hh.charAt(Math.floor(N / 16)) + hh.charAt(N % 16);
}

function WriteCompute(bb) {
  return false;
  var i_index, j_index;
  if (!IsAI) return;
  if (bb) ComputeData(2);
  for (i_index = 0; i_index < Size; i_index++) {
    for (j_index = 0; j_index < Size; j_index++) {
      window.document.getElementById('ComputedValues0' + i_index + j_index).title = Math.round(
        ComputedValues[i_index][j_index][0]
      );
      window.document.getElementById('ComputedValues1' + i_index + j_index).title = Math.round(
        ComputedValues[i_index][j_index][1]
      );
      window.document.getElementById('ComputedValues2' + i_index + j_index).title = Math.round(
        ComputedValues[i_index][j_index][2]
      );
      window.document.getElementById('ComputedValues3' + i_index + j_index).title = Math.round(
        ComputedValues[i_index][j_index][3]
      );
      window.document.getElementById(
        'ComputedValues0' + i_index + j_index
      ).style.backgroundColor = ComputeBlueData(ComputedValues[i_index][j_index][0]);
      window.document.getElementById(
        'ComputedValues1' + i_index + j_index
      ).style.backgroundColor = ComputeBlueData(ComputedValues[i_index][j_index][1]);
      window.document.getElementById(
        'ComputedValues2' + i_index + j_index
      ).style.backgroundColor = ComputeRedData(ComputedValues[i_index][j_index][2]);
      window.document.getElementById(
        'ComputedValues3' + i_index + j_index
      ).style.backgroundColor = ComputeRedData(ComputedValues[i_index][j_index][3]);
    }
  }
}

function sign(xx) {
  if (xx < 0) return -1;
  if (xx > 0) return 1;
  return 0;
}

function GetBestMove(theCol, theLevel) {
  var i_index,
    j_index,
    kk,
    i_index_b,
    j_index_b,
    ff = 0,
    i_index_q = 0,
    j_index_q = 0,
    cc,
    pp0,
    pp1;
  vv = new Array();
  if (MoveCount > 0) ff = 190 / (MoveCount * MoveCount);
  M = 20000;
  for (i_index = 0; i_index < Size; i_index++) {
    for (j_index = 0; j_index < Size; j_index++) {
      if (Color[i_index][j_index] != 0) {
        i_index_q += 2 * i_index + 1 - Size;
        j_index_q += 2 * j_index + 1 - Size;
      }
    }
  }
  i_index_q = sign(i_index_q);
  j_index_q = sign(j_index_q);
  for (i_index = 0; i_index < Size; i_index++) {
    for (j_index = 0; j_index < Size; j_index++) {
      if (Color[i_index][j_index] == 0) {
        Mp = Math.random() * (49 - theLevel * 16);
        Mp += (Math.abs(i_index - 5) + Math.abs(j_index - 5)) * ff;
        Mp += (8 * (i_index_q * (i_index - 5) + j_index_q * (j_index - 5))) / (MoveCount + 1);
        if (theLevel > 2) {
          for (kk = 0; kk < 4; kk++) Mp -= CoNector[i_index][j_index][kk];
        }
        pp0 = ComputedValues[i_index][j_index][0] + ComputedValues[i_index][j_index][1];
        pp1 = ComputedValues[i_index][j_index][2] + ComputedValues[i_index][j_index][3];
        Mp += pp0 + pp1;
        if (pp0 <= 268 || pp1 <= 268) Mp -= 400; //140+128
        vv[i_index * Size + j_index] = Mp;
        if (Mp < M) {
          M = Mp;
          i_index_b = i_index;
          j_index_b = j_index;
        }
      }
    }
  }
  if (theLevel > 2) {
    M += 108;
    for (i_index = 0; i_index < Size; i_index++) {
      for (j_index = 0; j_index < Size; j_index++) {
        if (vv[i_index * Size + j_index] < M) {
          if (theCol < 0) {
            //red
            if (i_index > 3 && i_index < Size - 1 && j_index > 0 && j_index < 3) {
              if (Color[i_index - 1][j_index + 2] == -theCol) {
                cc = CanCoNectFarBorder(i_index - 1, j_index + 2, -theCol);
                if (cc < 2) {
                  i_index_b = i_index;
                  if (cc < -1) {
                    i_index_b--;
                    cc++;
                  }
                  j_index_b = j_index - cc;
                  M = vv[i_index * Size + j_index];
                }
              }
            }
            if (i_index > 0 && i_index < Size - 1 && j_index == 0) {
              if (
                Color[i_index - 1][j_index + 2] == -theCol &&
                Color[i_index - 1][j_index] == 0 &&
                Color[i_index - 1][j_index + 1] == 0 &&
                Color[i_index][j_index + 1] == 0 &&
                Color[i_index + 1][j_index] == 0
              ) {
                i_index_b = i_index;
                j_index_b = j_index;
                M = vv[i_index * Size + j_index];
              }
            }
            if (i_index > 0 && i_index < Size - 4 && j_index < Size - 1 && j_index > Size - 4) {
              if (Color[i_index + 1][j_index - 2] == -theCol) {
                cc = CanCoNectFarBorder(i_index + 1, j_index - 2, -theCol);
                if (cc < 2) {
                  i_index_b = i_index;
                  if (cc < -1) {
                    i_index_b++;
                    cc++;
                  }
                  j_index_b = j_index + cc;
                  M = vv[i_index * Size + j_index];
                }
              }
            }
            if (i_index > 0 && i_index < Size - 1 && j_index == Size - 1) {
              if (
                Color[i_index + 1][j_index - 2] == -theCol &&
                Color[i_index + 1][j_index] == 0 &&
                Color[i_index + 1][j_index - 1] == 0 &&
                Color[i_index][j_index - 1] == 0 &&
                Color[i_index - 1][j_index] == 0
              ) {
                i_index_b = i_index;
                j_index_b = j_index;
                M = vv[i_index * Size + j_index];
              }
            }
          } else {
            if (j_index > 3 && j_index < Size - 1 && i_index > 0 && i_index < 3) {
              if (Color[i_index + 2][j_index - 1] == -theCol) {
                cc = CanCoNectFarBorder(i_index + 2, j_index - 1, -theCol);
                if (cc < 2) {
                  j_index_b = j_index;
                  if (cc < -1) {
                    j_index_b--;
                    cc++;
                  }
                  i_index_b = i_index - cc;
                  M = vv[i_index * Size + j_index];
                }
              }
            }
            if (j_index > 0 && j_index < Size - 1 && i_index == 0) {
              if (
                Color[i_index + 2][j_index - 1] == -theCol &&
                Color[i_index][j_index - 1] == 0 &&
                Color[i_index + 1][j_index - 1] == 0 &&
                Color[i_index + 1][j_index] == 0 &&
                Color[i_index][j_index + 1] == 0
              ) {
                i_index_b = i_index;
                j_index_b = j_index;
                M = vv[i_index * Size + j_index];
              }
            }
            if (j_index > 0 && j_index < Size - 4 && i_index < Size - 1 && i_index > Size - 4) {
              if (Color[i_index - 2][j_index + 1] == -theCol) {
                cc = CanCoNectFarBorder(i_index - 2, j_index + 1, -theCol);
                if (cc < 2) {
                  j_index_b = j_index;
                  if (cc < -1) {
                    j_index_b++;
                    cc++;
                  }
                  i_index_b = i_index + cc;
                  M = vv[i_index * Size + j_index];
                }
              }
            }
            if (j_index > 0 && j_index < Size - 1 && i_index == Size - 1) {
              if (
                Color[i_index - 2][j_index + 1] == -theCol &&
                Color[i_index][j_index + 1] == 0 &&
                Color[i_index - 1][j_index + 1] == 0 &&
                Color[i_index - 1][j_index] == 0 &&
                Color[i_index][j_index - 1] == 0
              ) {
                i_index_b = i_index;
                j_index_b = j_index;
                M = vv[i_index * Size + j_index];
              }
            }
          }
        }
      }
    }
  }
  MakeMove(i_index_b, j_index_b, false);
  ruNing = false;
  if (theCol < 0) {
    if (ComputedValues[i_index_b][j_index_b][2] > 140 || ComputedValues[i_index_b][j_index_b][3] > 140) {
      WriteCompute(false);
      return;
    }
    window.document.OptionsForm.Msg.value=" Red has won !";
    Blink(-2);
  } else {
    if (ComputedValues[i_index_b][j_index_b][0] > 140 || ComputedValues[i_index_b][j_index_b][1] > 140) {
      WriteCompute(false);
      return;
    }
    window.document.OptionsForm.Msg.value=" Blue has won !";
    Blink(-2);
  }
  IsOver = true;
}

function CanCoNectFarBorder(N, M, cc) {
  var i_index, j_index;
  if (cc > 0) {
    //blue
    if (2 * M < Size - 1) {
      for (i_index = 0; i_index < Size; i_index++) {
        for (j_index = 0; j_index < M; j_index++) {
          if (j_index - i_index < M - N && i_index + j_index <= N + M && Color[i_index][j_index] != 0)
            return 2;
        }
      }
      if (Color[N - 1][M] == -cc) return 0;
      if (Color[N - 1][M - 1] == -cc) {
        if (GetColor(N + 2, M - 1) == -cc) return 0;
        return -1;
      }
      if (GetColor(N + 2, M - 1) == -cc) return -2;
    } else {
      for (i_index = 0; i_index < Size; i_index++) {
        for (j_index = Size - 1; j_index > M; j_index--) {
          if (j_index - i_index > M - N && i_index + j_index >= N + M && Color[i_index][j_index] != 0)
            return 2;
        }
      }
      if (Color[N + 1][M] == -cc) return 0;
      if (Color[N + 1][M + 1] == -cc) {
        if (GetColor(N - 2, M + 1) == -cc) return 0;
        return -1;
      }
      if (GetColor(N - 2, M + 1) == -cc) return -2;
    }
  } else {
    if (2 * N < Size - 1) {
      for (j_index = 0; j_index < Size; j_index++) {
        for (i_index = 0; i_index < N; i_index++) {
          if (i_index - j_index < N - M && i_index + j_index <= N + M && Color[i_index][j_index] != 0)
            return 2;
        }
      }
      if (Color[N][M - 1] == -cc) return 0;
      if (Color[N - 1][M - 1] == -cc) {
        if (GetColor(N - 1, M + 2) == -cc) return 0;
        return -1;
      }
      if (GetColor(N - 1, M + 2) == -cc) return -2;
    } else {
      for (j_index = 0; j_index < Size; j_index++) {
        for (i_index = Size - 1; i_index > N; i_index--) {
          if (i_index - j_index > N - M && i_index + j_index >= N + M && Color[i_index][j_index] != 0)
            return 2;
        }
      }
      if (Color[N][M + 1] == -cc) return 0;
      if (Color[N + 1][M + 1] == -cc) {
        if (GetColor(N + 1, M - 2) == -cc) return 0;
        return -1;
      }
      if (GetColor(N + 1, M - 2) == -cc) return -2;
    }
  }
  return 1;
}

function GetColor(i_index, j_index) {
  if (i_index < 0) return -1;
  if (j_index < 0) return 1;
  if (i_index >= Size) return -1;
  if (j_index >= Size) return 1;
  return Color[i_index][j_index];
}

function Blink(N) {
  ruNing = true;
  if (N == -2) {
    setTimeout('Blink(-1)', 10);
    return;
  }
  if (N == -1) {
    ComputeData(0);
    WriteCompute(false);
    setTimeout('Blink(0)', 10);
    return;
  }
  if (N == 14) {
    ruNing = false;
    return;
  }
  var i_index,
    j_index,
    cc = (N % 2) * (((MoveCount + Start0) % 2) * 2 - 1);
  for (i_index = 0; i_index < Size; i_index++) {
    for (j_index = 0; j_index < Size; j_index++) {
      if (
        ComputedValues[i_index][j_index][0] + ComputedValues[i_index][j_index][1] <= 0 ||
        ComputedValues[i_index][j_index][2] + ComputedValues[i_index][j_index][3] <= 0
      ) {
        Color[i_index][j_index] = cc;
        UpdatePic(i_index, j_index);
      }
    }
  }
  setTimeout('Blink(' + eval(N + 1) + ')', 200);
}

function ComputeData(llevel) {
  var i_index,
    j_index,
    kk,
    M,
    Mp,
    N,
    bb,
    dd = 128;
  ActiveColor = ((MoveCount + 1 + Start0) % 2) * 2 - 1;
  for (i_index = 0; i_index < Size; i_index++) {
    for (j_index = 0; j_index < Size; j_index++) {
      for (kk = 0; kk < 4; kk++) {
        ComputedValues[i_index][j_index][kk] = 20000;
        CoNector[i_index][j_index][kk] = 0;
      }
    }
  }
  for (i_index = 0; i_index < Size; i_index++) {
    if (Color[i_index][0] == 0) ComputedValues[i_index][0][0] = dd;
    //blue border
    else {
      if (Color[i_index][0] > 0) ComputedValues[i_index][0][0] = 0;
    }
    if (Color[i_index][Size - 1] == 0) ComputedValues[i_index][Size - 1][1] = dd;
    //blue border
    else {
      if (Color[i_index][Size - 1] > 0) ComputedValues[i_index][Size - 1][1] = 0;
    }
  }
  for (j_index = 0; j_index < Size; j_index++) {
    if (Color[0][j_index] == 0) ComputedValues[0][j_index][2] = dd;
    //red border
    else {
      if (Color[0][j_index] < 0) ComputedValues[0][j_index][2] = 0;
    }
    if (Color[Size - 1][j_index] == 0) ComputedValues[Size - 1][j_index][3] = dd;
    //red border
    else {
      if (Color[Size - 1][j_index] < 0) ComputedValues[Size - 1][j_index][3] = 0;
    }
  }
  for (
    kk = 0;
    kk < 2;
    kk++ //blue ComputedValuesential
  ) {
    for (i_index = 0; i_index < Size; i_index++) {
      for (j_index = 0; j_index < Size; j_index++) Upd[i_index][j_index] = true;
    }
    N = 0;
    do {
      N++;
      bb = 0;
      for (i_index = 0; i_index < Size; i_index++) {
        for (j_index = 0; j_index < Size; j_index++) {
          if (Upd[i_index][j_index]) bb += SetComputedValues(i_index, j_index, kk, 1, llevel);
        }
      }
      for (i_index = Size - 1; i_index >= 0; i_index--) {
        for (j_index = Size - 1; j_index >= 0; j_index--) {
          if (Upd[i_index][j_index]) bb += SetComputedValues(i_index, j_index, kk, 1, llevel);
        }
      }
    } while (bb > 0 && N < 12);
  }
  for (
    kk = 2;
    kk < 4;
    kk++ //red ComputedValuesential
  ) {
    for (i_index = 0; i_index < Size; i_index++) {
      for (j_index = 0; j_index < Size; j_index++) Upd[i_index][j_index] = true;
    }
    N = 0;
    do {
      N++;
      bb = 0;
      for (i_index = 0; i_index < Size; i_index++) {
        for (j_index = 0; j_index < Size; j_index++) {
          if (Upd[i_index][j_index]) bb += SetComputedValues(i_index, j_index, kk, -1, llevel);
        }
      }
      for (i_index = Size - 1; i_index >= 0; i_index--) {
        for (j_index = Size - 1; j_index >= 0; j_index--) {
          if (Upd[i_index][j_index]) bb += SetComputedValues(i_index, j_index, kk, -1, llevel);
        }
      }
    } while (bb > 0 && N < 12);
  }
}

var vv = new Array(6);
var tt = new Array(6);

function SetComputedValues(i_index, j_index, kk, cc, llevel) {
  Upd[i_index][j_index] = false;
  CoNector[i_index][j_index][kk] = 0;
  if (Color[i_index][j_index] == -cc) return 0;
  var ll,
    M,
    ddb = 0,
    N,
    oo = 0,
    dd = 140,
    bb = 66;
  if (cc != ActiveColor) bb = 52;
  vv[0] = ComputedValuesVal(i_index + 1, j_index, kk, cc);
  vv[1] = ComputedValuesVal(i_index, j_index + 1, kk, cc);
  vv[2] = ComputedValuesVal(i_index - 1, j_index + 1, kk, cc);
  vv[3] = ComputedValuesVal(i_index - 1, j_index, kk, cc);
  vv[4] = ComputedValuesVal(i_index, j_index - 1, kk, cc);
  vv[5] = ComputedValuesVal(i_index + 1, j_index - 1, kk, cc);
  for (ll = 0; ll < 6; ll++) {
    if (vv[ll] >= 30000 && vv[(ll + 2) % 6] >= 30000) {
      if (vv[(ll + 1) % 6] < 0) ddb = +32;
      else vv[(ll + 1) % 6] += 128; //512;
    }
  }
  for (ll = 0; ll < 6; ll++) {
    if (vv[ll] >= 30000 && vv[(ll + 3) % 6] >= 30000) {
      ddb += 30;
    }
  }
  M = 30000;
  for (ll = 0; ll < 6; ll++) {
    if (vv[ll] < 0) {
      vv[ll] += 30000;
      tt[ll] = 10;
    } else tt[ll] = 1;
    if (M > vv[ll]) M = vv[ll];
  }
  N = 0;
  for (ll = 0; ll < 6; ll++) {
    if (vv[ll] == M) N += tt[ll];
  }
  if (llevel > 1) {
    CoNector[i_index][j_index][kk] = N / 5;
    if (N >= 2 && N < 10) {
      CoNector[i_index][j_index][kk] = bb + N - 2;
      M -= 32;
    }
    if (N < 2) {
      oo = 30000;
      for (ll = 0; ll < 6; ll++) {
        if (vv[ll] > M && oo > vv[ll]) oo = vv[ll];
      }
      if (oo <= M + 104) {
        CoNector[i_index][j_index][kk] = bb - (oo - M) / 4;
        M -= 64;
      }
      M += oo;
      M /= 2;
    }
  }

  if (i_index > 0 && i_index < Size - 1 && j_index > 0 && j_index < Size - 1)
    CoNector[i_index][j_index][kk] += ddb;
  else CoNector[i_index][j_index][kk] -= 2;
  if ((i_index == 0 || i_index == Size - 1) && (j_index == 0 || j_index == Size - 1))
    CoNector[i_index][j_index][kk] /= 2; // /=4
  if (CoNector[i_index][j_index][kk] > 68) CoNector[i_index][j_index][kk] = 68; //66

  if (Color[i_index][j_index] == cc) {
    if (M < ComputedValues[i_index][j_index][kk]) {
      ComputedValues[i_index][j_index][kk] = M;
      SetUpd(i_index + 1, j_index, cc);
      SetUpd(i_index, j_index + 1, cc);
      SetUpd(i_index - 1, j_index + 1, cc);
      SetUpd(i_index - 1, j_index, cc);
      SetUpd(i_index, j_index - 1, cc);
      SetUpd(i_index + 1, j_index - 1, cc);
      return 1;
    }
    return 0;
  }
  if (M + dd < ComputedValues[i_index][j_index][kk]) {
    ComputedValues[i_index][j_index][kk] = M + dd;
    SetUpd(i_index + 1, j_index, cc);
    SetUpd(i_index, j_index + 1, cc);
    SetUpd(i_index - 1, j_index + 1, cc);
    SetUpd(i_index - 1, j_index, cc);
    SetUpd(i_index, j_index - 1, cc);
    SetUpd(i_index + 1, j_index - 1, cc);
    return 1;
  }
  return 0;
}

function ComputedValuesVal(i_index, j_index, kk, cc) {
  if (i_index < 0) return 30000;
  if (j_index < 0) return 30000;
  if (i_index >= Size) return 30000;
  if (j_index >= Size) return 30000;
  if (Color[i_index][j_index] == 0) return ComputedValues[i_index][j_index][kk];
  if (Color[i_index][j_index] == -cc) return 30000;
  return ComputedValues[i_index][j_index][kk] - 30000;
}

function SetUpd(i_index, j_index, cc) {
  if (i_index < 0) return;
  if (j_index < 0) return;
  if (i_index >= Size) return;
  if (j_index >= Size) return;
  Upd[i_index][j_index] = true;
}

function Clicked(i_index, j_index) {
  if (IsOver) return;
  if (ruNing) {
    NextEvent = 'Clicked(' + i_index + ',' + j_index + ')';
    return;
  }
  if (Color[i_index][j_index] != 0) {
    if (MoveCount == 1 && false) MakeMove(i_index, j_index, false);
    return;
  }
  if (!IsPlayer[(MoveCount + Start0 + 1) % 2]) return;
  MakeMove(i_index, j_index, true);
}

function UpdatePic(i_index, j_index) {
  window.document.images[ImgNum[i_index][j_index]].src = Pic[1 + Color[i_index][j_index]].src;
}

function UpdateScreen() {
  for (i_index = 0; i_index < Size; i_index++) {
    for (j_index = 0; j_index < Size; j_index++)
      document.images[ImgNum[i_index][j_index]].src = Pic[1 + Color[i_index][j_index]].src;
  }
}
