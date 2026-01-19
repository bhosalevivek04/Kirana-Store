import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { CreditCard, Wallet, Banknote } from 'lucide-react';
import { useCart } from '../context/CartContext';
import logger from '../utils/logger';

const Checkout = () => {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('online'); // 'online', 'credit', or 'cash'
    const navigate = useNavigate();
    const [showPhoneModal, setShowPhoneModal] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const { clearCart } = useCart();

    // Get user for role check
    const user = JSON.parse(localStorage.getItem('user'));

    const handlePlaceOrder = () => {
        if (!user?.phone) {
            setShowPhoneModal(true);
            return;
        }
        if (paymentMethod === 'online') handleOnlinePayment();
        else if (paymentMethod === 'credit') handleCreditPayment();
        else handleCashPayment();
    };

    const handlePhoneSubmit = async (e) => {
        e.preventDefault();
        if (!phoneNumber) return;

        try {
            await api.put(`/ users / profile`, { phone: phoneNumber });

            const updatedUser = { ...user, phone: phoneNumber };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setShowPhoneModal(false);

            if (paymentMethod === 'online') handleOnlinePayment();
            else if (paymentMethod === 'credit') handleCreditPayment();
            else handleCashPayment();
        } catch (error) {
            logger.error('Failed to update phone:', error);
            alert('Failed to save phone number. Please try again.');
        }
    };

    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
        if (storedCart.length === 0) navigate('/');
        setCart(storedCart);
    }, [navigate]);

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handleOnlinePayment = async () => {
        setLoading(true);
        try {
            // 1. Create Order on Backend
            const orderRes = await api.post('/payments/create-order', { amount: total });
            const { id: order_id, amount, currency } = orderRes.data;

            // 2. Initialize Razorpay
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: amount,
                currency: currency,
                name: "Kirana Store",
                description: "Order Payment",
                order_id: order_id,
                handler: async function (response) {
                    try {
                        // 3. Verify Payment
                        await api.post('/payments/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        // 4. Create Order Record in DB
                        await api.post('/orders', {
                            items: cart.map(item => ({ product: item._id, quantity: item.quantity, price: item.price })),
                            totalAmount: total,
                            paymentMethod: 'online'
                        });

                        // 5. Clear Cart and Redirect
                        clearCart();
                        alert('Payment Successful! Order Placed.');
                        navigate('/orders');
                    } catch (error) {
                        logger.error('Payment verification failed:', error);
                        alert('Payment verification failed');
                    }
                },
                prefill: {
                    name: "Customer Name",
                    email: "customer@example.com",
                    contact: user?.phone || ""
                },
                theme: {
                    color: "#16a34a"
                }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', function (response) {
                logger.error('Payment failed:', response.error);
                alert(response.error.description);
            });
            rzp1.open();
        } catch (error) {
            logger.error('Payment error:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreditPayment = async () => {
        setLoading(true);
        try {
            // 1. Create Order with credit payment method
            await api.post('/orders', {
                items: cart.map(item => ({ product: item._id, quantity: item.quantity, price: item.price })),
                totalAmount: total,
                paymentMethod: 'credit'
            });

            // 2. Create Credit Ledger Entry
            await api.post('/credits', {
                amount: total,
                type: 'credit',
                description: `Order - ${cart.map(item => item.name).join(', ')} `
            });

            // 3. Clear Cart and Redirect
            clearCart();
            alert('Order placed on credit! You can pay later.');
            navigate('/orders');
        } catch (error) {
            logger.error('Credit order error:', error);
            alert(error.response?.data?.message || 'Failed to place credit order');
        } finally {
            setLoading(false);
        }
    };

    const handleCashPayment = async () => {
        if (user?.role !== 'admin') {
            alert('Cash payment is only available for admins.');
            return;
        }

        setLoading(true);
        try {
            // 1. Create Order with cash payment method
            await api.post('/orders', {
                items: cart.map(item => ({ product: item._id, quantity: item.quantity, price: item.price })),
                totalAmount: total,
                paymentMethod: 'cash'
            });

            // 2. Clear Cart and Redirect
            clearCart();
            alert('Order placed successfully! Please pay cash at the counter.');
            navigate('/orders');
        } catch (error) {
            logger.error('Cash order error:', error);
            alert(error.response?.data?.message || 'Failed to place cash order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Order Summary */}
                <div className="bg-white p-6 rounded-lg shadow-md h-fit">
                    <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                    <div className="space-y-2 md:space-y-3 mb-4">
                        {cart.map(item => (
                            <div key={item._id} className="flex justify-between text-sm md:text-base">
                                <span className="text-gray-700">{item.name} × {item.quantity}</span>
                                <span className="font-medium">₹{item.price * item.quantity}</span>
                            </div>
                        ))}
                    </div>
                    <div className="border-t pt-3 md:pt-4 flex justify-between text-lg md:text-xl font-bold">
                        <span>Total:</span>
                        <span className="text-green-600">₹{total}</span>
                    </div>
                </div>

                {/* Payment Section */}
                <div>
                    {/* Payment Method Selection */}
                    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mb-4 md:mb-6">
                        <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Select Payment Method</h2>
                        <div className="space-y-3">
                            {/* Online Payment */}
                            <button
                                onClick={() => setPaymentMethod('online')}
                                className={`w - full p - 4 md: p - 5 border - 2 rounded - lg flex items - center gap - 3 md: gap - 4 transition - all touch - manipulation ${paymentMethod === 'online'
                                        ? 'border-green-600 bg-green-50'
                                        : 'border-gray-200 hover:border-green-300'
                                    } `}
                            >
                                <div className={`w - 5 h - 5 md: w - 6 md: h - 6 rounded - full border - 2 flex items - center justify - center ${paymentMethod === 'online' ? 'border-green-600' : 'border-gray-300'
                                    } `}>
                                    {paymentMethod === 'online' && (
                                        <div className="w-3 h-3 md:w-3.5 md:h-3.5 bg-green-600 rounded-full"></div>
                                    )}
                                </div>
                                <CreditCard size={24} className="text-green-600" />
                                <div className="flex-1 text-left">
                                    <div className="font-semibold text-base md:text-lg">Pay Online</div>
                                    <div className="text-xs md:text-sm text-gray-500">UPI, Cards, Net Banking</div>
                                </div>
                            </button>

                            {/* Cash Payment - Only for Admin */}
                            {user?.role === 'admin' && (
                                <button
                                    onClick={() => setPaymentMethod('cash')}
                                    className={`w - full p - 4 md: p - 5 border - 2 rounded - lg flex items - center gap - 3 md: gap - 4 transition - all touch - manipulation ${paymentMethod === 'cash'
                                            ? 'border-green-600 bg-green-50'
                                            : 'border-gray-200 hover:border-green-300'
                                        } `}
                                >
                                    <div className={`w - 5 h - 5 md: w - 6 md: h - 6 rounded - full border - 2 flex items - center justify - center ${paymentMethod === 'cash' ? 'border-green-600' : 'border-gray-300'
                                        } `}>
                                        {paymentMethod === 'cash' && (
                                            <div className="w-3 h-3 md:w-3.5 md:h-3.5 bg-green-600 rounded-full"></div>
                                        )}
                                    </div>
                                    <Banknote size={24} className="text-green-600" />
                                    <div className="flex-1 text-left">
                                        <div className="font-semibold text-base md:text-lg">Pay via Cash</div>
                                        <div className="text-xs md:text-sm text-gray-500">Pay cash at counter</div>
                                    </div>
                                </button>
                            )}

                            {/* Credit/Udhaar Payment */}
                            <button
                                onClick={() => setPaymentMethod('credit')}
                                className={`w - full p - 4 md: p - 5 border - 2 rounded - lg flex items - center gap - 3 md: gap - 4 transition - all touch - manipulation ${paymentMethod === 'credit'
                                        ? 'border-green-600 bg-green-50'
                                        : 'border-gray-200 hover:border-green-300'
                                    } `}
                            >
                                <div className={`w - 5 h - 5 md: w - 6 md: h - 6 rounded - full border - 2 flex items - center justify - center ${paymentMethod === 'credit' ? 'border-green-600' : 'border-gray-300'
                                    } `}>
                                    {paymentMethod === 'credit' && (
                                        <div className="w-3 h-3 md:w-3.5 md:h-3.5 bg-green-600 rounded-full"></div>
                                    )}
                                </div>
                                <Wallet size={24} className="text-green-600" />
                                <div className="flex-1 text-left">
                                    <div className="font-semibold text-base md:text-lg">Pay on Credit (Udhaar)</div>
                                    <div className="text-xs md:text-sm text-gray-500">Pay later</div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Place Order Button */}
                    <button
                        onClick={handlePlaceOrder}
                        disabled={loading}
                        className="w-full bg-green-600 text-white py-4 md:py-5 rounded-lg hover:bg-green-700 active:bg-green-800 font-semibold text-base md:text-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors touch-manipulation"
                    >
                        {loading ? 'Processing...' : paymentMethod === 'online' ? 'Pay Now' : paymentMethod === 'cash' ? 'Place Order via Cash' : 'Place Order on Credit'}
                    </button>
                </div>
            </div>

            {/* Phone Number Modal */}
            {showPhoneModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                        <h3 className="text-lg font-bold mb-4">Add Phone Number</h3>
                        <p className="text-gray-600 mb-4 text-sm">Please add your phone number to receive order updates via WhatsApp.</p>
                        <form onSubmit={handlePhoneSubmit}>
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    if (val.length <= 10) setPhoneNumber(val);
                                }}
                                className="w-full border rounded-lg p-2 mb-4 focus:ring-2 focus:ring-green-500 outline-none"
                                placeholder="Enter mobile number"
                                required
                                autoFocus
                            />
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowPhoneModal(false)}
                                    className="flex-1 py-2 border rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    Save & Continue
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Checkout;
