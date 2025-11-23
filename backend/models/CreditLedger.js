const mongoose = require('mongoose');

const creditLedgerSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true }, // Positive for credit given, Negative for payment received
    type: { type: String, enum: ['credit', 'payment'], required: true },
    description: { type: String },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CreditLedger', creditLedgerSchema);
