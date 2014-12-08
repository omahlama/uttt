function emptyArr(size) {
	return Array.apply(null, new Array(size)).map(Number.prototype.valueOf,0)
}

var Game = function Game() {
	return {	
		wins: emptyArr(9),
		boards: Array.apply(null, new Array(9)).map(function() { return emptyArr(9) }),
		turn: 1,
		active: 4
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
	return game.turn === player && (game.active < 0 || game.active === board) && game.wins[board] === 0 && game.boards[board][place] === 0
}

var rows = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]
function calculateWin(board) {
	var i, j;
	for(i=0; i<rows.length; i++) {
		var sum = 0;
		for(j=0;j<3;j++) {
			sum += board[rows[i][j]]
		}
		if(sum === 3) return 1
		if(sum === -3) return -1
	}
	return 0
}

function applyMove(game, player, board, place) {
	var g = clone(game)
	g.boards[board][place] = player
	g.wins[board] = calculateWin(g.boards[board])
	g.active = g.wins[place] === 0 ? place : -1
	g.turn = -1 * g.turn
	return g
}

function play(game, player, board, place) {
	if(isValidMove(game, player, board, place)) {
		return applyMove(game, player, board, place)
	}
}

exports.game = Game
exports.play = play