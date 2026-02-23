// --- TEMA YÖNETİMİ ---
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
    if (localStorage.getItem('color-theme') === 'light') {
        document.documentElement.classList.add('dark');
        localStorage.setItem('color-theme', 'dark');
    } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('color-theme', 'light');
    }
});

// --- DEĞİŞKENLER VE AYARLAR ---
let allWords = [];
let lastSelectedWord = null;
let lastClickedText = ""; 
let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
let isGreek = false;

// Harf Listesi (V ve Y arasına X eklendi)
const customAlphabet = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVX YZ".split("");

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
        'title': 'Orum Dili', 'about_page_text': 'Çeviri', 'feedback_button_text': 'Geri Bildirim',
        'search_placeholder': 'Kelime ara...', 'about_title': 'Hoş Geldiniz',
        'about_text_1': 'Bu sözlük, Orum Diline ait kelimeleri ve kökenlerini keşfetmeniz için hazırlanmıştır. Anadolu Türkçesinin özleştirilmesi ve kolaylaştırılmasıyla oluşturulan bir yapay dildir.',
        'about_text_2': 'Herhangi bir geri bildiriminiz varsa lütfen bize ulaşın.',
        'feedback_title': 'Geri Bildirim', 'feedback_placeholder': 'Geri bildiriminizi buraya yazın...',
        'feedback_cancel': 'İptal', 'feedback_send': 'Gönder',
        'synonyms_title': 'Eş Anlamlılar', 'description_title': 'Açıklama',
        'example_title': 'Örnek', 'etymology_title': 'Köken', 'no_result': 'Sonuç bulunamadı'
    }
};

function normalizeString(str) {
    if (!str) return '';
    return str.toLocaleLowerCase('tr-TR');
}

function convertToGreek(text) {
    if (!text) return '';
    let res = '';
    for (let c of text) { res += latinToGreekMap[c] || c; }
    return res;
}

function updateText(lang) {
    const textElements = document.querySelectorAll('[data-key]');
    textElements.forEach(el => {
        const key = el.getAttribute('data-key');
        if (translations['tr'][key]) {
            let finalStr = translations['tr'][key];
            if (lang === 'gr') finalStr = convertToGreek(finalStr);
            
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = finalStr;
            } else {
                el.textContent = finalStr;
            }
        }
    });
}

function calculateStats() {
    const statsSentence = document.getElementById('stats-sentence');
    if (!statsSentence) return;
    const validEntries = allWords.filter(row => row.Sözcük && row.Sözcük.trim() !== "");
    const entryCount = validEntries.length;
    let sentence = `Şu an bu sözlükte ${entryCount} madde bulunmaktadır.`;
    if (isGreek) sentence = convertToGreek(sentence);
    statsSentence.innerHTML = sentence.replace(entryCount, `<span class="text-primary font-bold">${entryCount}</span>`);
}

async function fetchWords() {
    const url = `https://opensheet.elk.sh/1R01aIajx6dzHlO-KBiUXUmld2AEvxjCQkUTFGYB3EDM/Sözlük`;
    try {
        const response = await fetch(url);
        allWords = await response.json();
        
        createAlphabetMenu(); // Harf menüsü oluşturma
        setupSearch();
        setupAlphabetToggle();
        showPage('home');
        updateText('tr');
        calculateStats();
    } catch (error) { console.error('Hata:', error); }
}

// --- HARF MENÜSÜ SİSTEMİ ---
function createAlphabetMenu() {
    const desktopNav = document.getElementById('desktop-alphabet-nav');
    const mobileNav = document.getElementById('mobile-alphabet-nav');
    
    [desktopNav, mobileNav].forEach(nav => {
        if(!nav) return;
        nav.innerHTML = "";
        customAlphabet.forEach(harf => {
            if(harf === " ") return;
            const btn = document.createElement('button');
            btn.className = "w-6 h-6 flex items-center justify-center rounded text-xs font-bold hover:bg-primary hover:text-white transition-colors bg-subtle-dark/10 dark:bg-subtle-light/10";
            btn.innerText = isGreek ? convertToGreek(harf) : harf;
            btn.onclick = () => showWordsByLetter(harf);
            nav.appendChild(btn);
        });
    });
}

function showWordsByLetter(harf) {
    const container = document.getElementById('letter-results-container');
    const grid = document.getElementById('letter-words-grid');
    const title = document.getElementById('current-letter-title');
    
    // UI Temizliği
    document.getElementById('welcome-box').classList.add('hidden');
    document.getElementById('stats-card').classList.add('hidden');
    document.getElementById('result').innerHTML = ""; 
    document.getElementById('mobile-menu').classList.add('hidden');
    
    title.innerText = isGreek ? convertToGreek(harf) : harf;
    grid.innerHTML = "";
    container.classList.remove('hidden');

    const filtered = allWords.filter(w => w.Sözcük && normalizeString(w.Sözcük).startsWith(normalizeString(harf)));

    if (filtered.length === 0) {
        grid.innerHTML = `<p class="col-span-full opacity-50 italic">Kayıt yok.</p>`;
    } else {
        filtered.sort((a,b) => a.Sözcük.localeCompare(b.Sözcük, 'tr')).forEach(item => {
            const wordBtn = document.createElement('button');
            wordBtn.className = "text-left p-2 text-sm rounded border border-subtle-light dark:border-subtle-dark hover:bg-primary/10 transition-all";
            wordBtn.innerText = isGreek ? convertToGreek(item.Sözcük) : item.Sözcük;
            wordBtn.onclick = () => selectWord(item, item.Sözcük, "");
            grid.appendChild(wordBtn);
        });
    }
}

function closeLetterView() {
    document.getElementById('letter-results-container').classList.add('hidden');
    document.getElementById('welcome-box').classList.remove('hidden');
    document.getElementById('stats-card').classList.remove('hidden');
}

// --- MEVCUT FONKSİYONLARIN DEVAMI ---
function showPage(pageId) { if (pageId === 'home') clearResult(); }

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', function () {
        const query = normalizeString(this.value.trim());
        if (!query) {
            document.getElementById('suggestions').innerHTML = '';
            document.getElementById('result').innerHTML = '';
            document.getElementById('welcome-box').classList.remove('hidden');
            document.getElementById('stats-card').classList.remove('hidden');
            displaySearchHistory();
            return;
        }
        document.getElementById('letter-results-container').classList.add('hidden');
        const matches = [];
        allWords.filter(row => row.Sözcük).forEach(row => {
            if (normalizeString(row.Sözcük).startsWith(query)) {
                matches.push({ type: 'main', primary: row.Sözcük, secondary: '', data: row });
            }
        });
        displaySuggestions(matches);
    });
}

function displaySuggestions(matches) {
    const suggestionsDiv = document.getElementById('suggestions');
    const container = document.getElementById('suggestions-container');
    suggestionsDiv.innerHTML = '';
    if (matches.length === 0) {
        suggestionsDiv.innerHTML = `<div class="p-4 text-sm opacity-50">Sonuç yok</div>`;
        container.classList.remove('hidden');
        return;
    }
    matches.slice(0, 10).forEach(match => {
        const div = document.createElement('div');
        div.className = 'suggestion cursor-pointer p-4 hover:bg-background-light dark:hover:bg-background-dark border-b border-subtle-light dark:border-subtle-dark';
        div.innerHTML = `<span class="font-bold">${isGreek ? convertToGreek(match.primary) : match.primary}</span>`;
        div.addEventListener('mousedown', () => selectWord(match.data, match.primary, ''));
        suggestionsDiv.appendChild(div);
    });
    container.classList.remove('hidden');
}

function selectWord(wordData, pText, sText) {
    lastSelectedWord = wordData;
    lastClickedText = pText;
    document.getElementById('welcome-box').classList.add('hidden');
    document.getElementById('stats-card').classList.add('hidden');
    document.getElementById('searchInput').value = isGreek ? convertToGreek(pText) : pText;
    document.getElementById('suggestions-container').classList.add('hidden');
    showResult(wordData);
}

function showResult(word) {
    const resultDiv = document.getElementById('result');
    const convert = (val) => isGreek ? convertToGreek(val) : val;
    resultDiv.innerHTML = `
        <div class="bg-subtle-light dark:bg-subtle-dark rounded-xl p-6 shadow-md border border-primary/20">
            <h2 class="text-4xl font-bold text-primary mb-4">${convert(word.Sözcük)}</h2>
            <div class="space-y-4">
                ${word.Açıklama ? `<div><h3 class="text-primary font-bold">Açıklama</h3><p>${convert(word.Açıklama)}</p></div>` : ''}
                ${word.Köken ? `<div><h3 class="text-primary font-bold">Köken</h3><p>${convert(word.Köken)}</p></div>` : ''}
            </div>
        </div>`;
}

function clearResult() {
    document.getElementById('result').innerHTML = '';
    document.getElementById('searchInput').value = '';
    document.getElementById('letter-results-container').classList.add('hidden');
    document.getElementById('welcome-box').classList.remove('hidden');
    document.getElementById('stats-card').classList.remove('hidden');
}

function setupAlphabetToggle() {
    document.getElementById('alphabet-toggle').onclick = () => {
        isGreek = !isGreek;
        document.getElementById('alphabet-toggle-latin').classList.toggle('hidden');
        document.getElementById('alphabet-toggle-cyrillic').classList.toggle('hidden');
        createAlphabetMenu();
        updateText(isGreek ? 'gr' : 'tr');
        if (lastSelectedWord) showResult(lastSelectedWord);
    };
}

function toggleFeedbackForm() { document.getElementById('feedbackModal').classList.toggle('hidden'); }
function submitFeedback() { toggleFeedbackForm(); }
function toggleMobileMenu() { document.getElementById('mobile-menu').classList.toggle('hidden'); }

fetchWords();
