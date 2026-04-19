import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { getPhotoById } from '../services/api';
import { useCart } from '../context/CartContext';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [selectedSize, setSelectedSize] = useState('');
    const [isSizeTableOpen, setIsSizeTableOpen] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const data = await getPhotoById(id);
                setProduct(data);
                if (data.sizes && data.sizes.length > 0) {
                    setSelectedSize(data.sizes[0]);
                }
            } catch (error) {
                console.error("Error fetching product:", error);
                navigate('/');
            }
        };
        fetchProduct();
    }, [id, navigate]);

    if (!product) return <div style={{ padding: '100px', textAlign: 'center' }}>Loading...</div>;

    const handleAddToCart = () => {
        if (product.sizes && product.sizes.length > 0 && !selectedSize) {
            alert(t('selectSizePrompt') || 'Please select a size');
            return;
        }
        addToCart(product, selectedSize);
    };

    return (
        <section id="prodetails" className="section-p1">
            <div id="product-detail-container" className="prodetails-container">
                <div className="single-pro-image">
                    <img src={product.path} id="MainImg" alt={product.item_description || product.filename} />
                </div>
                <div className="single-pro-details">
                    <h6>{t('home')} / {t('products')}</h6>
                    <h4>{product.name || product.item_description || product.filename}</h4>
                    <h2>{parseFloat(product.price).toFixed(2)} UAH</h2>

                    {product.sizes && product.sizes.length > 0 && (
                        <>
                            <select
                                value={selectedSize}
                                onChange={(e) => setSelectedSize(e.target.value)}
                                style={{ padding: '10px', marginBottom: '10px' }}
                            >
                                <option value="" disabled>{t('selectSize')}</option>
                                {product.sizes.map(size => (
                                    <option key={size} value={size}>{size}</option>
                                ))}
                            </select>
                            {product.size_table_photo_path && (
                                <button
                                    className="size-table-btn"
                                    onClick={() => setIsSizeTableOpen(true)}
                                    style={{ marginLeft: '10px', padding: '10px', cursor: 'pointer' }}
                                >
                                    {t('sizeTable')}
                                </button>
                            )}
                        </>
                    )}

                    <button className="normal" onClick={handleAddToCart}>{t('addToCart')}</button>
                    <h4>{t('productDetails')}</h4>
                    <span style={{ whiteSpace: 'pre-wrap' }}>{product.item_description || t('noDescription')}</span>
                </div>
            </div>

            {isSizeTableOpen && product.size_table_photo_path && (
                <div className="modal" style={{ display: 'block' }} onClick={(e) => {
                    if (e.target.className === 'modal') setIsSizeTableOpen(false);
                }}>
                    <div className="modal-content size-table-modal">
                        <span className="close-button" onClick={() => setIsSizeTableOpen(false)}>&times;</span>
                        <img src={product.size_table_photo_path} alt="Size Table" style={{ width: '100%' }} />
                    </div>
                </div>
            )}
        </section>
    );
};

export default ProductDetail;
