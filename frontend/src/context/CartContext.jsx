import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
        setCart(storedCart);
    }, []);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product, quantity = 1) => {
        // 1. Check stock availability before updating state to avoid render side-effects
        const existingItem = cart.find(item => item._id === product._id);
        const currentQty = existingItem ? existingItem.quantity : 0;

        if (currentQty + quantity > product.stock) {
            toast.error(existingItem ? `Cannot add more than ${product.stock} items!` : `Only ${product.stock} items available!`);
            return;
        }

        // 2. State update (no side effects inside)
        setCart(prevCart => {
            const exist = prevCart.find(item => item._id === product._id);
            if (exist) {
                return prevCart.map(item =>
                    item._id === product._id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prevCart, { ...product, quantity }];
        });

        // 3. Show success toast (outside setState)
        toast.success(existingItem ? 'Cart updated!' : 'Added to cart!');
    };

    const removeFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => item._id !== productId));
    };

    const updateQuantity = (productId, delta) => {
        const item = cart.find(i => i._id === productId);
        if (!item) return;

        const newQuantity = item.quantity + delta;

        if (delta > 0 && item.stock && newQuantity > item.stock) {
            toast.error(`Max stock reached!`);
            return;
        }

        // We allow 0 or negative temporarilly? No, logic says Math.max(1)
        if (newQuantity < 1) return;

        setCart(prevCart => prevCart.map(i =>
            i._id === productId ? { ...i, quantity: newQuantity } : i
        ));
    };

    const clearCart = () => {
        setCart([]);
    };

    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal }}>
            {children}
        </CartContext.Provider>
    );
};
