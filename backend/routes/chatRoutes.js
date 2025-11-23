const express = require('express');
const router = express.Router();
const { chatWithAI, getChatHistory } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, chatWithAI);
router.get('/history', protect, getChatHistory);

module.exports = router;
