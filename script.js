// Dizeleri standart bir formata dönüştürür (küçük harfe çevirme gibi).
// Bu, arama ve eşleştirme işlemlerinin daha tutarlı olmasını sağlar.
function normalizeString(str) {
    if (!str) return '';
    return str.toLocaleLowerCase('tr-TR');
}

// Uygulamanın genel durumunu tutan değişkenler.
let allWords = [];
let lastSelectedWord = null;
let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
let isGreek = false; // Alfabenin başlangıç durumu (Latin)

// Harf dönüşüm eşleşmelerini burada tanımlayalım.
const latinToGreekMap = {
    "a":"Α","A":"Α",
    "e":"Ε","E":"Ε",
    "i":"Ͱ","İ":"Ͱ",
    "n":"Ν","N":"Ν",
    "r":"Ρ","R":"Ρ",
    "l":"L","L":"L",
    "ı":"Ь","I":"Ь",
    "k":"Κ","K":"Κ",
    "d":"D","D":"D",
    "m":"Μ","M":"Μ",
    "t":"Τ","T":"Τ",
    "y":"R","Y":"R",
    "s":"S","S":"S",
    "u":"U","U":"U",
    "o":"Q","O":"Q",
    "b":"Β","B":"Β",
    "ş":"Ш","Ş":"Ш",
    "ü":"Υ","Ü":"Υ",
    "z":"Ζ","Z":"Ζ",
    "g":"G","G":"G",
    "ç":"C","Ç":"C",
    "ğ":"Γ","Ğ":"Γ",
    "v":"V","V":"V",
    "c":"J","C":"J",
    "h":"Η","H":"Η",
    "p":"Π","P":"Π",
    "ö":"Ω","Ö":"Ω",
    "f":"F","F":"F",
    "x":"Ψ","X":"Ψ",
    "j":"Σ","J":"Σ",
    "0":"θ"
};

const translations = {
    'tr': {
        'title': 'Orum Dili',
        'about_page_text': 'Hakkında',
        'feedback_button_text': 'Geri Bildirim',
        'search_placeholder': 'Kelime ara...',
        'about_title': 'Hakkında',
        'about_text_1': 'Bu sözlük, Orum Diline ait kelimeleri ve kökenlerini keşfetmeniz için hazırlanmıştır. Bu dil, Anadolu Türkçesinin özleştirilmesiyle ve kolaylaştırılmasıyla ve ayrıca Azerbaycan Türkçesinden esintilerle oluşturulan yapay bir dildir. Amacım, dilimizin öz zenginliğini kanıtlamaktır. Ancak yapay etkiler görebileceğinizi de unutmayın.',
        'about_text_2': 'Herhangi bir geri bildiriminiz, öneriniz veya yeni sözcük ekleme isteğiniz varsa; lütfen yukarıdaki menüden "Geri Bildirim" butonunu kullanarak bana ulaşın. Katkılarınızla bu sözlüğü daha da zenginleştirebiliriz!',
        'feedback_title': 'Geri Bildirim',
        'feedback_placeholder': 'Geri bildiriminizi buraya yazın...',
        'feedback_cancel': 'İptal',
        'feedback_send': 'Gönder',
        'word_title': 'Sözcük',
        'synonyms_title': 'Eş Anlamlılar',
        'description_title': 'Açıklama',
        'type_title': 'Tür',
        'example_title': 'Örnek',
        'etymology_title': 'Köken',
        'no_result': 'Sonuç bulunamadı'
    },
    'gr': {} // Bu kısım convertToGreek fonksiyonuyla dinamik olarak doldurulacak
};

// Sayfadaki metinleri günceller.
function updateText(lang) {
    const textElements = document.querySelectorAll('[data-key]');
    textElements.forEach(el => {
        const key = el.getAttribute('data-key');
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
        } else if (lang === 'gr' && translations['tr'][key]) {
            el.textContent = convertToGreek(translations['tr'][key]);
        }
    });

    const placeholderElements = document.querySelectorAll('[data-key][placeholder]');
    placeholderElements.forEach(el => {
        const key = el.getAttribute('data-key');
        if (translations[lang][key]) {
            el.placeholder = translations[lang][key];
        } else if (lang === 'gr' && translations['tr'][key]) {
            el.placeholder = convertToGreek(translations['tr'][key]);
        }
    });
}

// Google Sheets'ten verileri çeker.
async function fetchWords() {
    const sheetId = '1R01aIajx6dzHlO-KBiUXUmld2AEvxjCQkUTFGYB3EDM';
    const sheetName = 'Sözlük';
    const url = `https://opensheet.elk.sh/${sheetId}/${sheetName}`;

    try {
        const response = await fetch(url);
        allWords = await response.json();
        setupSearch();
        setupAlphabetToggle(); 
        showPage('home'); 
        updateText('tr');
    } catch (error) {
        console.error('VERİ ÇEKME HATASI:', error);
        document.getElementById('result').innerHTML =
            '<p style="color: red;">VERİLER YÜKLENİRKEN HATA OLUŞTU. LÜTFEN SAYFAYI YENİLEYİN.</p>';
    }
}

// Sayfaları yönetir.
function showPage(pageId) {
    const homeContent = document.getElementById('home-content');
    const aboutContent = document.getElementById('about-content');
    const searchInput = document.getElementById('searchInput');

    homeContent.classList.add('hidden');
    aboutContent.classList.add('hidden');
    searchInput.disabled = true;

    if (pageId === 'home') {
        homeContent.classList.remove('hidden');
        searchInput.disabled = false;
        clearResult();
    } else if (pageId === 'about') {
        aboutContent.classList.remove('hidden');
    }
}

// Arama kutusu ve öneriler.
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const suggestionsDiv = document.getElementById('suggestions');
    const resultDiv = document.getElementById('result');

    displaySearchHistory();

    searchInput.addEventListener('input', function () {
        const rawQuery = this.value.trim();
        const query = normalizeString(rawQuery); 

        if (!query) {
            suggestionsDiv.innerHTML = '';
            resultDiv.innerHTML = '';
            displaySearchHistory();
            return;
        }

        const matches = [];
        allWords.forEach(row => {
            const mainWord = row.Sözcük || '';
            const mainNorm = normalizeString(mainWord);
            
            const synonyms = row['Eş Anlamlılar']
                ? row['Eş Anlamlılar'].split(',').map(s => s.trim())
                : [];
            
            const types = row.Tür
                ? row.Tür.split(',').map(s => s.trim())
                : [];

            let alreadyMatched = false;

            if (mainNorm.startsWith(query)) {
                matches.push({ type: 'main', word: mainWord, data: row });
                alreadyMatched = true;
                return;
            }
            
            let synonymMatch = false;
            synonyms.forEach(syn => {
                if (normalizeString(syn).startsWith(query)) {
                    if (!synonymMatch) {
                         matches.push({ type: 'synonym', synonym: syn, main: mainWord, data: row });
                         synonymMatch = true;
                         alreadyMatched = true;
                    }
                }
            });
            
            if (alreadyMatched) return;

            types.forEach(typeValue => {
                if (normalizeString(typeValue).startsWith(query)) {
                     if (!alreadyMatched) {
                        matches.push({ type: 'type', word: mainWord, typeValue: typeValue, data: row });
                        alreadyMatched = true;
                    }
                }
            });
        });

        displaySuggestions(matches, query);
    });

    searchInput.addEventListener('focus', () => {
        if (!searchInput.value.trim()) displaySearchHistory();
    });

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const firstSuggestion = suggestionsDiv.querySelector('.suggestion');
            if (firstSuggestion) firstSuggestion.click();
        }
    });

    if (lastSelectedWord) {
        showResult(lastSelectedWord);
    }
}

function setupAlphabetToggle() {
    const toggleButton = document.getElementById('alphabet-toggle');
    toggleButton.addEventListener('click', toggleAlphabet);
}

function toggleAlphabet() {
    isGreek = !isGreek;
    document.getElementById('alphabet-toggle-latin').classList.toggle('hidden', isGreek);
    document.getElementById('alphabet-toggle-cyrillic').classList.toggle('hidden', !isGreek);

    const lang = isGreek ? 'gr' : 'tr';
    updateText(lang);

    if (lastSelectedWord) {
        showResult(lastSelectedWord);
    }
    displaySearchHistory();
}

function displaySuggestions(matches, query) {
    const suggestionsDiv = document.getElementById('suggestions');
    suggestionsDiv.innerHTML = '';
    const suggestionsContainer = document.getElementById('suggestions-container');

    if (matches.length === 0) {
        const noResultText = isGreek ? convertToGreek(translations.tr.no_result) : translations.tr.no_result;
        suggestionsDiv.innerHTML = `<div class="p-4 text-muted-light dark:text-muted-dark">${noResultText}</div>`;
        suggestionsContainer.classList.remove('hidden');
        return;
    }

    matches.sort((a, b) => {
        const aWord = a.data.Sözcük; 
        const bWord = b.data.Sözcük;
        return normalizeString(aWord).localeCompare(normalizeString(bWord));
    }).slice(0, 12).forEach(match => {
        const suggestion = document.createElement('div');
        suggestion.className = 'suggestion cursor-pointer p-4 hover:bg-background-light dark:hover:bg-background-dark transition-colors border-b border-subtle-light dark:border-subtle-dark last:border-b-0';

        let primaryMatchText = ''; 
        let secondaryInfo = '';     

        if (match.type === 'main') {
            primaryMatchText = match.word;
            secondaryInfo = '';
        } else if (match.type === 'synonym') {
            primaryMatchText = match.synonym; 
            secondaryInfo = match.main; 
        } else if (match.type === 'type') {
            primaryMatchText = match.typeValue; 
            secondaryInfo = match.word;        
        }

        if (isGreek) {
            primaryMatchText = convertToGreek(primaryMatchText);
            secondaryInfo = convertToGreek(secondaryInfo);
        }
        
        if (match.type === 'main') {
            suggestion.innerHTML = `<span class="font-bold">${primaryMatchText}</span>`;
        } else {
             suggestion.innerHTML = `
                <span class="font-bold">${primaryMatchText}</span>
                <span class="text-muted-light dark:text-muted-dark ml-2 text-sm">${secondaryInfo}</span>
            `;
        }

        suggestion.addEventListener('mousedown', (e) => {
            e.preventDefault();
            selectWord(match.data);
            document.getElementById('searchInput').focus();
        });
        suggestionsDiv.appendChild(suggestion);
    });

    suggestionsContainer.classList.remove('hidden');
}

function selectWord(word) {
    lastSelectedWord = word;
    document.getElementById('searchInput').value = isGreek ? convertToGreek(word.Sözcük) : word.Sözcük;
    document.getElementById('suggestions').innerHTML = '';
    document.getElementById('suggestions-container').classList.add('hidden');
    showResult(word);
    updateSearchHistory(word.Sözcük);
}

function showResult(word) {
    const resultDiv = document.getElementById('result');
    
    let wordToDisplay = word.Sözcük || '';
    let synonymsToDisplay = word['Eş Anlamlılar'] || '';
    let descriptionToDisplay = word.Açıklama || '';
    let typeToDisplay = word.Tür || '';
    let exampleToDisplay = word.Örnek || '';
    let etymologyToDisplay = word.Köken || '';

    if (isGreek) {
      wordToDisplay = convertToGreek(wordToDisplay);
      synonymsToDisplay = convertToGreek(synonymsToDisplay);
      descriptionToDisplay = convertToGreek(descriptionToDisplay);
      typeToDisplay = convertToGreek(typeToDisplay);
      exampleToDisplay = convertToGreek(exampleToDisplay);
      etymologyToDisplay = convertToGreek(etymologyToDisplay);
    }

    const synonymsTitle = isGreek ? convertToGreek(translations.tr.synonyms_title) : translations.tr.synonyms_title;
    const descriptionTitle = isGreek ? convertToGreek(translations.tr.description_title) : translations.tr.description_title;
    const typeTitle = isGreek ? convertToGreek(translations.tr.type_title) : translations.tr.type_title;
    const exampleTitle = isGreek ? convertToGreek(translations.tr.example_title) : translations.tr.example_title;
    const etymologyTitle = isGreek ? convertToGreek(translations.tr.etymology_title) : translations.tr.etymology_title;

    resultDiv.innerHTML = `
        <div class="bg-subtle-light dark:bg-subtle-dark rounded-lg sm:rounded-xl overflow-hidden p-4 sm:p-6">
            <h2 class="text-3xl font-bold mb-4">${wordToDisplay}</h2>
            ${typeToDisplay ? `<p class="text-sm text-muted-light dark:text-muted-dark mb-4">${typeToDisplay}</p>` : ''}
            
            <hr class="border-t border-subtle-light dark:border-subtle-dark my-4">

            ${descriptionToDisplay ? `
            <div class="mb-4">
                <span class="font-bold text-lg">${descriptionTitle}</span>
                <p class="text-base mt-1">${descriptionToDisplay}</p>
            </div>` : ''}

            <hr class="border-t border-subtle-light dark:border-subtle-dark my-4">

            ${etymologyToDisplay ? `
            <div class="mb-4">
                <span class="font-bold text-lg">${etymologyTitle}</span>
                <p class="text-base mt-1">${etymologyToDisplay}</p>
            </div>` : ''}

            <hr class="border-t border-subtle-light dark:border-subtle-dark my-4">

            ${exampleToDisplay ? `
            <div class="mb-4">
                <span class="font-bold text-lg">${exampleTitle}</span>
                <p class="text-base mt-1">${exampleToDisplay}</p>
            </div>` : ''}

            <hr class="border-t border-subtle-light dark:border-subtle-dark my-4">

            ${synonymsToDisplay ? `
            <div class="mb-4">
                <span class="font-bold text-lg">${synonymsTitle}</span>
                <p class="text-base mt-1">${synonymsToDisplay}</p>
            </div>` : ''}
        </div>
    `;
}

function clearResult() {
    document.getElementById('result').innerHTML = '';
    document.getElementById('searchInput').value = '';
    document.getElementById('suggestions-container').classList.add('hidden');
    displaySearchHistory();
}

function updateSearchHistory(query) {
    const historyIndex = searchHistory.indexOf(query);
    if (historyIndex > -1) {
        searchHistory.splice(historyIndex, 1);
    }
    searchHistory.unshift(query);

    if (searchHistory.length > 12) {
        searchHistory.pop();
    }
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
}

function displaySearchHistory() {
    const suggestionsDiv = document.getElementById('suggestions');
    const suggestionsContainer = document.getElementById('suggestions-container');
    const searchInput = document.getElementById('searchInput');

    if (searchInput === document.activeElement && !searchInput.value.trim() && searchHistory.length > 0) {
        suggestionsDiv.innerHTML = '';
        searchHistory.slice(0, 12).forEach(history => {
            const suggestion = document.createElement('div');
            suggestion.className = 'suggestion cursor-pointer p-4 hover:bg-background-light dark:hover:bg-background-dark transition-colors border-b border-subtle-light dark:border-subtle-dark last:border-b-0';
            
            let historyToDisplay = isGreek ? convertToGreek(history) : history;

            suggestion.innerHTML = `<span class="font-bold">${historyToDisplay}</span>`;

            suggestion.addEventListener('mousedown', (e) => {
                e.preventDefault();
                const selectedWord = allWords.find(row => row.Sözcük === history);
                if (selectedWord) selectWord(selectedWord);
            });
            suggestionsDiv.appendChild(suggestion);
        });
        suggestionsContainer.classList.remove('hidden');
    }
}

// DÜZENLENEN KISIM BURASI:
// Geri bildirim modalını açınca metin alanını temizler.
function toggleFeedbackForm() {
    const feedbackModal = document.getElementById('feedbackModal');
    const feedbackTextarea = document.getElementById('feedbackText');
    
    feedbackModal.classList.toggle('hidden');

    // Eğer modal açıldıysa (gizli değilse) kutuyu boşalt
    if (!feedbackModal.classList.contains('hidden')) {
        feedbackTextarea.value = ''; 
    }
}

function submitFeedback() {
    const feedbackText = document.getElementById('feedbackText').value.trim();
    if (!feedbackText) {
        alert('Lütfen geri bildirim yazın.');
        return;
    }

    const tarih = new Date().toLocaleString('tr-TR');

    fetch('https://sheetdb.io/api/v1/mt09gl0tun8di', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { "Tarih": tarih, "Mesaj": feedbackText } })
    })
        .then(response => response.json())
        .then(() => {
            alert('Geri bildiriminiz alındı, teşekkür ederiz!');
            toggleFeedbackForm();
        })
        .catch(error => {
            console.error('Geri bildirim gönderilirken hata oluştu:', error);
            alert('Bir hata oluştu, lütfen tekrar deneyin.');
        });
}

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.classList.toggle('hidden');
}

function convertToGreek(text) {
    if (!text) return '';
    let convertedText = '';
    for (let char of text) {
        const greekChar = latinToGreekMap[char];
        convertedText += greekChar || char;
    }
    return convertedText;
}

fetchWords();
