document.addEventListener('DOMContentLoaded', () => {
    const languageSwitcher = document.querySelector('.language-switcher');
    let currentLanguage = 'ua'; // Default language

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

    function updateLanguageSwitcher() {
        document.querySelectorAll('.lang-option').forEach(option => {
            if (option.getAttribute('data-lang') === currentLanguage) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
    }

    languageSwitcher.addEventListener('click', (event) => {
        if (event.target.classList.contains('lang-option')) {
            const lang = event.target.getAttribute('data-lang');
            if (lang !== currentLanguage) {
                loadLanguage(lang);
            }
        }
    });

    // Load default language
    loadLanguage(currentLanguage);
});
