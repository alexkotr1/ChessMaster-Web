'use client';
import { useState } from "react";
import { useRouter } from 'next/navigation';
import { useSocket } from '@/context/context';
import { v4 as uuid } from 'uuid';
import RequestCodes from "../RequestCodes";
import Message from '../Message';
import styles from './page.css';

export default function Home() {
  const [inviteCode, setInviteCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [isPlayingAI, setIsPlayingAI] = useState(false);
  const router = useRouter();
  const socket = useSocket();


  const handleInviteCodeChange = (e) => {
    setInviteCode(e.target.value);
  };

  const generateInviteCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGeneratedCode(code);
  };

  const startGameAgainstAI = () => {
    setIsPlayingAI(true);
  };

  const joinGameWithCode = (inviteCode) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.log("WebSocket is not open.");
      return;
    }

    const parsedMessage = new Message(socket, uuid(), RequestCodes.JOIN_GAME, inviteCode);
    socket.send(parsedMessage.toString());
    socket.emitter.once(RequestCodes.JOIN_GAME_SUCCESS, () => {
      console.log("Redirecting...");
      const queryParams = new URLSearchParams({ host: 'false' }).toString();
      router.replace(`/chessboard?${queryParams}`);
    })
  };

  return (
    <div className="home-container">
      <h1>Welcome to ChessMaster</h1>
      <p>Play against friends or challenge the AI!</p>

      <div className="input-container">
        <h3>Enter Invite Code</h3>
        <input
          type="text"
          value={inviteCode}
          onChange={handleInviteCodeChange}
          placeholder="Enter code"
        />
        <button className="button" onClick={() => joinGameWithCode(inviteCode)}>
          Join Game
        </button>
      </div>

      <div className="generate-code-container">
        <h3>Generate Invite Code</h3>
        <button className="button" onClick={generateInviteCode}>
          Generate Code
        </button>
        {generatedCode && (
          <div className="generated-code">
            <p>Your Invite Code: <strong>{generatedCode}</strong></p>
          </div>
        )}
      </div>

      <div className="ai-container">
        <h3>Play Against AI</h3>
        <button className="button" onClick={startGameAgainstAI}>
          Play vs AI
        </button>
      </div>

      {isPlayingAI && (
        <div className="ai-game-message">
          <p>You're playing against the AI now!</p>
        </div>
      )}
    </div>
  );
}
