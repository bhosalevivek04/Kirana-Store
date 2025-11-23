const express = require('express');
const router = express.Router();
const { getProducts, createProduct, updateProduct, deleteProduct, uploadImage } = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

router.get('/', getProducts);
router.post('/', protect, createProduct);
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, deleteProduct);
router.post('/upload-image', protect, upload.single('image'), uploadImage);

module.exports = router;
