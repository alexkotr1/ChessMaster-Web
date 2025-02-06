'use client';
import WebSocketEventEmitter from "./WebSocketEventEmitter";
let socket;
let emitter;

export const getSocket = () => {
  if (!socket || socket.readyState === WebSocket.CLOSED) {
    socket = new WebSocket("ws://localhost:8025/chat");
    socket.emitter = new WebSocketEventEmitter(socket);

    socket.onopen = () => console.log("✅ Connected to WebSocket Server");
    socket.onclose = (event) => console.log("❌ Disconnected", event);
    socket.onerror = (error) => console.error("⚠️ WebSocket error:", error);
  }
  return socket;
};
