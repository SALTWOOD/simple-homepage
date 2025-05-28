const defaultLanguage = 'zh-CN';
const availableLanguages = ['zh-CN', 'zh-TW', 'en'];
let fallback = null;

function getTranslated(resources, key) {
    return resources ? resources[key] : (fallback[key]) || key;
}

function getCurrentLanguage() {
    const savedLang = localStorage.getItem('ui.language');
    const browserLang = navigator.language;
    return savedLang || browserLang;
}

async function loadLanguage(lang) {
    let resources;
    if (lang) {
        try {
            const response = await import(`/lang/${lang}.js`);
            resources = await response.json();
            document.getElementById("something-hidden").style.display = "none";
        } catch (error) {
            console.error(`Failed to load ${lang}:`, error);
            resources = null;
        }
    }

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.innerHTML = getTranslated(resources, key);
    });

    if (!resources) document.getElementById("something-hidden").style.display = "block";
    document.title = await getTranslated(resources, "title");
    document.documentElement.lang = resources ? lang : defaultLanguage;
}

async function initI18n() {
    if (fallback === null) {
        try {
            fallback = (await import(`/lang/${defaultLanguage}.js`)).json();
        } catch (error) {
            fallback = {};
        }
    }
    await loadLanguage(getCurrentLanguage());
}

function toggleLanguage() {
    const currentLang = getCurrentLanguage();
    let currentIndex = availableLanguages.indexOf(currentLang);

    if (currentIndex === -1) {
        currentIndex = availableLanguages.indexOf(defaultLanguage);
        if (currentIndex === -1) currentIndex = 0;
    }

    currentIndex = (currentIndex + 1) % availableLanguages.length;
    changeLanguage(availableLanguages[currentIndex]);
}

window.changeLanguage = async (lang) => {
    localStorage.setItem('ui.language', lang);
    await loadLanguage(lang);
};

initI18n();