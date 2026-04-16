"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io as ClientIO } from "socket.io-client";
import { useSession } from "next-auth/react";

const SocketContext = createContext({
    socket: null,
    isConnected: false,
});

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const { data: session, status } = useSession();
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (status !== "authenticated" || !session?.user) {
            return;
        }
        const businessId = session.user.businessId || undefined;
        const userId = session.user.id || undefined;
        if (!businessId && !userId) {
            return;
        }

        const query = {};
        if (businessId) query.businessId = businessId;
        if (userId) query.userId = userId;

        const fromEnv = (
            process.env.NEXT_PUBLIC_SOCKET_URL ||
            process.env.NEXT_PUBLIC_APP_URL ||
            ""
        ).trim();
        const isLocalPage =
            typeof window !== "undefined" &&
            (window.location.hostname === "localhost" ||
                window.location.hostname === "127.0.0.1");
        let socketBaseUrl = fromEnv;
        if (typeof window !== "undefined") {
            const pointsToLoopback =
                /localhost|127\.0\.0\.1/.test(socketBaseUrl) && !isLocalPage;
            if (!socketBaseUrl || pointsToLoopback) {
                socketBaseUrl = window.location.origin;
            }
        }

        const socketInstance = new ClientIO(socketBaseUrl, {
            path: "/api/socket/io",
            query,
            addTrailingSlash: false,
        });

        socketInstance.on("connect", () => {
            console.log("Socket connected:", socketInstance.id);
            setIsConnected(true);
        });

        socketInstance.on("disconnect", () => {
            console.log("Socket disconnected");
            setIsConnected(false);
        });

        setSocket(socketInstance);

        // Cleanup on unmount or session change
        return () => {
            socketInstance.disconnect();
        };
    }, [session, status]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
