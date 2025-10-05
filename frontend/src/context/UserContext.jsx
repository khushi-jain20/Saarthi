// Filename: frontend/src/context/UserContext.jsx
// This is the final, bulletproof version that handles the id vs _id inconsistency.

import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext(null);

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    
    if (storedUser) {
      try {
        let parsedUser = JSON.parse(storedUser);
        
        // --- THIS IS THE FINAL FIX ---
        // If the user object has an 'id' but not an '_id', create '_id'.
        // This makes the context consistent with the rest of the app.
        if (parsedUser.id && !parsedUser._id) {
          parsedUser._id = parsedUser.id;
        }
        // --- END OF FIX ---

        setUser(parsedUser);
        console.log('[UserContext] Successfully loaded AND normalized user:', parsedUser);

      } catch (error) {
        console.error('[UserContext] Failed to parse stored user data:', error);
        setUser(null);
      }
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;