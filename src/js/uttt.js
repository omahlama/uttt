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