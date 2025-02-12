'use client';
import { useEffect, useState } from "react";
import { Chessboard as ReactChessboard } from "react-chessboard";
import { useSocket } from "@/context/context";
import { useSearchParams, useRouter } from 'next/navigation';
import { v4 as uuid } from 'uuid';

import RequestCodes from "@/RequestCodes";
import Chessboard from "@/Classes/Chessboard";
import Message from "@/Message";
import Utilities from "@/Classes/Utilities";
import Timer from "@/Classes/Timer";
import styles from './page.css';


export default function Chess() {
  const socket = useSocket();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [boardState, setBoardState] = useState("start");
  const [legalMoves, setLegalMoves] = useState({});
  const [highlightedSquares, setHighlightedSquares] = useState({});
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [upgradeMessageID, setUpgradeMessageID] = useState("");
  const [blackTime, setBlackTime] = useState("");
  const [whiteTime, setWhiteTime] = useState("");
  const [winner, setWinner] = useState("");
  const [chessboard] = useState(new Chessboard(true));
  const searchParams = useSearchParams();
  const host = searchParams.get('host') == 'true';
  const minutes = searchParams.get('minutes');
  const orientation = host ? "white" : "black"
  const vsAI = searchParams.get('vsAI') == 'true';
  const minutesAllowed = parseInt(minutes);
  const [blackTimer, setBlackTimer] = useState(() => new Timer(1000, minutesAllowed * 60 * 1000, () => {
    setBlackTime(blackTimer.getRemainingTime() <= 0 ? 0 : blackTimer.getRemainingTime());
  }))
  const [whiteTimer, setWhiteTimer] = useState(() => new Timer(1000, minutesAllowed * 60 * 1000, () => {
    setWhiteTime(whiteTimer.getRemainingTime() <= 0 ? 0 : whiteTimer.getRemainingTime());
  }));
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");




  useEffect(() => {
    if (!socket) {
      router.push("/");
    }
  }, [socket]);


  useEffect(() => {
    setBlackTime(blackTimer.getRemainingTime());
    setWhiteTime(whiteTimer.getRemainingTime());

  }, [])

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!socket) {
      if (process.env.NODE_ENV === "development") console.log("socket undefined!");
      return;
    }
    const emitter = socket.emitter;
    whiteTimer.start();
    emitter.on(RequestCodes.ENEMY_MOVE, updateBoard);
    emitter.on(RequestCodes.REQUEST_UPGRADE, requestUpgrade);
    emitter.on(RequestCodes.TIMER, updateTimers);
    emitter.on(RequestCodes.CHAT_MESSAGE_NOTIFICATION, registerMessage);

    return () => {
      emitter.off(RequestCodes.ENEMY_MOVE, updateBoard);
      emitter.off(RequestCodes.REQUEST_UPGRADE, requestUpgrade);
      emitter.off(RequestCodes.TIMER, updateTimers);
      emitter.off(RequestCodes.CHAT_MESSAGE_NOTIFICATION, registerMessage);
    };
  }, [socket]);


  useEffect(() => {
    async function update() {
      await updateBoard();
    }
    update();
  }, []);

  const requestUpgrade = (message) => {
    setUpgradeMessageID(message.messageID);
    setShowPromotionDialog(true);
  }
  const updateTimers = (message) => {
    const timers = JSON.parse(message.data);
    whiteTimer.setRemainingTime(timers[0]);
    blackTimer.setRemainingTime(timers[1]);
  }
  const registerMessage = (message) => {
    setMessages(prevMessages => {
      const newMessages = [...prevMessages, { sender: host ? "Black" : "White", text: message.data }];
      console.log("New Messages:")
      console.log(newMessages);
      return newMessages;
    });
  }
  const updateBoard = async () => {
    return new Promise((resolve) => {
      let fenMessage = new Message(socket, uuid(), RequestCodes.REQUEST_FEN, null, res => {
        setFen(res.data);
        if (chessboard.whiteTurn) {
          whiteTimer.start();
          blackTimer.pause();
        } else {
          whiteTimer.pause();
          blackTimer.start();
        }
        let legalMovesMessage = new Message(socket, uuid(), RequestCodes.CHECKMATE, host, res => {
          const response = JSON.parse(res.data);
          const transformed = Object.keys(response).reduce((map, key) => {
            const parts = key.split('/');
            const position = parts[4].toLowerCase() + parts[6];
            const val = response[key];
            map[position] = val.map(item => `${Utilities.intToChar(parseInt(item[0]))}${item[1]}`);
            return map;
          }, {});
          setLegalMoves(transformed);

          let checkEnded = new Message(socket, uuid(), RequestCodes.IS_GAME_ENDED, null, message => {
            if (message.data && message.data !== 'false') {
              setWinner(message.data.toLowerCase());
            }
            resolve(true);
          });

          checkEnded.send();
        });

        legalMovesMessage.send();
      });

      fenMessage.send();
    });
  };
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
    const legalPieceMoves = legalMoves[sourceSquare];
    return legalPieceMoves && legalPieceMoves.indexOf(targetSquare).indexOf >= 0;
  }

  const requestMove = async (sourceSquare, targetSquare) => {
    let source = [Utilities.charToInt(sourceSquare.charAt(0)), parseInt(sourceSquare.charAt(1))];
    let target = [Utilities.charToInt(targetSquare.charAt(0)), parseInt(targetSquare.charAt(1))];
    const moveData = JSON.stringify([source, target]);
    return new Promise(resolve => {
      const requestMove = new Message(socket, uuid(), RequestCodes.REQUEST_MOVE, moveData, async res => {
        if (res && res.fen) {
          await updateBoard();
          resolve(true);
        } else resolve(false);
      });
      requestMove.send();
    })
  }

  const isDraggablePiece = ({ piece }) => {
    if ((piece.startsWith("w") && host && chessboard.whiteTurn) || (!host && piece.startsWith("b") && !chessboard.whiteTurn)) return true;
    return false;
  }

  const resetGame = () => {
    socket.emitter.once(RequestCodes.PLAY_AGAIN_ACCEPTED, async () => {
      setWinner("false");
      whiteTimer.setRemainingTime(minutesAllowed * 60 * 1000);
      blackTimer.setRemainingTime(minutesAllowed * 60 * 1000);
      await updateBoard();
      whiteTimer.start();
    })
    const playAgainMessage = new Message(socket, uuid(), RequestCodes.PLAY_AGAIN, null, null);
    playAgainMessage.send();
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
  const sendMessage = () => {
    setMessages(prevMessages => {
      const newMessages = [...prevMessages, { sender: host ? "Black" : "White", text: messageInput }];
      console.log("Self messages:")
      console.log(newMessages);
      return newMessages;
    });
    setMessageInput("")
    const chatMessage = new Message(socket, uuid(), RequestCodes.CHAT_MESSAGE, messageInput, null);
    chatMessage.send();

  }

  if (!isClient) {
    return null;
  }

  return (
    <div className="chess-container">
      <h1 className="game-title">Chess Game</h1>

      <div className="game-layout">
        <div className="board-section">
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
          </div>

          <div className="board-chat-container">
            <div className="board-container">
              <ReactChessboard
                position={boardState}
                isDraggablePiece={isDraggablePiece}
                onPieceDrop={async (sourceSquare, targetSquare, piece) => {
                  if (processMove) {
                    const state = chessboard.fenToBoardState(boardState);
                    delete state[sourceSquare];
                    state[targetSquare] = piece;
                    setBoardState(state);
                    await requestMove(sourceSquare, targetSquare);
                  } else return false;
                }}
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
            {!vsAI &&
              <div className="chat-section">
                <h2>Chat</h2>
                <div className="chat-window">
                  {messages.map((msg, index) => (
                    <div key={index} className="chat-message"><strong>{msg.sender}: </strong>{msg.text}</div>
                  ))}
                </div>
                <div className="chat-input">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
                    placeholder="Type a message..."
                  />
                  <button onClick={sendMessage}>Send</button>
                </div>
              </div>
            }

          </div>

          {(winner.includes("white") || winner.includes("black") || winner.includes("draw")) && (
            <div className="win-screen">
              <h2>
                {winner.includes("white") ? "White Wins!" :
                  winner.includes("black") ? "Black Wins!" :
                    "It's a Draw!"}
              </h2>
              <button className="restart-button" onClick={resetGame}>Play Again</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

}
