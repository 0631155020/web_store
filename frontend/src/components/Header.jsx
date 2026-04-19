import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

const Header = () => {
    const { cartCount, setIsCartOpen } = useCart();
    const { language, setLanguage, t } = useLanguage();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLangOpen, setIsLangOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    return (
        <section id="header">
            <Link to="/"><img src="/photos/logo.jpg" className="logo" alt="logo" /></Link>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div>
                    <ul id="navbar" className={isMenuOpen ? 'active' : ''}>
                        <li><Link to="/" className={location.pathname === '/' ? 'active' : ''}>{t('home')}</Link></li>
                        <li><Link to="/home" className={location.pathname === '/home' ? 'active' : ''}>{t('products')}</Link></li>
                        <li><Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>{t('about')}</Link></li>
                        <li><Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>{t('contact')}</Link></li>

                        <div className="language-switcher-container" onMouseLeave={() => setIsLangOpen(false)}>
                            <div className="current-lang" onClick={() => setIsLangOpen(!isLangOpen)}>
                                <span id="activeLang">{language.toUpperCase()}</span>
                            </div>

                            <div className={`language-dropdown ${isLangOpen ? 'show' : ''}`} id="langDropdown">
                                {['ua', 'ru', 'en'].map(lang => (
                                    <span
                                        key={lang}
                                        className={`lang-option ${language === lang ? 'active' : ''}`}
                                        onClick={() => {
                                            setLanguage(lang);
                                            setIsLangOpen(false);
                                        }}
                                    >
                                        {lang.toUpperCase()}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <li className="cart-container cart-icon" id="lg-bag" onClick={() => setIsCartOpen(true)} style={{cursor: 'pointer'}}>
                            <span className="material-symbols-outlined">shopping_bag</span>
                            <span id="cartCount">{cartCount}</span>
                        </li>
                        <a href="#" id="close" onClick={(e) => { e.preventDefault(); closeMenu(); }}>
                            <i className="material-symbols-outlined">close</i>
                        </a>
                    </ul>
                </div>
                <div id="mobile">
                    <li className="cart-container cart-icon" id="cartIcon" onClick={() => setIsCartOpen(true)} style={{cursor: 'pointer'}}>
                        <span className="material-symbols-outlined">shopping_bag</span>
                        <span id="cartCountMobile">{cartCount}</span>
                    </li>
                    <i id="bar" className="material-symbols-outlined" onClick={toggleMenu}>menu</i>
                </div>
            </div>
        </section>
    );
};

export default Header;
