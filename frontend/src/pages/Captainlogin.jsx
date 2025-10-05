import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api'; 
import { CaptainContext } from '../context/CaptainContext';

const Captainlogin = () => {
    // --- All your state and logic are preserved ---
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(''); // Added for better error display
    const [isLoading, setIsLoading] = useState(false); // Added for loading state
    const { loginCaptain } = useContext(CaptainContext); 
    const navigate = useNavigate();

    const submitHandler = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const captainCredentials = { email, password };
            const response = await api.post('/captains/login', captainCredentials);

            if (response?.captain && response?.token) {
                loginCaptain(response.captain, response.token);
                navigate('/captain/dashboard');
            } else {
                throw new Error("Login response from server is missing captain data or token.");
            }
        } catch (err) {
            setError(err.message || "Login failed. Please check your credentials.");
            console.error("Captain login failed:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // --- The JSX is the only part we are changing ---
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">

                {/* Header Section */}
                <div className="text-center">
                    <h1 className="text-5xl font-bold text-gray-900 tracking-tight">
                        Saarthi
                    </h1>
                    <p className="mt-2 text-md text-gray-600">
                        Welcome, Captain. Sign in to start driving.
                    </p>
                </div>

                {/* Login Form with modern styling */}
                <div className="bg-white p-8 shadow-2xl rounded-2xl space-y-6">
                    <form onSubmit={submitHandler} className='space-y-6'>
                        <div>
                            <label htmlFor='email' className='block text-sm font-medium text-gray-700'>
                                Email address
                            </label>
                            <input
                                id='email'
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className='mt-1 bg-gray-50 rounded-lg px-4 py-3 border w-full text-lg focus:outline-none focus:ring-2 focus:ring-black'
                                type="email"
                                placeholder='captain@example.com'
                                autoComplete='email'
                            />
                        </div>

                        <div>
                            <label htmlFor='password' className='block text-sm font-medium text-gray-700'>
                                Password
                            </label>
                            <input
                                id='password'
                                className='mt-1 bg-gray-50 rounded-lg px-4 py-3 border w-full text-lg focus:outline-none focus:ring-2 focus:ring-black'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                                type="password"
                                placeholder='••••••••'
                                autoComplete='current-password'
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div className='flex items-center justify-between text-sm'>
                            <Link to='/captain/register' className='font-medium text-gray-600 hover:text-black'>
                                Register as a Captain
                            </Link>
                            <a href="#" className='font-medium text-gray-600 hover:text-black'>
                                Need help?
                            </a>
                        </div>

                        <div className='pt-2'>
                            <button
                                type='submit'
                                disabled={isLoading}
                                className={`w-full flex justify-center bg-black text-white font-semibold rounded-lg px-4 py-3 text-lg hover:bg-gray-800 transition ${
                                    isLoading ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
                            >
                                {isLoading ? 'Signing In...' : 'Sign In'}
                            </button>
                        </div>
                    </form>
                </div>
                
                {/* Separator */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-gray-50 text-gray-500">or</span>
                    </div>
                </div>

                {/* Alternative Action */}
                <div>
                    <Link
                        to='/login'
                        className='w-full flex items-center justify-center bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg px-4 py-3 text-lg hover:bg-gray-100 transition'
                    >
                        Sign in as a User
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Captainlogin;