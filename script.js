let allWords = [];
let isGreek = false;
let sortConfig = { key: 'harf', direction: 'asc' }; 
let etySortConfig = { key: 'label', direction: 'asc' }; 
let searchHistory = JSON.parse(localStorage.getItem('orum_history')) || [];
const PAGE_SIZE = 36;
const customAlphabet = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVX YZ".split("");
const latinToGreekMap = { "a":"Α","A":"Α", "e":"Ε","E":"Ε", "i":"Ͱ","İ":"Ͱ", "n":"Ν","N":"Ν", "r":"Ρ","R":"Ρ", "l":"L","L":"L", "ı":"Ь","I":"Ь", "k":"Κ","Κ":"Κ", "d":"D","D":"D", "m":"Μ","M":"Μ", "t":"Τ","T":"Τ", "y":"R","Y":"R", "s":"S","S":"S", "u":"U","U":"U", "o":"Q","Q":"Q", "b":"Β","B":"Β", "ş":"Ш","Ş":"Ш", "ü":"Υ","Ü":"Υ", "z":"Ζ","Z":"Ζ", "g":"G","G":"G", "ç":"C","Ç":"C", "ğ":"Γ","Ğ":"Γ", "v":"V","V":"V", "c":"J","C":"J", "h":"Η","H":"Η", "p":"Π","P":"Π", "ö":"Ω","Ö":"Ω", "f":"F","F":"F", "x":"Ψ","X":"Ψ", "j":"Σ","J":"Σ", "0":"θ" };

async function fetchWords() { 
    const url = `https://opensheet.elk.sh/1R01aIajx6dzHlO-KBiUXUmld2AEvxjCQkUTFGYB3EDM/Sözlük`; 
    try { 
        const res = await fetch(url); 
        allWords = await res.json(); 
        initButtons(); setupSearch(); calculateStats();
    } catch (e) { console.error(e); } 
}

function setupSearch() {
    const input = document.getElementById('searchInput');
    input?.addEventListener('focus', () => { if(!input.value.trim()) renderHistory(); });
    input?.addEventListener('input', function() {
        let q = this.value.trim().toLocaleLowerCase('tr-TR');
        if (!q) { renderHistory(); return; }
        
        hideAllSections();
        let matches = [];
        allWords.forEach(row => {
            if (row.Sözcük?.toLocaleLowerCase('tr-TR').startsWith(q)) matches.push({ data: row, text: row.Sözcük, subText: null });
            if (row['Eş Anlamlılar']) {
                row['Eş Anlamlılar'].split(',').map(s => s.trim()).forEach(s => {
                    if (s.toLocaleLowerCase('tr-TR').startsWith(q)) matches.push({ data: row, text: s, subText: row.Sözcük });
                });
            }
            if (row.Bilimsel?.toLocaleLowerCase('tr-TR').startsWith(q)) matches.push({ data: row, text: row.Bilimsel, subText: row.Sözcük });
        });
        displaySuggestions(matches);
    });
    document.addEventListener('click', (e) => { if(!e.target.closest('.relative')) document.getElementById('suggestions-container').classList.add('hidden'); });
}

function displaySuggestions(matches) {
    const div = document.getElementById('suggestions');
    const cont = document.getElementById('suggestions-container');
    div.innerHTML = '';
    if (matches.length === 0) { div.innerHTML = '<div class="p-4 text-sm opacity-50">Sonuç yok</div>'; cont.classList.remove('hidden'); return; }
    
    const seen = new Set();
    matches.filter(m => { if(seen.has(m.text)) return false; seen.add(m.text); return true; }).slice(0, 15).forEach(m => {
        const d = document.createElement('div');
        d.className = 'suggestion cursor-pointer p-4 bg-white dark:bg-subtle-dark border-b border-subtle-light dark:border-subtle-dark last:border-b-0 select-none flex items-baseline gap-2';
        d.innerHTML = `<span class="suggestion-item font-bold">${isGreek ? convertToGreek(m.text) : m.text}</span>
                       ${m.subText ? `<span class="sub-text-item ml-2 text-sm">${isGreek ? convertToGreek(m.subText) : m.subText}</span>` : ''}`;
        d.onclick = () => selectWord(m.data, m.text, false, m.subText);
        div.appendChild(d);
    });
    cont.classList.remove('hidden');
}

function renderHistory() {
    const div = document.getElementById('suggestions');
    const cont = document.getElementById('suggestions-container');
    div.innerHTML = '';
    if (searchHistory.length === 0) return;
    searchHistory.forEach(item => {
        const d = document.createElement('div');
        d.className = 'suggestion cursor-pointer p-4 bg-white dark:bg-subtle-dark border-b border-subtle-light dark:border-subtle-dark last:border-b-0 select-none flex items-baseline gap-2';
        d.innerHTML = `<span class="suggestion-item font-bold opacity-70">${isGreek ? convertToGreek(item.clickedText) : item.clickedText}</span>
                       ${item.subText ? `<span class="sub-text-item ml-2 text-sm">${isGreek ? convertToGreek(item.subText) : item.subText}</span>` : ''}`;
        d.onclick = () => selectWord(item.wordData, item.clickedText, true, item.subText);
        div.appendChild(d);
    });
    cont.classList.remove('hidden');
}

function selectWord(wordData, pText, fromHistory = false, subText = null) { 
    document.getElementById('searchInput').value = isGreek ? convertToGreek(pText) : pText; 
    document.getElementById('suggestions-container').classList.add('hidden'); 
    hideAllSections();
    if (!fromHistory) {
        searchHistory = searchHistory.filter(h => h.clickedText !== pText);
        searchHistory.unshift({ wordData, clickedText: pText, subText });
        if (searchHistory.length > 12) searchHistory.pop();
        localStorage.setItem('orum_history', JSON.stringify(searchHistory));
    }
    showResult(wordData); 
}

function showResult(word) {
    const res = document.getElementById('result');
    const c = (v) => isGreek ? convertToGreek(v) : v;
    res.innerHTML = `<div class="bg-subtle-light dark:bg-subtle-dark rounded-xl p-6 shadow-md border border-subtle-light dark:border-subtle-dark mt-8">
        <h2 class="text-4xl font-bold text-primary mb-2">${c(word.Sözcük)}</h2>
        ${word.Bilimsel ? `<p class="opacity-70 mb-1">${word.Bilimsel}</p>` : ''}
        <p class="text-sm opacity-50 mb-4">${c(word.Tür || '')}</p>
        <hr class="border-subtle-light dark:border-subtle-dark my-4">
        <div class="space-y-4">
            ${word.Açıklama ? `<div><h3 class="text-primary font-bold">Açıklama</h3><p>${c(word.Açıklama)}</p></div>` : ''}
            ${word.Köken ? `<div><h3 class="text-primary font-bold">Köken</h3><p>${c(word.Köken)}</p></div>` : ''}
            ${word.Örnek ? `<div><h3 class="text-primary font-bold">Örnek</h3><p class="border-l-4 border-primary/30 pl-4">${c(word.Örnek)}</p></div>` : ''}
        </div>
    </div>`;
    res.scrollIntoView({ behavior: 'smooth' });
}

function hideAllSections() {
    ['welcome-box', 'stats-card', 'alphabet-section', 'stats-section', 'ety-section'].forEach(id => document.getElementById(id)?.classList.add('hidden'));
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

function showKelimelerPage() { hideAllSections(); document.getElementById('alphabet-section').classList.remove('hidden'); renderAlphabet(); }
function showStatsPage() { hideAllSections(); document.getElementById('stats-section').classList.remove('hidden'); renderAlphabetStats(); }
function showEtyPage() { hideAllSections(); document.getElementById('ety-section').classList.remove('hidden'); renderEtymologyStats(); }

// --- İstatistik Motorları ---
function renderEtymologyStats() {
    const container = document.getElementById('ety-container');
    let etyMap = {}; let total = 0;
    allWords.forEach(w => {
        if (!w.Sözcük) return; total++;
        let origin = w.Köken?.toLowerCase().includes("kökenli") ? w.Köken.split(/kökenli/i)[1].trim() || w.Köken.split(" ").pop() : w.Köken || "Türkçe";
        if (origin.toLowerCase() === "türkçe") origin = "Türkçe (Melez)";
        etyMap[origin] = (etyMap[origin] || 0) + 1;
    });
    let data = Object.keys(etyMap).map(k => ({ label: k, count: etyMap[k], pct: (etyMap[k]/total*100).toFixed(1) }));
    data.sort((a,b) => b.count - a.count);
    container.innerHTML = data.map(item => `<div class="bg-subtle-light dark:bg-subtle-dark rounded-xl overflow-hidden border border-subtle-light dark:border-subtle-dark">
        <div class="bg-primary text-white text-center py-2 font-bold text-xs truncate px-2">${item.label}</div>
        <div class="flex text-center divide-x dark:divide-subtle-dark/50">
            <div class="flex-1 py-2"><p class="text-[10px] opacity-50 font-bold">ADET</p><p class="font-bold">${item.count}</p></div>
            <div class="flex-1 py-2"><p class="text-[10px] opacity-50 font-bold">ORAN</p><p class="font-bold">%${item.pct}</p></div>
        </div>
    </div>`).join('');
}

function renderAlphabetStats() {
    const container = document.getElementById('stats-container');
    let totalChars = 0; allWords.forEach(w => totalChars += (w.Sözcük?.replace(/\s/g,'').length || 0));
    let data = customAlphabet.filter(h => h !== " ").map(h => {
        const starts = allWords.filter(w => w.Sözcük?.toLocaleLowerCase('tr-TR').startsWith(h.toLocaleLowerCase('tr-TR'))).length;
        let occ = 0; allWords.forEach(w => occ += (w.Sözcük?.toLocaleLowerCase('tr-TR').split(h.toLocaleLowerCase('tr-TR')).length -1 || 0));
        return { h, starts, occ, pct: (occ/totalChars*100).toFixed(1) };
    });
    container.innerHTML = data.map(item => `<div class="bg-subtle-light dark:bg-subtle-dark rounded-xl overflow-hidden border border-subtle-light dark:border-subtle-dark">
        <div class="bg-primary text-white text-center py-2 font-bold text-xl">${item.h}</div>
        <div class="flex text-center divide-x dark:divide-subtle-dark/50">
            <div class="flex-1 py-2"><p class="text-[9px] opacity-50 font-bold">BAŞTA</p><p class="font-bold">${item.starts}</p></div>
            <div class="flex-1 py-2"><p class="text-[9px] opacity-50 font-bold">TOPLAM</p><p class="font-bold">${item.occ}</p></div>
        </div>
    </div>`).join('');
}

function renderAlphabet() {
    const list = document.getElementById('alphabet-list');
    list.innerHTML = customAlphabet.filter(h => h !== " ").map(h => `<button onclick="showLetterResults('${h}', 0)" class="w-10 h-10 font-bold rounded bg-subtle-light/50 dark:bg-subtle-dark hover:bg-primary hover:text-white transition-all">${h}</button>`).join('');
}

function showLetterResults(h, page) {
    const filtered = allWords.filter(w => w.Sözcük?.toLocaleLowerCase('tr-TR').startsWith(h.toLocaleLowerCase('tr-TR'))).sort((a,b) => a.Sözcük.localeCompare(b.Sözcük, 'tr'));
    document.getElementById('letter-results').innerHTML = filtered.slice(page*PAGE_SIZE, (page+1)*PAGE_SIZE).map(w => `<button onclick="selectWord(null, '${w.Sözcük}')" class="text-left p-3 rounded border border-subtle-light dark:border-subtle-dark hover:border-primary truncate text-sm font-bold">${w.Sözcük}</button>`).join('');
}

function calculateStats() {
    const valid = allWords.filter(r => r.Sözcük);
    document.getElementById('stats-sentence').innerHTML = `Sözlükte <span class="text-primary font-bold">${valid.length}</span> madde bulunmaktadır.`;
}

function convertToGreek(str) { return str ? str.split('').map(c => latinToGreekMap[c] || c).join('') : ""; }
function initButtons() {
    document.getElementById('alphabet-toggle').onclick = () => { isGreek = !isGreek; renderAlphabet(); showKelimelerPage(); };
    document.getElementById('theme-toggle').onclick = () => { document.documentElement.classList.toggle('dark'); };
}

fetchWords();
