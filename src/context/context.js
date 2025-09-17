import React, { createContext, useContext, useState, useEffect } from "react";
import Socket from "@/app/utils/Socket";

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const socketUrl = process.env.NODE_ENV === "development"
            ? "ws://192.168.1.2:8080"
            : "wss://ws.chessmaster.gr:5554";

        const socket = new Socket(socketUrl);
        setSocket(socket);

        return () => {
            socket.close();
        };
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
