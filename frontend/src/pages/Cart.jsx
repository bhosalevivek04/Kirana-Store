import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash, Plus, Minus } from 'lucide-react';

const Cart = () => {
    const [cart, setCart] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
        setCart(storedCart);
    }, []);

    const updateQuantity = (id, delta) => {
        const newCart = cart.map(item => {
            if (item._id === id) {
                return { ...item, quantity: Math.max(1, item.quantity + delta) };
            }
            return item;
        });
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
    };

    const removeItem = (id) => {
        const newCart = cart.filter(item => item._id !== id);
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
    };

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (cart.length === 0) {
        return (
            <div className="text-center mt-10 px-4">
                <h2 className="text-xl md:text-2xl font-bold mb-4">Your cart is empty</h2>
                <Link to="/" className="text-green-600 hover:underline text-base md:text-lg">Continue Shopping</Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-2 md:px-4">
            <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Shopping Cart</h1>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {cart.map(item => (
                    <div key={item._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 md:p-4 border-b last:border-b-0 gap-3">
                        {/* Product Info */}
                        <div className="flex items-center space-x-3 md:space-x-4 flex-1 w-full sm:w-auto">
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                                {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-sm md:text-base truncate">{item.name}</h3>
                                <p className="text-gray-500 text-sm md:text-base">₹{item.price}</p>
                                <p className="text-gray-600 text-xs md:text-sm font-medium mt-1">
                                    Subtotal: ₹{item.price * item.quantity}
                                </p>
                            </div>
                        </div>

                        {/* Quantity Controls + Delete */}
                        <div className="flex items-center space-x-3 md:space-x-4 w-full sm:w-auto justify-between sm:justify-end">
                            <div className="flex items-center border rounded-lg">
                                <button
                                    onClick={() => updateQuantity(item._id, -1)}
                                    className="p-2 md:p-3 hover:bg-gray-100 active:bg-gray-200 touch-manipulation"
                                >
                                    <Minus size={18} />
                                </button>
                                <span className="px-4 md:px-5 py-2 md:py-3 font-medium min-w-[3rem] text-center">{item.quantity}</span>
                                <button
                                    onClick={() => updateQuantity(item._id, 1)}
                                    className="p-2 md:p-3 hover:bg-gray-100 active:bg-gray-200 touch-manipulation"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                            <button
                                onClick={() => removeItem(item._id)}
                                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg touch-manipulation"
                            >
                                <Trash size={20} />
                            </button>
                        </div>
                    </div>
                ))}

                {/* Total and Checkout */}
                <div className="p-4 md:p-6 bg-gray-50">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-xl md:text-2xl font-bold w-full sm:w-auto text-center sm:text-left">
                            Total: ₹{total}
                        </div>
                        <button
                            onClick={() => navigate('/checkout')}
                            className="bg-green-600 text-white px-6 py-3 md:px-8 md:py-4 rounded-lg hover:bg-green-700 active:bg-green-800 font-semibold text-base md:text-lg w-full sm:w-auto touch-manipulation"
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
