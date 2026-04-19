import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
    const { t } = useLanguage();
    return (
        <footer className="section-p1">
            <div className="col">
                <img className="logo" src="/photos/logo.jpg" alt="logo" />
                <h4>{t('contact')}</h4>
                <p><strong>{t('address')}:</strong> 123 Pajama Street, Sleepy Town, ZZZ</p>
                <p><strong>{t('phone')}:</strong> +380 (12) 345 67 89</p>
                <p><strong>{t('hours')}:</strong> 10:00 - 18:00, Mon - Sat</p>
                <div className="follow">
                    <h4>{t('followUs')}</h4>
                    <div className="icon">
                        <i className="fab fa-instagram"></i>
                    </div>
                </div>
            </div>

            <div className="col">
                <h4>{t('about')}</h4>
                <a href="/about">{t('aboutUs')}</a>
                <a href="#">{t('deliveryInfo')}</a>
                <a href="#">{t('privacyPolicy')}</a>
                <a href="#">{t('termsAndConditions')}</a>
                <a href="/contact">{t('contactUs')}</a>
            </div>

            <div className="col">
                <h4>{t('myAccount')}</h4>
                <a href="#">{t('signIn')}</a>
                <a href="/cart">{t('viewCart')}</a>
                <a href="#">{t('myWishlist')}</a>
                <a href="#">{t('trackMyOrder')}</a>
                <a href="#">{t('help')}</a>
            </div>

            <div className="copyright">
                <p>© 2024, Pajama Dream - React Frontend</p>
            </div>
        </footer>
    );
};

export default Footer;
