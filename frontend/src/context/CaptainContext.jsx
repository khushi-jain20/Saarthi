import React, { createContext, useState, useEffect, useContext } from 'react';

export const CaptainContext = createContext();

export const CaptainProvider = ({ children }) => {
    const [captain, setCaptain] = useState(null);
    const [loading, setLoading] = useState(true);

    // This effect runs ONCE when the app loads to check for a saved session.
    useEffect(() => {
        console.log('[CaptainContext] Initializing and checking localStorage...');
        try {
            const storedCaptain = localStorage.getItem('captain');
            const token = localStorage.getItem('captain_token');

            if (storedCaptain && token) {
                const parsedCaptain = JSON.parse(storedCaptain);
                console.log('[CaptainContext] Found stored captain:', parsedCaptain);
                setCaptain(parsedCaptain);
            } else {
                console.log('[CaptainContext] No stored captain found.');
            }
        } catch (error) {
            console.error("[CaptainContext] Failed to parse captain data from localStorage", error);
            localStorage.removeItem('captain');
            localStorage.removeItem('captain_token');
        } finally {
            setLoading(false);
        }
    }, []);

    // This function will be called from the login page.
    const loginCaptain = (captainData, token) => {
        if (!captainData || !token) {
            console.error("[CaptainContext] loginCaptain called with invalid data");
            return;
        }
        console.log('[CaptainContext] Logging in captain:', captainData);
        setCaptain(captainData);
        localStorage.setItem('captain', JSON.stringify(captainData));
        localStorage.setItem('captain_token', token);
    };

    const logoutCaptain = () => {
        console.log('[CaptainContext] Logging out captain.');
        setCaptain(null);
        localStorage.removeItem('captain');
        localStorage.removeItem('captain_token');
    };

    const value = {
        captain,
        loading,
        loginCaptain,
        logoutCaptain
    };

    return (
        <CaptainContext.Provider value={value}>
            {!loading && children}
        </CaptainContext.Provider>
    );
};

export const useCaptain = () => {
    return useContext(CaptainContext);
};