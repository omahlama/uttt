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
