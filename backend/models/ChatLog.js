const mongoose = require('mongoose');

const chatLogSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    messages: [{
        sender: { type: String, enum: ['user', 'bot'], required: true },
        text: { type: String, required: true },
        options: [{ type: String }], // Array of option strings
        timestamp: { type: Date, default: Date.now }
    }],
    context: { type: String, default: 'IDLE' }, // IDLE, SEARCH_PRICE, SEARCH_STOCK
    metadata: { type: Object, default: {} } // To store temp data like selected category
});

module.exports = mongoose.model('ChatLog', chatLogSchema);
