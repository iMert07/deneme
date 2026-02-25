// --- DEĞİŞKENLER VE AYARLAR ---
let allWords = [];
let lastSelectedWord = null;
let isGreek = false;
let currentSelectedLetter = null;
let sortConfig = { key: 'harf', direction: 'asc' }; 
let etySortConfig = { key: 'label', direction: 'asc' }; 
let searchHistory = JSON.parse(localStorage.getItem('orum_history')) || [];

const PAGE_SIZE = 36;
const customAlphabet = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVXYZ".split("");
const latinToGreekMap = { "a":"Α","A":"Α", "e":"Ε","E":"Ε", "i":"Ͱ","İ":"Ͱ", "n":"Ν","N":"Ν", "r":"Ρ","R":"Ρ", "l":"L","L":"L", "ı":"Ь","I":"Ь", "k":"Κ","Κ":"Κ", "d":"D","D":"D", "m":"Μ","M":"Μ", "t":"Τ","T":"Τ", "y":"R","Y":"R", "s":"S","S":"S", "u":"U","U":"U", "o":"Q","Q":"Q", "b":"Β","B":"Β", "ş":"Ш","Ş":"Ш", "ü":"Υ","Ü":"Υ", "z":"Ζ","Z":"Ζ", "g":"G","G":"G", "ç":"C","Ç":"C", "ğ":"Γ","Ğ":"Γ", "v":"V","V":"V", "c":"J","C":"J", "h":"Η","H":"Η", "p":"Π","P":"Π", "ö":"Ω","Ö":"Ω", "f":"F","F":"F", "x":"Ψ","X":"Ψ", "j":"Σ","J":"Σ" };

const translations = { 
    'tr': { 
        'title': 'Orum Dili', 'nav_words': 'Kelimeler', 'nav_stats': 'Harf Dağılımı', 'nav_ety': 'Köken Dağılımı',
        'about_page_text': 'Çeviri', 'feedback_button_text': 'Geri Bildirim', 
        'search_placeholder': 'Kelime ara...', 'about_title': 'Hoş Geldiniz', 
        'about_text_1': 'Bu sözlük, Orum Diline ait kelimeleri ve kökenlerini keşfetmeniz için hazırlanmıştır.',
        'about_text_2': 'Herhangi bir geri bildiriminiz varsa lütfen bize ulaşın.',
        'feedback_title': 'Geri Bildirim', 'feedback_placeholder': 'Mesajınız...', 
        'feedback_cancel': 'İptal', 'feedback_send': 'Gönder', 
        'synonyms_title': 'Eş Anlamlılar', 'description_title': 'Açıklama', 
        'example_title': 'Örnek', 'etymology_title': 'Köken', 'no_result': 'Sonuç bulunamadı' 
    } 
};

// --- 1. ETKİLEŞİMLİ BUTONLAR ---
function initButtons() {
    ['theme-toggle', 'alphabet-toggle'].forEach(id => {
        const btn = document.getElementById(id);
        if(btn) {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
        }
    });

    document.getElementById('theme-toggle')?.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('color-theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
        updateThemeIcons();
    });

    document.getElementById('alphabet-toggle')?.addEventListener('click', () => {
        isGreek = !isGreek;
        document.getElementById('alphabet-toggle-latin')?.classList.toggle('hidden', isGreek);
        document.getElementById('alphabet-toggle-cyrillic')?.classList.toggle('hidden', !isGreek);
        updateText(isGreek ? 'gr' : 'tr');
        calculateStats();
        if (lastSelectedWord) showResult(lastSelectedWord);
        if (!document.getElementById('alphabet-section').classList.contains('hidden')) renderAlphabet();
    });
    updateThemeIcons();
}

function updateThemeIcons() {
    const isDark = document.documentElement.classList.contains('dark');
    document.getElementById('theme-toggle-dark-icon')?.classList.toggle('hidden', isDark);
    document.getElementById('theme-toggle-light-icon')?.classList.toggle('hidden', !isDark);
}

// --- 2. GEÇMİŞ VE ÖNERİLER (TAM BEYAZ TASARIM) ---
function addToHistory(wordData, clickedText, subText = null) {
    searchHistory = searchHistory.filter(h => h.clickedText !== clickedText);
    searchHistory.unshift({ wordData, clickedText, subText });
    if (searchHistory.length > 12) searchHistory.pop();
    localStorage.setItem('orum_history', JSON.stringify(searchHistory));
}

function renderHistory() {
    const div = document.getElementById('suggestions');
    const cont = document.getElementById('suggestions-container');
    div.innerHTML = '';
    if (searchHistory.length === 0) return;
    searchHistory.forEach(item => {
        const d = document.createElement('div');
        d.className = 'suggestion cursor-pointer p-4 bg-white dark:bg-subtle-dark hover:bg-background-light dark:hover:bg-background-dark border-b border-subtle-light dark:border-subtle-dark last:border-b-0 select-none flex items-baseline gap-2';
        const display = isGreek ? convertToGreek(item.clickedText) : item.clickedText;
        const subDisplay = item.subText ? (isGreek ? convertToGreek(item.subText) : item.subText) : '';
        d.innerHTML = `<span class="font-bold text-foreground-light dark:text-foreground-dark opacity-70">${display}</span>${item.subText ? `<span class="opacity-50 ml-2 text-sm text-muted-light dark:text-muted-dark">${subDisplay}</span>` : ''}`;
        d.onclick = () => selectWord(item.wordData, item.clickedText, false, item.subText, false);
        div.appendChild(d);
    });
    cont.classList.remove('hidden');
}

// --- 3. ARAMA MANTIĞI ---
function setupSearch() {
    const input = document.getElementById('searchInput');
    const container = document.getElementById('suggestions-container');

    input?.addEventListener('focus', () => { if (!input.value.trim()) renderHistory(); });

    input?.addEventListener('input', function () {
        const q = normalizeString(this.value.trim());
        if (!q) { renderHistory(); return; }
        
        const matches = allWords.filter(row => {
            const sozcuk = normalizeString(row.Sözcük || "");
            const bilimsel = normalizeString(row.Bilimsel || "");
            const esAnlam = normalizeString(row['Eş Anlamlılar'] || "");
            const synArray = esAnlam.split(',').map(s => s.trim());
            return sozcuk.startsWith(q) || bilimsel.startsWith(q) || synArray.some(s => s.startsWith(q));
        });
        
        displaySuggestions(matches, q);
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.relative')) container.classList.add('hidden');
    });
}

function displaySuggestions(matches, q) {
    const div = document.getElementById('suggestions');
    const cont = document.getElementById('suggestions-container');
    div.innerHTML = '';
    if (matches.length === 0) { 
        div.innerHTML = `<div class="p-4 text-sm opacity-50 bg-white dark:bg-subtle-dark border-b border-subtle-light dark:border-subtle-dark">Sonuç bulunamadı</div>`; 
        cont.classList.remove('hidden'); return; 
    }
    
    matches.slice(0, 15).forEach(m => {
        const d = document.createElement('div');
        d.className = 'suggestion cursor-pointer p-4 bg-white dark:bg-subtle-dark border-b border-subtle-light dark:border-subtle-dark last:border-b-0 select-none flex items-baseline gap-2 hover:bg-background-light dark:hover:bg-background-dark';
        
        let displayMain = m.Sözcük;
        let displaySub = "";
        const sozcuk = normalizeString(m.Sözcük || "");
        const bilimsel = normalizeString(m.Bilimsel || "");

        if (!sozcuk.startsWith(q)) {
            if (bilimsel.startsWith(q)) {
                displayMain = m.Bilimsel; displaySub = m.Sözcük;
            } else {
                const foundSyn = m['Eş Anlamlılar']?.split(',').map(s => s.trim()).find(s => normalizeString(s).startsWith(q));
                if(foundSyn) { displayMain = foundSyn; displaySub = m.Sözcük; }
            }
        }

        const mainText = isGreek ? convertToGreek(displayMain) : displayMain;
        const subText = displaySub ? (isGreek ? convertToGreek(displaySub) : displaySub) : "";

        d.innerHTML = `<span class="font-bold text-foreground-light dark:text-foreground-dark">${mainText}</span>${subText ? `<span class="opacity-50 ml-2 text-sm text-muted-light dark:text-muted-dark">${subText}</span>` : ''}`;
        d.onclick = () => selectWord(m, displayMain, false, displaySub, false);
        div.appendChild(d);
    });
    cont.classList.remove('hidden');
}

function selectWord(wordData, pText, forceNoHistory = false, subText = null, isFromAlphabet = false) { 
    lastSelectedWord = wordData; 
    document.getElementById('searchInput').value = isGreek ? convertToGreek(pText) : pText; 
    document.getElementById('suggestions-container').classList.add('hidden'); 
    
    if (!forceNoHistory) addToHistory(wordData, pText, subText);
    
    hideAllSections(); // Bu işlem alfabetik listeyi (alphabet-section) kapatır.
    showResult(wordData); 

    if (isFromAlphabet) {
        // Alfabeden seçilirse aşağı kaydır
        setTimeout(() => { document.getElementById('result')?.scrollIntoView({ behavior: 'smooth' }); }, 100); 
    } else {
        // Aramadan seçilirse en üste odakla
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// --- 4. SAYFA YÖNETİMİ ---
function hideAllSections() {
    ['welcome-box', 'stats-card', 'alphabet-section', 'stats-section', 'ety-section'].forEach(id => {
        document.getElementById(id)?.classList.add('hidden');
    });
}

function showPage(pageId) {
    if (pageId === 'home') {
        hideAllSections();
        document.getElementById('welcome-box').classList.remove('hidden');
        document.getElementById('stats-card').classList.remove('hidden');
        document.getElementById('result').innerHTML = '';
        window.scrollTo({ top: 0 });
    }
}

function showKelimelerPage() { 
    hideAllSections(); 
    document.getElementById('alphabet-section').classList.remove('hidden'); 
    document.getElementById('result').innerHTML = '';
    currentSelectedLetter = "A"; 
    renderAlphabet(); 
    showLetterResults("A", 0); 
}

function showResult(word) {
    const resultDiv = document.getElementById('result');
    const convert = (val) => isGreek ? convertToGreek(val) : val;
    // Örnek kısmındaki italik (italic) kaldırıldı.
    resultDiv.innerHTML = `<div class="bg-subtle-light dark:bg-subtle-dark rounded-xl overflow-hidden p-6 shadow-md border border-subtle-light dark:border-subtle-dark mt-8"><div class="mb-5"><h2 class="text-4xl font-bold text-primary">${convert(word.Sözcük)}</h2>${word.Bilimsel ? `<p class="text-base text-muted-light dark:text-muted-dark opacity-70 mt-1">${convert(word.Bilimsel)}</p>` : ''}</div><hr class="border-t border-subtle-light dark:border-subtle-dark my-5"><div class="space-y-6">${word.Açıklama ? `<div><h3 class="text-primary font-bold text-lg mb-1">Açıklama</h3><p class="text-base">${convert(word.Açıklama)}</p></div>` : ''}${word.Örnek ? `<div><h3 class="text-primary font-bold text-lg mb-1">Örnek</h3><p class="text-base border-l-4 border-primary/40 pl-4 py-1">${convert(word.Örnek)}</p></div>` : ''}</div></div>`;
}

// --- 6. ALFABETİK LİSTE ---
function renderAlphabet() {
    const list = document.getElementById('alphabet-list'); if (!list) return;
    list.innerHTML = "";
    customAlphabet.forEach(harf => {
        if(harf === " ") return;
        const btn = document.createElement('button');
        const isActive = currentSelectedLetter === harf;
        btn.className = `w-10 h-10 flex items-center justify-center font-bold rounded transition-all ${isActive ? 'bg-primary text-white scale-110' : 'bg-subtle-light/50 dark:bg-subtle-dark'}`;
        btn.innerText = isGreek ? convertToGreek(harf) : harf;
        btn.onclick = () => { currentSelectedLetter = harf; renderAlphabet(); showLetterResults(harf, 0); };
        list.appendChild(btn);
    });
}

function showLetterResults(harf, page) {
    const resultsDiv = document.getElementById('letter-results');
    resultsDiv.innerHTML = "";
    const filtered = allWords.filter(w => w.Sözcük && normalizeString(w.Sözcük).startsWith(normalizeString(harf))).sort((a,b) => a.Sözcük.localeCompare(b.Sözcük, 'tr'));
    
    filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).forEach(item => {
        const b = document.createElement('button');
        b.className = "text-left p-3 rounded border border-subtle-light dark:border-subtle-dark font-semibold text-sm";
        b.innerText = isGreek ? convertToGreek(item.Sözcük) : item.Sözcük;
        b.onclick = () => selectWord(item, item.Sözcük, true, null, true); // true parametresi aşağı kaydırmayı tetikler
        resultsDiv.appendChild(b);
    });
}

function calculateStats() { /* İstatistik kodları... */ }
function normalizeString(str) { return str ? str.toLocaleLowerCase('tr-TR') : ''; }
function convertToGreek(str) { if(!str) return ""; return str.split('').map(char => latinToGreekMap[char] || char).join(''); }
function updateText(lang) { /* Çeviri kodları... */ }

async function fetchWords() { 
    const url = `https://opensheet.elk.sh/1R01aIajx6dzHlO-KBiUXUmld2AEvxjCQkUTFGYB3EDM/Sözlük`; 
    try { 
        const res = await fetch(url); allWords = await res.json(); 
        initButtons(); setupSearch();
    } catch (e) { console.error(e); } 
}
fetchWords();
