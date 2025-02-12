import Utilities from "./Utilities";
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
        this.whiteTurn = parts[1] == 'w';
        this.movesRemaining = parseInt(parts[4]);
    }
    fenToBoardState(fen) {
        const parts = fen.split(" ");
        const boardState = {};
        const rows = parts[0].split("/");

        for (let rank = 0; rank < 8; rank++) {
            let file = 0;

            for (const char of rows[rank]) {
                if (!isNaN(char)) {
                    file += parseInt(char);
                } else {
                    const fileChar = Utilities.intToChar(file + 1);
                    const rankChar = 8 - rank;

                    const color = char.toLowerCase() === char ? "b" : "w";
                    const piece = char.toUpperCase();

                    boardState[`${fileChar}${rankChar}`] = `${color}${piece}`;

                    file++;
                }
            }
        }

        return boardState;
    }
    static isValidFen(fen) {
        if (typeof fen !== 'string' || !(fen instanceof String)) return false;
        const fenParts = fen.split(' ');

        if (fenParts.length !== 6) {
            return false;
        }

        const [boardFen, turn, castlingRights, enPassant, halfmoveClock, fullmoveNumber] = fenParts;

        const rows = boardFen.split('/');
        if (rows.length !== 8) {
            return false;
        }

        for (let row of rows) {
            let totalSquares = 0;
            for (let char of row) {
                if (isNaN(char)) {
                    totalSquares++;
                } else {
                    totalSquares += parseInt(char);
                }
            }
            if (totalSquares !== 8) {
                return false;
            }
        }

        if (turn !== 'w' && turn !== 'b') {
            return false;
        }

        if (!/^[KQkq-]*$/.test(castlingRights)) {
            return false;
        }

        if (enPassant !== '-' && !/^[a-h][3-6]$/.test(enPassant)) {
            return false;
        }

        if (!/^\d+$/.test(halfmoveClock) || parseInt(halfmoveClock) < 0) {
            return false;
        }

        if (!/^\d+$/.test(fullmoveNumber) || parseInt(fullmoveNumber) <= 0) {
            return false;
        }

        return true;
    }


}

export default Chessboard;