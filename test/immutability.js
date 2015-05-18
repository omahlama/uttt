var _ = require("lodash")
var uttt = require("../src/js/uttt.js")

var n = 1;
while(true) {
  console.log(n++)
  var game = uttt.game()
  do {
    var moves = uttt.availableMoves(game)
    var move = moves[Math.floor(Math.random()*moves.length)]
    var orig = _.cloneDeep(game)
    var next = uttt.play(game, game.turn, move[0], move[1])
    if(!_.isEqual(game, orig)) {
      console.log(game)
      console.log(orig)
      throw new Exception()
    }
    game = next
  } while(game.winner === null)
}

