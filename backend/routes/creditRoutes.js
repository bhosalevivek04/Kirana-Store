const express = require('express');
const router = express.Router();
const { addCreditEntry, getUserCredits, getAllCredits, getAllCreditEntries, updateCreditEntry, deleteCreditEntry } = require('../controllers/creditController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addCreditEntry);
router.get('/user/:userId', protect, getUserCredits);
router.get('/', protect, getAllCredits);
router.get('/entries', protect, getAllCreditEntries);
router.put('/:id', protect, updateCreditEntry);
router.delete('/:id', protect, deleteCreditEntry);

module.exports = router;
