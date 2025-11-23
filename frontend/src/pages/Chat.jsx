import { useState, useEffect, useRef } from 'react';
import api from '../api';
import { Send, Bot, User } from 'lucide-react';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchHistory = async () => {
        try {
            const res = await api.get('/chat/history');
            setMessages(res.data);
        } catch (error) {
            console.error('Error fetching chat history:', error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const res = await api.post('/chat', { message: userMessage.text });
            // The backend returns the full history or just the response. 
            // Based on my controller: res.json({ response: botResponse, history: chatLog.messages });
            // So I can just use the history from response or append the bot response.
            // Let's append for smoother UI or use history if we want to be sure.
            // Using history ensures sync.
            setMessages(res.data.history);
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I am having trouble connecting.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto h-[600px] flex flex-col bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-green-600 text-white p-4 flex items-center">
                <Bot className="mr-2" />
                <h2 className="text-xl font-bold">Kirana AI Assistant</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] p-3 rounded-lg flex items-start ${msg.sender === 'user' ? 'bg-green-600 text-white rounded-br-none' : 'bg-white text-gray-800 shadow rounded-bl-none'}`}>
                            <span className="mr-2 mt-1">
                                {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                            </span>
                            <p>{msg.text}</p>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white p-3 rounded-lg shadow rounded-bl-none text-gray-500 italic">
                            Typing...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 bg-white border-t flex">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about products..."
                    className="flex-1 border rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-green-600 text-white px-4 rounded-r-lg hover:bg-green-700 disabled:opacity-50"
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
};

export default Chat;
