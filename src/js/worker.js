var uttt = require("./uttt.js")

self.onmessage = function(e) {
    selectMoveWorker.apply(this, e.data)
}

function selectMoveWorker(game, searchDepth, move, heuristicStr) {
		eval("var heuristic = " + heuristicStr)
		var best = doSelectMove(game, searchDepth)
		postMessage([best[0], move])

		function doSelectMove(game, depth) {
			if(depth === 0) {
				return [heuristic(game), null];
			} else {
				var moves = uttt.availableMoves(game);
				var bestValue = game.turn === 1 ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
				var bestMove, move, val;
				for(var i=0; i<moves.length; i++) {
					move = moves[i];
					if(game.winner) { 
						val = game.turn * Math.Infinity;
					} else {
						val = doSelectMove(uttt.play(game, game.turn, move[0], move[1]), depth-1)[0];
					}
					if(game.turn === 1 && val > bestValue || game.turn === -1 && val < bestValue) {
						bestValue = val;
						bestMove = move;
					} else if(!bestMove) {
						bestMove = move;
					}
				}
				return [bestValue, bestMove];
			}
		}
	}