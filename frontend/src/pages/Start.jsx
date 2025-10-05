// Filename: src/pages/Start.jsx (Polished Pro Version)

import React from 'react';
import { Link } from 'react-router-dom';

const Start = () => {
    return (
        // Main container with the background image
        <div 
            style={{ backgroundImage: `url(/start-background.jpeg)` }} 
            className="h-screen w-screen bg-cover bg-center"
        >
            {/* Dark semi-transparent overlay for readability */}
            <div className="h-full w-full bg-black bg-opacity-50 flex flex-col justify-between p-8 text-white">
                
                {/* Logo at the top */}
                <div>
                    <h1 className="text-5xl font-bold" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>
                        Saarthi
                    </h1>
                </div>

                {/* Buttons and text at the bottom */}
                <div className="w-full max-w-md mx-auto">
                    <h2 className="text-4xl font-semibold mb-6">
                        Welcome to Saarthi.
                    </h2>
                    
                    <Link to="/login">
                        <button className="w-full bg-white text-black font-bold py-3 px-4 rounded-lg mb-4 text-lg hover:bg-gray-200 transition-transform transform hover:scale-105">
                            Sign in as a User
                        </button>
                    </Link>

                    <Link to="/captain-login">
                        <button className="w-full bg-gray-800 bg-opacity-80 backdrop-blur-sm border border-gray-600 text-white font-bold py-3 px-4 rounded-lg text-lg hover:bg-gray-700 transition-transform transform hover:scale-105">
                            Sign in as a Captain
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Start;