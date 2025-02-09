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
  const [selectedTime, setSelectedTime] = useState(10);
  const router = useRouter();
  const socket = useSocket();

  const handleInviteCodeChange = (e) => {
    setInviteCode(e.target.value);
  };

  const generateInviteCode = () => {
    const requestHost = new Message(socket, uuid(), RequestCodes.HOST_GAME, selectedTime, message => {
      setGeneratedCode(message.data);
    })

    socket.emitter.once(RequestCodes.SECOND_PLAYER_JOINED, () => {
      const queryParams = new URLSearchParams({ host: 'true', minutes: selectedTime }).toString();
      router.replace(`/chessboard?${queryParams}`);
    })
    requestHost.send();
  };

  const startGameAgainstAI = () => {
    const requestVsAI = new Message(socket, uuid(), RequestCodes.START_AI_GAME, selectedTime, () => {
      const queryParams = new URLSearchParams({ host: 'true', minutes: selectedTime }).toString();
      router.replace(`/chessboard?${queryParams}`);
    })
    requestVsAI.send();
  };

  const joinGameWithCode = (inviteCode) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      if (process.env.NODE_ENV === "development") console.log("WebSocket is not open.");
      return;
    }

    const parsedMessage = new Message(socket, uuid(), RequestCodes.JOIN_GAME, inviteCode);
    socket.send(parsedMessage.toString());

    socket.emitter.once(RequestCodes.JOIN_GAME_SUCCESS, message => {
      const queryParams = new URLSearchParams({ host: 'false', minutes: message.data }).toString();
      router.replace(`/chessboard?${queryParams}`);
    });

  };

  return (
    <div className="home-container">
      <h1>Welcome to ChessMaster!</h1>
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
        <label>Select Time Control:</label>
        <select
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
        >
          <option value={1}>1 min</option>
          <option value={3}>3 min</option>
          <option value={5}>5 min</option>
          <option value={10}>10 min</option>
          <option value={15}>15 min</option>
          <option value={30}>30 min</option>
        </select>
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

      <div className="download-container">
        <h3>Download Windows Client</h3>
        <a href="https://github.com/alexkotr1/alexkotr1.github.io/raw/refs/heads/main/ChessMasterInstaller.exe" download className="download-button">
          Download ChessMaster for Windows
        </a>
      </div>
      <footer className="credits">
        <p>Developed by <strong>Alex Kotrotsios</strong></p>
        <p>© {new Date().getFullYear()} ChessMaster. All rights reserved.</p>
      </footer>
    </div>
  );
}
