const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }
    }],
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['online', 'credit', 'cash'], default: 'cash' },
    status: { type: String, enum: ['pending', 'processing', 'delivered', 'cancelled', 'completed'], default: 'pending' },
    customerName: { type: String }, // For POS/walk-in customers
    customerPhone: { type: String }, // For POS/walk-in customers
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
