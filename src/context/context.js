import React, { createContext, useContext, useState, useEffect } from "react";
import WebSocketEventEmitter from "@/app/utils/WebSocketEventEmitter";

const SocketContext = createContext(null);

export const useSocket = () => {
    return useContext(SocketContext);
}

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const socketInstance = new WebSocket(`wss://${process.env.NODE_ENV === "development" ? "0.0.0.0:8025" : "ws.chessmaster.gr"}`);
        socketInstance.emitter = new WebSocketEventEmitter(socketInstance);

        setSocket(socketInstance);
        return () => {
            socketInstance.close();
        };
    }, []);

    return (
        <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
    );
};
