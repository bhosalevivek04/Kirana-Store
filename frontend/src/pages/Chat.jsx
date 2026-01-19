import { useState, useEffect, useRef } from 'react';
import api from '../api';
import { Send, Bot, User, ArrowLeft, Trash2 } from 'lucide-react';
import logger from '../utils/logger';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        resetChat();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const resetChat = async () => {
        if (!window.confirm("Start a new conversation?")) return;
        try {
            const res = await api.post('/chat/reset');
            setMessages(res.data); // Reset should return welcome message
        } catch (error) {
            logger.error('Error resetting chat history:', error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        sendMessage(input);
    };

    const handleOptionClick = (option) => {
        setInput(option);
        sendMessage(option);
    };

    const sendMessage = async (text) => {
        const userMessage = { sender: 'user', text: text };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const res = await api.post('/chat', { message: text });
            setMessages(res.data.history);
        } catch (error) {
            logger.error('Error sending message:', error);
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
                    <div key={index} className="flex flex-col">
                        <div className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] p-3 rounded-lg flex items-start ${msg.sender === 'user' ? 'bg-green-600 text-white rounded-br-none' : 'bg-white text-gray-800 shadow rounded-bl-none'}`}>
                                <span className="mr-2 mt-1">
                                    {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                                </span>
                                <p>{msg.text}</p>
                            </div>
                        </div>
                        {/* Render Options if available */}
                        {msg.options && msg.options.length > 0 && (
                            <div className={`flex flex-wrap gap-2 mt-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start ml-10'}`}>
                                {msg.options.map((option, optIndex) => (
                                    <button
                                        key={optIndex}
                                        onClick={() => handleOptionClick(option)}
                                        className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full hover:bg-green-200 border border-green-200 transition-colors"
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        )}
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
