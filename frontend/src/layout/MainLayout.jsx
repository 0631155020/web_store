import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CartModal from '../components/CartModal';

const MainLayout = ({ children }) => {
    return (
        <>
            <Header />
            {children}
            <Footer />
            <CartModal />
        </>
    );
};

export default MainLayout;
