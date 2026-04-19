import React, { createContext, useState, useEffect, useContext } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(localStorage.getItem('language') || 'ua');
    const [translations, setTranslations] = useState({});

    useEffect(() => {
        const loadLanguage = async () => {
            try {
                const response = await fetch(`/locales/${language}.json`);
                if (!response.ok) {
                    console.error(`Could not load ${language}.json`);
                    return;
                }
                const data = await response.json();
                setTranslations(data);
                localStorage.setItem('language', language);
            } catch (error) {
                console.error('Error loading language file:', error);
            }
        };

        loadLanguage();
    }, [language]);

    const t = (key) => {
        return translations[key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};
