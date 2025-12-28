// --- DEĞİŞKENLER ---
let allWords = [];
let lastSelectedWord = null;
let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
let isGreek = false;

const latinToGreekMap = {
    "a":"Α","A":"Α", "e":"Ε","E":"Ε", "i":"Ͱ","İ":"Ͱ", "n":"Ν","N":"Ν",
    "r":"Ρ","R":"Ρ", "l":"L","L":"L", "ı":"Ь","I":"Ь", "k":"Κ","K":"Κ",
    "d":"D","D":"D", "m":"Μ","M":"Μ", "t":"Τ","T":"Τ", "y":"R","Y":"R",
    "s":"S","S":"S", "u":"U","U":"U", "o":"Q","O":"Q", "b":"Β","B":"Β",
    "ş":"Ш","Ş":"Ш", "ü":"Υ","Ü":"Υ", "z":"Ζ","Z":"Ζ", "g":"G","G":"G",
    "ç":"C","Ç":"C", "ğ":"Γ","Ğ":"Γ", "v":"V","V":"V", "c":"J","C":"J",
    "h":"Η","H":"Η", "p":"Π","P":"Π", "ö":"Ω","Ö":"Ω", "f":"F","F":"F",
    "x":"Ψ","X":"Ψ", "j":"Σ","J":"Σ", "0":"θ"
};

const translations = {
    'tr': {
        'title': 'Orum Dili',
        'about_page_text': 'Çeviri',
        'feedback_button_text': 'Geri Bildirim',
        'search_placeholder': 'Veriler yükleniyor, lütfen bekleyin...',
        'search_ready': 'Kelime ara...',
        'about_title': 'Hoş Geldiniz',
        'about_text_1': 'Bu sözlük, Orum Diline ait kelimeleri ve kökenlerini keşfetmeniz için hazırlanmıştır. Bu dil, Anadolu Türkçesinin özleştirilmesiyle ve kolaylaştırılmasıyla oluşturulan yapay bir dildir.',
        'about_text_2': 'Geri bildiriminiz varsa "Geri Bildirim" butonunu kullanın.',
        'feedback_title': 'Geri Bildirim',
        'feedback_placeholder': 'Geri bildiriminizi buraya yazın...',
        'feedback_cancel': 'İptal',
        'feedback_send': 'Gönder',
        'synonyms_title': 'Eş Anlamlılar',
        'description_title': 'Açıklama',
        'example_title': 'Örnek',
        'etymology_title': 'Köken',
        'no_result': 'Sonuç bulunamadı'
    },
    'gr': {}
};

// --- TEMA YÖNETİMİ ---
function setupTheme() {
    const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');
    const themeToggleButton = document.getElementById('theme-toggle');

    if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        themeToggleLightIcon?.classList.remove('hidden');
    } else {
        themeToggleDarkIcon?.classList.remove('hidden');
    }

    themeToggleButton?.addEventListener('click', function() {
        themeToggleDarkIcon.classList.toggle('hidden');
        themeToggleLightIcon.classList.toggle('hidden');
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('color-theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('color-theme', 'dark');
        }
    });
}

// --- TEMEL FONKSİYONLAR ---

function normalizeString(str) {
    if (!str) return '';
    return str.toLocaleLowerCase('tr-TR');
}

function convertToGreek(text) {
    if (!text) return '';
    let convertedText = '';
    for (let char of text) {
        const greekChar = latinToGreekMap[char];
        convertedText += greekChar || char;
    }
    return convertedText;
}

function updateText(lang) {
    const textElements = document.querySelectorAll('[data-key]');
    textElements.forEach(el => {
        const key = el.getAttribute('data-key');
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
        } else if (lang === 'gr' && translations['tr'][key]) {
            el.textContent = convertToGreek(translations['tr'][key]);
        }
    });
}

async function fetchWords() {
    const sheetId = '1R01aIajx6dzHlO-KBiUXUmld2AEvxjCQkUTFGYB3EDM';
    const sheetName = 'Sözlük';
    const url = `https://opensheet.elk.sh/${sheetId}/${sheetName}`;
    const searchInput = document.getElementById('searchInput');

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Sunucu hatası');
        allWords = await response.json();
        
        // Veri yüklendiğinde arama barını aktifleştir
        searchInput.placeholder = isGreek ? convertToGreek(translations.tr.search_ready) : translations.tr.search_ready;
        console.log("Veriler başarıyla yüklendi.");
    } catch (error) {
        console.error('Veri çekilemedi:', error);
        searchInput.placeholder = "Hata: Veriler yüklenemedi.";
    }
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const suggestionsDiv = document.getElementById('suggestions');
    const resultDiv = document.getElementById('result');
    const welcomeBox = document.getElementById('welcome-box');

    searchInput.addEventListener('input', function () {
        const query = normalizeString(this.value.trim());

        if (!query) {
            suggestionsDiv.innerHTML = '';
            resultDiv.innerHTML = '';
            welcomeBox.classList.remove('hidden');
            return;
        }

        if (allWords.length === 0) return;

        const matches = [];
        allWords.forEach(row => {
            const mainWord = row.Sözcük || '';
            if (normalizeString(mainWord).startsWith(query)) {
                matches.push({ type: 'main', word: mainWord, data: row });
            }
        });
        displaySuggestions(matches, query);
    });
}

function displaySuggestions(matches, query) {
    const suggestionsDiv = document.getElementById('suggestions');
    const suggestionsContainer = document.getElementById('suggestions-container');
    suggestionsDiv.innerHTML = '';

    if (matches.length === 0) {
        suggestionsDiv.innerHTML = `<div class="p-4">${isGreek ? convertToGreek('Sonuç bulunamadı') : 'Sonuç bulunamadı'}</div>`;
        suggestionsContainer.classList.remove('hidden');
        return;
    }

    matches.slice(0, 10).forEach(match => {
        const div = document.createElement('div');
        div.className = 'suggestion cursor-pointer p-4 hover:bg-background-light dark:hover:bg-background-dark border-b border-subtle-light dark:border-subtle-dark';
        let text = match.word;
        if (isGreek) text = convertToGreek(text);
        div.innerHTML = `<span class="font-bold">${text}</span>`;
        div.addEventListener('mousedown', (e) => {
            e.preventDefault();
            selectWord(match.data);
        });
        suggestionsDiv.appendChild(div);
    });
    suggestionsContainer.classList.remove('hidden');
}

function selectWord(word) {
    document.getElementById('welcome-box').classList.add('hidden');
    document.getElementById('suggestions-container').classList.add('hidden');
    document.getElementById('searchInput').value = isGreek ? convertToGreek(word.Sözcük) : word.Sözcük;
    showResult(word);
}

function showResult(word) {
    const resultDiv = document.getElementById('result');
    const t = (key) => isGreek ? convertToGreek(translations.tr[key]) : translations.tr[key];
    const convert = (val) => isGreek ? convertToGreek(val) : val;

    resultDiv.innerHTML = `
        <div class="bg-subtle-light dark:bg-subtle-dark rounded-xl p-6 shadow-lg">
            <h2 class="text-3xl font-bold mb-4 text-primary">${convert(word.Sözcük)}</h2>
            <div class="space-y-4">
                ${word.Açıklama ? `<div><span class="font-bold">${t('description_title')}:</span> <p>${convert(word.Açıklama)}</p></div>` : ''}
            </div>
        </div>`;
}

function setupAlphabetToggle() {
    document.getElementById('alphabet-toggle').onclick = () => {
        isGreek = !isGreek;
        document.getElementById('alphabet-toggle-latin').classList.toggle('hidden');
        document.getElementById('alphabet-toggle-cyrillic').classList.toggle('hidden');
        updateText(isGreek ? 'gr' : 'tr');
        const searchInput = document.getElementById('searchInput');
        if (allWords.length > 0) {
            searchInput.placeholder = isGreek ? convertToGreek(translations.tr.search_ready) : translations.tr.search_ready;
        }
    };
}

function toggleFeedbackForm() {
    document.getElementById('feedbackModal').classList.toggle('hidden');
}

function toggleMobileMenu() {
    document.getElementById('mobile-menu').classList.toggle('hidden');
}

function init() {
    setupTheme();
    setupAlphabetToggle();
    setupSearch();
    updateText('tr');
    fetchWords();
}

init();
