import React from 'react';
import { Routes, Route } from 'react-router-dom';
import 'remixicon/fonts/remixicon.css';

// Import all your page components
import Start from './pages/Start';
import Home from './pages/Home';
import Riding from './pages/Riding';
import RateRide from './components/RateRide';

// User Auth Components
import UserLogin from './pages/UserLogin';
import UserSignup from './pages/UserSignup';
import UserLogout from './pages/UserLogout';
import UserProtectWrapper from './pages/UserProtectWrapper';

// Captain Auth Components
import CaptainLogin from './pages/Captainlogin';
import CaptainSignup from './pages/CaptainSignup';
import CaptainLogout from './pages/CaptainLogout';
import CaptainHome from './pages/CaptainHome';
import CaptainRiding from './pages/CaptainRiding';
import CaptainProtectWrapper from './pages/CaptainProtectWrapper';

const App = () => {
  return (
    <div>
      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        {/* These routes are accessible to everyone, logged in or not. */}
        <Route path="/" element={<Start />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/signup" element={<UserSignup />} />
        <Route path="/captain-login" element={<CaptainLogin />} />
        <Route path="/captain/register" element={<CaptainSignup />} />

        {/* --- PROTECTED USER ROUTES --- */}
        {/* These routes are wrapped by the UserProtectWrapper. */}
        {/* If a user is not logged in, they will be redirected. */}
        <Route element={<UserProtectWrapper />}>
          <Route path="/home" element={<Home />} />
          <Route path="/riding" element={<Riding />} />
          <Route path="/user/logout" element={<UserLogout />} />
          <Route path="/rate-ride/:rideId" element={<RateRide />} />
          <Route path="/user/logout" element={<UserLogout />} />
        </Route>

        {/* --- PROTECTED CAPTAIN ROUTES --- */}
        {/* These routes are wrapped by the CaptainProtectWrapper. */}
        {/* If a captain is not logged in, they will be redirected. */}
        <Route element={<CaptainProtectWrapper />}>
          <Route path="/captain/dashboard" element={<CaptainHome />} />
          <Route path="/captain-riding" element={<CaptainRiding />} />
          <Route path="/captain/logout" element={<CaptainLogout />} />
        </Route>
        
        {/* Optional but recommended: A catch-all route for 404 pages */}
        <Route path="*" element={
          <div style={{ padding: '50px', textAlign: 'center' }}>
            <h1>404: Page Not Found</h1>
          </div>
        } />
      </Routes>
    </div>
  );
};

export default App;