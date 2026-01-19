const express = require('express');
const router = express.Router();
const { getChatHistory, chat, resetChat } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.get('/history', protect, getChatHistory);
router.delete('/history', protect, resetChat);
router.post('/reset', protect, resetChat);
router.post('/', protect, chat);

module.exports = router;
