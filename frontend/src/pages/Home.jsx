import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import { useCart } from '../context/CartContext';
import { ShoppingCart } from 'lucide-react';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [quantities, setQuantities] = useState({}); // Track quantity for each product
    const [selectedProduct, setSelectedProduct] = useState(null); // For product detail modal
    const [searchParams] = useSearchParams();

    useEffect(() => {
        fetchProducts();
    }, []);

    // Handle URL search params from navbar
    useEffect(() => {
        const searchQuery = searchParams.get('search');
        if (searchQuery) {
            setSearchTerm(searchQuery);
        } else {
            // Clear search term if no search param in URL
            setSearchTerm('');
        }
    }, [searchParams]);

    useEffect(() => {
        filterAndSortProducts();
    }, [products, searchTerm, selectedCategory, sortBy]);

    const fetchProducts = async () => {
        try {
            const res = await api.get('/products');
            setProducts(res.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterAndSortProducts = () => {
        let filtered = [...products];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Category filter
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(product => product.category === selectedCategory);
        }

        // Sort
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'price_asc':
                    return a.price - b.price;
                case 'price_desc':
                    return b.price - a.price;
                case 'name':
                default:
                    return a.name.localeCompare(b.name);
            }
        });

        setFilteredProducts(filtered);
    };

    const getQuantity = (productId) => {
        return quantities[productId] || 1;
    };

    const updateQuantity = (productId, newQuantity) => {
        const product = products.find(p => p._id === productId);
        if (!product) return;

        // Ensure quantity is between 1 and available stock
        const validQuantity = Math.max(1, Math.min(newQuantity, product.stock));
        setQuantities(prev => ({ ...prev, [productId]: validQuantity }));
    };

    const incrementQuantity = (productId) => {
        const currentQty = getQuantity(productId);
        updateQuantity(productId, currentQty + 1);
    };

    const decrementQuantity = (productId) => {
        const currentQty = getQuantity(productId);
        updateQuantity(productId, currentQty - 1);
    };

    const user = JSON.parse(localStorage.getItem('user'));
    const { addToCart } = useCart();

    const handleAddToCart = (product) => {
        if (!user) {
            alert('Please login to add items to cart');
            window.location.href = '/login';
            return;
        }

        if (product.stock === 0) {
            alert('Product is out of stock!');
            return;
        }

        const qtyToAdd = getQuantity(product._id);

        if (qtyToAdd > product.stock) {
            alert(`Only ${product.stock} items available in stock!`);
            return;
        }

        addToCart(product, qtyToAdd);
        alert(`Added ${qtyToAdd} item(s) to cart!`);

        // Reset quantity to 1 after adding
        setQuantities(prev => ({ ...prev, [product._id]: 1 }));
    };

    const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))];

    if (loading) return <div className="text-center mt-10">Loading products...</div>;

    return (
        <div className="px-2 md:px-0">
            <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-gray-800">Our Products</h1>

            {/* Blinkit-Style Filter Bar */}
            <div className="mb-4">
                {/* Category Chips - Horizontal Scroll */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${selectedCategory === cat
                                ? 'bg-green-600 text-white shadow-md'
                                : 'bg-white text-gray-700 border border-gray-300 hover:border-green-500'
                                }`}
                        >
                            {cat === 'all' ? 'All' : cat}
                        </button>
                    ))}
                </div>

                {/* Sort Dropdown - Compact */}
                <div className="flex items-center justify-between mt-3">
                    <div className="text-sm text-gray-600">
                        {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                    </div>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                    >
                        <option value="name">Sort: A-Z</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                    </select>
                </div>
            </div>

            {/* Product Grid - Blinkit Style */}
            {filteredProducts.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                    {filteredProducts.map(product => (
                        <div key={product._id} className="bg-white rounded-xl border border-gray-200 hover:border-green-500 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col">
                            {/* Product Image - Fixed Height */}
                            <div
                                className="relative bg-gray-50 h-32 md:h-40 p-2 cursor-pointer flex items-center justify-center overflow-hidden"
                                onClick={() => setSelectedProduct(product)}
                            >
                                {product.imageUrl ? (
                                    <img
                                        src={product.imageUrl}
                                        alt={product.name}
                                        className="max-w-full max-h-full object-contain"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center">
                                        <span className="text-gray-300 text-sm">No Image</span>
                                    </div>
                                )}
                                {product.stock === 0 && (
                                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-lg">
                                        <span className="text-white font-semibold text-xs px-2 py-1 bg-red-600 rounded">OUT OF STOCK</span>
                                    </div>
                                )}
                                {product.stock > 0 && product.stock <= 5 && (
                                    <div className="absolute top-1 right-1 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                                        {product.stock} left
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="p-2 flex flex-col flex-1">
                                {/* Product Name - Clickable */}
                                <h3
                                    className="text-xs md:text-sm font-medium text-gray-800 line-clamp-2 mb-1 cursor-pointer hover:text-green-600"
                                    onClick={() => setSelectedProduct(product)}
                                >
                                    {product.name}
                                </h3>

                                {/* Category */}
                                {product.category && (
                                    <span className="text-xs text-gray-400 mb-1 capitalize">
                                        {product.category}
                                    </span>
                                )}

                                {/* Price */}
                                <div className="flex items-baseline gap-1 mb-2 mt-auto">
                                    <span className="text-sm md:text-base font-bold text-gray-900">₹{product.price}</span>
                                    <span className="text-xs text-gray-400 line-through">₹{(product.price * 1.2).toFixed(0)}</span>
                                </div>

                                {product.stock > 0 ? (
                                    <>
                                        <>
                                            {/* Quantity Selector & Add Button - Visible to Everyone */}
                                            <div className="flex items-center gap-1 mb-1.5">
                                                <button
                                                    onClick={() => decrementQuantity(product._id)}
                                                    className="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded border border-green-600 text-green-600 hover:bg-green-50 font-bold disabled:opacity-40"
                                                    disabled={getQuantity(product._id) <= 1}
                                                >
                                                    −
                                                </button>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={product.stock}
                                                    value={getQuantity(product._id)}
                                                    onChange={(e) => updateQuantity(product._id, parseInt(e.target.value) || 1)}
                                                    className="w-8 md:w-10 h-6 md:h-7 text-center border border-gray-300 rounded font-medium text-xs focus:outline-none focus:border-green-500"
                                                />
                                                <button
                                                    onClick={() => incrementQuantity(product._id)}
                                                    className="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded bg-green-600 text-white hover:bg-green-700 font-bold disabled:opacity-40"
                                                    disabled={getQuantity(product._id) >= product.stock}
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => handleAddToCart(product)}
                                                className="w-full py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 font-semibold text-xs transition-colors"
                                            >
                                                Add
                                            </button>
                                        </>
                                    </>
                                ) : (
                                    <button
                                        disabled
                                        className="w-full py-1.5 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed font-semibold text-xs"
                                    >
                                        Out of Stock
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Product Detail Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedProduct(null)}>
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6">
                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="float-right text-gray-400 hover:text-gray-600 text-2xl font-bold"
                            >
                                ×
                            </button>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Product Image */}
                                <div className="bg-gray-50 rounded-xl p-6 flex items-center justify-center">
                                    {selectedProduct.imageUrl ? (
                                        <img
                                            src={selectedProduct.imageUrl}
                                            alt={selectedProduct.name}
                                            className="max-h-80 object-contain"
                                        />
                                    ) : (
                                        <span className="text-gray-300">No Image</span>
                                    )}
                                </div>

                                {/* Product Details */}
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedProduct.name}</h2>

                                    {selectedProduct.category && (
                                        <span className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full mb-3 capitalize">
                                            {selectedProduct.category}
                                        </span>
                                    )}

                                    <div className="flex items-baseline gap-2 mb-4">
                                        <span className="text-3xl font-bold text-green-600">₹{selectedProduct.price}</span>
                                        <span className="text-lg text-gray-400 line-through">₹{(selectedProduct.price * 1.2).toFixed(0)}</span>
                                        <span className="text-sm text-green-600 font-medium">20% OFF</span>
                                    </div>

                                    {/* Description */}
                                    <div className="mb-4">
                                        <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                            {selectedProduct.description || 'No description available for this product.'}
                                        </p>
                                    </div>

                                    {/* Stock Status */}
                                    <div className="mb-4">
                                        <h3 className="font-semibold text-gray-900 mb-2">Availability</h3>
                                        {selectedProduct.stock > 0 ? (
                                            <p className="text-green-600 font-medium">
                                                In Stock ({selectedProduct.stock} available)
                                            </p>
                                        ) : (
                                            <p className="text-red-600 font-medium">Out of Stock</p>
                                        )}
                                    </div>

                                    {/* Add to Cart Section - Visible to Everyone */}
                                    {selectedProduct.stock > 0 && (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-medium text-gray-700">Quantity:</span>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => decrementQuantity(selectedProduct._id)}
                                                        className="w-10 h-10 flex items-center justify-center rounded-lg border-2 border-green-600 text-green-600 hover:bg-green-50 font-bold text-xl"
                                                        disabled={getQuantity(selectedProduct._id) <= 1}
                                                    >
                                                        −
                                                    </button>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max={selectedProduct.stock}
                                                        value={getQuantity(selectedProduct._id)}
                                                        onChange={(e) => updateQuantity(selectedProduct._id, parseInt(e.target.value) || 1)}
                                                        className="w-16 h-10 text-center border-2 border-gray-300 rounded-lg font-bold text-lg focus:outline-none focus:border-green-500"
                                                    />
                                                    <button
                                                        onClick={() => incrementQuantity(selectedProduct._id)}
                                                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-green-600 text-white hover:bg-green-700 font-bold text-xl"
                                                        disabled={getQuantity(selectedProduct._id) >= selectedProduct.stock}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    handleAddToCart(selectedProduct);
                                                    setSelectedProduct(null);
                                                }}
                                                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold text-lg transition-colors"
                                            >
                                                Add to Cart
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
