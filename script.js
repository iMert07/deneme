const latin = document.getElementById('latin'); // Sol Kutu
const greek = document.getElementById('greek'); // Sağ Kutu
const pillInputLabel = document.getElementById('pill-input-label');
const pillOutputLabel = document.getElementById('pill-output-label');
const dropdownInput = document.getElementById('dropdown-input');
const dropdownOutput = document.getElementById('dropdown-output');
let activeInput = latin;

// Aktif birimler
let currentInputUnit = "Standart";
let currentOutputUnit = "Yeni Alfabe";

const unitData = {
    "Alfabe": ["Standart", "Yeni Alfabe"],
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

const alphabetMaps = {
    "Standart": [
        "a", "b", "c", "ç", "d", "e", "f", "g", "ğ", "h", "ı", "i", "j", "k", "l", "m", "n", "o", "ö", "p", "r", "s", "ş", "t", "u", "ü", "v", "x", "y", "z",
        "A", "B", "C", "Ç", "D", "E", "F", "G", "Ğ", "H", "I", "İ", "J", "K", "L", "M", "N", "O", "Ö", "P", "R", "S", "Ş", "T", "U", "Ü", "V", "X", "Y", "Z",
        "0"
    ],
    "Yeni Alfabe": [
        "Α", "Β", "J", "C", "D", "Ε", "F", "G", "Γ", "Η", "Ь", "Ͱ", "Σ", "Κ", "L", "Μ", "Ν", "Q", "Ω", "Π", "Ρ", "S", "Ш", "Τ", "U", "Υ", "V", "Ψ", "R", "Ζ",
        "Α", "Β", "J", "C", "D", "Ε", "F", "G", "Γ", "Η", "Ь", "Ͱ", "Σ", "Κ", "L", "Μ", "Ν", "Q", "Ω", "Π", "Ρ", "S", "Ш", "Τ", "U", "Υ", "V", "Ψ", "R", "Ζ",
        "θ"
    ]
};

// Çeviri Motoru
function universalTranslate(text, fromUnit, toUnit) {
    if (fromUnit === toUnit) return text;
    const sourceMap = alphabetMaps[fromUnit];
    const targetMap = alphabetMaps[toUnit];
    
    if (!sourceMap || !targetMap) return text;

    return text.split('').map(char => {
        const index = sourceMap.indexOf(char);
        return index !== -1 ? targetMap[index] : char;
    }).join('');
}

// Merkezi Tetikleyici
function performTranslation() {
    const mode = document.querySelector('.active-tab').dataset.value;
    if (mode === "Alfabe") {
        if (activeInput === latin) {
            // Sol kutu (latin) üzerinden işlem yapılıyorsa sağ kutuyu (greek) güncelle
            greek.value = universalTranslate(latin.value, currentInputUnit, currentOutputUnit);
        } else {
            // Sağ kutu (greek) üzerinden işlem yapılıyorsa sol kutuyu (latin) güncelle
            latin.value = universalTranslate(greek.value, currentOutputUnit, currentInputUnit);
        }
    }
}

// Event Listeners (Giriş ve Odak)
[latin, greek].forEach(inputEl => {
    inputEl.addEventListener('input', (e) => {
        activeInput = e.target;
        performTranslation();
    });
    inputEl.addEventListener('focus', (e) => {
        activeInput = e.target;
    });
});

// Birim Seçimi ve UI Güncelleme
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
    // Birim değiştiğinde mevcut metni yeni birime göre tekrar çevir
    performTranslation();
}

function renderPills() {
    pillInputLabel.innerText = currentInputUnit;
    pillOutputLabel.innerText = currentOutputUnit;
    dropdownInput.classList.remove('show');
    dropdownOutput.classList.remove('show');
}

function renderDropdowns(mode) {
    const options = unitData[mode] || [];
    currentInputUnit = options[0];
    currentOutputUnit = options[1] || options[0];
    
    dropdownInput.innerHTML = options.map(opt => `<div class="dropdown-item" onclick="selectUnit('input', '${opt}')">${opt}</div>`).join('');
    dropdownOutput.innerHTML = options.map(opt => `<div class="dropdown-item" onclick="selectUnit('output', '${opt}')">${opt}</div>`).join('');
    renderPills();
}

// Navigasyon (Sekme Değişimi)
document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.nav-tab').forEach(t => { 
            t.classList.remove('active-tab'); t.classList.add('inactive-tab'); 
        });
        this.classList.add('active-tab'); this.classList.remove('inactive-tab');
        renderDropdowns(this.dataset.value);
    });
});

// Başlatma
renderDropdowns("Alfabe");
