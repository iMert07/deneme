const latin = document.getElementById('latin');
const greek = document.getElementById('greek');
const pillInputLabel = document.getElementById('pill-input-label');
const pillOutputLabel = document.getElementById('pill-output-label');
const dropdownInput = document.getElementById('dropdown-input');
const dropdownOutput = document.getElementById('dropdown-output');
const kbContainer = document.getElementById('kb-container');
let activeInput = latin;

// Aktif birimler
let currentInputUnit = "Standart Alfabe";
let currentOutputUnit = "Yeni Alfabe";

const unitData = {
    "Alfabe": ["Standart Alfabe", "Yeni Alfabe", "Fars Alfabesi (Yok)", "Orhun Alfabesi (Yok)"],
    "Sayı": ["Onluk (Standart)", "Onikilik (Anatolya)"],
    "Para": ["Lira", "Kuruş", "Anatolya Sikkesi"],
    "Takvim": ["Gregoryen", "Anatolya Takvimi"],
    "Zaman": ["Standart Saat", "Anatolya Saati"],
    "Uzunluk": ["Metre", "Kilometre", "Arşın", "Menzil"],
    "Kütle": ["Kilogram", "Gram", "Batman", "Dirhem"],
    "Sıcaklık": ["Celsius", "Fahrenheit", "Ilım", "Ayaz"],
    "Hacim": ["Litre", "Mililitre", "Kile", "Katre"],
    "Hız": ["km/saat", "mil/saat", "Anatolya Hızı"],
    "Alan": ["Metrekare", "Dönüm", "Evlek"],
    "Veri": ["Byte", "Bit", "Anatolya Verisi"],
    "Meridyen": ["Standart Meridyen", "Anatolya Boylamı"],
    "Paralel": ["Standart Parallel", "Anatolya Enlemi"]
};

// --- ALFABE SÜTUNLARI ---
// Yeni alfabe ekleyeceksen sadece altına yeni bir satır ekle.
const alphabetMaps = {
    "Standart Alfabe": [
        "a", "b", "c", "ç", "d", "e", "f", "g", "ğ", "h", "ı", "i", "j", "k", "l", "m", "n", "o", "ö", "p", "r", "s", "ş", "t", "u", "ü", "v", "x", "y", "z",
        "A", "B", "C", "Ç", "D", "E", "F", "G", "Ğ", "H", "I", "İ", "J", "K", "L", "M", "N", "O", "Ö", "P", "R", "S", "Ş", "T", "U", "Ü", "V", "X", "Y", "Z",
        "0"
    ],
    "Yeni Alfabe": [
        "Α", "Β", "J", "C", "D", "Ε", "F", "G", "Γ", "Η", "Ь", "Ͱ", "Σ", "Κ", "L", "Μ", "Ν", "Q", "Ω", "Π", "Ρ", "S", "Ш", "Τ", "U", "Υ", "V", "Ψ", "R", "Ζ",
        "Α", "Β", "J", "C", "D", "Ε", "F", "G", "Γ", "Η", "Ь", "Ͱ", "Σ", "Κ", "L", "Μ", "Ν", "Q", "Ω", "Π", "Ρ", "S", "Ш", "Τ", "U", "Υ", "V", "Ψ", "R", "Ζ",
        "θ"
    ],
    "Fars Alfabesi (Yok)": [], // İleride burayı doldurabilirsin
    "Orhun Alfabesi (Yok)": [] // İleride burayı doldurabilirsin
};

// --- ÇEVİRİ MOTORU ---
function universalTranslate(text, fromUnit, toUnit) {
    if (fromUnit === toUnit) return text;
    
    const sourceMap = alphabetMaps[fromUnit];
    const targetMap = alphabetMaps[toUnit];
    
    // Eğer seçilen alfabenin verisi yoksa metni olduğu gibi bırak
    if (!sourceMap || sourceMap.length === 0 || !targetMap || targetMap.length === 0) return text;

    return text.split('').map(char => {
        const index = sourceMap.indexOf(char);
        if (index !== -1) {
            return targetMap[index];
        }
        return char; // Harita dışı karakterleri koru
    }).join('');
}

function performTranslation() {
    const mode = document.querySelector('.active-tab').dataset.value;
    if (mode === "Alfabe") {
        if (activeInput === latin) {
            greek.value = universalTranslate(latin.value, currentInputUnit, currentOutputUnit);
        } else {
            latin.value = universalTranslate(greek.value, currentOutputUnit, currentInputUnit);
        }
    }
}

// --- EVENT LISTENERS ---
[latin, greek].forEach(inputEl => {
    inputEl.addEventListener('input', (e) => {
        activeInput = e.target;
        performTranslation();
    });
    inputEl.addEventListener('focus', (e) => activeInput = e.target);
});

// Klavye Tuşları
document.querySelectorAll('.key').forEach(key => {
    key.addEventListener('click', (e) => {
        e.preventDefault();
        const action = key.dataset.action;
        if(action === 'delete') activeInput.value = activeInput.value.slice(0,-1);
        else if(action === 'enter') activeInput.value += '\n';
        else if(action === 'space') activeInput.value += ' ';
        else if(action === 'reset') { latin.value = ''; greek.value = ''; }
        else if(!key.classList.contains('fn-key')) activeInput.value += key.innerText;
        performTranslation();
    });
});

// Dropdown & UI Mantığı
function toggleDropdown(type) {
    const el = type === 'input' ? dropdownInput : dropdownOutput;
    const other = type === 'input' ? dropdownOutput : dropdownInput;
    other.classList.remove('show');
    el.classList.toggle('show');
}

window.onclick = function(event) {
    if (!event.target.closest('.unit-pill')) {
        dropdownInput.classList.remove('show');
        dropdownOutput.classList.remove('show');
    }
}

function selectUnit(type, value) {
    const mode = document.querySelector('.active-tab').dataset.value;
    const options = unitData[mode];
    if (type === 'input') {
        currentInputUnit = value;
        if (currentInputUnit === currentOutputUnit) currentOutputUnit = options.find(o => o !== value);
    } else {
        currentOutputUnit = value;
        if (currentOutputUnit === currentInputUnit) currentInputUnit = options.find(o => o !== value);
    }
    renderPills();
    performTranslation();
}

function renderDropdowns(mode) {
    const options = unitData[mode] || [];
    currentInputUnit = options[0];
    currentOutputUnit = options[1] || options[0];
    dropdownInput.innerHTML = options.map(opt => `<div class="dropdown-item" onclick="selectUnit('input', '${opt}')">${opt}</div>`).join('');
    dropdownOutput.innerHTML = options.map(opt => `<div class="dropdown-item" onclick="selectUnit('output', '${opt}')">${opt}</div>`).join('');
    renderPills();
}

function renderPills() {
    pillInputLabel.innerText = currentInputUnit;
    pillOutputLabel.innerText = currentOutputUnit;
    dropdownInput.classList.remove('show');
    dropdownOutput.classList.remove('show');
}

const navTabs = document.querySelectorAll('.nav-tab');
navTabs.forEach(tab => {
    tab.addEventListener('click', function() {
        navTabs.forEach(t => { t.classList.remove('active-tab'); t.classList.add('inactive-tab'); });
        this.classList.add('active-tab'); this.classList.remove('inactive-tab');
        renderDropdowns(this.dataset.value);
    });
});

// Tema & Zaman (Mevcut fonksiyonların)
document.getElementById('themeToggle').addEventListener('click', function() {
    document.documentElement.classList.toggle('dark');
});

function toBase12(n, pad = 2) {
    const digits = "θ123456789ΦΛ";
    if (n === 0) return "θ".repeat(pad);
    let res = ""; let num = Math.abs(Math.floor(n));
    while (num > 0) { res = digits[num % 12] + res; num = Math.floor(num / 12); }
    return res.padStart(pad, 'θ');
}

function updateTime() {
    const clockEl = document.getElementById('clock');
    const dateEl = document.getElementById('date');
    if(!clockEl || !dateEl) return;
    const now = new Date();
    // Zaman hesaplamaların...
    clockEl.textContent = "00.00.00"; // Örnek
}

setInterval(updateTime, 100);
renderDropdowns("Alfabe");
