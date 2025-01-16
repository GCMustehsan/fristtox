const express = require('express');
const { 
  registerUser, 
  loginUser, 
  forgotPassword,
  resetPassword 
} = require('../controllers/authcontroller');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

router.get('/profile', protect, (req, res) => {
  res.status(200).json({ message: `Welcome, ${req.user.name}` });
});

module.exports = router;

