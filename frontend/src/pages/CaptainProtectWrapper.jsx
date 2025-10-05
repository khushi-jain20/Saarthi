import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
// FIX #1: Import the correct context
import { CaptainContext } from '../context/CaptainContext';

const CaptainProtectWrapper = () => {
    // FIX #2: Use the correct context name to get the captain and loading state
    const { captain, loading } = useContext(CaptainContext);

    // This is the new, cleaner logic. We don't need to make an API call here
    // because the CaptainContext already handles checking localStorage for us.

    // Step 1: Wait for the context to finish its initial check.
    if (loading) {
        // Show a blank screen or a spinner while the context determines if a captain is logged in.
        return <div>Loading...</div>; 
    }

    // Step 2: After loading, if there is NO captain object, redirect to the login page.
    if (!captain) {
        // The 'replace' prop is important for good back-button behavior.
        return <Navigate to="/captain-login" replace />;
    }

    // Step 3: If loading is false AND there is a captain, show the protected page.
    // The <Outlet /> component automatically renders the child route (e.g., <CaptainHome />).
    return <Outlet />;
};

export default CaptainProtectWrapper;