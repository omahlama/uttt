(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var uttt = require("./uttt.js")
var heuristics = {
  wins: require("./wins-ai.js"),
  distance_to_win: require("./distance-to-win.js")
}

self.onmessage = function(e) {
    selectMoveWorker.apply(this, e.data)
}

function selectMoveWorker(game, searchDepth, move, heuristicName) {
    var heuristic = heuristics[heuristicName].heuristic
    var best = doSelectMove(game, searchDepth)
    postMessage([best[0], move, best[2]])

    function doSelectMove(game, depth) {
      if(depth === 0) {
        return [heuristic(game), null, "!"];
      } else {
        var moves = uttt.availableMoves(game);
        var bestValue = game.turn === 1 ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
        var bestMove, move, val, bestCombo, combo;
        for(var i=0; i<moves.length; i++) {
          move = moves[i];
          if(game.winner) {
            val = game.turn * Math.Infinity;
          } else {
            var ret = doSelectMove(uttt.play(game, game.turn, move[0], move[1]), depth-1);
            val = ret[0]
            combo = ret[2]
          }
          if(game.turn === 1 && val > bestValue || game.turn === -1 && val < bestValue) {
            bestValue = val;
            bestMove = move;
            bestCombo = [move].concat(combo);
          } else if(!bestMove) {
            bestMove = move;
            bestCombo = [move].concat(combo);
          }
        }
        return [bestValue, bestMove, bestCombo];
      }
    }
  }

},{"./distance-to-win.js":3,"./uttt.js":4,"./wins-ai.js":5}],2:[function(require,module,exports){
var uttt = require("./uttt.js")

function ai(heuristic, searchDepth) {


  return function selectMove(game, cb) {
    asyncSelectMove(game, searchDepth, cb)
  }

  function asyncSelectMove(game, searchDepth, cb) {
    var moves = uttt.availableMoves(game)
    var bestValue = game.turn === 1 ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY
    var bestMove, bestCombo, queue = moves.length, index = 0

    var workers = [];
    for(var i=0; i<4; i++) {
      var worker = new Worker("src/worker.js")
      worker.onmessage = function(e) {
        var res = e.data
          var val = res[0], move = res[1], combo = res[2]
        if(game.turn === 1 && val > bestValue || game.turn === -1 && val < bestValue) {
          bestValue = val
          bestMove = move
          bestCombo = [move].concat(combo)
        } else if(!bestMove) {
          bestMove = move
          bestCombo = [move].concat(combo)
        }
        queue--;
        this.free = true
        if(index < moves.length) {
          doWork()
        }
        if(queue === 0)
        {
          cb(bestMove, bestValue, bestCombo)
        }
      }
      worker.free = true
      workers.push(worker)
    }

    function doWork() {
      var nextGame = uttt.play(game, game.turn, moves[index][0], moves[index][1])
      for(var i=0; i<workers.length; i++) {
        var worker = workers[i]
        if(worker.free) {
          worker.free = false;
          worker.postMessage([nextGame, searchDepth-1, moves[index], heuristic])
          index++
        }
      }
    }

    doWork();
  }
}

exports.ai = ai

},{"./uttt.js":4}],3:[function(require,module,exports){
var uttt = require("./uttt")

function combinations() {
  var complete = [[1], [0], [-1]], next;
  for(var i = 1; i < 9; i++) {
    next = []
    for(var j=0; j<complete.length; j++) {
      next.push([1].concat(complete[j]))
      next.push([0].concat(complete[j]))
      next.push([-1].concat(complete[j]))
    }
    complete = next;
  }
  return complete
}

function sorted() {
  return combinations().sort(function(a, b) {
    return fillCount(a) - fillCount(b)
  })
}

function fillCount(arr) {
  var c=0;
  for(var i=0;i<arr.length; i++) {
    if(arr[i] === 0) c++
  }
  return c;
}

function distances() {
  var plus = {}, minus = {}
  var s = sorted()
  var board, boardStr, winner

  for(var i=0; i<s.length; i++) {
    board = s[i]
    boardStr = board.join('')
    winner = uttt.calculateWin(board)
    var plusMin = winner === 1 ? 0 : Infinity
    var minusMin = winner === -1 ? 0 : Infinity
    if(fillCount(board) !== 0) {
      for(var j=0; j<board.length; j++) {
        if(board[j] === 0) {
          var plusStr = board.slice(0,j).concat([1]).concat(board.slice(j+1, board.length)).join('')
          var minusStr = board.slice(0,j).concat([-1]).concat(board.slice(j+1, board.length)).join('')
          var plusMin = Math.min(plus[plusStr] + 1, plusMin)
          var minusMin = Math.min(minus[minusStr] + 1, minusMin)
        }
      }
    }
    plus[boardStr] = plusMin
    minus[boardStr] = minusMin
  }
  return { plus: plus, minus: minus }
}

function sum(a, b) { return a+b }

var generatedDistances
function heuristic(game) {
  if(!generatedDistances) {
    generatedDistances = distances()
  }

  return game.boards.map(function(board) {
    var boardStr = board.join('')
    var p = generatedDistances.plus[boardStr]
    var m = generatedDistances.minus[boardStr]

    if(p===0 && m===0) return 0
    if(p===0) return game.turn
    if(m===0) return -game.turn
    return game.turn*(p-m)/3
  }).reduce(sum, 0)
}

exports.heuristic = heuristic

},{"./uttt":4}],4:[function(require,module,exports){
function emptyArr(size) {
  return Array.apply(null, new Array(size)).map(Number.prototype.valueOf,0)
}

var Game = function Game() {
  return {
    wins: emptyArr(9),
    boards: Array.apply(null, new Array(9)).map(function() { return emptyArr(9) }),
    turn: 1,
    active: 4,
    winner: null
  }
}

function clone(game) {
  return {
    wins: game.wins.slice(0),
    boards: game.boards.map(function(board) { return board.slice(0) }),
    turn: game.turn,
    active: game.active
  }
}

function isValidMove(game, player, board, place) {
  return game.winner === null && game.turn === player && (game.active < 0 || game.active === board) && game.wins[board] === 0 && game.boards[board][place] === 0
}

var rows = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]
function calculateWin(board) {
  var i, j, val, full=true
  for(i=0; i<rows.length; i++) {
    var sum = 0;
    for(j=0;j<3;j++) {
      val = board[rows[i][j]]
      sum += val;
      if(val === 0) {
        full = false
      }
    }
    if(sum === 3) return 1
    if(sum === -3) return -1
  }
  if(full) {
    return null
  }
  return 0
}

function gameWinner(wins) {
  var x = 0, y = 0, full = 0;
  for(var i=0; i<9; i++) {
    var win = wins[i]
    if(win === 1) { x++ }
    if(win === -1) { y++ }
    if(win === null) { full++ }
  }

  if(x === 5 || y === 5 || x + y + full === 9) {
    return x > y || x === 5 ? 1 : (x < y || y === 5 ? -1 : 0)
  }
  return null;
}

function applyMove(game, player, board, place) {
  var boards = game.boards.slice(0)
  boards[board] = boards[board].slice()
  boards[board][place] = player
  wins = game.wins.slice(0)
  wins[board] = calculateWin(boards[board])

  return {
    boards: boards,
    wins: wins,
    active: wins[place] === 0 ? place : -1,
    turn: -1 * game.turn,
    winner: gameWinner(wins)
  }
}

function play(game, player, board, place) {
  if(isValidMove(game, player, board, place)) {
    return applyMove(game, player, board, place)
  }
}

function emptyCells(board) {
  var arr = []
  for(var i=0;i<board.length; i++) {
    if(board[i] === 0) {
      arr.push(i)
    }

  }
  return arr;
}

function pairs(val, arr) {
  var len = arr.length
  var ret = new Array(len)
  for(var i = 0; i < len; i++) {
    ret[i] = [val, arr[i]]
  }
  return ret
}

function availableMoves(game) {
  var moves = []
  if(game.active >= 0) {
    Array.prototype.push.apply(moves, pairs(game.active, emptyCells(game.boards[game.active])))
  } else {
    for(var i=0;i<9;i++) {
      if(game.wins[i] === 0) {
        Array.prototype.push.apply(moves, pairs(i, emptyCells(game.boards[i])))
      }
    }
  }
  return moves
}

exports.game = Game
exports.play = play
exports.availableMoves = availableMoves
exports.calculateWin = calculateWin

},{}],5:[function(require,module,exports){
var ai = require("./ai.js")

function heuristic(game) {
  return game.wins.reduce(function(a, b) { return a + (b || 0)}, 0)
}

exports.heuristic = heuristic

},{"./ai.js":2}]},{},[1]);
