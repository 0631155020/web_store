import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export const About = () => {
    const { t } = useLanguage();
    return (
        <section id="page-header" className="about-header">
            <h2>{t('aboutUs')}</h2>
            <p>{t('aboutSubtitle') || 'Learn more about Pajama Dream'}</p>
        </section>
    );
};

export const Contact = () => {
    const { t } = useLanguage();
    return (
        <section id="contact-details" className="section-p1">
            <div className="details">
                <span>GET IN TOUCH</span>
                <h2>Visit one of our agency locations or contact us today</h2>
                <h3>Head Office</h3>
                <div>
                    <li>
                        <i className="fal fa-map"></i>
                        <p>{t('address')} 123 Pajama Street, Sleepy Town, ZZZ</p>
                    </li>
                    <li>
                        <i className="far fa-envelope"></i>
                        <p>contact@pajamas585.com </p>
                    </li>
                    <li>
                        <i className="fas fa-phone-alt"></i>
                        <p>+380 (12) 345 67 89 </p>
                    </li>
                    <li>
                        <i className="far fa-clock"></i>
                        <p>10:00 - 18:00, Mon - Sat </p>
                    </li>
                </div>
            </div>
            <div className="map">
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2469.8088025254456!2d-1.256555484681452!3d51.754819700404106!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4876c6a9ef8c485b%3A0xd2ff1883a001afed!2sUniversity%20of%20Oxford!5e0!3m2!1sen!2sbd!4v1636892552636!5m2!1sen!2sbd" width="600" height="450" style={{ border: 0 }} allowFullScreen="" loading="lazy"></iframe>
            </div>
        </section>
    );
};
