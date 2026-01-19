const ChatLog = require('../models/ChatLog');
const Product = require('../models/Product');
const Order = require('../models/Order');

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
            chatLog = new ChatLog({ user: userId, messages: [], context: 'IDLE' });
        }

        // Add user message
        chatLog.messages.push({ sender: 'user', text: message });

        let botResponse = "I'm sorry, I didn't understand that.";
        let options = [];
        const lowerMsg = message.toLowerCase();

        // --- STATE MACHINE LOGIC ---

        // RESET: Allow user to cancel/reset at any time
        if (lowerMsg === 'cancel' || lowerMsg === 'menu' || lowerMsg === 'main menu' || lowerMsg === 'hi' || lowerMsg === 'hello') {
            chatLog.context = 'IDLE';
            chatLog.metadata = {};
        }

        // STATE: IDLE
        if (chatLog.context === 'IDLE') {
            if (lowerMsg.includes('price')) {
                botResponse = "Sure! Which product's price are you looking for? (e.g., Milk, Atta)";
                chatLog.context = 'SEARCH_PRICE';
            } else if (lowerMsg.includes('stock')) {
                botResponse = "Sure! Which product's stock do you want to check?";
                chatLog.context = 'SEARCH_STOCK';
            } else if (lowerMsg.includes('order')) {
                // Fetch recent orders
                const orders = await Order.find({ user: userId }).sort({ createdAt: -1 }).limit(3);
                if (orders.length === 0) {
                    botResponse = "You haven't placed any orders yet.";
                    options = ["Check Price", "Check Stock"];
                } else {
                    botResponse = "Here are your recent orders:";
                    // Format orders nicely
                    orders.forEach(order => {
                        botResponse += `\n• Order #${order._id.toString().slice(-6)}: ${order.status} (₹${order.totalAmount})`;
                    });
                    options = ["Check Price", "Check Stock", "Main Menu"];
                }
            } else {
                botResponse = "Hello! I can help you with Prices, Stock, and Order Status. What would you like to do?";
                options = ["Check Price", "Check Stock", "My Orders"];
            }
        }

        // STATE: SEARCH_PRICE
        else if (chatLog.context === 'SEARCH_PRICE') {
            // Optimized search using MongoDB regex
            const foundProduct = await Product.findOne({
                name: { $regex: new RegExp(lowerMsg, 'i') }
            });

            if (foundProduct) {
                botResponse = `The price of ${foundProduct.name} is ₹${foundProduct.price}.`;
                options = ["Check another price", "Main Menu"];
                chatLog.context = 'IDLE'; // Reset after answering
            } else {
                botResponse = "Sorry, I couldn't find a product with that name. Please try again or type 'Menu' to go back.";
                options = ["Main Menu"];
            }
        }

        // STATE: SEARCH_STOCK
        else if (chatLog.context === 'SEARCH_STOCK') {
            // Optimized search using MongoDB regex
            const foundProduct = await Product.findOne({
                name: { $regex: new RegExp(lowerMsg, 'i') }
            });

            if (foundProduct) {
                botResponse = foundProduct.stock > 0
                    ? `Yes, we have ${foundProduct.stock} ${foundProduct.name}(s) in stock.`
                    : `Sorry, ${foundProduct.name} is currently out of stock.`;
                options = ["Check another stock", "Main Menu"];
                chatLog.context = 'IDLE'; // Reset after answering
            } else {
                botResponse = "Sorry, I couldn't find a product with that name. Please try again or type 'Menu' to go back.";
                options = ["Main Menu"];
            }
        }

        // Add bot response
        chatLog.messages.push({ sender: 'bot', text: botResponse, options });
        await chatLog.save();

        res.json({ response: botResponse, history: chatLog.messages });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.resetChat = async (req, res) => {
    try {
        const welcomeMessage = {
            sender: 'bot',
            text: "Hello! I can help you with Prices, Stock, and Order Status. What would you like to do?",
            options: ["Check Price", "Check Stock", "My Orders"]
        };

        const chatLog = await ChatLog.findOneAndUpdate(
            { user: req.user.id },
            {
                $set: {
                    messages: [welcomeMessage],
                    context: 'IDLE',
                    metadata: {}
                }
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.json(chatLog.messages);
    } catch (error) {
        logger.error('Error resetting chat:', error);
        res.status(500).json({ message: error.message });
    }
};
