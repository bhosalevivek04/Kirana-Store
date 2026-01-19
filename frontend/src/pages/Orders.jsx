import { useState, useEffect } from 'react';
import api from '../api';
import { Package, Clock, CheckCircle, XCircle, Search, Filter, Calendar, CreditCard, ChevronUp, ChevronDown } from 'lucide-react';
import logger from '../utils/logger';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]); // Added new state
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await api.get('/orders/my-orders'); // API endpoint changed
                setOrders(res.data);
                setFilteredOrders(res.data); // Set filtered orders
            } catch (error) {
                logger.error('Error fetching orders:', error); // Replaced console.error with logger.error
            } finally { // Added finally block
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const toggleExpand = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    if (loading) {
        return <div className="text-center py-10">Loading orders...</div>;
    }

    if (orders.length === 0) {
        return (
            <div className="text-center py-20">
                <Package size={64} className="mx-auto text-gray-400 mb-4" />
                <h2 className="text-2xl font-semibold text-gray-600 mb-2">No Orders Yet</h2>
                <p className="text-gray-500">Start shopping to see your orders here!</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">My Orders</h1>

            <div className="space-y-4">
                {orders.map(order => (
                    <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Package size={20} className="text-gray-600" />
                                        <span className="font-semibold text-gray-700">Order #{order._id.slice(-8)}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={16} />
                                            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <CreditCard size={16} />
                                            <span className="capitalize">{order.paymentMethod}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-green-600 mb-2">₹{order.totalAmount}</div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => toggleExpand(order._id)}
                                className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium text-sm"
                            >
                                {expandedOrder === order._id ? (
                                    <>
                                        <ChevronUp size={16} /> Hide Details
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown size={16} /> View Details
                                    </>
                                )}
                            </button>

                            {expandedOrder === order._id && (
                                <div className="mt-4 pt-4 border-t">
                                    <h3 className="font-semibold mb-3">Order Items:</h3>
                                    <div className="space-y-2">
                                        {order.items.map((item, index) => (
                                            <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                                                <div>
                                                    <div className="font-medium">{item.product?.name || 'Product'}</div>
                                                    <div className="text-sm text-gray-500">Quantity: {item.quantity}</div>
                                                </div>
                                                <div className="font-semibold">₹{item.price * item.quantity}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 pt-4 border-t flex justify-between items-center">
                                        <span className="font-semibold">Total Amount:</span>
                                        <span className="text-xl font-bold text-green-600">₹{order.totalAmount}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Orders;
