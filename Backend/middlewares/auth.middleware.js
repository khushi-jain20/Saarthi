const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const blackListTokenModel = require('../models/blackListToken.model');
const captainModel = require('../models/captain.model');


module.exports.authUser = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const isBlacklisted = await blackListTokenModel.findOne({ token: token });

    if (isBlacklisted) {
        return res.status(401).json({ message: 'Unauthorized: Token is blacklisted' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // FIX #1: Use 'decoded.id' instead of 'decoded._id'. This is the standard for JWTs.
        const user = await userModel.findById(decoded.id);

        // FIX #2: Add a check to ensure the user still exists in the database.
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized: User not found' });
        }

        req.user = user;
        return next();

    } catch (err) {
        // This will catch expired tokens or invalid signatures
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
}

// In backend/middlewares/auth.middleware.js

module.exports.authCaptain = async (req, res, next) => {
    console.log("\n--- [AUTH] Captain Auth Middleware Triggered ---");
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.error("[AUTH ERROR] No 'Bearer ' token found in authorization header.");
        return res.status(401).json({ message: 'Unauthorized: Malformed token' });
    }

    const token = authHeader.split(' ')[1];
    console.log("[AUTH] Token Found:", token);

    // --- Verification Block ---
    try {
        console.log("[AUTH] Attempting to verify token with secret:", process.env.JWT_SECRET);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        console.log("[AUTH] Token VERIFIED. Decoded Payload:", decoded);

        const captain = await captainModel.findById(decoded.id);
        
        if (!captain) {
            console.error("[AUTH ERROR] Token was valid, but no captain found for ID:", decoded.id);
            return res.status(401).json({ message: 'Unauthorized: Captain not found' });
        }

        console.log("[AUTH SUCCESS] Captain Authenticated:", captain.email);
        req.captain = captain;
        return next();

    } catch (err) {
        // THIS IS THE MOST IMPORTANT PART
        console.error("\n\n--- [AUTH FATAL ERROR] ---");
        console.error("The 'jwt.verify' function failed. This is the reason the backend is rejecting the request.");
        console.error("The error object is:");
        console.error(err);
        console.error("--- END OF ERROR ---\n\n");
        return res.status(401).json({ message: 'Unauthorized' });
    }
}