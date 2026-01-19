import { useState, useEffect, Fragment } from 'react';
import api from '../api';
import { Plus, Edit, Trash, ChevronDown, ChevronUp, Users } from 'lucide-react';
import logger from '../utils/logger';
import { toast } from 'react-toastify';

const Udhaar = () => {
    const [credits, setCredits] = useState([]);
    const [entries, setEntries] = useState([]);
    const [customerEntries, setCustomerEntries] = useState({});
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [currentEntry, setCurrentEntry] = useState(null);
    const [currentCustomer, setCurrentCustomer] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [newEntry, setNewEntry] = useState({ userId: '', amount: '', type: 'credit', description: '' });
    const [viewMode, setViewMode] = useState('summary'); // 'summary' or 'detailed'
    const [expandedCustomer, setExpandedCustomer] = useState(null);

    useEffect(() => {
        fetchCredits();
        fetchEntries();
    }, []);

    const fetchCredits = async () => {
        try {
            const res = await api.get('/credits/summary');
            setCredits(res.data);
        } catch (error) {
            logger.error('Error fetching credits:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEntries = async () => {
        try {
            const res = await api.get('/credits/entries');
            setEntries(res.data);
        } catch (error) {
            logger.error('Error fetching entries:', error);
        }
    };

    const fetchCustomerEntries = async (customerId) => {
        try {
            const res = await api.get(`/credits/${customerId}`);
            setCustomerEntries(prev => ({ ...prev, [customerId]: res.data }));
        } catch (error) {
            logger.error('Error fetching entries:', error);
        }
    };

    const handleAddEntry = async (e) => {
        e.preventDefault();
        try {
            await api.post('/credits', newEntry);
            setShowAddModal(false);
            setNewEntry({ userId: '', amount: '', type: 'credit', description: '' });
            fetchCredits();
            fetchEntries();
            toast.success('Entry added successfully');
        } catch (error) {
            toast.error('Error adding entry');
        }
    };

    const handleEditEntry = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/credits/${currentEntry._id}`, {
                amount: currentEntry.amount,
                type: currentEntry.type,
                description: currentEntry.description
            });
            setShowEditModal(false);
            setCurrentEntry(null);
            fetchCredits();
            fetchEntries();
            toast.success('Entry updated successfully');
        } catch (error) {
            toast.error('Error updating entry');
        }
    };

    const handleDeleteEntry = async (id) => {
        if (window.confirm('Are you sure you want to delete this entry?')) {
            try {
                await api.delete(`/credits/${id}`);
                fetchCredits();
                fetchEntries();
                toast.success('Entry deleted successfully');
            } catch (error) {
                toast.error('Error deleting entry');
            }
        }
    };

    const handleRecordPayment = async (e) => {
        e.preventDefault();
        try {

            const amount = parseFloat(paymentAmount);
            if (amount <= 0 || amount > currentCustomer.totalCredit) {
                toast.error('Invalid payment amount. Amount must be greater than 0 and less than or equal to outstanding credit.');
                return;
            }

            await api.post('/credits', {
                userId: currentCustomer.userId,
                amount: amount,
                type: 'payment',
                description: `Payment Received - ₹${amount}`
            });
            setShowPaymentModal(false);
            setPaymentAmount('');
            setCurrentCustomer(null);
            fetchCredits();
            fetchEntries();
            toast.success('Payment recorded successfully!');
        } catch (error) {
            toast.error('Error recording payment');
        }
    };

    const openPaymentModal = (customer) => {
        setCurrentCustomer(customer);
        setPaymentAmount('');
        setShowPaymentModal(true);
    };

    const openEditModal = (entry) => {
        setCurrentEntry({ ...entry });
        setShowEditModal(true);
    };

    const getCustomerEntries = (userId) => {
        return entries.filter(entry => entry.user?._id === userId);
    };

    const toggleCustomerExpand = (userId) => {
        setExpandedCustomer(expandedCustomer === userId ? null : userId);
    };


    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">Udhaar / Credit Management</h1>
                <div className="flex flex-wrap gap-2 md:gap-3 w-full md:w-auto">
                    <div className="bg-white rounded-lg shadow-sm border flex-1 md:flex-none flex">
                        <button
                            onClick={() => setViewMode('summary')}
                            className={`flex-1 md:flex-none px-3 md:px-4 py-2 rounded-l-lg text-sm md:text-base ${viewMode === 'summary' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            Summary
                        </button>
                        <button
                            onClick={() => setViewMode('detailed')}
                            className={`flex-1 md:flex-none px-3 md:px-4 py-2 rounded-r-lg text-sm md:text-base ${viewMode === 'detailed' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            All Transactions
                        </button>
                    </div>
                    <button onClick={() => setShowAddModal(true)} className="bg-green-600 text-white px-3 md:px-4 py-2 rounded-md hover:bg-green-700 flex items-center text-sm md:text-base whitespace-nowrap">
                        <Plus size={20} className="mr-1 md:mr-2" /> Add
                    </button>
                </div>
            </div>

            {viewMode === 'summary' ? (
                /* Summary View - Customer-wise totals with expandable transactions */
                /* Summary View - Customer-wise totals with expandable transactions */
                <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Credit</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {credits.map(credit => {
                                    const customerEntries = getCustomerEntries(credit.userId);
                                    const isExpanded = expandedCustomer === credit.userId;

                                    return (
                                        <Fragment key={credit.userId}>
                                            <tr className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{credit.name}</div>
                                                    <div className="text-sm text-gray-500">{credit.email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {credit.totalCredit > 0 ? (
                                                        <div>
                                                            <span className="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-red-100 text-red-800">
                                                                ₹{credit.totalCredit} Owed
                                                            </span>
                                                        </div>
                                                    ) : credit.totalCredit < 0 ? (
                                                        <div>
                                                            <span className="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                                                                ₹{Math.abs(credit.totalCredit)} Overpaid
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <span className="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-green-100 text-green-800">
                                                                ₹0 Settled
                                                            </span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(credit.lastUpdated).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <div className="flex gap-2">
                                                        {credit.totalCredit > 0 && (
                                                            <button
                                                                onClick={() => openPaymentModal(credit)}
                                                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-medium"
                                                            >
                                                                Record Payment
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => toggleCustomerExpand(credit.userId)}
                                                            className="text-green-600 hover:text-green-900 flex items-center"
                                                        >
                                                            {isExpanded ? (
                                                                <>
                                                                    <ChevronUp size={18} className="mr-1" /> Hide
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <ChevronDown size={18} className="mr-1" /> View
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {isExpanded && (
                                                <tr>
                                                    <td colSpan="4" className="px-6 py-4 bg-gray-50">
                                                        <div className="space-y-2">
                                                            <h4 className="font-semibold text-sm mb-3">Transaction History:</h4>
                                                            {customerEntries.length === 0 ? (
                                                                <p className="text-sm text-gray-500">No transactions found</p>
                                                            ) : (
                                                                <div className="space-y-2">
                                                                    {customerEntries.map(entry => (
                                                                        <div key={entry._id} className="flex justify-between items-center bg-white p-3 rounded border">
                                                                            <div className="flex-1">
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className={`px-2 py-1 text-xs font-semibold rounded ${entry.type === 'credit' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                                                        {entry.type === 'credit' ? 'Credit Given' : 'Payment Received'}
                                                                                    </span>
                                                                                    <span className="font-semibold">₹{entry.amount}</span>
                                                                                </div>
                                                                                <p className="text-sm text-gray-600 mt-1">{entry.description}</p>
                                                                                <p className="text-xs text-gray-400 mt-1">{new Date(entry.date).toLocaleString()}</p>
                                                                            </div>
                                                                            <div className="flex gap-2">
                                                                                <button
                                                                                    onClick={() => openEditModal(entry)}
                                                                                    className="text-blue-600 hover:text-blue-900"
                                                                                >
                                                                                    <Edit size={16} />
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => handleDeleteEntry(entry._id)}
                                                                                    className="text-red-600 hover:text-red-900"
                                                                                >
                                                                                    <Trash size={16} />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4">
                        {credits.map(credit => {
                            const customerEntries = getCustomerEntries(credit.userId);
                            const isExpanded = expandedCustomer === credit.userId;

                            return (
                                <div key={credit.userId} className="bg-white rounded-lg shadow p-4 border">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-semibold text-lg">{credit.name}</h3>
                                            <p className="text-sm text-gray-500">{credit.email}</p>
                                        </div>
                                        <div className="text-right">
                                            {credit.totalCredit > 0 ? (
                                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                                    ₹{credit.totalCredit} Owed
                                                </span>
                                            ) : credit.totalCredit < 0 ? (
                                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    ₹{Math.abs(credit.totalCredit)} Overpaid
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                    Settled
                                                </span>
                                            )}
                                            <p className="text-xs text-gray-400 mt-1">
                                                {new Date(credit.lastUpdated).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-4">
                                        {credit.totalCredit > 0 && (
                                            <button
                                                onClick={() => openPaymentModal(credit)}
                                                className="flex-1 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
                                            >
                                                Record Payment
                                            </button>
                                        )}
                                        <button
                                            onClick={() => toggleCustomerExpand(credit.userId)}
                                            className="flex-1 py-2 border border-green-600 text-green-600 rounded hover:bg-green-50 text-sm font-medium flex justify-center items-center"
                                        >
                                            {isExpanded ? (
                                                <>
                                                    <ChevronUp size={16} className="mr-1" /> History
                                                </>
                                            ) : (
                                                <>
                                                    <ChevronDown size={16} className="mr-1" /> History
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {/* Expanded History for Mobile */}
                                    {isExpanded && (
                                        <div className="mt-4 pt-4 border-t space-y-3">
                                            <h4 className="font-semibold text-sm text-gray-700">Recent Transactions:</h4>
                                            {customerEntries.length === 0 ? (
                                                <p className="text-sm text-gray-500">No transactions found</p>
                                            ) : (
                                                customerEntries.map(entry => (
                                                    <div key={entry._id} className="bg-gray-50 p-3 rounded text-sm">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className={`px-1.5 py-0.5 text-xs font-semibold rounded ${entry.type === 'credit' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                                        {entry.type === 'credit' ? 'Given' : 'Recv'}
                                                                    </span>
                                                                    <span className="font-bold">₹{entry.amount}</span>
                                                                </div>
                                                                <p className="text-gray-600 text-xs">{entry.description}</p>
                                                                <p className="text-gray-400 text-[10px] mt-0.5">{new Date(entry.date).toLocaleString()}</p>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => openEditModal(entry)}
                                                                    className="text-blue-600 p-1"
                                                                >
                                                                    <Edit size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteEntry(entry._id)}
                                                                    className="text-red-600 p-1"
                                                                >
                                                                    <Trash size={16} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </>
            ) : (
                /* Detailed View - All transactions */
                /* Detailed View - All transactions */
                <>
                    {/* Desktop Table */}
                    <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {entries.map(entry => (
                                    <tr key={entry._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(entry.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{entry.user?.name || 'Unknown User'}</div>
                                            <div className="text-sm text-gray-500">{entry.user?.email || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${entry.type === 'credit' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                {entry.type === 'credit' ? 'Credit' : 'Payment'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                                            ₹{entry.amount}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {entry.description}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button onClick={() => openEditModal(entry)} className="text-blue-600 hover:text-blue-900 mr-4">
                                                <Edit size={18} />
                                            </button>
                                            <button onClick={() => handleDeleteEntry(entry._id)} className="text-red-600 hover:text-red-900">
                                                <Trash size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View for All Transactions */}
                    <div className="md:hidden space-y-3">
                        {entries.map(entry => (
                            <div key={entry._id} className="bg-white rounded-lg shadow p-4 border relative">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">{new Date(entry.date).toLocaleString()}</p>
                                        <h4 className="font-semibold text-gray-900">{entry.user?.name || 'Unknown User'}</h4>
                                        <p className="text-xs text-gray-500">{entry.user?.email}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${entry.type === 'credit' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                        {entry.type === 'credit' ? 'Credit' : 'Payment'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <div className="flex-1">
                                        <p className="font-bold text-lg">₹{entry.amount}</p>
                                        <p className="text-sm text-gray-600">{entry.description}</p>
                                    </div>
                                    <div className="flex gap-4 ml-4">
                                        <button onClick={() => openEditModal(entry)} className="text-blue-600">
                                            <Edit size={20} />
                                        </button>
                                        <button onClick={() => handleDeleteEntry(entry._id)} className="text-red-600">
                                            <Trash size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Add Entry Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Add Credit/Payment Entry</h2>
                        <form onSubmit={handleAddEntry} className="space-y-4">
                            <input
                                type="text"
                                placeholder="User ID (Copy from customer's MongoDB ID)"
                                value={newEntry.userId}
                                onChange={e => setNewEntry({ ...newEntry, userId: e.target.value })}
                                className="w-full border p-2 rounded"
                                required
                            />
                            <input
                                type="number"
                                placeholder="Amount"
                                value={newEntry.amount}
                                onChange={e => setNewEntry({ ...newEntry, amount: e.target.value })}
                                className="w-full border p-2 rounded"
                                required
                            />
                            <select
                                value={newEntry.type}
                                onChange={e => setNewEntry({ ...newEntry, type: e.target.value })}
                                className="w-full border p-2 rounded"
                            >
                                <option value="credit">Credit Given (Udhaar)</option>
                                <option value="payment">Payment Received</option>
                            </select>
                            <input
                                type="text"
                                placeholder="Description"
                                value={newEntry.description}
                                onChange={e => setNewEntry({ ...newEntry, description: e.target.value })}
                                className="w-full border p-2 rounded"
                            />
                            <div className="flex justify-end space-x-2">
                                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Entry Modal */}
            {showEditModal && currentEntry && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Edit Entry</h2>
                        <form onSubmit={handleEditEntry} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                                <input
                                    type="text"
                                    value={currentEntry.user?.name || ''}
                                    disabled
                                    className="w-full border p-2 rounded bg-gray-100"
                                />
                            </div>
                            <input
                                type="number"
                                placeholder="Amount"
                                value={currentEntry.amount}
                                onChange={e => setCurrentEntry({ ...currentEntry, amount: e.target.value })}
                                className="w-full border p-2 rounded"
                                required
                            />
                            <select
                                value={currentEntry.type}
                                onChange={e => setCurrentEntry({ ...currentEntry, type: e.target.value })}
                                className="w-full border p-2 rounded"
                            >
                                <option value="credit">Credit Given (Udhaar)</option>
                                <option value="payment">Payment Received</option>
                            </select>
                            <input
                                type="text"
                                placeholder="Description"
                                value={currentEntry.description}
                                onChange={e => setCurrentEntry({ ...currentEntry, description: e.target.value })}
                                className="w-full border p-2 rounded"
                            />
                            <div className="flex justify-end space-x-2">
                                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Update</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Record Payment Modal */}
            {showPaymentModal && currentCustomer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Record Payment</h2>
                        <div className="mb-4 p-3 bg-gray-50 rounded">
                            <p className="text-sm text-gray-600">Customer</p>
                            <p className="font-semibold">{currentCustomer.name}</p>
                            <p className="text-sm text-gray-500">{currentCustomer.email}</p>
                            <p className="text-lg font-bold text-red-600 mt-2">
                                Outstanding: ₹{currentCustomer.totalCredit}
                            </p>
                        </div>
                        <form onSubmit={handleRecordPayment} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Payment Amount
                                </label>
                                <input
                                    type="number"
                                    placeholder="Enter amount received"
                                    value={paymentAmount}
                                    onChange={e => setPaymentAmount(e.target.value)}
                                    className="w-full border p-2 rounded"
                                    required
                                    min="0.01"
                                    step="0.01"
                                    max={currentCustomer.totalCredit}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Maximum: ₹{currentCustomer.totalCredit}
                                </p>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowPaymentModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    Record Payment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Udhaar;
