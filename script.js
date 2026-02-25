// --- DEĞİŞKENLER VE AYARLAR ---
let allWords = [];
let lastSelectedWord = null;
let isGreek = false;
let currentSelectedLetter = null;
let sortConfig = { key: 'harf', direction: 'asc' }; 
let etySortConfig = { key: 'label', direction: 'asc' }; 
let searchHistory = JSON.parse(localStorage.getItem('orum_history')) || [];

const PAGE_SIZE = 36;
const customAlphabet = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVX YZ".split("");
const latinToGreekMap = { "a":"Α","A":"Α", "e":"Ε","E":"Ε", "i":"Ͱ","İ":"Ͱ", "n":"Ν","N":"Ν", "r":"Ρ","R":"Ρ", "l":"L","L":"L", "ı":"Ь","I":"Ь", "k":"Κ","Κ":"Κ", "d":"D","D":"D", "m":"Μ","M":"Μ", "t":"Τ","T":"Τ", "y":"R","Y":"R", "s":"S","S":"S", "u":"U","U":"U", "o":"Q","Q":"Q", "b":"Β","B":"Β", "ş":"Ш","Ş":"Ш", "ü":"Υ","Ü":"Υ", "z":"Ζ","Z":"Ζ", "g":"G","G":"G", "ç":"C","Ç":"C", "ğ":"Γ","Ğ":"Γ", "v":"V","V":"V", "c":"J","C":"J", "h":"Η","H":"Η", "p":"Π","P":"Π", "ö":"Ω","Ö":"Ω", "f":"F","F":"F", "x":"Ψ","X":"Ψ", "j":"Σ","J":"Σ" };

const translations = { 
    'tr': { 
        'title': 'Orum Dili', 'nav_words': 'Kelimeler', 'nav_stats': 'Harf Dağılımı', 'nav_ety': 'Köken Dağılımı',
        'about_page_text': 'Çeviri', 'feedback_button_text': 'Geri Bildirim', 
        'search_placeholder': 'Kelime ara...', 'about_title': 'Hoş Geldiniz'
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
        if (!document.getElementById('stats-section')?.classList.contains('hidden')) renderAlphabetStats();
        if (!document.getElementById('ety-section')?.classList.contains('hidden')) renderEtymologyStats();
    });
    updateThemeIcons();
}

function updateThemeIcons() {
    const isDark = document.documentElement.classList.contains('dark');
    document.getElementById('theme-toggle-dark-icon')?.classList.toggle('hidden', isDark);
    document.getElementById('theme-toggle-light-icon')?.classList.toggle('hidden', !isDark);
}

// --- 2. GEÇMİŞ YÖNETİMİ (TAM BEYAZ RENK) ---
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
        d.className = 'suggestion cursor-pointer p-4 hover:bg-background-light dark:hover:bg-background-dark border-b border-subtle-light dark:border-subtle-dark last:border-b-0 select-none flex items-baseline gap-2';
        const display = isGreek ? convertToGreek(item.clickedText) : item.clickedText;
        const subDisplay = item.subText ? (isGreek ? convertToGreek(item.subText) : item.subText) : '';
        // Geçmişteki ana metin: Tam Beyaz (text-foreground), Yan metin: Belirgin Gri (opacity-50)
        d.innerHTML = `<span class="font-bold text-foreground-light dark:text-foreground-dark">${display}</span>${item.subText ? `<span class="opacity-50 ml-2 text-sm">${subDisplay}</span>` : ''}`;
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
        
        // Arama yapmak ayrı bir işlem: Diğer bölümleri gizle
        hideAllSections();

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
        div.innerHTML = `<div class="p-4 text-sm opacity-50 bg-white dark:bg-subtle-dark">Sonuç bulunamadı</div>`; 
        cont.classList.remove('hidden'); return; 
    }
    
    matches.slice(0, 15).forEach(m => {
        const d = document.createElement('div');
        d.className = 'suggestion cursor-pointer p-4 bg-white dark:bg-subtle-dark border-b border-subtle-light dark:border-subtle-dark last:border-b-0 select-none flex items-baseline gap-2';
        
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

        d.innerHTML = `<span class="font-bold text-foreground-light dark:text-foreground-dark">${mainText}</span>${subText ? `<span class="opacity-50 ml-2 text-sm">${subText}</span>` : ''}`;
        d.onclick = () => selectWord(m, displayMain, false, displaySub, true); // Arama sonucuna tıklandığında ekran temizlensin
        div.appendChild(d);
    });
    cont.classList.remove('hidden');
}

// --- 4. SEÇİM VE KAYMA MANTIĞI ---
function selectWord(wordData, pText, forceNoHistory = false, subText = null, shouldClearScreen = false) { 
    lastSelectedWord = wordData; 
    document.getElementById('searchInput').value = isGreek ? convertToGreek(pText) : pText; 
    document.getElementById('suggestions-container').classList.add('hidden'); 
    
    if (!forceNoHistory) addToHistory(wordData, pText, subText);
    
    // Eğer Arama Barı'ndan seçildiyse (shouldClearScreen = true) her şeyi gizle
    // Eğer Kelimeler listesinden seçildiyse ekranı temizleme, sadece kaydır
    if (shouldClearScreen) {
        hideAllSections();
    } else {
        document.getElementById('welcome-box').classList.add('hidden');
        document.getElementById('stats-card').classList.add('hidden');
    }

    showResult(wordData); 
    
    // Kayma işlemi
    setTimeout(() => { 
        const resultEl = document.getElementById('result');
        if (resultEl) resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' }); 
    }, 100); 
}

// --- 5. DİĞER FONKSİYONLAR ---
function hideAllSections() {
    ['welcome-box', 'stats-card', 'alphabet-section', 'stats-section', 'ety-section'].forEach(id => {
        document.getElementById(id)?.classList.add('hidden');
    });
    document.getElementById('result').innerHTML = '';
}

function showPage(pageId) {
    if (pageId === 'home') {
        hideAllSections();
        document.getElementById('welcome-box').classList.remove('hidden');
        document.getElementById('stats-card').classList.remove('hidden');
        document.getElementById('searchInput').value = '';
    }
}

function showKelimelerPage() { 
    hideAllSections(); 
    document.getElementById('alphabet-section').classList.remove('hidden'); 
    currentSelectedLetter = "A"; 
    renderAlphabet(); 
    showLetterResults("A", 0); 
}

function showStatsPage() { hideAllSections(); document.getElementById('stats-section').classList.remove('hidden'); renderAlphabetStats(); }
function showEtyPage() { hideAllSections(); document.getElementById('ety-section').classList.remove('hidden'); renderEtymologyStats(); }

function showResult(word) {
    const resultDiv = document.getElementById('result');
    const convert = (val) => isGreek ? convertToGreek(val) : val;
    resultDiv.innerHTML = `<div class="bg-subtle-light dark:bg-subtle-dark rounded-lg sm:rounded-xl overflow-hidden p-4 sm:p-6 shadow-md border border-subtle-light dark:border-subtle-dark mt-8 select-none"><div class="mb-5"><h2 class="text-4xl font-bold text-primary">${convert(word.Sözcük)}</h2>${word.Bilimsel ? `<p class="text-base text-muted-light dark:text-muted-dark opacity-70 mt-1">${convert(word.Bilimsel)}</p>` : ''}${word.Tür ? `<p class="text-sm opacity-60 mt-0.5">${convert(word.Tür)}</p>` : ''}</div><hr class="border-t border-subtle-light dark:border-subtle-dark my-5"><div class="space-y-6">${word.Açıklama ? `<div><h3 class="text-primary font-bold text-lg mb-1">Açıklama</h3><p class="text-base leading-relaxed">${convert(word.Açıklama)}</p></div>` : ''}${word.Köken ? `<div><h3 class="text-primary font-bold text-lg mb-1">Köken</h3><p class="text-base leading-relaxed">${convert(word.Köken)}</p></div>` : ''}${word.Örnek ? `<div><h3 class="text-primary font-bold text-lg mb-1">Örnek</h3><p class="text-base border-l-4 border-primary/40 pl-4 py-1 italic">${convert(word.Örnek)}</p></div>` : ''}${word['Eş Anlamlılar'] ? `<div><h3 class="text-primary font-bold text-lg mb-1">Eş Anlamlılar</h3><p class="text-base">${convert(word['Eş Anlamlılar'])}</p></div>` : ''}</div></div>`;
}

// ... (renderEtymologyStats ve renderAlphabetStats fonksiyonları aynı kaldı, yukarıdaki çeviri düzeltmeleriyle birlikte) ...
// (Kısalık için diğer istatistik fonksiyonlarını buraya eklemiyorum ama orijinalindeki çeviri mantığıyla aynıdır)

function renderAlphabet() {
    const list = document.getElementById('alphabet-list'); if (!list) return;
    list.innerHTML = ""; list.className = "grid grid-cols-5 md:grid-cols-10 gap-2 justify-items-center";
    customAlphabet.forEach(harf => {
        if(harf === " ") return;
        const btn = document.createElement('button');
        const isActive = currentSelectedLetter === harf;
        btn.className = `w-10 h-10 flex items-center justify-center font-bold rounded transition-all select-none ${isActive ? 'bg-primary text-white shadow-md scale-110' : 'bg-subtle-light/50 dark:bg-subtle-dark hover:bg-primary hover:text-white'}`;
        btn.innerText = isGreek ? convertToGreek(harf) : harf;
        btn.onclick = () => { 
            currentSelectedLetter = harf; 
            document.getElementById('result').innerHTML = ''; 
            renderAlphabet(); 
            showLetterResults(harf, 0); 
        };
        list.appendChild(btn);
    });
}

function showLetterResults(harf, page) {
    const resultsDiv = document.getElementById('letter-results'); const pagDiv = document.getElementById('alphabet-pagination');
    resultsDiv.innerHTML = ""; pagDiv.innerHTML = "";
    const filtered = allWords.filter(w => w.Sözcük && normalizeString(w.Sözcük).startsWith(normalizeString(harf))).sort((a,b) => a.Sözcük.localeCompare(b.Sözcük, 'tr'));
    filtered.forEach(item => {
        const b = document.createElement('button'); b.className = "text-left p-3 rounded bg-white/5 border border-subtle-light dark:border-subtle-dark hover:border-primary transition-all truncate font-semibold text-sm select-none text-foreground-light dark:text-foreground-dark";
        b.innerText = isGreek ? convertToGreek(item.Sözcük) : item.Sözcük;
        b.onclick = () => selectWord(item, item.Sözcük, false, null, false); // false göndererek listenin kapanmamasını sağlıyoruz
        resultsDiv.appendChild(b);
    });
}

function normalizeString(str) { return str ? str.toLocaleLowerCase('tr-TR') : ''; }
function convertToGreek(str) { if(!str) return ""; return str.split('').map(char => latinToGreekMap[char] || char).join(''); }
function updateText(lang) { document.querySelectorAll('[data-key]').forEach(el => { const key = el.getAttribute('data-key'); if (translations['tr'][key]) { let f = translations['tr'][key]; if (lang === 'gr') f = convertToGreek(f); if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.placeholder = f; else el.textContent = f; } }); }
function toggleFeedbackForm() { document.getElementById('feedbackModal').classList.toggle('hidden'); }
function submitFeedback() { toggleFeedbackForm(); }
function toggleMobileMenu() { document.getElementById('mobile-menu').classList.toggle('hidden'); }

async function fetchWords() { 
    const url = `https://opensheet.elk.sh/1R01aIajx6dzHlO-KBiUXUmld2AEvxjCQkUTFGYB3EDM/Sözlük`; 
    try { 
        const res = await fetch(url); allWords = await res.json(); 
        initButtons(); setupSearch(); calculateStats(); updateText('tr');
    } catch (e) { console.error(e); } 
}
fetchWords();
