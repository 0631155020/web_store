document.addEventListener('DOMContentLoaded', () => {
    const languageSwitcher = document.querySelector('.language-switcher-container');

    // Load saved language or default to 'ua'
    let currentLanguage = localStorage.getItem('language') || 'ua';
    window.currentLanguage = currentLanguage;

    if (languageSwitcher) {
        const currentLang = languageSwitcher.querySelector('.current-lang');
        const langDropdown = languageSwitcher.querySelector('.language-dropdown');
        const langOptions = langDropdown.querySelectorAll('.lang-option');
        const activeLangDisplay = languageSwitcher.querySelector('#activeLang');

        currentLang.addEventListener('click', function() {
            langDropdown.classList.toggle('show');
        });

        langOptions.forEach(option => {
            option.addEventListener('click', function() {
                const lang = this.getAttribute('data-lang');
                localStorage.setItem('language', lang); // Save selected language
                loadLanguage(lang);
                activeLangDisplay.textContent = lang.toUpperCase();
                langDropdown.classList.remove('show');
            });
        });

        window.addEventListener('click', function(e) {
            if (!e.target.closest('.language-switcher-container')) {
                if (langDropdown.classList.contains('show')) {
                    langDropdown.classList.remove('show');
                }
            }
        });

        // Init active lang display on load
        if (activeLangDisplay) {
            activeLangDisplay.textContent = currentLanguage.toUpperCase();
        }
    }

    async function loadLanguage(lang) {
        try {
            const response = await fetch(`/static/locales/${lang}.json`);
            if (!response.ok) {
                console.error(`Could not load ${lang}.json`);
                return;
            }
            const translations = await response.json();
            window.translations = translations; // Expose translations globally
            window.currentLanguage = lang;

            applyTranslations(translations);
            updateLanguageSwitcher();

            // Dispatch event to let other components know translations are ready
            window.dispatchEvent(new Event('languageLoaded'));
        } catch (error) {
            console.error('Error loading language file:', error);
        }
    }

    function applyTranslations(translations) {
        document.querySelectorAll('[data-i18n-key]').forEach(element => {
            const key = element.getAttribute('data-i18n-key');
            if (translations[key]) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = translations[key];
                } else {
                    element.textContent = translations[key];
                }
            }
        });

        // Need to update the currency dynamically where it's hardcoded in HTML
        const currencyElements = document.querySelectorAll('.currency-display');
        currencyElements.forEach(el => {
             el.textContent = translations['currency'] || 'UAH';
        });
    }

    function updateLanguageSwitcher() {
        document.querySelectorAll('.lang-option').forEach(option => {
            if (option.getAttribute('data-lang') === currentLanguage) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
    }

    // Load default language
    loadLanguage(currentLanguage);
});

// Helper function to get translation
window.t = function(key) {
    if (window.translations && window.translations[key]) {
        return window.translations[key];
    }
    return key; // Fallback to key if translation not found
};
