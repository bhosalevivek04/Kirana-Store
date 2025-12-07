import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, MessageCircle, LogOut, Package, Menu, Search, X, User } from 'lucide-react';
import Sidebar from './Sidebar';
import api from '../api';

const NavIcon = ({ to, icon: Icon, label, onClick, className = '' }) => {
    const content = (
        <>
            <Icon size={24} />
            <span className="absolute top-full mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg">
                {label}
            </span>
        </>
    );

    const baseClass = `group relative flex items-center justify-center p-2 rounded-lg hover:bg-green-700 transition-colors ${className}`;

    if (onClick) {
        return (
            <button onClick={onClick} className={baseClass}>
                {content}
            </button>
        );
    }

    return (
        <Link to={to} className={baseClass}>
            {content}
        </Link>
    );
};

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user'));
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchSuggestions, setSearchSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const searchRef = useRef(null);

    const isHomePage = location.pathname === '/';

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    // Fetch search suggestions
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (searchQuery.trim().length > 0) {
                try {
                    const res = await api.get('/products');
                    const filtered = res.data
                        .filter(product =>
                            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            product.category?.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .slice(0, 5); // Show max 5 suggestions
                    setSearchSuggestions(filtered);
                    setShowSuggestions(true);
                } catch (error) {
                    console.error('Error fetching suggestions:', error);
                }
            } else {
                setSearchSuggestions([]);
                setShowSuggestions(false);
            }
        };

        const debounceTimer = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchQuery]);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
            setShowSuggestions(false);
        } else {
            // If search is empty and user presses enter, clear search
            navigate('/');
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (productName) => {
        setSearchQuery(productName);
        navigate(`/?search=${encodeURIComponent(productName)}`);
        setShowSuggestions(false);
    };

    const clearSearch = () => {
        setSearchQuery('');
        setShowSuggestions(false);
        navigate('/'); // Navigate to home without search param
    };

    return (
        <>
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <nav className="bg-green-600 text-white shadow-lg sticky top-0 z-30">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex justify-between items-center gap-4">
                        {/* Left: Hamburger + Logo */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                            {user && (
                                <button
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="md:hidden p-2 hover:bg-green-700 rounded-lg transition-colors"
                                >
                                    <Menu size={24} />
                                </button>
                            )}
                            <Link to="/" className="text-xl font-bold whitespace-nowrap" onClick={clearSearch}>
                                {import.meta.env.VITE_STORE_NAME || 'Kirana Store'}
                            </Link>
                        </div>

                        {/* Center: Search Bar (Desktop) */}
                        {isHomePage && (
                            <div ref={searchRef} className="hidden md:flex flex-1 max-w-xl mx-4 relative">
                                <form onSubmit={handleSearch} className="w-full">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Search products..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onFocus={() => searchQuery && setShowSuggestions(true)}
                                            className="w-full pl-9 pr-10 py-2 rounded-lg text-gray-900 placeholder-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 text-sm"
                                        />
                                        {/* Clear Button */}
                                        {searchQuery && (
                                            <button
                                                type="button"
                                                onClick={clearSearch}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>
                                </form>

                                {/* Search Suggestions Dropdown */}
                                {showSuggestions && searchSuggestions.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50">
                                        {searchSuggestions.map(product => (
                                            <div
                                                key={product._id}
                                                onClick={() => handleSuggestionClick(product.name)}
                                                className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                            >
                                                {/* Product Image */}
                                                <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center">
                                                    {product.imageUrl ? (
                                                        <img
                                                            src={product.imageUrl}
                                                            alt={product.name}
                                                            className="w-full h-full object-contain rounded"
                                                        />
                                                    ) : (
                                                        <Package size={20} className="text-gray-400" />
                                                    )}
                                                </div>

                                                {/* Product Info */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {product.name}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        {product.category && (
                                                            <span className="text-xs text-gray-500 capitalize">
                                                                {product.category}
                                                            </span>
                                                        )}
                                                        <span className="text-xs font-semibold text-green-600">
                                                            ₹{product.price}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Stock Badge */}
                                                {product.stock <= 5 && product.stock > 0 && (
                                                    <span className="text-xs text-orange-600 font-medium">
                                                        {product.stock} left
                                                    </span>
                                                )}
                                                {product.stock === 0 && (
                                                    <span className="text-xs text-red-600 font-medium">
                                                        Out of stock
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Right: Desktop Navigation + Mobile Icons */}
                        <div className="flex items-center space-x-2 md:space-x-4">
                            {user ? (
                                <>
                                    {/* Desktop Navigation - Hidden on Mobile */}
                                    <Link to="/profile" className="font-medium hidden md:flex items-center gap-2 mr-2 hover:text-green-200">
                                        <User size={20} />
                                        <span>Hi, {user.name}</span>
                                    </Link>

                                    {/* Admin Navigation */}
                                    {user.role === 'admin' && (
                                        <>
                                            {/* Desktop Links - Hidden on Mobile */}
                                            <Link to="/dashboard" className="hover:text-green-200 hidden md:inline">Dashboard</Link>
                                            <Link to="/inventory" className="hover:text-green-200 hidden md:inline">Inventory</Link>
                                            <Link to="/order-management" className="hover:text-green-200 hidden md:inline">Orders</Link>
                                            <Link to="/udhaar" className="hover:text-green-200 hidden md:inline">Udhaar</Link>
                                        </>
                                    )}

                                    {/* Customer Navigation (shown to all users) */}
                                    <NavIcon to="/cart" icon={ShoppingCart} label="Cart" />
                                    <NavIcon to="/orders" icon={Package} label="My Orders" className="md:hidden" />
                                    <NavIcon to="/chat" icon={MessageCircle} label="Chat Support" className="md:hidden" />

                                    {/* Desktop Links - Hidden on Mobile */}
                                    <NavIcon to="/orders" icon={Package} label="My Orders" className="hidden md:flex" />
                                    <NavIcon to="/chat" icon={MessageCircle} label="Chat Support" className="hidden md:flex" />

                                    {/* Logout - Hidden on Mobile */}
                                    <NavIcon onClick={handleLogout} icon={LogOut} label="Logout" className="hidden md:flex hover:bg-red-600" />
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="hover:text-green-200">Login</Link>
                                    <Link to="/register" className="hover:text-green-200">Register</Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Search Icon */}
                        {isHomePage && (
                            <button
                                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                                className="md:hidden p-2 text-white hover:bg-green-700 rounded-lg transition-colors ml-auto"
                            >
                                {isMobileSearchOpen ? <X size={24} /> : <Search size={24} />}
                            </button>
                        )}
                    </div>

                    {/* Mobile Search Bar (Expandable) */}
                    {isMobileSearchOpen && isHomePage && (
                        <div className="md:hidden mt-3 pb-2">
                            <form onSubmit={handleSearch} className="w-full relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                    className="w-full pl-9 pr-4 py-2 rounded-lg text-gray-900 placeholder-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 text-sm"
                                />
                            </form>
                        </div>
                    )}
                </div>
            </nav>
        </>
    );
};

export default Navbar;
