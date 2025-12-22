// Uygulamanın genel durumu
let allWords = [];
let lastSelectedWord = null;
let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
let isGreek = false;

// Harf dönüşüm eşleşmeleri
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
        'about_text_1': 'Bu sözlük, Orum Diline ait kelimeleri ve kökenlerini keşfetmeniz için hazırlanmıştır. Bu dil, Anadolu Türkçesinin özleştirilmesiyle ve kolaylaştırılmasıyla ve ayrıca Azerbaycan Türkçesinden esintilerle oluşturulan yapay bir dildir. Amacım, dilimizin öz zenginliğini kanıtlamaktır.',
        'about_text_2': 'Herhangi bir geri bildiriminiz, öneriniz veya yeni sözcük ekleme isteğiniz varsa; lütfen "Geri Bildirim" butonunu kullanarak bana ulaşın.',
        'feedback_title': 'Geri Bildirim',
        'feedback_placeholder': 'Geri bildiriminizi buraya yazın...',
        'feedback_cancel': 'İptal',
        'feedback_send': 'Gönder',
        'no_result': 'Sonuç bulunamadı',
        'synonyms_title': 'Eş Anlamlılar',
        'description_title': 'Açıklama',
        'example_title': 'Örnek',
        'etymology_title': 'Köken'
    }
};

function normalizeString(str) {
    return str ? str.toLocaleLowerCase('tr-TR') : '';
}

function convertToGreek(text) {
    if (!text) return '';
    return text.split('').map(char => latinToGreekMap[char] || char).join('');
}

// Merkezi Metin Güncelleme Fonksiyonu
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

async function fetchWords() {
    const sheetId = '1R01aIajx6dzHlO-KBiUXUmld2AEvxjCQkUTFGYB3EDM';
    const url = `https://opensheet.elk.sh/${sheetId}/Sözlük`;

    try {
        const response = await fetch(url);
        allWords = await response.json();
        setupSearch();
        updateUI(); // Sayfa metinlerini yükle
        showPage('home');
    } catch (error) {
        console.error('Hata:', error);
    }
}

function showPage(pageId) {
    const homeContent = document.getElementById('home-content');
    const aboutContent = document.getElementById('about-content');
    const searchInput = document.getElementById('searchInput');

    homeContent.classList.toggle('hidden', pageId !== 'home');
    aboutContent.classList.toggle('hidden', pageId !== 'about');
    searchInput.disabled = (pageId !== 'home');
    
    if (pageId === 'home') clearResult();
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const suggestionsDiv = document.getElementById('suggestions');
    const suggestionsContainer = document.getElementById('suggestions-container');

    searchInput.addEventListener('input', function () {
        const query = normalizeString(this.value.trim());
        if (!query) {
            suggestionsContainer.classList.add('hidden');
            return;
        }

        const matches = allWords.filter(word => 
            normalizeString(word.Sözcük).startsWith(query) || 
            (word.Tür && normalizeString(word.Tür).includes(query))
        );

        displaySuggestions(matches, query);
    });

    // Alfabe butonunu kur
    document.getElementById('alphabet-toggle').onclick = toggleAlphabet;
}

function toggleAlphabet() {
    isGreek = !isGreek;
    document.getElementById('alphabet-toggle-latin').classList.toggle('hidden', isGreek);
    document.getElementById('alphabet-toggle-cyrillic').classList.toggle('hidden', !isGreek);
    updateUI();
    if (lastSelectedWord) showResult(lastSelectedWord);
}

function displaySuggestions(matches, query) {
    const suggestionsDiv = document.getElementById('suggestions');
    const suggestionsContainer = document.getElementById('suggestions-container');
    suggestionsDiv.innerHTML = '';

    if (matches.length === 0) {
        const msg = isGreek ? convertToGreek(translations.tr.no_result) : translations.tr.no_result;
        suggestionsDiv.innerHTML = `<div class="p-4">${msg}</div>`;
    } else {
        matches.slice(0, 10).forEach(match => {
            const div = document.createElement('div');
            div.className = 'suggestion p-4 cursor-pointer hover:bg-background-light dark:hover:bg-background-dark';
            let wordText = isGreek ? convertToGreek(match.Sözcük) : match.Sözcük;
            div.innerHTML = `<span class="font-bold">${wordText}</span>`;
            div.onmousedown = () => selectWord(match);
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
}

function showResult(word) {
    const resultDiv = document.getElementById('result');
    const getField = (key) => {
        let val = word[key] || '';
        return isGreek ? convertToGreek(val) : val;
    };

    const labels = {
        syn: isGreek ? convertToGreek(translations.tr.synonyms_title) : translations.tr.synonyms_title,
        desc: isGreek ? convertToGreek(translations.tr.description_title) : translations.tr.description_title,
        etym: isGreek ? convertToGreek(translations.tr.etymology_title) : translations.tr.etymology_title
    };

    resultDiv.innerHTML = `
        <div class="bg-subtle-light dark:bg-subtle-dark rounded-xl p-6 shadow-sm">
            <h2 class="text-3xl font-bold mb-2">${getField('Sözcük')}</h2>
            <p class="text-primary text-sm mb-4">${getField('Tür')}</p>
            <div class="space-y-4">
                ${word.Açıklama ? `<div><span class="font-bold">${labels.desc}:</span> <p>${getField('Açıklama')}</p></div>` : ''}
                ${word.Köken ? `<div><span class="font-bold">${labels.etym}:</span> <p>${getField('Köken')}</p></div>` : ''}
                ${word['Eş Anlamlılar'] ? `<div><span class="font-bold">${labels.syn}:</span> <p>${getField('Eş Anlamlılar')}</p></div>` : ''}
            </div>
        </div>
    `;
}

function clearResult() {
    document.getElementById('result').innerHTML = '';
    document.getElementById('searchInput').value = '';
    document.getElementById('suggestions-container').classList.add('hidden');
}

function toggleFeedbackForm() {
    document.getElementById('feedbackModal').classList.toggle('hidden');
}

function submitFeedback() {
    const text = document.getElementById('feedbackText').value;
    if (!text) return alert("Lütfen bir mesaj yazın.");
    // SheetDB URL'nizi buraya ekleyin
    alert("Geri bildiriminiz gönderildi!");
    toggleFeedbackForm();
}

function toggleMobileMenu() {
    document.getElementById('mobile-menu').classList.toggle('hidden');
}

fetchWords();
