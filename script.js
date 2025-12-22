// Temel Ayarlar
let allWords = [];
let lastSelectedWord = null;
let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
let isGreek = false;

const latinToGreekMap = {
    "a":"Α","A":"Α","e":"Ε","E":"Ε","i":"Ͱ","İ":"Ͱ","n":"Ν","N":"Ν","r":"Ρ","R":"Ρ","l":"L","L":"L",
    "ı":"Ь","I":"Ь","k":"Κ","K":"Κ","d":"D","D":"D","m":"Μ","M":"Μ","t":"Τ","T":"Τ","y":"R","Y":"R",
    "s":"S","S":"S","u":"U","U":"U","o":"Q","O":"Q","b":"Β","B":"Β","ş":"Ш","Ş":"Ш","ü":"Υ","Ü":"Υ",
    "z":"Ζ","Z":"Ζ","g":"G","G":"G","ç":"C","Ç":"C","ğ":"Γ","Ğ":"Γ","v":"V","V":"V","c":"J","C":"J",
    "h":"Η","H":"Η","p":"Π","P":"Π","ö":"Ω","Ö":"Ω","f":"F","F":"F","x":"Ψ","X":"Ψ","j":"Σ","J":"Σ","0":"θ"
};

const translations = {
    'tr': {
        'title': 'Orum Dili',
        'about_page_text': 'Hakkında',
        'feedback_button_text': 'Geri Bildirim',
        'search_placeholder': 'Kelime ara...',
        'about_title': 'Hakkında',
        'about_text_1': 'Bu sözlük, Orum Diline ait kelimeleri ve kökenlerini keşfetmeniz için hazırlanmıştır. Bu dil, Anadolu Türkçesinin özleştirilmesiyle ve kolaylaştırılmasıyla ve ayrıca Azerbaycan Türkçesinden esintilerle oluşturulan yapay bir dildir.',
        'about_text_2': 'Herhangi bir geri bildiriminiz varsa lütfen butonla bana ulaşın. Katkılarınızla bu sözlüğü zenginleştirebiliriz!',
        'feedback_title': 'Geri Bildirim',
        'feedback_placeholder': 'Geri bildiriminizi buraya yazın...',
        'feedback_cancel': 'İptal',
        'feedback_send': 'Gönder',
        'no_result': 'Sonuç bulunamadı',
        'synonyms_title': 'Eş Anlamlılar',
        'description_title': 'Açıklama',
        'type_title': 'Tür',
        'example_title': 'Örnek',
        'etymology_title': 'Köken'
    }
};

// Yardımcı Fonksiyonlar
function normalizeString(str) {
    if (!str) return '';
    return str.toLocaleLowerCase('tr-TR');
}

function convertToGreek(text) {
    if (!text) return '';
    return text.split('').map(char => latinToGreekMap[char] || char).join('');
}

// Arayüzü Güncelleyen Fonksiyon (Tüm Metinler Buradan Gelir)
function updateUI() {
    const lang = isGreek ? 'gr' : 'tr';
    document.querySelectorAll('[data-key]').forEach(el => {
        const key = el.getAttribute('data-key');
        let text = translations.tr[key] || '';
        if (isGreek) text = convertToGreek(text);

        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = text;
        } else {
            el.textContent = text;
        }
    });
}

// Veri Çekme
async function fetchWords() {
    const sheetId = '1R01aIajx6dzHlO-KBiUXUmld2AEvxjCQkUTFGYB3EDM';
    const url = `https://opensheet.elk.sh/${sheetId}/Sözlük`;
    try {
        const response = await fetch(url);
        allWords = await response.json();
        setupSearch();
        updateUI(); // Başlangıçta metinleri bas
        showPage('home');
    } catch (error) {
        console.error('Hata:', error);
    }
}

// Sayfa Yönetimi
function showPage(pageId) {
    const homeContent = document.getElementById('home-content');
    const aboutContent = document.getElementById('about-content');
    const searchInput = document.getElementById('searchInput');

    homeContent.classList.toggle('hidden', pageId !== 'home');
    aboutContent.classList.toggle('hidden', pageId !== 'about');
    searchInput.disabled = (pageId !== 'home');
    if (pageId === 'home') clearResult();
}

// Arama Mantığı (EŞ ANLAMLI VE TÜR KORUNDU)
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const suggestionsDiv = document.getElementById('suggestions');
    const resultDiv = document.getElementById('result');

    displaySearchHistory();

    searchInput.addEventListener('input', function () {
        const query = normalizeString(this.value.trim());
        if (!query) {
            suggestionsDiv.innerHTML = '';
            resultDiv.innerHTML = '';
            displaySearchHistory();
            return;
        }

        const matches = [];
        allWords.forEach(row => {
            const mainWord = row.Sözcük || '';
            const synonyms = row['Eş Anlamlılar'] ? row['Eş Anlamlılar'].split(',').map(s => s.trim()) : [];
            const types = row.Tür ? row.Tür.split(',').map(s => s.trim()) : [];

            if (normalizeString(mainWord).startsWith(query)) {
                matches.push({ type: 'main', word: mainWord, data: row });
            } else {
                const syn = synonyms.find(s => normalizeString(s).startsWith(query));
                if (syn) {
                    matches.push({ type: 'synonym', synonym: syn, main: mainWord, data: row });
                } else {
                    const typ = types.find(t => normalizeString(t).startsWith(query));
                    if (typ) matches.push({ type: 'type', typeValue: typ, word: mainWord, data: row });
                }
            }
        });
        displaySuggestions(matches, query);
    });

    document.getElementById('alphabet-toggle').onclick = toggleAlphabet;
}

// Önerileri Göster (Görsel yapı korundu)
function displaySuggestions(matches, query) {
    const suggestionsDiv = document.getElementById('suggestions');
    const suggestionsContainer = document.getElementById('suggestions-container');
    suggestionsDiv.innerHTML = '';

    if (matches.length === 0) {
        const msg = isGreek ? convertToGreek(translations.tr.no_result) : translations.tr.no_result;
        suggestionsDiv.innerHTML = `<div class="p-4 text-muted-light dark:text-muted-dark">${msg}</div>`;
    } else {
        matches.sort((a,b) => normalizeString(a.data.Sözcük).localeCompare(normalizeString(b.data.Sözcük)))
        .slice(0, 12).forEach(match => {
            const div = document.createElement('div');
            div.className = 'suggestion cursor-pointer p-4 hover:bg-background-light dark:hover:bg-background-dark transition-colors border-b border-subtle-light dark:border-subtle-dark last:border-b-0';
            
            let primary = match.type === 'main' ? match.word : (match.type === 'synonym' ? match.synonym : match.typeValue);
            let secondary = match.type === 'main' ? '' : match.word;

            if (isGreek) { primary = convertToGreek(primary); secondary = convertToGreek(secondary); }

            div.innerHTML = `<span class="font-bold">${primary}</span>${secondary ? `<span class="text-muted-light dark:text-muted-dark ml-2 text-sm">${secondary}</span>` : ''}`;
            div.onmousedown = (e) => { e.preventDefault(); selectWord(match.data); };
            suggestionsDiv.appendChild(div);
        });
    }
    suggestionsContainer.classList.remove('hidden');
}

function selectWord(word) {
    lastSelectedWord = word;
    document.getElementById('searchInput').value = isGreek ? convertToGreek(word.Sözcük) : word.Sözcük;
    document.getElementById('suggestions-container').classList.add('hidden');
    showResult(word);
    updateSearchHistory(word.Sözcük);
}

function showResult(word) {
    const res = document.getElementById('result');
    const f = (k) => isGreek ? convertToGreek(word[k] || '') : (word[k] || '');
    const t = (k) => isGreek ? convertToGreek(translations.tr[k]) : translations.tr[k];

    res.innerHTML = `
        <div class="bg-subtle-light dark:bg-subtle-dark rounded-xl p-6 shadow-sm">
            <h2 class="text-3xl font-bold mb-4">${f('Sözcük')}</h2>
            ${word.Tür ? `<p class="text-sm text-muted-light dark:text-muted-dark mb-4">${f('Tür')}</p>` : ''}
            <hr class="border-subtle-light dark:border-subtle-dark my-4">
            ${word.Açıklama ? `<div class="mb-4"><span class="font-bold text-lg">${t('description_title')}</span><p class="mt-1">${f('Açıklama')}</p></div>` : ''}
            ${word.Köken ? `<div class="mb-4"><span class="font-bold text-lg">${t('etymology_title')}</span><p class="mt-1">${f('Köken')}</p></div>` : ''}
            ${word['Eş Anlamlılar'] ? `<div class="mb-4"><span class="font-bold text-lg">${t('synonyms_title')}</span><p class="mt-1">${f('Eş Anlamlılar')}</p></div>` : ''}
        </div>
    `;
}

// Diğer Fonksiyonlar (Alfabe, Menü, Geri Bildirim)
function toggleAlphabet() {
    isGreek = !isGreek;
    document.getElementById('alphabet-toggle-latin').classList.toggle('hidden', isGreek);
    document.getElementById('alphabet-toggle-cyrillic').classList.toggle('hidden', !isGreek);
    updateUI();
    if (lastSelectedWord) showResult(lastSelectedWord);
    displaySearchHistory();
}

function clearResult() {
    document.getElementById('result').innerHTML = '';
    document.getElementById('searchInput').value = '';
    document.getElementById('suggestions-container').classList.add('hidden');
}

function toggleFeedbackForm() { document.getElementById('feedbackModal').classList.toggle('hidden'); }

function submitFeedback() {
    const text = document.getElementById('feedbackText').value.trim();
    if (!text) return alert('Boş mesaj gönderilemez.');
    fetch('https://sheetdb.io/api/v1/mt09gl0tun8di', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { "Tarih": new Date().toLocaleString('tr-TR'), "Mesaj": text } })
    }).then(() => { alert('Teşekkürler!'); toggleFeedbackForm(); });
}

function toggleMobileMenu() { document.getElementById('mobile-menu').classList.toggle('hidden'); }

function updateSearchHistory(q) {
    searchHistory = [q, ...searchHistory.filter(x => x !== q)].slice(0, 12);
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
}

function displaySearchHistory() {
    const input = document.getElementById('searchInput');
    const div = document.getElementById('suggestions');
    if (input === document.activeElement && !input.value.trim() && searchHistory.length > 0) {
        div.innerHTML = '';
        searchHistory.forEach(h => {
            const s = document.createElement('div');
            s.className = 'suggestion p-4 cursor-pointer hover:bg-background-light dark:hover:bg-background-dark';
            s.innerHTML = `<span class="font-bold">${isGreek ? convertToGreek(h) : h}</span>`;
            s.onmousedown = () => { const w = allWords.find(r => r.Sözcük === h); if (w) selectWord(w); };
            div.appendChild(s);
        });
        document.getElementById('suggestions-container').classList.remove('hidden');
    }
}

fetchWords();
