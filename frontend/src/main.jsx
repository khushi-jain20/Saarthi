import 'leaflet/dist/leaflet.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';

import App from './App.jsx';
import './index.css';

// --- THIS IS THE FINAL FIX ---
// We import each provider exactly how it is exported in its file.
// 'UserProvider' is a default export.
import UserProvider from './context/UserContext.jsx'; 
// 'CaptainProvider' and 'SocketProvider' are named exports.
import { CaptainProvider } from './context/CaptainContext.jsx'; 
import { SocketProvider } from './context/SocketContext.jsx'; 

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Fatal Error: The root element with ID 'root' was not found in the HTML.");
}

const root = ReactDOM.createRoot(rootElement);

// The provider nesting order is also corrected here.
root.render(
  <React.StrictMode>
    <Router>
      <UserProvider>
        <CaptainProvider>
          <SocketProvider>
            <App />
          </SocketProvider>
        </CaptainProvider>
      </UserProvider>
    </Router>
  </React.StrictMode>
);