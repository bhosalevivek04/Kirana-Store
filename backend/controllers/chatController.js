const ChatLog = require('../models/ChatLog');
const Product = require('../models/Product');

exports.getChatHistory = async (req, res) => {
    try {
        let chatLog = await ChatLog.findOne({ user: req.user.id });
        if (!chatLog) {
            return res.json([]);
        }
        res.json(chatLog.messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.chat = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user.id;

        let chatLog = await ChatLog.findOne({ user: userId });
        if (!chatLog) {
            chatLog = new ChatLog({ user: userId, messages: [] });
        }

        // Add user message
        chatLog.messages.push({ sender: 'user', text: message });

        // Generate Bot Response
        let botResponse = "I'm sorry, I didn't understand that. You can ask me about products.";
        const lowerMsg = message.toLowerCase();

        if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
            botResponse = "Hello! Welcome to Kirana Store. How can I help you today?";
        } else if (lowerMsg.includes('price') || lowerMsg.includes('cost') || lowerMsg.includes('how much')) {
            // Search for product in message
            const products = await Product.find();
            const foundProduct = products.find(p => lowerMsg.includes(p.name.toLowerCase()));
            if (foundProduct) {
                botResponse = `The price of ${foundProduct.name} is ₹${foundProduct.price}.`;
            } else {
                botResponse = "Please specify the product name to get its price.";
            }
        } else if (lowerMsg.includes('stock') || lowerMsg.includes('available') || lowerMsg.includes('have')) {
            const products = await Product.find();
            const foundProduct = products.find(p => lowerMsg.includes(p.name.toLowerCase()));
            if (foundProduct) {
                botResponse = foundProduct.stock > 0
                    ? `Yes, we have ${foundProduct.stock} ${foundProduct.name}(s) in stock.`
                    : `Sorry, ${foundProduct.name} is currently out of stock.`;
            } else {
                botResponse = "Please specify the product name to check availability.";
            }
        } else if (lowerMsg.includes('thank')) {
            botResponse = "You're welcome! Happy shopping!";
        }

        // Add bot response
        chatLog.messages.push({ sender: 'bot', text: botResponse });
        await chatLog.save();

        res.json({ response: botResponse, history: chatLog.messages });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
