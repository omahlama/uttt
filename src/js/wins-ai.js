var ai = require("./ai.js")

function heuristic(game) {
	return game.wins.reduce(function(a, b) { return a + (b || 0)}, 0)
}

exports.winsAi = ai.ai(heuristic, 4)