// Filename: frontend/src/context/SocketContext.jsx (Final and Robust Version)

import React, { createContext, useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import { UserContext } from './UserContext';
import { CaptainContext } from './CaptainContext';

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user } = useContext(UserContext);
    const { captain } = useContext(CaptainContext);

    useEffect(() => {
        // Determine if we should have a connection (either user or captain is logged in)
        const loggedInEntity = user || captain;
        const token = localStorage.getItem('token') || localStorage.getItem('captain_token');

        if (loggedInEntity && token) {
            // Create a new socket connection. The 'forceNew' option is crucial
            // for ensuring a fresh connection on login/logout.
            const newSocket = io(import.meta.env.VITE_BASE_URL, {
                auth: { token },
                transports: ['websocket'],
                forceNew: true, 
            });

            newSocket.on('connect', () => {
                console.log(`[SocketContext] Successfully connected with ID: ${newSocket.id}`);
                setSocket(newSocket);
            });

            newSocket.on('disconnect', () => {
                console.log(`[SocketContext] Disconnected.`);
                setSocket(null);
            });

            // This is the cleanup function that runs when the component unmounts
            // or when the dependencies (user, captain) change.
            return () => {
                console.log("[SocketContext] Cleaning up old socket connection.");
                newSocket.disconnect();
            };

        } else {
            // If no one is logged in, ensure socket is null.
            setSocket(null);
        }
    }, [user, captain]); // This effect re-runs on login/logout

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};