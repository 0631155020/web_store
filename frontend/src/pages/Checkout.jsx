import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { getCities, getWarehouses, createOrder } from '../services/api';

const Checkout = () => {
    const { cart, cartTotal, setCart } = useCart();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        deliveryMethod: 'novaPoshta',
        paymentMethod: 'card',
        messenger: '',
        cityRef: '',
        warehouseRef: ''
    });

    const [allCities, setAllCities] = useState([]);
    const [filteredCities, setFilteredCities] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [filteredWarehouses, setFilteredWarehouses] = useState([]);
    const [cityQuery, setCityQuery] = useState('');
    const [warehouseQuery, setWarehouseQuery] = useState('');
    const [selectedCityName, setSelectedCityName] = useState('');
    const [selectedWarehouseName, setSelectedWarehouseName] = useState('');

    useEffect(() => {
        if (cart.length === 0) {
            navigate('/');
        }
    }, [cart, navigate]);

    // Load cities once when component mounts
    useEffect(() => {
        const fetchCities = async () => {
            try {
                const res = await getCities();
                if (res.success && res.data) {
                    setAllCities(res.data);
                }
            } catch (error) {
                console.error("Error fetching cities:", error);
            }
        };
        fetchCities();
    }, []);

    // Filter cities based on query
    useEffect(() => {
        if (cityQuery.length >= 2 && allCities.length > 0) {
            const lowerQuery = cityQuery.toLowerCase();
            const filtered = allCities.filter(city =>
                city.Description.toLowerCase().includes(lowerQuery)
            );
            setFilteredCities(filtered);
        } else {
            setFilteredCities([]);
        }
    }, [cityQuery, allCities]);

    // Fetch warehouses when a city is selected
    useEffect(() => {
        const fetchWarehouses = async () => {
            if (formData.cityRef) {
                try {
                    const res = await getWarehouses(formData.cityRef);
                    if (res.success && res.data) {
                        setWarehouses(res.data);
                    }
                } catch (error) {
                    console.error("Error fetching warehouses:", error);
                }
            } else {
                setWarehouses([]);
            }
        };
        fetchWarehouses();
    }, [formData.cityRef]);

    // Filter warehouses based on query
    useEffect(() => {
        if (warehouseQuery && warehouses.length > 0) {
            const lowerQuery = warehouseQuery.toLowerCase();
            const filtered = warehouses.filter(wh =>
                wh.Description.toLowerCase().includes(lowerQuery)
            );
            setFilteredWarehouses(filtered);
        } else {
            // Show all warehouses for the city if no query
            setFilteredWarehouses(warehouses);
        }
    }, [warehouseQuery, warehouses]);


    const handleInputChange = (e) => {
        const { id, value, name, type } = e.target;
        if (type === 'radio') {
             setFormData(prev => ({ ...prev, [name]: value }));
        } else {
            setFormData(prev => ({ ...prev, [id]: value }));
        }
    };

    const handleCitySelect = (city) => {
        setFormData(prev => ({ ...prev, cityRef: city.Ref, warehouseRef: '' }));
        setSelectedCityName(city.Description);
        setCityQuery('');
        setFilteredCities([]);
        setSelectedWarehouseName('');
        setWarehouseQuery('');
    };

    const handleWarehouseSelect = (warehouse) => {
        setFormData(prev => ({ ...prev, warehouseRef: warehouse.Ref }));
        setSelectedWarehouseName(warehouse.Description);
        setWarehouseQuery('');
        setFilteredWarehouses([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const orderItems = cart.map(item => ({
            name: item.photo.name || item.photo.item_description || item.photo.filename,
            quantity: item.quantity,
            size: item.size || null
        }));

        const orderData = {
            email: formData.email || null,
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            deliveryMethod: formData.deliveryMethod,
            paymentMethod: formData.paymentMethod,
            messenger: formData.messenger || null,
            novaPoshta: {
                city: selectedCityName,
                warehouse: selectedWarehouseName,
                cityRef: formData.cityRef,
                warehouseRef: formData.warehouseRef
            },
            items: orderItems
        };

        try {
            await createOrder(orderData);
            alert(t('orderSuccess') || 'Order placed successfully!');
            // Clear cart
            localStorage.removeItem('cart');
            setCart([]);
            navigate('/');
        } catch (error) {
            console.error("Error placing order:", error);
            alert(t('orderError') || 'Error placing order.');
        }
    };

    return (
        <section id="checkout-page" className="section-p1">
            <h1 style={{ textAlign: 'center' }}>{t('checkout')}</h1>
            <div className="checkout-container">
                <div className="checkout-cart-summary">
                    <h2>{t('orderSummary')}</h2>
                    <div id="checkoutCartItems">
                        {cart.map((item, index) => {
                            const name = item.photo.name || item.photo.item_description || item.photo.filename;
                            return (
                                <div key={index} className="checkout-cart-item">
                                    <img src={item.photo.path} alt={name} className="checkout-item-image" />
                                    <div className="checkout-item-details">
                                        <span className="checkout-item-name">{name} {item.size && `(${item.size})`}</span>
                                        <span className="checkout-item-qty">{t('quantity')}: {item.quantity}</span>
                                    </div>
                                    <span className="checkout-item-price">{(parseFloat(item.photo.price) * item.quantity).toFixed(2)} UAH</span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="checkout-total">
                        <strong>{t('total')}:</strong> <span id="checkoutTotal">{cartTotal.toFixed(2)}</span> UAH
                    </div>
                </div>

                <div className="checkout-form-container">
                    <h2>{t('shippingDetails')}</h2>
                    <form id="checkoutForm" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="firstName">{t('firstName')} *</label>
                            <input type="text" id="firstName" value={formData.firstName} onChange={handleInputChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="lastName">{t('lastName')} *</label>
                            <input type="text" id="lastName" value={formData.lastName} onChange={handleInputChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone">{t('phone')} *</label>
                            <input type="tel" id="phone" value={formData.phone} onChange={handleInputChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">{t('email')} ({t('optional')})</label>
                            <input type="email" id="email" value={formData.email} onChange={handleInputChange} />
                        </div>

                        <div className="form-group">
                            <label>{t('preferredMessenger')}</label>
                            <div className="radio-group" style={{ display: 'flex', gap: '10px' }}>
                                <label><input type="radio" name="messenger" value="telegram" onChange={handleInputChange} /> Telegram</label>
                                <label><input type="radio" name="messenger" value="viber" onChange={handleInputChange} /> Viber</label>
                                <label><input type="radio" name="messenger" value="whatsapp" onChange={handleInputChange} /> WhatsApp</label>
                                <label><input type="radio" name="messenger" value="none" onChange={handleInputChange} /> {t('none')}</label>
                            </div>
                        </div>

                        <h3>{t('novaPoshta')}</h3>

                        <div className="form-group np-search-group">
                            <label htmlFor="npCity">{t('city')} *</label>
                            {selectedCityName ? (
                                <div className="selected-value">
                                    {selectedCityName} <button type="button" onClick={() => { setSelectedCityName(''); setFormData(p => ({...p, cityRef: '', warehouseRef: ''})); setSelectedWarehouseName(''); }}>X</button>
                                </div>
                            ) : (
                                <input
                                    type="text"
                                    id="npCity"
                                    value={cityQuery}
                                    onChange={(e) => setCityQuery(e.target.value)}
                                    placeholder={t('searchCity')}
                                    autoComplete="off"
                                />
                            )}
                            <ul className="np-dropdown" style={{ display: filteredCities.length > 0 ? 'block' : 'none', maxHeight: '200px', overflowY: 'auto' }}>
                                {filteredCities.map(city => (
                                    <li key={city.Ref} onClick={() => handleCitySelect(city)}>{city.Description}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="form-group np-search-group">
                            <label htmlFor="npWarehouse">{t('warehouse')} *</label>
                            {selectedWarehouseName ? (
                                <div className="selected-value">
                                    {selectedWarehouseName} <button type="button" onClick={() => { setSelectedWarehouseName(''); setFormData(p => ({...p, warehouseRef: ''})); }}>X</button>
                                </div>
                            ) : (
                                <input
                                    type="text"
                                    id="npWarehouse"
                                    value={warehouseQuery}
                                    onChange={(e) => setWarehouseQuery(e.target.value)}
                                    placeholder={t('searchWarehouse')}
                                    disabled={!formData.cityRef}
                                    autoComplete="off"
                                    onFocus={() => { if(!warehouseQuery && warehouses.length > 0) setFilteredWarehouses(warehouses); }}
                                />
                            )}
                            <ul className="np-dropdown" style={{ display: filteredWarehouses.length > 0 && !selectedWarehouseName ? 'block' : 'none', maxHeight: '200px', overflowY: 'auto' }}>
                                {filteredWarehouses.map(wh => (
                                    <li key={wh.Ref} onClick={() => handleWarehouseSelect(wh)}>{wh.Description}</li>
                                ))}
                            </ul>
                        </div>

                        <input type="hidden" id="cityRef" value={formData.cityRef} required />
                        <input type="hidden" id="warehouseRef" value={formData.warehouseRef} required />

                        <h3>{t('paymentMethod')} *</h3>
                        <div className="form-group radio-group" style={{ display: 'flex', gap: '10px' }}>
                            <label><input type="radio" name="paymentMethod" value="card" checked={formData.paymentMethod === 'card'} onChange={handleInputChange} required /> {t('card')}</label>
                            <label><input type="radio" name="paymentMethod" value="cash" checked={formData.paymentMethod === 'cash'} onChange={handleInputChange} required /> {t('cashOnDelivery')}</label>
                        </div>

                        <button type="submit" id="placeOrderBtn" className="normal" disabled={!formData.cityRef || !formData.warehouseRef}>
                            {t('placeOrder')}
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default Checkout;
