const ChatLog = require('../models/ChatLog');

exports.chatWithAI = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user.id;

        let chatLog = await ChatLog.findOne({ user: userId });
        if (!chatLog) {
            chatLog = new ChatLog({ user: userId, messages: [] });
        }

        // User message
        chatLog.messages.push({ sender: 'user', text: message });

        // AI Response (Placeholder logic)
        // In a real app, you'd call OpenAI or Gemini API here
        let botResponse = "I'm a simple bot. I can help you with product availability.";
        if (message.toLowerCase().includes('price')) {
            botResponse = "Please check the product page for the latest prices.";
        } else if (message.toLowerCase().includes('hello')) {
            botResponse = "Namaste! How can I help you today?";
        }

        chatLog.messages.push({ sender: 'bot', text: botResponse });
        await chatLog.save();

        res.json({ response: botResponse, history: chatLog.messages });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getChatHistory = async (req, res) => {
    try {
        const chatLog = await ChatLog.findOne({ user: req.user.id });
        res.json(chatLog ? chatLog.messages : []);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
