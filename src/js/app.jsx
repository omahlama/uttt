var uttt = require('./uttt.js')
var React = require('react')

var GameBoard = React.createClass({
  getInitialState: function() {
    return { game: uttt.game() }
  },
  play: function(boardIndex, cellIndex) {
  	var nextState = uttt.play(this.state.game, this.state.game.turn, boardIndex, cellIndex)
  	if(nextState) {
    	this.setState({game: nextState})  		
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
  			(game.wins[boardIndex] !==  0 ? " board-win-" + (game.wins[boardIndex] === 1 ? "x" : "y") : "")
  	}

    return (
      	<div className="game">
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
	  	</div>
    );
  }	
})

React.render(<GameBoard />, document.getElementById("game"))