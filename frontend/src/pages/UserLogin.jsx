import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { loginUser } from '../api';

const UserLogin = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [formErrors, setFormErrors] = useState({
        email: '',
        password: ''
    });

    const { setUser } = useContext(UserContext);
    const navigate = useNavigate();

    // Clear error when form changes
    useEffect(() => {
        if (error) setError('');
    }, [formData.email, formData.password]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
        
        // Clear field-specific error when typing
        if (formErrors[id]) {
            setFormErrors(prev => ({
                ...prev,
                [id]: ''
            }));
        }
    };

    const validateForm = () => {
        const errors = {};
        let isValid = true;

        if (!formData.email) {
            errors.email = 'Email is required';
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Please enter a valid email';
            isValid = false;
        }

        if (!formData.password) {
            errors.password = 'Password is required';
            isValid = false;
        } else if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setIsLoading(true);
        setError('');

        try {
            const { token, user } = await loginUser({
                email: formData.email,
                password: formData.password
            });
            
            // Store authentication data
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            // Update global state
            setUser({
                id: user._id,
                email: user.email,
                name: [user.firstname, user.lastname].filter(Boolean).join(' ')
            });
            
            // Redirect to home or previous protected page
            navigate('/home', { replace: true });
            
        } catch (err) {
            console.error('Login error:', err);
            
            let errorMessage = err.message;
            
            // Handle specific error cases
            if (err.status === 401) {
                errorMessage = 'Invalid email or password';
            } else if (err.code === 'ERR_NETWORK') {
                errorMessage = 'Network error. Please check your connection.';
            }
            
            setError(errorMessage);
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
                        Sign in to continue your journey.
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
                                value={formData.email}
                                onChange={handleChange}
                                className={`mt-1 bg-gray-50 rounded-lg px-4 py-3 border w-full text-lg focus:outline-none focus:ring-2 ${
                                    formErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-black'
                                }`}
                                type="email"
                                placeholder='email@example.com'
                                autoComplete='email'
                            />
                            {formErrors.email && (
                                <p className="mt-1 text-xs text-red-600">{formErrors.email}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor='password' className='block text-sm font-medium text-gray-700'>
                                Password
                            </label>
                            <input
                                id='password'
                                className={`mt-1 bg-gray-50 rounded-lg px-4 py-3 border w-full text-lg focus:outline-none focus:ring-2 ${
                                    formErrors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-black'
                                }`}
                                value={formData.password}
                                onChange={handleChange}
                                required 
                                type="password"
                                placeholder='••••••••'
                                minLength="6"
                                autoComplete='current-password'
                            />
                            {formErrors.password && (
                                <p className="mt-1 text-xs text-red-600">{formErrors.password}</p>
                            )}
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div className='flex items-center justify-between text-sm'>
                            <p>
                                <Link to='/signup' className='font-medium text-gray-600 hover:text-black'>
                                    Create account
                                </Link>
                            </p>
                            <Link to='/forgot-password' className='font-medium text-gray-600 hover:text-black'>
                                Forgot password?
                            </Link>
                        </div>

                        <div className='pt-2'>
                            <button
                                type='submit'
                                disabled={isLoading}
                                className={`w-full flex justify-center bg-black text-white font-semibold rounded-lg px-4 py-3 text-lg hover:bg-gray-800 transition ${
                                    isLoading ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
                            >
                                {isLoading ? (
                                    <span className='flex items-center'>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Signing In...
                                    </span>
                                ) : 'Sign In'}
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
                        to='/captain-login'
                        className='w-full flex items-center justify-center bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg px-4 py-3 text-lg hover:bg-gray-100 transition'
                    >
                        Sign in as a Captain
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default UserLogin;