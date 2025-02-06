'use client';
import { useEffect, useState } from "react";
import { Chessboard as ReactChessboard } from "react-chessboard";
import { useSocket } from "@/context/context";
import { useSearchParams } from 'next/navigation';
import { v4 as uuid } from 'uuid';

import RequestCodes from "@/RequestCodes";
import Chessboard from "@/Classes/Chessboard";
import Message from "@/Message";
import Utilities from "@/Classes/Utilities";
import styles from './page.css';


export default function Chess() {
  const socket = useSocket();
  const [isClient, setIsClient] = useState(false);
  const [boardState, setBoardState] = useState("start");
  const [legalMoves, setLegalMoves] = useState({});
  const [highlightedSquares, setHighlightedSquares] = useState({});
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [upgradeMessageID, setUpgradeMessageID] = useState("");
  const [gameOver, setGameOver] = useState(false)
  const [blackTime, setBlackTime] = useState("");
  const [whiteTime, setWhiteTime] = useState("");
  const searchParams = useSearchParams();
  const host = searchParams.get('host') == 'true';
  const [chessboard] = useState(new Chessboard(true));
  const orientation = host ? "white" : "black"


  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!socket) { console.log("socket undefined!"); return; }
    const emitter = socket.emitter;

    emitter.on(RequestCodes.ENEMY_MOVE, () => {
      let fenMessage = new Message(socket, uuid(), RequestCodes.REQUEST_FEN, null, res => setFen(res.data))
      fenMessage.send();

      let legalMovesMessage = new Message(socket, uuid(), RequestCodes.CHECKMATE, null, res => {
        const response = JSON.parse(res.data);
        const transformed = Object.keys(response).reduce((map, key) => {
          const parts = key.split('/');
          const position = parts[4].toLowerCase() + parts[6];
          const val = response[key];
          map[position] = val.map(item => `${Utilities.intToChar(parseInt(item[0]))}${item[1]}`);
          return map;
        }, {});
        setLegalMoves(transformed);
      });
      legalMovesMessage.send();
    });

    emitter.on(RequestCodes.REQUEST_UPGRADE, message => {
      setUpgradeMessageID(message.messageID);
      setShowPromotionDialog(true);
    });

    emitter.on(RequestCodes.TIMER, message => {
      const timers = JSON.parse(message.data);
      setWhiteTime(timers[0]);
      setBlackTime(timers[1]);
    })

    return () => {
      emitter.off(RequestCodes.ENEMY_MOVE);
    };
  }, [socket]);

  const onPromotionPieceSelect = (piece, orig, dest) => {
    setShowPromotionDialog(false);
    let upgradeTo = piece.charAt(1).toLowerCase();
    if (upgradeTo == "q") upgradeTo = "Vasilissa"
    else if (upgradeTo == "n") upgradeTo = "Alogo"
    else if (upgradeTo == "r") upgradeTo = "Pyrgos"
    else if (upgradeTo == "b") upgradeTo = "Stratigos"
    let upgradeNotify = new Message(socket, upgradeMessageID, RequestCodes.REQUEST_CHESSBOARD_RESULT, upgradeTo)
    upgradeNotify.send();
    return true;
  }

  const setFen = (fen) => {
    chessboard.fromFen(fen);
    setBoardState(fen);
  };

  const secondsToTime = (milliseconds) => {
    const seconds = milliseconds / 1000;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = remainingSeconds.toString().padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  }

  const processMove = (sourceSquare, targetSquare) => {
    let source = [Utilities.charToInt(sourceSquare.charAt(0)), parseInt(sourceSquare.charAt(1))];
    let target = [Utilities.charToInt(targetSquare.charAt(0)), parseInt(targetSquare.charAt(1))];
    const moveData = JSON.stringify([source, target]);
    const requestMove = new Message(socket, uuid(), RequestCodes.REQUEST_MOVE, moveData, res => {
      if (res && res.fen) setFen(res.fen)
    });
    requestMove.send();
    return true;
  }

  const isDraggablePiece = ({ piece }) => {
    if ((piece.startsWith("w") && host && chessboard.whiteTurn) || (!host && piece.startsWith("b") && !chessboard.whiteTurn)) return true;
    return false;
  }



  const getLegalMoves = (square) => {
    const moves = legalMoves[square];
    const newHighlights = {};
    if (!moves) return undefined;
    moves.forEach(move => {
      newHighlights[move] = {
        background: "radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)",
        borderRadius: "150%"
      };
    });
    setHighlightedSquares(newHighlights);
  }


  if (!isClient) {
    return null;
  }

  return (
    <div className="chess-container">
      <h1 className="game-title">Chess Game</h1>

      {/* Game Status Bar */}
      <div className="game-status-bar">
        <div className="timer-container">
          <div className="timer white-time">
            <h3>White Time</h3>
            <p>{secondsToTime(whiteTime)}</p>
          </div>
          <div className="timer black-time">
            <h3>Black Time</h3>
            <p>{secondsToTime(blackTime)}</p>
          </div>
        </div>

        {/* <div className="captured-pieces">
          <div>
            <h4>Captured White Pieces</h4>
            <div className="captured-pieces-list">
              {capturedWhite.map(piece => (
                <span key={piece} className="captured-piece">{piece}</span>
              ))}
            </div>
          </div>
          <div>
            <h4>Captured Black Pieces</h4>
            <div className="captured-pieces-list">
              {capturedBlack.map(piece => (
                <span key={piece} className="captured-piece">{piece}</span>
              ))}
            </div>
          </div>
        </div> */}
      </div>

      {/* Chessboard */}
      <div className="board-container">
        <ReactChessboard
          boardWidth={800}
          position={boardState}
          isDraggablePiece={isDraggablePiece}
          onPieceDrop={processMove}
          onPieceDragBegin={(piece, square) => getLegalMoves(square)}
          onPieceDragEnd={() => setHighlightedSquares({})}
          customSquareStyles={highlightedSquares}
          showPromotionDialog={showPromotionDialog}
          onPromotionPieceSelect={onPromotionPieceSelect}
          promotionDialogVariant="modal"
          boardOrientation={orientation}
          onPromotionCheck={() => { return false; }}
        />
      </div>

      {/* Win Screen */}
      {gameOver && (
        <div className="win-screen">
          <h2>{winner === "w" ? "White Wins!" : "Black Wins!"}</h2>
          <button className="restart-button" onClick={resetGame}>Play Again</button>
        </div>
      )}

    </div>
  );

}
