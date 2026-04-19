import React, { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    const [isCartOpen, setIsCartOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (photo, size) => {
        if (photo.sizes && photo.sizes.length > 0 && !size) {
            alert('Please select a size.');
            return;
        }

        setCart(prevCart => {
            const existingItemIndex = prevCart.findIndex(item => item.photo.id === photo.id && item.size === size);
            if (existingItemIndex >= 0) {
                const newCart = [...prevCart];
                newCart[existingItemIndex] = {
                    ...newCart[existingItemIndex],
                    quantity: newCart[existingItemIndex].quantity + 1
                };
                return newCart;
            } else {
                return [...prevCart, { photo, quantity: 1, size }];
            }
        });
        setIsCartOpen(true);
    };

    const decreaseQuantity = (photoId, size) => {
        setCart(prevCart => {
            const existingItemIndex = prevCart.findIndex(item => item.photo.id === photoId && item.size === size);
            if (existingItemIndex >= 0) {
                const newCart = [...prevCart];
                if (newCart[existingItemIndex].quantity > 1) {
                    newCart[existingItemIndex] = {
                        ...newCart[existingItemIndex],
                        quantity: newCart[existingItemIndex].quantity - 1
                    };
                } else {
                    newCart.splice(existingItemIndex, 1);
                }
                return newCart;
            }
            return prevCart;
        });
    };

    const removeAllFromCart = (photoId, size) => {
        setCart(prevCart => prevCart.filter(item => !(item.photo.id === photoId && item.size === size)));
    };

    const cartTotal = cart.reduce((sum, item) => sum + parseFloat(item.photo.price) * item.quantity, 0);
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cart, setCart,
            addToCart,
            decreaseQuantity,
            removeAllFromCart,
            cartTotal,
            cartCount,
            isCartOpen,
            setIsCartOpen
        }}>
            {children}
        </CartContext.Provider>
    );
};
