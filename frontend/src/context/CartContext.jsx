import { createContext, useContext, useState, useEffect } from 'react';

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
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item._id === product._id);
            if (existingItem) {
                // Check stock limit
                if (existingItem.quantity + quantity > product.stock) {
                    alert(`Cannot add more than ${product.stock} items!`);
                    return prevCart;
                }
                return prevCart.map(item =>
                    item._id === product._id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                if (quantity > product.stock) {
                    alert(`Only ${product.stock} items available!`);
                    return prevCart;
                }
                return [...prevCart, { ...product, quantity }];
            }
        });
    };

    const removeFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => item._id !== productId));
    };

    const updateQuantity = (productId, delta) => {
        setCart(prevCart => {
            return prevCart.map(item => {
                if (item._id === productId) {
                    const newQuantity = Math.max(1, item.quantity + delta);
                    // Ideally we should check stock here too, but simplest is to trust the decrement/increment buttons which usually have limits
                    // But strictly speaking, we can check item.stock if avail.
                    if (delta > 0 && item.stock && newQuantity > item.stock) {
                        alert(`Max stock reached!`);
                        return item;
                    }
                    return { ...item, quantity: newQuantity };
                }
                return item;
            });
        });
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
