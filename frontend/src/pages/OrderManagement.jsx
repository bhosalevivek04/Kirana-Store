import React, { useState, useEffect } from 'react';
import { Package, User, Calendar, CreditCard, CheckCircle, X, Trash2, ChevronDown, ChevronUp, ExternalLink, MessageCircle, DollarSign } from 'lucide-react';
import api from '../api';
import { Link } from 'react-router-dom';

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [customerCredits, setCustomerCredits] = useState({});
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [expandedOrder, setExpandedOrder] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        filterOrders();
    }, [orders, statusFilter]);

    const fetchData = async () => {
        try {
            // Fetch orders
            const ordersRes = await api.get('/orders');
            setOrders(ordersRes.data);

            // Fetch customer credits
            const creditsRes = await api.get('/credits');
            const creditMap = {};
            creditsRes.data.forEach(credit => {
                creditMap[credit.userId] = credit.totalCredit;
            });
            setCustomerCredits(creditMap);
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const filterOrders = () => {
        if (statusFilter === 'all') {
            setFilteredOrders(orders);
        } else {
            setFilteredOrders(orders.filter(order => order.status === statusFilter));
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            await api.put(`/orders/${orderId}/status`, { status: newStatus });
            alert(`Order status updated to ${newStatus}`);
            fetchData(); // Refresh data
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('Failed to update order status');
        }
    };

    const deleteOrder = async (orderId) => {
        try {
            await api.delete(`/orders/${orderId}`);
            alert('Order deleted successfully');
            fetchData(); // Refresh data
        } catch (error) {
            console.error('Error deleting order:', error);
            alert('Failed to delete order');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentStatusColor = (paymentMethod, customerCredit) => {
        switch (paymentMethod) {
            case 'online':
                return 'bg-green-100 text-green-800';
            case 'credit':
                return customerCredit <= 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
            case 'cash':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentStatusBadge = (paymentMethod, customerCredit) => {
        switch (paymentMethod) {
            case 'online':
                return '✅ Paid';
            case 'credit':
                return customerCredit <= 0 ? '✅ Paid (Credit Cleared)' : '⏳ Unpaid (Credit)';
            case 'cash':
                return '💵 Cash';
            default:
                return paymentMethod;
        }
    };

    const getStatusBadge = (status) => {
        const icons = {
            pending: '🟡',
            processing: '🔵',
            delivered: '🟢',
            cancelled: '🔴'
        };
        return `${icons[status] || ''} ${status.charAt(0).toUpperCase() + status.slice(1)}`;
    };

    const toggleExpand = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    const getOrderStats = () => {
        return {
            all: orders.length,
            pending: orders.filter(o => o.status === 'pending').length,
            processing: orders.filter(o => o.status === 'processing').length,
            delivered: orders.filter(o => o.status === 'delivered').length
        };
    };

    const getCustomerCredit = (userId) => {
        return customerCredits[userId] || 0;
    };

    const stats = getOrderStats();

    if (loading) {
        return <div className="text-center py-10">Loading orders...</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Order Management</h1>

            {/* Filter Tabs */}
            <div className="bg-white rounded-lg shadow-md mb-6 p-4">
                <div className="flex gap-2 overflow-x-auto">
                    <button
                        onClick={() => setStatusFilter('all')}
                        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${statusFilter === 'all'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        All Orders ({stats.all})
                    </button>
                    <button
                        onClick={() => setStatusFilter('pending')}
                        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${statusFilter === 'pending'
                            ? 'bg-yellow-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        🟡 Pending ({stats.pending})
                    </button>
                    <button
                        onClick={() => setStatusFilter('processing')}
                        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${statusFilter === 'processing'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        🔵 Processing ({stats.processing})
                    </button>
                    <button
                        onClick={() => setStatusFilter('delivered')}
                        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${statusFilter === 'delivered'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        🟢 Delivered ({stats.delivered})
                    </button>
                </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-lg shadow-md">
                    <Package size={64} className="mx-auto text-gray-400 mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-600 mb-2">No Orders Found</h2>
                    <p className="text-gray-500">
                        {statusFilter === 'all'
                            ? 'No orders have been placed yet.'
                            : `No ${statusFilter} orders.`}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map(order => {
                        const customerCredit = getCustomerCredit(order.user?._id);
                        return (
                            <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="p-6">
                                    {/* Order Header */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Package size={20} className="text-gray-600" />
                                                <span className="font-semibold text-gray-700">
                                                    Order #{order._id.slice(-8)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-2 flex-wrap">
                                                <div className="flex items-center gap-1">
                                                    <User size={16} />
                                                    <span>{order.user?.name || 'Customer'}</span>
                                                    {customerCredit > 0 && (
                                                        <span className="ml-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                                                            ₹{customerCredit} credit
                                                        </span>
                                                    )}
                                                </div>
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
                                            <div className="text-2xl font-bold text-green-600 mb-2">
                                                ₹{order.totalAmount}
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                                    {getStatusBadge(order.status)}
                                                </span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(order.paymentMethod, customerCredit)}`}>
                                                    {getPaymentStatusBadge(order.paymentMethod, customerCredit)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="flex gap-2 mb-4 flex-wrap">
                                        {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                            <>
                                                {order.status === 'pending' && (
                                                    <button
                                                        onClick={() => updateOrderStatus(order._id, 'processing')}
                                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                                                    >
                                                        Mark as Processing
                                                    </button>
                                                )}
                                                {order.status === 'processing' && (
                                                    <button
                                                        onClick={() => updateOrderStatus(order._id, 'delivered')}
                                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium flex items-center gap-2"
                                                    >
                                                        <CheckCircle size={16} />
                                                        Mark as Delivered
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        if (!order.user?.phone) {
                                                            alert('Customer phone number not available');
                                                            return;
                                                        }
                                                        const message = encodeURIComponent(
                                                            `Hi ${order.user.name}, your order #${order._id.slice(-6)} is ${order.status}! 📦 Total: ₹${order.totalAmount}`
                                                        );
                                                        window.open(`https://wa.me/${order.user.phone}?text=${message}`, '_blank');
                                                    }}
                                                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium flex items-center gap-2"
                                                >
                                                    <MessageCircle size={16} />
                                                    WhatsApp Update
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('Are you sure you want to cancel this order?')) {
                                                            updateOrderStatus(order._id, 'cancelled');
                                                        }
                                                    }}
                                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium flex items-center gap-2"
                                                >
                                                    <X size={16} />
                                                    Cancel Order
                                                </button>
                                            </>
                                        )}
                                        {order.user?._id && (
                                            <Link
                                                to="/udhaar"
                                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium flex items-center gap-2"
                                            >
                                                <DollarSign size={16} />
                                                View Credit History
                                                <ExternalLink size={14} />
                                            </Link>
                                        )}
                                        <button
                                            onClick={() => {
                                                if (window.confirm('Are you sure you want to DELETE this order? This action cannot be undone!')) {
                                                    deleteOrder(order._id);
                                                }
                                            }}
                                            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 text-sm font-medium flex items-center gap-2"
                                        >
                                            <Trash2 size={16} />
                                            Delete Order
                                        </button>
                                    </div>

                                    {/* Expand/Collapse Button */}
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

                                    {/* Order Details */}
                                    {expandedOrder === order._id && (
                                        <div className="mt-4 pt-4 border-t">
                                            <h3 className="font-semibold mb-3">Order Items:</h3>
                                            <div className="space-y-2">
                                                {order.items.map((item, index) => (
                                                    <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                                                        <div className="flex items-center gap-3">
                                                            {item.product?.imageUrl && (
                                                                <img
                                                                    src={item.product.imageUrl}
                                                                    alt={item.product.name}
                                                                    className="w-12 h-12 object-cover rounded"
                                                                />
                                                            )}
                                                            <div>
                                                                <div className="font-medium">{item.product?.name || 'Product'}</div>
                                                                <div className="text-sm text-gray-500">
                                                                    Quantity: {item.quantity} × ₹{item.price}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="font-semibold">₹{item.price * item.quantity}</div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-4 pt-4 border-t">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-gray-600">Customer Email:</span>
                                                    <span className="font-medium">{order.user?.email}</span>
                                                </div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-gray-600">Payment Method:</span>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(order.paymentMethod, customerCredit)}`}>
                                                        {getPaymentStatusBadge(order.paymentMethod, customerCredit)}
                                                    </span>
                                                </div>
                                                {customerCredit > 0 && (
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-gray-600">Customer Total Credit:</span>
                                                        <span className="font-medium text-red-600">₹{customerCredit}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between items-center">
                                                    <span className="font-semibold">Total Amount:</span>
                                                    <span className="text-xl font-bold text-green-600">₹{order.totalAmount}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default OrderManagement;
