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

// --- DEĞİŞKENLER ---
let allWords = [];
let lastSelectedWord = null;
let lastClickedText = ""; 
let isGreek = false;

const PAGE_SIZE = 36; // 12 satır * 3 sütun
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
        'about_text_1': 'Bu sözlük, Orum Diline ait kelimeleri ve kökenlerini keşfetmeniz için hazırlanmıştır. Bu dil, Anadolu Türkçesinin özleştirilmesiyle ve kolaylaştırılmasıyla ve ayrıca Azerbaycan Türkçesinden esintilerle oluşturulan yapay bir dildir. Amacım, dilimizin öz zenginliğini kanıtlamaktır. Ancak yapay etkiler görebileceğinizi de unutmayın.',
        'about_text_2': 'Herhangi bir geri bildiriminiz, öneriniz veya yeni sözcük ekleme isteğiniz varsa; lütfen yukarıdaki menüden "Geri Bildirim" butonunu kullanarak bana ulaşın. Katkılarınızla bu sözlüğü daha da zenginleştirebiliriz!',
        'feedback_title': 'Geri Bildirim', 'feedback_placeholder': 'Geri bildiriminizi buraya yazın...',
        'feedback_cancel': 'İptal', 'feedback_send': 'Gönder',
        'synonyms_title': 'Eş Anlamlılar', 'description_title': 'Açıklama',
        'example_title': 'Örnek', 'etymology_title': 'Köken', 'no_result': 'Sonuç bulunamadı'
    }
};

// --- YARDIMCI FONKSİYONLAR ---

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

// --- KELİMELER BÖLÜMÜ YÖNETİMİ ---
function openWordsSection() {
    document.getElementById('landing-page').classList.add('hidden');
    document.getElementById('result').innerHTML = '';
    document.getElementById('words-section').classList.remove('hidden');
    renderAlphabet();
    showLetterResults('A', 0);
}

function renderAlphabet() {
    const list = document.getElementById('alphabet-list');
    list.innerHTML = "";
    customAlphabet.forEach(harf => {
        if(harf === " ") return;
        const btn = document.createElement('button');
        btn.className = "w-8 h-8 md:w-10 md:h-10 flex items-center justify-center font-bold rounded border border-subtle-dark/20 dark:border-subtle-light/10 hover:bg-primary hover:text-white transition-all";
        btn.innerText = isGreek ? convertToGreek(harf) : harf;
        btn.onclick = () => showLetterResults(harf, 0);
        list.appendChild(btn);
    });
}

function showLetterResults(harf, page, showAll = false) {
    const resultsDiv = document.getElementById('letter-results');
    const pagDiv = document.getElementById('alphabet-pagination');
    resultsDiv.innerHTML = "";
    pagDiv.innerHTML = "";

    const filtered = allWords.filter(w => w.Sözcük && normalizeString(w.Sözcük).startsWith(normalizeString(harf)))
                             .sort((a,b) => a.Sözcük.localeCompare(b.Sözcük, 'tr'));

    const start = page * PAGE_SIZE;
    const end = showAll ? filtered.length : start + PAGE_SIZE;
    const currentList = filtered.slice(start, end);

    if (currentList.length === 0) {
        resultsDiv.innerHTML = `<p class="col-span-full opacity-50 py-10 text-center font-bold italic underline">"${harf}" ile başlayan kelime yok.</p>`;
    }

    currentList.forEach(item => {
        const b = document.createElement('button');
        b.className = "text-left p-3 rounded-lg bg-subtle-light dark:bg-subtle-dark border border-subtle-dark/5 hover:border-primary transition-all truncate font-semibold text-sm";
        b.innerText = isGreek ? convertToGreek(item.Sözcük) : item.Sözcük;
        b.onclick = () => selectWord(item, item.Sözcük);
        resultsDiv.appendChild(b);
    });

    if (filtered.length > PAGE_SIZE && !showAll) {
        pagDiv.classList.remove('hidden');
        const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
        for (let i = 0; i < pageCount; i++) {
            const pBtn = document.createElement('button');
            pBtn.className = `w-8 h-8 rounded font-bold ${i === page ? 'bg-primary text-white' : 'bg-subtle-light dark:bg-subtle-dark opacity-50'}`;
            pBtn.innerText = i + 1;
            pBtn.onclick = () => showLetterResults(harf, i);
            pagDiv.appendChild(pBtn);
        }
        const allBtn = document.createElement('button');
        allBtn.className = "px-4 h-8 rounded bg-primary/20 text-primary font-bold text-xs uppercase";
        allBtn.innerText = "TÜMÜNÜ GÖR";
        allBtn.onclick = () => showLetterResults(harf, 0, true);
        pagDiv.appendChild(allBtn);
    } else {
        pagDiv.classList.add('hidden');
    }
}

// --- ANA SAYFAYA DÖNÜŞ (LOGO) ---
function showPage(pageId) {
    if (pageId === 'home') {
        document.getElementById('landing-page').classList.remove('hidden');
        document.getElementById('words-section').classList.add('hidden');
        document.getElementById('result').innerHTML = '';
        document.getElementById('searchInput').value = '';
        calculateStats();
    }
}

// --- VERİ ÇEKME VE BAŞLATMA ---
async function fetchWords() {
    const url = `https://opensheet.elk.sh/1R01aIajx6dzHlO-KBiUXUmld2AEvxjCQkUTFGYB3EDM/Sözlük`;
    try {
        const response = await fetch(url);
        if(!response.ok) throw new Error("Ağ hatası");
        allWords = await response.json();
        
        setupSearch();
        setupAlphabetToggle();
        calculateStats();
        updateText('tr');
        console.log("Sözlük hazır.");
    } catch (error) { 
        console.error('Hata:', error);
        document.getElementById('stats-sentence').innerText = "Veriler şu an yüklenemiyor. Lütfen sayfayı yenileyin.";
    }
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

function setupSearch() {
    const input = document.getElementById('searchInput');
    input.addEventListener('input', function() {
        const q = normalizeString(this.value.trim());
        if (!q) {
            document.getElementById('suggestions-container').classList.add('hidden');
            return;
        }
        const matches = allWords.filter(row => row.Sözcük && normalizeString(row.Sözcük).startsWith(q));
        displaySuggestions(matches);
    });
}

function displaySuggestions(matches) {
    const div = document.getElementById('suggestions');
    const container = document.getElementById('suggestions-container');
    div.innerHTML = '';
    if (matches.length === 0) {
        div.innerHTML = `<div class="p-4 text-sm opacity-50">Sonuç bulunamadı</div>`;
        container.classList.remove('hidden');
        return;
    }
    matches.slice(0, 10).forEach(match => {
        const s = document.createElement('div');
        s.className = 'suggestion cursor-pointer p-4 hover:bg-background-light dark:hover:bg-background-dark border-b border-subtle-dark/5 last:border-0';
        s.innerHTML = `<span class="font-bold">${isGreek ? convertToGreek(match.Sözcük) : match.Sözcük}</span>`;
        s.onclick = () => selectWord(match, match.Sözcük);
        div.appendChild(s);
    });
    container.classList.remove('hidden');
}

function selectWord(wordData, pText) {
    lastSelectedWord = wordData;
    document.getElementById('searchInput').value = isGreek ? convertToGreek(pText) :
