const express = require('express');
const router = express.Router();
const { getChatHistory, chat } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.get('/history', protect, getChatHistory);
router.post('/', protect, chat);

module.exports = router;
