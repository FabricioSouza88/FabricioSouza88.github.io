const I18n = {
    translations: {},
    currentLang: '',
    fallbackLanguage: 'en',

    async loadConfig() {
        try {
            const response = await fetch('../config.json');
            const config = await response.json();
            this.fallbackLanguage = config.fallbackLanguage || this.fallbackLanguage;
            this.currentLang = this.fallbackLanguage;
            this.init();
        } catch (error) {
            console.error("Error on load config file:", error);
            this.init();
        }
    },

    async loadLanguage(lang) {
        try {
            const response = await fetch(`lang/${lang}/translations.json`);
            this.translations = await response.json();
            this.currentLang = lang;
            this.updatePage();
            this.selectLanguageBtn(lang);
            localStorage.setItem('lang', lang);
        } catch (error) {
            console.error(`Error on load language ${lang}:`, error);
            if (lang !== this.fallbackLanguage) {
                console.log(`Loading fallbackLanguage: ${this.fallbackLanguage}`);
                this.loadLanguage(this.fallbackLanguage);
            }
        }
    },

    updatePage() {
        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.getAttribute("data-i18n");
            if (this.translations[key]) {
                el.textContent = this.translations[key];
            }
        });
    },

    selectLanguageBtn(lang) {
        // Remove a classe 'active' de todos os botões
        document.querySelectorAll('.language-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Adiciona a classe 'active' ao botão selecionado
        const btn = document.querySelector('.language-btn.' + lang.toLowerCase());
        if (btn) btn.classList.add('active');
    },

    getNavigatorLang() {
        return navigator.language.split('-')[0];
    },

    init() {
        const savedLang = localStorage.getItem('lang') || this.fallbackLanguage;
        this.loadLanguage(savedLang);
    }
};

document.addEventListener("DOMContentLoaded", () => I18n.loadConfig());
