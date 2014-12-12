var uttt = require("./uttt.js")

function ai(heuristic, searchDepth) {


	return function selectMove(game, cb) {
		asyncSelectMove(game, searchDepth, cb)
	}

	function asyncSelectMove(game, searchDepth, cb) {
		var moves = uttt.availableMoves(game)
		var bestValue = game.turn === 1 ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY
		var bestMove, queue = moves.length, index = 0
		
		var workers = [];
		for(var i=0; i<4; i++) {
			var worker = new Worker("src/worker.js")
			worker.onmessage = function(e) {
				var res = e.data
			  	var val = res[0], move = res[1]
				if(game.turn === 1 && val > bestValue || game.turn === -1 && val < bestValue) {
					bestValue = val
					bestMove = move
				} else if(!bestMove) {
					bestMove = move
				}
				queue--;
				index++
				this.free = true
				if(index < moves.length) {
					doWork()
				}
				if(queue === 0) 
				{
					cb(bestMove)
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
					worker.postMessage([nextGame, searchDepth-1, moves[index], heuristic.toString()])
				} 
			}
		}

		doWork();
	}
}

exports.ai = ai