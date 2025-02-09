import React, { createContext, useContext, useState, useEffect } from "react";
import WebSocketEventEmitter from "@/app/utils/WebSocketEventEmitter";

const SocketContext = createContext(null);

export const useSocket = () => {
    return useContext(SocketContext);
}

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const serverIP = process.env.NEXT_PUBLIC_LOCAL === "true"
            ? process.env.NEXT_PUBLIC_SERVER_IP_LOCAL
            : process.env.NEXT_PUBLIC_SERVER_IP_REMOTE;

        const serverPort = process.env.NEXT_PUBLIC_SERVER_PORT_REMOTE
            ? process.env.NEXT_PUBLIC_SERVER_PORT_REMOTE
            : 8025;

        const socketInstance = new WebSocket(`wss://${serverIP}:${serverPort}/chat`);
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
