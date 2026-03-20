document.addEventListener('DOMContentLoaded', () => {
    const languageSwitcher = document.querySelector('.language-switcher-container');
    let currentLanguage = 'ua'; // Default language

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
    }

    async function loadLanguage(lang) {
        try {
            const response = await fetch(`/static/locales/${lang}.json`);
            if (!response.ok) {
                console.error(`Could not load ${lang}.json`);
                return;
            }
            const translations = await response.json();
            applyTranslations(translations);
            currentLanguage = lang;
            updateLanguageSwitcher();
        } catch (error) {
            console.error('Error loading language file:', error);
        }
    }

    function applyTranslations(translations) {
        window.i18nTranslations = translations;
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
    }

    // Expose a global method to translate newly created elements
    window.applyTranslations = function() {
        if (window.i18nTranslations) {
            applyTranslations(window.i18nTranslations);
        }
    };

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
