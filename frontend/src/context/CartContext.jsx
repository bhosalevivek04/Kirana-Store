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
        let shouldToast = false;
        let toastMessage = '';
        let toastType = 'success';

        setCart(prevCart => {
            const existingItem = prevCart.find(item => item._id === product._id);
            if (existingItem) {
                // Check stock limit
                if (existingItem.quantity + quantity > product.stock) {
                    // We can't toast here directly if we want to avoid side effects in render
                    // But setState updater isn't exactly render.
                    // However, to be safe and cleaner matches typical patterns:
                    // Actually, the issue might be that toast triggers a re-render of something else synchronously?
                    // Better to calculate next state first.
                    return prevCart;
                }
                return prevCart.map(item =>
                    item._id === product._id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                if (quantity > product.stock) {
                    return prevCart;
                }
                return [...prevCart, { ...product, quantity }];
            }
        });

        // We need to check the condition again to decide whether to toast
        // Or better: read the CURRENT state? No, that's stale.
        // We can check the SAME conditions.

        // Let's rely on the fact that if we didn't return early above, we succeeded.
        // But verifying logic outside is safer.

        const currentCart = [...cart]; // This is stale inside the function closure if called rapidly?
        // Actually, let's just do the check outside BEFORE setCart.

        const existingItem = cart.find(item => item._id === product._id);
        const currentQty = existingItem ? existingItem.quantity : 0;

        if (currentQty + quantity > product.stock) {
            toast.error(existingItem ? `Cannot add more than ${product.stock} items!` : `Only ${product.stock} items available!`);
            return;
        }

        toast.success(existingItem ? 'Cart updated!' : 'Added to cart!');

        setCart(prevCart => {
            const exist = prevCart.find(item => item._id === product._id);
            if (exist) {
                return prevCart.map(item => item._id === product._id ? { ...item, quantity: item.quantity + quantity } : item);
            }
            return [...prevCart, { ...product, quantity }];
        });
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
