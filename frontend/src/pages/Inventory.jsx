import { useState, useEffect } from 'react';
import api from '../api';
import { Package, Plus, Edit, Trash2, Search } from 'lucide-react';
import logger from '../utils/logger';

const Inventory = () => {
    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [formData, setFormData] = useState({ name: '', price: '', stock: '', minStockLevel: '10', description: '', imageUrl: '', category: '' });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await api.get('/products');
            setProducts(res.data);
            setFilteredProducts(res.data);
        } catch (error) {
            logger.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const uploadImage = async () => {
        if (!imageFile) return formData.imageUrl;

        setUploading(true);
        const formDataUpload = new FormData();
        formDataUpload.append('image', imageFile);

        try {
            const res = await api.post('/products/upload-image', formDataUpload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setUploading(false);
            return res.data.imageUrl;
        } catch (error) {
            setUploading(false);
            alert('Image upload failed');
            return formData.imageUrl;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const imageUrl = await uploadImage();
            const productData = { ...formData, imageUrl };

            if (currentProduct) {
                await api.put(`/products/${currentProduct._id}`, productData);
            } else {
                await api.post('/products', productData);
            }
            fetchProducts();
            closeModal();
        } catch (error) {
            alert('Error saving product');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure?')) {
            try {
                await api.delete(`/products/${id}`);
                fetchProducts();
            } catch (error) {
                alert('Error deleting product');
            }
        }
    };

    const openModal = (product = null) => {
        if (product) {
            setCurrentProduct(product);
            setFormData({
                name: product.name,
                price: product.price,
                stock: product.stock,
                minStockLevel: product.minStockLevel || 10,
                description: product.description,
                imageUrl: product.imageUrl,
                category: product.category || ''
            });
            setImagePreview(product.imageUrl || '');
        } else {
            setCurrentProduct(null);
            setFormData({ name: '', price: '', stock: '', minStockLevel: '10', description: '', imageUrl: '', category: '' });
            setImagePreview('');
        }
        setImageFile(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentProduct(null);
        setImageFile(null);
        setImagePreview('');
    };

    const getStockStatus = (stock, minLevel) => {
        if (stock === 0) return { color: 'bg-red-100 text-red-800', text: 'Out of Stock', icon: true };
        if (stock <= minLevel) return { color: 'bg-yellow-100 text-yellow-800', text: 'Low Stock', icon: true };
        return { color: 'bg-green-100 text-green-800', text: 'In Stock', icon: false };
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Inventory Management</h1>
                <button onClick={() => openModal()} className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-green-700">
                    <Plus size={20} className="mr-2" /> Add Product
                </button>
            </div>

            {/* Desktop View - Table */}
            <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.map(product => {
                            const status = getStockStatus(product.stock, product.minStockLevel || 10);
                            return (
                                <tr key={product._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{product.price}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color} items-center`}>
                                            {status.icon && <AlertTriangle size={14} className="mr-1" />}
                                            {status.text}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button onClick={() => openModal(product)} className="text-indigo-600 hover:text-indigo-900 mr-4"><Edit size={18} /></button>
                                        <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:text-red-900"><Trash size={18} /></button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile View - Cards */}
            <div className="md:hidden space-y-4">
                {products.map(product => {
                    const status = getStockStatus(product.stock, product.minStockLevel || 10);
                    return (
                        <div key={product._id} className="bg-white rounded-lg shadow p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                                    <p className="text-sm text-gray-500">{product.category}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${status.color} flex items-center`}>
                                    {status.icon && <AlertTriangle size={12} className="mr-1" />}
                                    {status.text}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                <div>
                                    <span className="text-gray-500 block">Price</span>
                                    <span className="font-medium">₹{product.price}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block">Stock</span>
                                    <span className="font-medium">{product.stock}</span>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                                <button
                                    onClick={() => openModal(product)}
                                    className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                >
                                    <Edit size={16} /> Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(product._id)}
                                    className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm font-medium"
                                >
                                    <Trash size={16} /> Delete
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">{currentProduct ? 'Edit Product' : 'Add Product'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Name"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full border p-2 rounded"
                                required
                            />
                            <input
                                type="number"
                                placeholder="Price"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                className="w-full border p-2 rounded"
                                required
                            />
                            <input
                                type="number"
                                placeholder="Stock"
                                value={formData.stock}
                                onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                className="w-full border p-2 rounded"
                            />
                            <input
                                type="number"
                                placeholder="Min Stock Level (Alert Threshold)"
                                value={formData.minStockLevel}
                                onChange={e => setFormData({ ...formData, minStockLevel: e.target.value })}
                                className="w-full border p-2 rounded"
                            />
                            <input
                                type="text"
                                placeholder="Category"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                className="w-full border p-2 rounded"
                            />
                            <textarea
                                placeholder="Description"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full border p-2 rounded"
                            />

                            {/* Image Upload */}
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                                {imagePreview && (
                                    <div className="relative mb-3">
                                        <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded" />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setImageFile(null);
                                                setImagePreview('');
                                                setFormData({ ...formData, imageUrl: '' });
                                            }}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}
                                <label className="flex items-center justify-center w-full px-4 py-2 bg-gray-100 text-gray-700 rounded cursor-pointer hover:bg-gray-200">
                                    <Upload size={20} className="mr-2" />
                                    <span>Choose Image</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>
                                <p className="text-xs text-gray-500 mt-2">Or enter image URL below</p>
                                <input
                                    type="text"
                                    placeholder="Image URL (optional)"
                                    value={formData.imageUrl}
                                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                    className="w-full border p-2 rounded mt-2"
                                />
                            </div>

                            <div className="flex justify-end space-x-2">
                                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                                >
                                    {uploading ? 'Uploading...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
