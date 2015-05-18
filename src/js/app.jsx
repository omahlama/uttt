var uttt = require('./uttt.js')
var ai = require('./ai.js')
var React = require('react')

var winsAi = ai.ai("wins", 6)

var GameBoard = React.createClass({
  getInitialState: function() {
    return { game: uttt.game(), loading: false }
  },
  play: function(boardIndex, cellIndex) {
    if(this.state.game.turn === 1) {
      var nextState = uttt.play(this.state.game, this.state.game.turn, boardIndex, cellIndex)
      if(nextState) {
        this.setState({game: nextState, loading: true})
        if(nextState.turn === -1) {
          setTimeout((function() {
            winsAi(nextState, (function(aiMove, value, combo) {
              nextState = uttt.play(nextState, nextState.turn, aiMove[0], aiMove[1])
              if(nextState) {
                this.setState({game: nextState, loading: false, value: value, combo: combo})
              }

            }).bind(this))
          }).bind(this), 0)
        }
      }
    }
  },
  render: function() {
    var game = this.state.game
    var self = this

    function classForCell(value) {
      return value === 1 ? " state-x" : (value === -1 ? " state-y" : "")
    }

    function classForBoard(boardIndex) {
      return "board" +
        (game.active === boardIndex ? " board-active" : "") +
        (game.wins[boardIndex] !== 0 ? " board-win-" + (game.wins[boardIndex] === 1 ? "x" : (game.wins[boardIndex] === -1 ? "y" : "tie")) : "")
    }

    var gameOver = ""
    if(game.winner !== null) {
      gameOver =
        <div className="gameover">
        <span>{ game.winner === 1 ? "Red wins" : (game.winner === -1 ? "Blue wins": "Tie") }</span>
      </div>
    }

    return (
        <div className={ this.state.loading ? 'game loading' : 'game'}>
          <h1>Ultimate Tic Tac Toe</h1>
          { gameOver }
          {
            game.boards.map(function(board, boardIndex) {
              return (
                <div className={classForBoard(boardIndex)} id={"board-"+boardIndex}>
                {board.map(function(cell, cellIndex) {
                    return <div
                      className={"cell" + classForCell(cell)}
                      id={"cell-"+boardIndex+"-"+cellIndex}
                      onClick={function() { self.play(boardIndex, cellIndex)}}></div>
                })}
              </div>
              )
            })
          }
          <div className="debug">{this.state.value}</div>
          <div className="debug">{this.state.combo && this.state.combo.join(" -> ")}</div>
      </div>
    );
  }
})

React.render(<GameBoard />, document.getElementById("game"))
