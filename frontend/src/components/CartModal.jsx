import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

const CartModal = () => {
    const {
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        decreaseQuantity,
        removeAllFromCart,
        cartTotal
    } = useCart();
    const { t } = useLanguage();
    const navigate = useNavigate();

    if (!isCartOpen) return null;

    const handleCheckout = () => {
        setIsCartOpen(false);
        navigate('/checkout');
    };

    return (
        <div id="cartModal" className="modal" style={{ display: 'block' }} onClick={(e) => {
            if (e.target.className === 'modal') setIsCartOpen(false);
        }}>
            <div className="modal-content">
                <span className="close-button" onClick={() => setIsCartOpen(false)}>&times;</span>
                <h2>{t('cart')}</h2>
                <div id="cartItems">
                    {cart.map((item, index) => {
                        const itemTotal = parseFloat(item.photo.price) * item.quantity;
                        const name = item.photo.name || item.photo.item_description || item.photo.filename;

                        return (
                            <div key={`${item.photo.id}-${item.size}-${index}`} className="cart-item">
                                <img src={item.photo.path} alt={name} className="cart-item-image" />
                                <span className="cart-item-name">
                                    {name} {item.size && `(${item.size})`}
                                </span>
                                <span className="cart-item-controls">
                                    <button className="decrease-quantity-btn" onClick={() => decreaseQuantity(item.photo.id, item.size)}>-</button>
                                    <span className="quantity">x{item.quantity}</span>
                                    <button className="increase-quantity-btn" onClick={() => addToCart(item.photo, item.size)}>+</button>
                                </span>
                                <span className="cart-item-price">{itemTotal.toFixed(2)} UAH</span>
                                <button className="remove-all-btn" onClick={() => removeAllFromCart(item.photo.id, item.size)}>
                                    {t('removeAll')}
                                </button>
                            </div>
                        );
                    })}
                    {cart.length === 0 && <p>Cart is empty</p>}
                </div>
                <p><strong>{t('total')}:</strong> <span id="cartTotal">{cartTotal.toFixed(2)}</span> UAH</p>
                <button id="checkoutButton" onClick={handleCheckout} disabled={cart.length === 0}>
                    {t('checkout')}
                </button>
            </div>
        </div>
    );
};

export default CartModal;
