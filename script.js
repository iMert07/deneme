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
        'search_placeholder': 'Kelime ara...', 'about_title': 'Hoş Geldiniz',
        'about_text_1': 'Bu sözlük, Orum Diline ait kelimeleri ve kökenlerini keşfetmeniz için hazırlanmıştır.',
        'about_text_2': 'Herhangi bir geri bildiriminiz varsa lütfen ulaşın.'
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
    });

    document.getElementById('alphabet-toggle')?.addEventListener('click', () => {
        isGreek = !isGreek;
        updateText(isGreek ? 'gr' : 'tr');
        calculateStats();
        if (!document.getElementById('alphabet-section').classList.contains('hidden')) renderAlphabet();
        if (!document.getElementById('stats-section')?.classList.contains('hidden')) renderAlphabetStats();
        if (!document.getElementById('ety-section')?.classList.contains('hidden')) renderEtymologyStats();
    });
}

// --- 2. GEÇMİŞ VE ARAMA ---
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
        d.innerHTML = `<span class="font-bold text-foreground-light dark:text-foreground-dark">${display}</span>${item.subText ? `<span class="opacity-50 ml-2 text-sm">${subDisplay}</span>` : ''}`;
        d.onclick = () => selectWord(item.wordData, item.clickedText, false, item.subText, true);
        div.appendChild(d);
    });
    cont.classList.remove('hidden');
}

function setupSearch() {
    const input = document.getElementById('searchInput');
    const container = document.getElementById('suggestions-container');
    input?.addEventListener('focus', () => { if (!input.value.trim()) renderHistory(); });
    input?.addEventListener('input', function () {
        const q = normalizeString(this.value.trim());
        if (!q) { renderHistory(); return; }
        hideAllSections();
        const matches = allWords.filter(row => {
            const sozcuk = normalizeString(row.Sözcük || "");
            const bilimsel = normalizeString(row.Bilimsel || "");
            const esAnlam = normalizeString(row['Eş Anlamlılar'] || "");
            return sozcuk.startsWith(q) || bilimsel.startsWith(q) || esAnlam.split(',').some(s => normalizeString(s.trim()).startsWith(q));
        });
        displaySuggestions(matches, q);
    });
    document.addEventListener('click', (e) => { if (!e.target.closest('.relative')) container.classList.add('hidden'); });
}

function displaySuggestions(matches, q) {
    const div = document.getElementById('suggestions');
    const cont = document.getElementById('suggestions-container');
    div.innerHTML = '';
    if (matches.length === 0) { div.innerHTML = `<div class="p-4 text-sm opacity-50 bg-white dark:bg-subtle-dark">Sonuç bulunamadı</div>`; cont.classList.remove('hidden'); return; }
    matches.slice(0, 15).forEach(m => {
        const d = document.createElement('div');
        d.className = 'suggestion cursor-pointer p-4 hover:bg-background-light dark:hover:bg-background-dark border-b border-subtle-light dark:border-subtle-dark last:border-b-0 select-none flex items-baseline gap-2';
        let displayMain = m.Sözcük; let displaySub = "";
        if (!normalizeString(m.Sözcük || "").startsWith(q)) {
            if (normalizeString(m.Bilimsel || "").startsWith(q)) { displayMain = m.Bilimsel; displaySub = m.Sözcük; }
            else { const found = m['Eş Anlamlılar']?.split(',').map(s => s.trim()).find(s => normalizeString(s).startsWith(q)); if(found) { displayMain = found; displaySub = m.Sözcük; } }
        }
        d.innerHTML = `<span class="font-bold text-foreground-light dark:text-foreground-dark">${isGreek ? convertToGreek(displayMain) : displayMain}</span>${displaySub ? `<span class="opacity-50 ml-2 text-sm">${isGreek ? convertToGreek(displaySub) : displaySub}</span>` : ''}`;
        d.onclick = () => selectWord(m, displayMain, false, displaySub, true);
        div.appendChild(d);
    });
    cont.classList.remove('hidden');
}

function selectWord(wordData, pText, forceNoHistory = false, subText = null, clearAll = false) { 
    if (!forceNoHistory) addToHistory(wordData, pText, subText);
    if (clearAll) hideAllSections();
    else { document.getElementById('welcome-box').classList.add('hidden'); document.getElementById('stats-card').classList.add('hidden'); }
    showResult(wordData);
    setTimeout(() => { document.getElementById('result')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
}

// --- 3. İSTATİSTİKLER ---
function calculateStats() {
    const s = document.getElementById('stats-sentence'); if (!s) return;
    const valid = allWords.filter(r => r.Sözcük && r.Sözcük.trim() !== "");
    let tWord = 0; valid.forEach(r => { tWord += 1; if (r['Eş Anlamlılar']) tWord += r['Eş Anlamlılar'].split(',').filter(x => x.trim() !== '').length; });
    let sent = `Şu an bu sözlükte ${valid.length} madde altında toplam ${tWord} kelime bulunmaktadır.`;
    if (isGreek) sent = convertToGreek(sent);
    s.innerHTML = sent.replace(/\d+/g, m => `<span class="text-primary font-bold">${m}</span>`);
}

function renderEtymologyStats() {
    const container = document.getElementById('ety-container'); if (!container) return;
    let etyMap = {}; let total = 0;
    allWords.forEach(w => { if (!w.Sözcük) return; total++; let origin = w.Köken?.includes("kökenli") ? w.Köken.split(/kökenli/i)[0].trim().split(" ").pop() : (w.Köken || "Türkçe"); etyMap[origin] = (etyMap[origin] || 0) + 1; });
    let data = Object.keys(etyMap).map(k => ({ label: k, count: etyMap[k], pct: (etyMap[k]/total*100).toFixed(1) }));
    data.sort((a,b) => etySortConfig.key === 'label' ? a.label.localeCompare(b.label, 'tr') : b.count - a.count);
    const t_adet = isGreek ? convertToGreek('Adet') : 'Adet';
    const t_oran = isGreek ? convertToGreek('Oran') : 'Oran';
    container.innerHTML = `<div class="col-span-full mb-8 flex justify-center gap-2"><button onclick="etySortConfig.key='label';renderEtymologyStats()" class="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold uppercase">Dil</button><button onclick="etySortConfig.key='count';renderEtymologyStats()" class="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold uppercase">Adet</button></div>`;
    data.forEach(item => {
        const box = document.createElement('div'); box.className = "bg-subtle-light dark:bg-subtle-dark rounded-xl border overflow-hidden flex flex-col h-full";
        box.innerHTML = `<div class="bg-primary text-white text-center py-2 px-1 font-bold text-sm">${isGreek ? convertToGreek(item.label) : item.label}</div><div class="flex divide-x text-center mt-auto"><div class="flex-1 py-2 text-xs opacity-70"><b>${item.count}</b><br>${t_adet}</div><div class="flex-1 py-2 text-xs opacity-70"><b>%${item.pct}</b><br>${t_oran}</div></div>`;
        container.appendChild(box);
    });
}

function renderAlphabetStats() {
    const container = document.getElementById('stats-container'); if (!container) return;
    let totalChars = 0; allWords.forEach(w => { if (w.Sözcük) totalChars += w.Sözcük.replace(/\s/g, '').length; });
    let data = customAlphabet.filter(h => h !== " ").map(h => {
        const basta = allWords.filter(w => normalizeString(w.Sözcük).startsWith(normalizeString(h))).length;
        let toplam = 0; allWords.forEach(w => { if(w.Sözcük) toplam += (normalizeString(w.Sözcük).split(normalizeString(h)).length - 1); });
        return { h, basta, toplam, bastaPct: (basta/allWords.length*100).toFixed(1), toplamPct: (toplam/totalChars*100).toFixed(1) };
    });
    const t_basta = isGreek ? convertToGreek('Başta') : 'Başta';
    const t_toplam = isGreek ? convertToGreek('Toplam') : 'Toplam';
    container.innerHTML = `<div class="col-span-full mb-8 flex justify-center"><button class="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold uppercase">Sırala</button></div>`;
    data.forEach(item => {
        const box = document.createElement('div'); box.className = "bg-subtle-light dark:bg-subtle-dark rounded-xl border text-center overflow-hidden";
        box.innerHTML = `<div class="bg-primary text-white py-2 font-bold">${isGreek ? convertToGreek(item.h) : item.h}</div><div class="flex divide-x"><div class="flex-1 py-2 text-[10px] opacity-70"><b>${item.basta}</b><br>${t_basta}</div><div class="flex-1 py-2 text-[10px] opacity-70"><b>${item.toplam}</b><br>${t_toplam}</div></div>`;
        container.appendChild(box);
    });
}

// --- 4. ALFABE VE SAYFA ---
function renderAlphabet() {
    const list = document.getElementById('alphabet-list'); if (!list) return;
    list.innerHTML = customAlphabet.filter(h => h !== " ").map(h => {
        const active = currentSelectedLetter === h ? 'bg-primary text-white' : 'bg-subtle-light/50 dark:bg-subtle-dark';
        return `<button onclick="currentSelectedLetter='${h}';renderAlphabet();showLetterResults('${h}')" class="w-10 h-10 flex items-center justify-center font-bold rounded transition-all ${active}">${isGreek ? convertToGreek(h) : h}</button>`;
    }).join('');
}

function showLetterResults(h) {
    const res = document.getElementById('letter-results');
    res.innerHTML = allWords.filter(w => normalizeString(w.Sözcük).startsWith(normalizeString(h))).sort((a,b) => a.Sözcük.localeCompare(b.Sözcük, 'tr')).map(w => 
        `<button onclick="selectWord(null, '${w.Sözcük}', false, null, false)" class="text-left p-3 rounded bg-white/5 border truncate font-semibold text-sm text-foreground-light dark:text-foreground-dark">${isGreek ? convertToGreek(w.Sözcük) : w.Sözcük}</button>`
    ).join('');
}

function showResult(word) {
    const convert = (val) => isGreek ? convertToGreek(val) : val;
    document.getElementById('result').innerHTML = `<div class="bg-subtle-light dark:bg-subtle-dark rounded-xl p-6 border mt-8 shadow-md">
        <h2 class="text-4xl font-bold text-primary mb-2">${convert(word.Sözcük)}</h2>
        <p class="opacity-70 mb-4">${word.Bilimsel || ''}</p>
        <div class="space-y-4">
            ${word.Açıklama ? `<div><h3 class="font-bold text-primary">${isGreek ? convertToGreek('Açıklama'):'Açıklama'}</h3><p>${convert(word.Açıklama)}</p></div>`:''}
            ${word.Köken ? `<div><h3 class="font-bold text-primary">${isGreek ? convertToGreek('Köken'):'Köken'}</h3><p>${convert(word.Köken)}</p></div>`:''}
            ${word['Eş Anlamlılar'] ? `<div><h3 class="font-bold text-primary">${isGreek ? convertToGreek('Eş Anlamlılar'):'Eş Anlamlılar'}</h3><p>${convert(word['Eş Anlamlılar'])}</p></div>`:''}
        </div>
    </div>`;
}

function hideAllSections() {
    ['welcome-box', 'stats-card', 'alphabet-section', 'stats-section', 'ety-section'].forEach(id => document.getElementById(id)?.classList.add('hidden'));
    document.getElementById('result').innerHTML = '';
}

function showPage(p) { hideAllSections(); if (p === 'home') { document.getElementById('welcome-box').classList.remove('hidden'); document.getElementById('stats-card').classList.remove('hidden'); } }
function showKelimelerPage() { hideAllSections(); document.getElementById('alphabet-section').classList.remove('hidden'); currentSelectedLetter = "A"; renderAlphabet(); showLetterResults("A"); }
function showStatsPage() { hideAllSections(); document.getElementById('stats-section').classList.remove('hidden'); renderAlphabetStats(); }
function showEtyPage() { hideAllSections(); document.getElementById('ety-section').classList.remove('hidden'); renderEtymologyStats(); }

function normalizeString(str) { return str ? str.toLocaleLowerCase('tr-TR') : ''; }
function convertToGreek(str) { if(!str) return ""; return str.split('').map(char => latinToGreekMap[char] || char).join(''); }
function updateText(l) { document.querySelectorAll('[data-key]').forEach(el => { const k = el.getAttribute('data-key'); if (translations['tr'][k]) el.textContent = translations['tr'][k]; }); }
function toggleFeedbackForm() { document.getElementById('feedbackModal').classList.toggle('hidden'); }
function toggleMobileMenu() { document.getElementById('mobile-menu').classList.toggle('hidden'); }

async function fetchWords() { 
    try { 
        const res = await fetch(`https://opensheet.elk.sh/1R01aIajx6dzHlO-KBiUXUmld2AEvxjCQkUTFGYB3EDM/Sözlük`); 
        allWords = await res.json(); initButtons(); setupSearch(); calculateStats(); updateText('tr');
    } catch (e) { console.error(e); } 
}
fetchWords();
