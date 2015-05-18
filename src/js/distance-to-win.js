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
