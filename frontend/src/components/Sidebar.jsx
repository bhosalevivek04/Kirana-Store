import { Link, useNavigate } from 'react-router-dom';
import { X, Home, ShoppingCart, Package, MessageCircle, LayoutDashboard, Archive, ClipboardList, Wallet, LogOut, User } from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        onClose();
        navigate('/login');
    };

    const handleLinkClick = () => {
        onClose(); // Close sidebar when link is clicked
    };

    if (!user) return null;

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Menu</h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={24} className="text-gray-600" />
                            </button>
                        </div>

                        {/* User Profile Section */}
                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                                <User size={24} className="text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-gray-800">{user.name}</p>
                                <p className="text-sm text-gray-600">{user.email}</p>
                                <p className="text-xs text-green-600 font-medium capitalize mt-1">
                                    {user.role}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex-1 overflow-y-auto py-4">
                        {user.role === 'customer' ? (
                            <div className="space-y-1 px-2">
                                <Link
                                    to="/"
                                    onClick={handleLinkClick}
                                    className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-green-50 rounded-lg transition-colors"
                                >
                                    <Home size={22} />
                                    <span className="font-medium">Home</span>
                                </Link>
                                <Link
                                    to="/cart"
                                    onClick={handleLinkClick}
                                    className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-green-50 rounded-lg transition-colors"
                                >
                                    <ShoppingCart size={22} />
                                    <span className="font-medium">My Cart</span>
                                </Link>
                                <Link
                                    to="/orders"
                                    onClick={handleLinkClick}
                                    className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-green-50 rounded-lg transition-colors"
                                >
                                    <Package size={22} />
                                    <span className="font-medium">My Orders</span>
                                </Link>
                                <Link
                                    to="/chat"
                                    onClick={handleLinkClick}
                                    className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-green-50 rounded-lg transition-colors"
                                >
                                    <MessageCircle size={22} />
                                    <span className="font-medium">Chat Support</span>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-1 px-2">
                                <Link
                                    to="/dashboard"
                                    onClick={handleLinkClick}
                                    className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-green-50 rounded-lg transition-colors"
                                >
                                    <LayoutDashboard size={22} />
                                    <span className="font-medium">Dashboard</span>
                                </Link>
                                <Link
                                    to="/inventory"
                                    onClick={handleLinkClick}
                                    className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-green-50 rounded-lg transition-colors"
                                >
                                    <Archive size={22} />
                                    <span className="font-medium">Inventory</span>
                                </Link>
                                <Link
                                    to="/order-management"
                                    onClick={handleLinkClick}
                                    className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-green-50 rounded-lg transition-colors"
                                >
                                    <ClipboardList size={22} />
                                    <span className="font-medium">Order Management</span>
                                </Link>
                                <Link
                                    to="/udhaar"
                                    onClick={handleLinkClick}
                                    className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-green-50 rounded-lg transition-colors"
                                >
                                    <Wallet size={22} />
                                    <span className="font-medium">Udhaar Management</span>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Logout Button */}
                    <div className="p-4 border-t border-gray-200">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-4 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                        >
                            <LogOut size={22} />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
