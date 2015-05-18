uttt = require("../src/js/uttt.js")

var game = uttt.game()

console.time("move")
for(var i=0; i<100000; i++) {
  uttt.play(game, game.turn, 4, 4)
}
console.timeEnd("move")

console.time("generate single table moves")
for(var i=0; i<100000; i++) {
  uttt.availableMoves(game)
}
console.timeEnd("generate single table moves")

console.time("generate all moves")
game.active = -1
for(var i=0; i<100000; i++) {
  uttt.availableMoves(game)
}
console.timeEnd("generate all moves")
