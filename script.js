// --- DEĞİŞKENLER ---
let allWords = [];
let isGreek = false;
let lastSelectedWord = null;
const PAGE_SIZE = 36;
const customAlphabet = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVX YZ".split("");

// --- TEMA ---
const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');

function initTheme() {
    if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        themeToggleLightIcon.classList.remove('hidden');
    } else {
        document.documentElement.classList.remove('dark');
        themeToggleDarkIcon.classList.remove('hidden');
    }
}

document.getElementById('theme-toggle').addEventListener('click', () => {
    themeToggleDarkIcon.classList.toggle('hidden');
    themeToggleLightIcon.classList.toggle('hidden');
    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('color-theme', 'light');
    } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('color-theme', 'dark');
    }
});

// --- FONKSİYONLAR ---

function hideWelcome() {
    document.getElementById('home-welcome-section').classList.add('hidden');
}

function showWelcome() {
    document.getElementById('home-welcome-section').classList.remove('hidden');
}

function toggleAlphabetMenu() {
    const menu = document.getElementById('alphabet-menu');
    const results = document.getElementById('letter-results');
    const resultDetail = document.getElementById('result');

    menu.classList.toggle('hidden');
    
    if (!menu.classList.contains('hidden')) {
        hideWelcome();
        renderAlphabet();
    } else if (results.classList.contains('hidden') && resultDetail.innerHTML === "") {
        showWelcome();
    }
}

function renderAlphabet() {
    const list = document.getElementById('alphabet-list');
    list.innerHTML = "";
    customAlphabet.forEach(harf => {
        if(harf === " ") return;
        const btn = document.createElement('button');
        btn.className = "w-10 h-10 flex items-center justify-center font-bold rounded bg-subtle-light dark:bg-subtle-dark hover:bg-primary hover:text-white transition-all";
        btn.innerText = harf;
        btn.onclick = () => showLetterResults(harf, 0);
        list.appendChild(btn);
    });
}

function showLetterResults(harf, page, showAll = false) {
    hideWelcome();
    document.getElementById('result').innerHTML = "";
    const resultsDiv = document.getElementById('letter-results');
    const pagDiv = document.getElementById('alphabet-pagination');
    
    resultsDiv.innerHTML = "";
    pagDiv.innerHTML = "";
    resultsDiv.classList.remove('hidden');

    const filtered = allWords.filter(w => w.Sözcük && w.Sözcük.toLocaleLowerCase('tr').startsWith(harf.toLocaleLowerCase('tr')))
                             .sort((a,b) => a.Sözcük.localeCompare(b.Sözcük, 'tr'));

    const start = page * PAGE_SIZE;
    const end = showAll ? filtered.length : start + PAGE_SIZE;
    const currentList = filtered.slice(start, end);

    currentList.forEach(item => {
        const b = document.createElement('button');
        b.className = "text-left p-3 rounded bg-subtle-light/30 dark:bg-subtle-dark/30 border border-subtle-light dark:border-subtle-dark hover:border-primary truncate font-semibold";
        b.innerText = item.Sözcük;
        b.onclick = () => selectWord(item);
        resultsDiv.appendChild(b);
    });

    if (filtered.length > PAGE_SIZE && !showAll) {
        pagDiv.classList.remove('hidden');
        const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
        for (let i = 0; i < pageCount; i++) {
            const pBtn = document.createElement('button');
            pBtn.className = `px-3 py-1 rounded ${i === page ? 'bg-primary text-white' : 'bg-subtle-light dark:bg-subtle-dark'}`;
            pBtn.innerText = i + 1;
            pBtn.onclick = () => showLetterResults(harf, i);
            pagDiv.appendChild(pBtn);
        }
    }
}

function selectWord(word) {
    hideWelcome();
    document.getElementById('letter-results').classList.add('hidden');
    document.getElementById('alphabet-menu').classList.add('hidden');
    document.getElementById('suggestions-container').classList.add('hidden');
    document.getElementById('searchInput').value = word.Sözcük;
    
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `
        <div class="bg-subtle-light dark:bg-subtle-dark rounded-xl p-6 border border-subtle-light dark:border-subtle-dark shadow-md">
            <h2 class="text-4xl font-bold text-primary mb-4">${word.Sözcük}</h2>
            <div class="space-y-4">
                ${word.Açıklama ? `<div><h3 class="font-bold text-primary">Açıklama</h3><p>${word.Açıklama}</p></div>` : ''}
                ${word.Köken ? `<div><h3 class="font-bold text-primary">Köken</h3><p>${word.Köken}</p></div>` : ''}
            </div>
        </div>`;
}

function setupSearch() {
    const input = document.getElementById('searchInput');
    input.addEventListener('input', (e) => {
        const query = e.target.value.toLocaleLowerCase('tr').trim();
        const suggContainer = document.getElementById('suggestions-container');
        const suggDiv = document.getElementById('suggestions');
        
        if (!query) {
            suggContainer.classList.add('hidden');
            if (document.getElementById('letter-results').classList.contains('hidden')) showWelcome();
            return;
        }

        hideWelcome();
        const matches = allWords.filter(w => w.Sözcük && w.Sözcük.toLocaleLowerCase('tr').startsWith(query)).slice(0, 10);
        
        suggDiv.innerHTML = "";
        if (matches.length > 0) {
            matches.forEach(m => {
                const d = document.createElement('div');
                d.className = "p-3 hover:bg-primary/10 cursor-pointer border-b border-subtle-light dark:border-subtle-dark last:border-0";
                d.innerText = m.Sözcük;
                d.onclick = () => selectWord(m);
                suggDiv.appendChild(d);
            });
            suggContainer.classList.remove('hidden');
        } else {
            suggContainer.classList.add('hidden');
        }
    });
}

function showPage(page) {
    if (page === 'home') {
        document.getElementById('result').innerHTML = "";
        document.getElementById('letter-results').classList.add('hidden');
        document.getElementById('alphabet-menu').classList.add('hidden');
        document.getElementById('searchInput').value = "";
        showWelcome();
    }
}

async function fetchWords() {
    try {
        const response = await fetch('https://opensheet.elk.sh/1R01aIajx6dzHlO-KBiUXUmld2AEvxjCQkUTFGYB3EDM/Sözlük');
        allWords = await response.json();
        document.getElementById('stats-sentence').innerText = `Sözlükte ${allWords.length} kelime bulunmaktadır.`;
    } catch (e) { console.error("Veri çekilemedi", e); }
}

// Başlat
initTheme();
fetchWords();
setupSearch();
