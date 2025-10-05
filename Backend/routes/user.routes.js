const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const rateLimit = require('express-rate-limit');

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  message: 'Too many login attempts, please try again later'
});

// Enhanced registration route
router.post('/register', 
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email address')
      .normalizeEmail(),
    body('fullname.firstname')
      .trim()
      .isLength({ min: 2, max: 30 })
      .withMessage('First name must be 2-30 characters long'),
    body('fullname.lastname')
      .trim()
      .isLength({ min: 2, max: 30 })
      .withMessage('Last name must be 2-30 characters long'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
  ],
  userController.registerUser
);

// Enhanced login route with rate limiting
router.post('/login', 
  authLimiter,
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email address')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],
  userController.loginUser
);

// Secure profile route
router.get('/profile', 
  authMiddleware.authUser,
  userController.getUserProfile
);

// Secure logout route
router.post('/logout', 
  authMiddleware.authUser,
  userController.logoutUser
);

// Refresh token route
router.post('/refresh-token', 
  authMiddleware.authUser,
  userController.refreshToken
);

// Password reset routes
router.post('/forgot-password', 
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email address')
  ],
  userController.forgotPassword
);

router.post('/reset-password/:token', 
  [
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
  ],
  userController.resetPassword
);

module.exports = router;