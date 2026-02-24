let allWords = [];
let lastSelectedWord = null;
let isGreek = false;
let currentSelectedLetter = null;
let sortConfig = { key: 'harf', direction: 'asc' }; 
let etySortConfig = { key: 'label', direction: 'asc' }; 
let searchHistory = JSON.parse(localStorage.getItem('orum_history')) || [];

const PAGE_SIZE = 36;
const customAlphabet = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVX YZ".split("");
const latinToGreekMap = { "a":"Α","A":"Α", "e":"Ε","E":"Ε", "i":"Ͱ","İ":"Ͱ", "n":"Ν","N":"Ν", "r":"Ρ","R":"Ρ", "l":"L","L":"L", "ı":"Ь","I":"Ь", "k":"Κ","Κ":"Κ", "d":"D","D":"D", "m":"Μ","M":"Μ", "t":"Τ","T":"Τ", "y":"R","Y":"R", "s":"S","S":"S", "u":"U","U":"U", "o":"Q","Q":"Q", "b":"Β","B":"Β", "ş":"Ш","Ş":"Ш", "ü":"Υ","Ü":"Υ", "z":"Ζ","Z":"Ζ", "g":"G","G":"G", "ç":"C","Ç":"C", "ğ":"Γ","Ğ":"Γ", "v":"V","V":"V", "c":"J","C":"J", "h":"Η","H":"Η", "p":"Π","P":"Π", "ö":"Ω","Ö":"Ω", "f":"F","F":"F", "x":"Ψ","X":"Ψ", "j":"Σ","J":"Σ", "0":"θ" };

const translations = { 
    'tr': { 
        'title': 'Orum Dili', 'nav_words': 'Kelimeler', 'nav_stats': 'Harf Dağılımı', 'nav_ety': 'Köken Dağılımı',
        'about_page_text': 'Çeviri', 'feedback_button_text': 'Geri Bildirim', 
        'search_placeholder': 'Kelime ara...', 'about_title': 'Hoş Geldiniz', 
        'about_text_1': 'Bu sözlük, Orum Diline ait kelimeleri ve kökenlerini keşfetmeniz için hazırlanmıştır. Bu dil, Anadolu Türkçesinin özleştirilmesiyle ve kolaylaştırılmasıyla ve ayrıca Azerbaycan Türkçesinden esintilerle oluşturulan yapay bir dildir. Amacım, dilimizin öz zenginliğini kanıtlamaktır. Ancak yapay etkiler görebileceğinizi de unutmayın.',
        'about_text_2': 'Herhangi bir geri bildiriminiz, öneriniz veya yeni sözcük ekleme isteğiniz varsa; lütfen yukarıdaki menüden "Geri Bildirim" butonunu kullanarak bana ulaşın. Katkılarınızla bu sözlüğü daha da zenginleştirebiliriz!',
        'feedback_title': 'Geri Bildirim', 'feedback_placeholder': 'Mesajınız...', 
        'feedback_cancel': 'İptal', 'feedback_send': 'Gönder', 
        'synonyms_title': 'Eş Anlamlılar', 'description_title': 'Açıklama', 
        'example_title': 'Örnek', 'etymology_title': 'Köken', 'no_result': 'Sonuç bulunamadı' 
    } 
};

// --- ARAMA VE GEÇMİŞ SİSTEMİ ---
function setupSearch() {
    const input = document.getElementById('searchInput');
    input?.addEventListener('focus', () => { if (!input.value.trim()) renderHistory(); });
    input?.addEventListener('input', function () {
        let q = this.value.trim().toLocaleLowerCase('tr-TR');
        if (!q) { renderHistory(); return; }
        
        let matches = [];
        allWords.forEach(row => {
            if (row.Sözcük && row.Sözcük.toLocaleLowerCase('tr-TR').startsWith(q)) {
                matches.push({ data: row, text: row.Sözcük, subText: null });
            }
            if (row['Eş Anlamlılar']) {
                row['Eş Anlamlılar'].split(',').map(s => s.trim()).forEach(s => {
                    if (s.toLocaleLowerCase('tr-TR').startsWith(q) && s.toLocaleLowerCase('tr-TR') !== (row.Sözcük || "").toLocaleLowerCase('tr-TR')) {
                        matches.push({ data: row, text: s, subText: row.Sözcük });
                    }
                });
            }
            if (row.Bilimsel && row.Bilimsel.toLocaleLowerCase('tr-TR').startsWith(q)) {
                matches.push({ data: row, text: row.Bilimsel, subText: row.Sözcük });
            }
        });
        displaySuggestions(matches);
    });
    document.addEventListener('click', (e) => { if (!e.target.closest('.relative')) document.getElementById('suggestions-container')?.classList.add('hidden'); });
}

function displaySuggestions(matches) {
    const div = document.getElementById('suggestions');
    const cont = document.getElementById('suggestions-container');
    div.innerHTML = '';
    if (matches.length === 0) { div.innerHTML = '<div class="p-4 opacity-50 bg-white dark:bg-subtle-dark">Sonuç yok</div>'; cont.classList.remove('hidden'); return; }
    
    const seen = new Set();
    matches.filter(m => { if (seen.has(m.text)) return false; seen.add(m.text); return true; }).slice(0, 15).forEach(m => {
        const d = document.createElement('div');
        d.className = 'suggestion cursor-pointer p-4 bg-white dark:bg-subtle-dark border-b border-subtle-light dark:border-subtle-dark last:border-b-0 select-none flex items-baseline gap-2';
        d.innerHTML = `<span class="font-bold text-foreground-light dark:text-foreground-dark">${isGreek ? convertToGreek(m.text) : m.text}</span>
                       ${m.subText ? `<span class="opacity-30 ml-2 text-sm">${isGreek ? convertToGreek(m.subText) : m.subText}</span>` : ''}`;
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
        d.innerHTML = `<span class="font-bold text-foreground-light dark:text-foreground-dark opacity-70">${isGreek ? convertToGreek(item.clickedText) : item.clickedText}</span>
                       ${item.subText ? `<span class="opacity-30 ml-2 text-sm">${isGreek ? convertToGreek(item.subText) : item.subText}</span>` : ''}`;
        d.onclick = () => selectWord(item.wordData, item.clickedText, false, item.subText);
        div.appendChild(d);
    });
    cont.classList.remove('hidden');
}

function selectWord(wordData, pText, fromHistory = false, subText = null) { 
    lastSelectedWord = wordData; 
    document.getElementById('searchInput').value = isGreek ? convertToGreek(pText) : pText; 
    document.getElementById('suggestions-container').classList.add('hidden'); 
    
    // Geçmişi son bakılana göre güncelleme
    searchHistory = searchHistory.filter(h => h.clickedText !== pText);
    searchHistory.unshift({ wordData, clickedText: pText, subText });
    if (searchHistory.length > 12) searchHistory.pop();
    localStorage.setItem('orum_history', JSON.stringify(searchHistory));

    hideAllSections();
    showResult(wordData); 
}

// --- GERİ BİLDİRİM SİSTEMİ ---
function toggleFeedbackForm() {
    document.getElementById('feedbackModal').classList.toggle('hidden');
    document.getElementById('feedbackStatus').classList.add('hidden');
}

async function submitFeedback() {
    const contact = document.getElementById('feedbackContact');
    const message = document.getElementById('feedbackText');
    const status = document.getElementById('feedbackStatus');
    const btn = document.getElementById('submitBtn');

    if (!message.value.trim()) { alert("Lütfen mesaj alanını doldurun."); return; }

    btn.disabled = true;
    btn.innerText = "Gönderiliyor...";

    try {
        const scriptURL = 'BURAYA_GOOGLE_APPS_SCRIPT_URL_GELECEK';
        const formData = new FormData();
        formData.append('İletişim', contact.value);
        formData.append('Mesaj', message.value);

        // await fetch(scriptURL, { method: 'POST', body: formData });

        contact.value = "";
        message.value = "";
        status.classList.remove('hidden');
        btn.disabled = false;
        btn.innerText = "Gönder";

        setTimeout(() => { toggleFeedbackForm(); }, 2000);
    } catch (e) {
        btn.disabled = false;
        btn.innerText = "Gönder";
        alert("Bir hata oluştu.");
    }
}

// --- DİĞER FONKSİYONLAR ---
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

function showKelimelerPage() { hideAllSections(); document.getElementById('alphabet-section').classList.remove('hidden'); renderAlphabet(); }
function showStatsPage() { hideAllSections(); document.getElementById('stats-section').classList.remove('hidden'); renderAlphabetStats(); }
function showEtyPage() { hideAllSections(); document.getElementById('ety-section').classList.remove('hidden'); renderEtymologyStats(); }

function showResult(word) {
    const div = document.getElementById('result');
    const c = (v) => isGreek ? convertToGreek(v) : v;
    div.innerHTML = `<div class="bg-subtle-light dark:bg-subtle-dark rounded-xl p-6 border border-subtle-light dark:border-subtle-dark mt-8 shadow-md">
        <h2 class="text-4xl font-bold text-primary mb-2">${c(word.Sözcük)}</h2>
        <p class="opacity-70 mb-4">${word.Bilimsel || ''}</p>
        <div class="space-y-4">
            ${word.Açıklama ? `<div><h3 class="font-bold text-primary">Açıklama</h3><p>${c(word.Açıklama)}</p></div>` : ''}
            ${word.Köken ? `<div><h3 class="font-bold text-primary">Köken</h3><p>${c(word.Köken)}</p></div>` : ''}
            ${word.Örnek ? `<div><h3 class="font-bold text-primary">Örnek</h3><p class="border-l-4 border-primary/20 pl-4 italic">${c(word.Örnek)}</p></div>` : ''}
        </div>
    </div>`;
    div.scrollIntoView({ behavior: 'smooth' });
}

function renderAlphabet() {
    const list = document.getElementById('alphabet-list');
    list.innerHTML = customAlphabet.filter(h => h !== " ").map(h => `<button onclick="showLetterResults('${h}', 0)" class="w-10 h-10 font-bold rounded bg-subtle-light/50 dark:bg-subtle-dark hover:bg-primary hover:text-white transition-all">${h}</button>`).join('');
}

function showLetterResults(h, page) {
    const filtered = allWords.filter(w => w.Sözcük?.toLocaleLowerCase('tr-TR').startsWith(h.toLocaleLowerCase('tr-TR'))).sort((a,b) => a.Sözcük.localeCompare(b.Sözcük, 'tr'));
    document.getElementById('letter-results').innerHTML = filtered.map(w => `<button onclick="selectWord(null, '${w.Sözcük}')" class="text-left p-3 rounded border border-subtle-light dark:border-subtle-dark hover:border-primary truncate text-sm font-bold">${w.Sözcük}</button>`).join('');
}

function calculateStats() {
    const valid = allWords.filter(r => r.Sözcük);
    document.getElementById('stats-sentence').innerHTML = `Sözlükte <span class="text-primary font-bold">${valid.length}</span> madde bulunmaktadır.`;
}

function initButtons() {
    document.getElementById('theme-toggle').onclick = () => { document.documentElement.classList.toggle('dark'); updateThemeIcons(); };
    document.getElementById('alphabet-toggle').onclick = () => { isGreek = !isGreek; renderAlphabet(); };
}

function convertToGreek(str) { if(!str) return ""; return str.split('').map(char => latinToGreekMap[char] || char).join(''); }
function updateText(lang) { document.querySelectorAll('[data-key]').forEach(el => { const key = el.getAttribute('data-key'); if (translations['tr'][key]) { el.textContent = translations['tr'][key]; } }); }

async function fetchWords() { 
    const url = `https://opensheet.elk.sh/1R01aIajx6dzHlO-KBiUXUmld2AEvxjCQkUTFGYB3EDM/Sözlük`; 
    try { 
        const res = await fetch(url); allWords = await res.json(); 
        initButtons(); setupSearch(); calculateStats(); updateText('tr');
    } catch (e) { console.error(e); } 
}
fetchWords();
