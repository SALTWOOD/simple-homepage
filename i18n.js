const defaultLanguage = 'zh-CN';
const availableLanguages = ['zh-CN', 'zh-TW', 'en'];

function createMojibake(str) {
    const utf8Bytes = new TextEncoder().encode(str);
    return new TextDecoder('latin1').decode(utf8Bytes);
}

function getCurrentLanguage() {
    const savedLang = localStorage.getItem('ui.language');
    const browserLang = navigator.language;
    return savedLang || browserLang;
}

async function loadLanguage(lang) {
    let resources;
    try {
        const response = await fetch(`/lang/${lang}.json`);
        if (!response.ok) throw new Error('Network response was not ok');
        resources = await response.json();
        document.getElementById("something-hidden").style.display = "none";
    } catch (error) {
        console.error(`Failed to load ${lang}:`, error);
        
        if (lang !== defaultLanguage) {
            try {
                const defaultResponse = await fetch(`/lang/${defaultLanguage}.json`);
                resources = await defaultResponse.json();
                localStorage.setItem('ui.language', defaultLanguage);
                document.getElementById("something-hidden").style.display = "none";
            } catch (defaultError) {
                console.error('Failed to load default language:', defaultError);
                document.getElementById("something-hidden").style.display = "block";
                resources = {};
            }
        } else {
            document.getElementById("something-hidden").style.display = "block";
            resources = {};
        }
    }

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.innerHTML = resources[key] || createMojibake(key);
    });
    
    document.title = resources.title || createMojibake('title');
    document.documentElement.lang = resources ? lang : defaultLanguage;
}

async function initI18n() {
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