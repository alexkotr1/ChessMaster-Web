class Chessboard {
    constructor(whiteTurn, fen, movesRemaining, gameEnded, winner) {
        this.fen = this.fen;
        this.whiteTurn = whiteTurn;
        this.movesRemaining = movesRemaining;
        this.gameEnded = gameEnded;
        this.winner = winner;
    }
    fromFen(fen) {
        if (!fen || fen.length == 0) return undefined;
        this.fen = fen;
        const parts = fen.split(" ");
        console.log(parts);
        this.whiteTurn = parts[1] == 'w';
        this.movesRemaining = parseInt(parts[4]);
    }
}

export default Chessboard;