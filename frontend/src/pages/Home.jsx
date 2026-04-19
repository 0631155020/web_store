import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { getPhotos } from '../services/api';
import { useCart } from '../context/CartContext';

const Home = () => {
    const { t } = useLanguage();
    const { addToCart } = useCart();
    const [photos, setPhotos] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchPhotos = async () => {
            try {
                const data = await getPhotos();
                setPhotos(data);
            } catch (error) {
                console.error("Error fetching photos:", error);
            }
        };
        fetchPhotos();
    }, []);

    const filteredPhotos = photos.filter(photo => {
        const query = searchQuery.toLowerCase();
        return (
            (photo.name && photo.name.toLowerCase().includes(query)) ||
            (photo.item_description && photo.item_description.toLowerCase().includes(query)) ||
            (photo.filename && photo.filename.toLowerCase().includes(query))
        );
    });

    return (
        <main>
            <section id="hero">
                <h1>{t('heroTitle')}</h1>
                <p>{t('heroSubtitle')}</p>
                <Link to="/home"><button>{t('findYours')} &#8594;</button></Link>
            </section>

            <section className="search-section" style={{ padding: '20px', textAlign: 'center' }}>
                <input
                    type="text"
                    placeholder={t('searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ padding: '10px', width: '80%', maxWidth: '400px', borderRadius: '5px', border: '1px solid #ccc' }}
                />
            </section>

            <section className="gallery">
                <h2>{t('collection')}</h2>
                <div className="gallery-container">
                    {filteredPhotos.map(photo => (
                        <div className="gallery-item" key={photo.id}>
                            <Link to={`/product/${photo.id}`}>
                                <img src={photo.path} alt={photo.item_description || photo.filename} />
                                <div className="product-info">
                                    <h3>{photo.name || photo.item_description || photo.filename}</h3>
                                    <p className="price">{parseFloat(photo.price).toFixed(2)} UAH</p>
                                </div>
                            </Link>
                            <button className="add-to-cart-btn" onClick={(e) => {
                                e.preventDefault();
                                if (photo.sizes && photo.sizes.length > 0) {
                                    window.location.href = `/product/${photo.id}`;
                                } else {
                                    addToCart(photo, null);
                                }
                            }}>
                                <span className="material-symbols-outlined">shopping_cart</span>
                            </button>
                        </div>
                    ))}
                    {filteredPhotos.length === 0 && <p style={{ textAlign: 'center', width: '100%' }}>No items found.</p>}
                </div>
            </section>
        </main>
    );
};

export default Home;
