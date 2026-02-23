let allWords = [];
let filteredWords = [];
let isGreek = false;
let lastSelectedWord = null;
let lastClickedText = "";
const LIMIT = 36; // 12 satır x 3 kolon (PC), 18 satır x 2 kolon (Mobil)

const customAlphabet = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVX YZ".split("");

const latinToGreekMap = { "a":"Α","e":"Ε","i":"Ͱ","ı":"Ь","k":"Κ","d":"D","m":"Μ","t":"Τ","y":"R","s":"S","u":"U","o":"Q","b":"Β","ş":"Ш","ü":"Υ","z":"Ζ","g":"G","ç":"C","ğ":"Γ","v":"V","c":"J","h":"Η","p":"Π","ö":"Ω","f":"F","x":"Ψ","j":"Σ" };

async function fetchWords() {
    const url = `https://opensheet.elk.sh/1R01aIajx6dzHlO-KBiUXUmld2AEvxjCQkUTFGYB3EDM/Sözlük`;
    try {
        const response = await fetch(url);
        allWords = await response.json();
        createAlphabetMenu();
        setupSearch();
        setupAlphabetToggle();
        calculateStats();
    } catch (error) { console.error('Veri çekilemedi:', error); }
}

function normalizeString(str) { return str ? str.toLocaleLowerCase('tr-TR') : ''; }
function convertToGreek(text) { 
    if(!text) return "";
    return text.split('').map(c => latinToGreekMap[c.toLowerCase()] || c).join('');
}

function createAlphabetMenu() {
    const dNav = document.getElementById('desktop-alphabet-nav');
    const mNav = document.getElementById('mobile-alphabet-nav');
    [dNav, mNav].forEach(nav => {
        nav.innerHTML = "";
        customAlphabet.forEach(h => {
            if(h === " ") return;
            const b = document.createElement('button');
            b.className = "p-2 hover:bg-primary hover:text-white rounded transition-all font-bold text-center";
            b.innerText = isGreek ? convertToGreek(h) : h;
            b.onclick = () => showWordsByLetter(h);
            nav.appendChild(b);
        });
    });
}

function showWordsByLetter(harf, showAll = false) {
    const container = document.getElementById('letter-results-container');
    const grid = document.getElementById('letter-words-grid');
    const showAllBtn = document.getElementById('show-all-container');
    
    document.getElementById('welcome-box').classList.add('hidden');
    document.getElementById('stats-card').classList.add('hidden');
    document.getElementById('mobile-menu').classList.add('hidden');
    
    document.getElementById('current-letter-title').innerText = (isGreek ? convertToGreek(harf) : harf) + " Harfi";
    grid.innerHTML = "";
    container.classList.remove('hidden');

    filteredWords = allWords.filter(w => w.Sözcük && normalizeString(w.Sözcük).startsWith(normalizeString(harf)))
                             .sort((a,b) => a.Sözcük.localeCompare(b.Sözcük, 'tr'));

    const displayList = showAll ? filteredWords : filteredWords.slice(0, LIMIT);
    
    displayList.forEach(item => {
        const btn = document.createElement('button');
        btn.className = "text-left p-3 rounded-lg bg-white/5 border border-subtle-light/10 hover:border-primary transition-all truncate text-sm font-semibold";
        btn.innerText = isGreek ? convertToGreek(item.Sözcük) : item.Sözcük;
        btn.onclick = () => selectWord(item, item.Sözcük);
        grid.appendChild(btn);
    });

    if (!showAll && filteredWords.length > LIMIT) {
        showAllBtn.classList.remove('hidden');
        document.getElementById('btn-show-all').onclick = () => showWordsByLetter(harf, true);
    } else {
        showAllBtn.classList.add('hidden');
    }
}

function selectWord(word, text) {
    lastSelectedWord = word;
    lastClickedText = text;
    document.getElementById('searchInput').value = isGreek ? convertToGreek(text) : text;
    document.getElementById('suggestions-container').classList.add('hidden');
    showResult(word);
}

function showResult(word) {
    const res = document.getElementById('result');
    const conv = (v) => isGreek ? convertToGreek(v) : v;
    
    // Eski Zengin Kart Yapısı
    res.innerHTML = `
        <div class="bg-subtle-light dark:bg-subtle-dark rounded-xl overflow-hidden p-6 shadow-xl border border-primary/20 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div class="mb-5">
                <h2 class="text-4xl font-bold text-primary">${conv(word.Sözcük)}</h2>
                ${word.Bilimsel ? `<p class="text-base text-muted-dark opacity-70 mt-1 italic">${conv(word.Bilimsel)}</p>` : ''}
                ${word.Tür ? `<p class="text-xs font-bold uppercase tracking-widest text-primary/80 mt-2">${conv(word.Tür)}</p>` : ''}
            </div>
            <hr class="border-subtle-light dark:border-subtle-dark my-5">
            <div class="space-y-6">
                ${word.Açıklama ? `<div><h3 class="text-primary font-bold text-lg mb-1">Açıklama</h3><p class="leading-relaxed opacity-90">${conv(word.Açıklama)}</p></div>` : ''}
                ${word.Köken ? `<div><h3 class="text-primary font-bold text-lg mb-1">Köken</h3><p class="text-sm italic opacity-80">${conv(word.Köken)}</p></div>` : ''}
                ${word.Örnek ? `<div><h3 class="text-primary font-bold text-lg mb-1">Örnek</h3><p class="border-l-4 border-primary/30 pl-4 py-2 bg-primary/5 rounded-r italic">${conv(word.Örnek)}</p></div>` : ''}
                ${word['Eş Anlamlılar'] ? `<div><h3 class="text-primary font-bold text-lg mb-1">Eş Anlamlılar</h3><p class="text-primary/90">${conv(word['Eş Anlamlılar'])}</p></div>` : ''}
            </div>
        </div>`;
    res.scrollIntoView({ behavior: 'smooth' });
}

function setupSearch() {
    const input = document.getElementById('searchInput');
    input.addEventListener('input', (e) => {
        const q = normalizeString(e.target.value.trim());
        if(!q) { closeSuggestions(); return; }
        document.getElementById('letter-results-container').classList.add('hidden');
        const matches = allWords.filter(w => w.Sözcük && normalizeString(w.Sözcük).startsWith(q)).slice(0, 10);
        displaySuggestions(matches);
    });
}

function displaySuggestions(matches) {
    const div = document.getElementById('suggestions');
    const container = document.getElementById('suggestions-container');
    div.innerHTML = matches.length ? "" : "<p class='p-4 opacity-50 text-sm'>Sonuç bulunamadı.</p>";
    matches.forEach(m => {
        const s = document.createElement('div');
        s.className = "p-3 hover:bg-primary/10 cursor-pointer border-b border-subtle-dark/5 last:border-0 font-medium";
        s.innerText = isGreek ? convertToGreek(m.Sözcük) : m.Sözcük;
        s.onclick = () => selectWord(m, m.Sözcük);
        div.appendChild(s);
    });
    container.classList.remove('hidden');
}

function closeSuggestions() { document.getElementById('suggestions-container').classList.add('hidden'); }
function closeLetterView() { 
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
        if(lastSelectedWord) showResult(lastSelectedWord);
        calculateStats();
    };
}

function calculateStats() {
    const count = allWords.filter(w => w.Sözcük).length;
    let s = `Sözlükte ${count} kelime bulunmaktadır.`;
    document.getElementById('stats-sentence').innerText = isGreek ? convertToGreek(s) : s;
}

function toggleFeedbackForm() { document.getElementById('feedbackModal').classList.toggle('hidden'); }
function toggleMobileMenu() { document.getElementById('mobile-menu').classList.toggle('hidden'); }

fetchWords();
