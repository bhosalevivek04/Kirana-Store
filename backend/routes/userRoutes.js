const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, userController.updateProfile);

router.get('/:id', userController.getUserProfile);
router.put('/:id', userController.updateUser);

module.exports = router;
