const crypto = require('crypto');
const userModel = require('../models/user.model');
const userService = require('../services/user.service');
const { validationResult } = require('express-validator');
const blackListTokenModel = require('../models/blackListToken.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Enhanced sanitize user function
const sanitizeUser = (user) => {
  if (!user) return null;
  
  const userObj = user.toObject ? user.toObject() : user;
  const { password, __v, createdAt, updatedAt, ...sanitizedUser } = userObj;
  return sanitizedUser;
};

// Common error response handler
const handleErrorResponse = (res, error, context) => {
  console.error(`${context} error:`, error);
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
};

module.exports = {
  async registerUser(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
      }

      const { fullname, email, password } = req.body;

      if (await userModel.exists({ email })) {
        return res.status(409).json({ success: false, message: 'Email already registered', field: 'email' });
      }

      const user = await userService.createUser({
        firstname: fullname.firstname,
        lastname: fullname.lastname || '',
        email,
        password
      });

      // FIX: Use 'id' for consistency
      const token = jwt.sign(
        { id: user._id, role: user.role || 'user' },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
      );

      res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 3600000 });
      return res.status(201).json({ success: true, message: 'Registration successful', token, user: sanitizeUser(user) });

    } catch (error) {
      return handleErrorResponse(res, error, 'Registration');
    }
  },

  async loginUser(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
      }

      const { email, password } = req.body;

      const user = await userModel.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      // FIX: Use 'id' to match the middleware
      const token = jwt.sign(
        { id: user._id, role: user.role || 'user' },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
      );

      res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 3600000 });
      return res.status(200).json({ success: true, message: 'Login successful', token, user: sanitizeUser(user) });

    } catch (error) {
      return handleErrorResponse(res, error, 'Login');
    }
  },

  async getUserProfile(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      // FIX: The user object from middleware is complete, no need to re-fetch unless necessary.
      return res.status(200).json({ success: true, user: sanitizeUser(req.user) });

    } catch (error) {
      return handleErrorResponse(res, error, 'Profile fetch');
    }
  },

  async logoutUser(req, res) {
    try {
      const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
      
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          // FIX: Use 'id' from the token payload
          await blackListTokenModel.create({ 
            token,
            expiresAt: new Date(decoded.exp * 1000),
            userId: decoded.id 
          });
        } catch (err) {
          // Ignore token verification errors during logout
        }
      }

      res.clearCookie('token');
      return res.status(200).json({ success: true, message: 'Logged out successfully' });

    } catch (error) {
      return handleErrorResponse(res, error, 'Logout');
    }
  },

  async refreshToken(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication failed' });
      }

      const user = req.user;

      // FIX: Use 'id' for consistency
      const token = jwt.sign(
        { id: user._id, role: user.role || 'user' },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
      );

      res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 3600000 });
      return res.status(200).json({ success: true, message: 'Token refreshed successfully', token, user: sanitizeUser(user) });

    } catch (error) {
      return handleErrorResponse(res, error, 'Token refresh');
    }
  },

  async forgotPassword(req, res) {
    // This function requires a real email service to be useful.
    // The current logic is for testing purposes.
    // ... (Your existing forgotPassword logic can stay here)
  },

  async resetPassword(req, res) {
    // This function depends on the forgotPassword flow.
    // ... (Your existing resetPassword logic can stay here, but ensure it also uses 'id' when creating a token)
  }
};