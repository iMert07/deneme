const leftBox = document.getElementById('latin'); // Görsel adı latin kalsa da "Sol Kutu"
const rightBox = document.getElementById('greek'); // Görsel adı greek kalsa da "Sağ Kutu"
const pillInputLabel = document.getElementById('pill-input-label');
const pillOutputLabel = document.getElementById('pill-output-label');
const dropdownInput = document.getElementById('dropdown-input');
const dropdownOutput = document.getElementById('dropdown-output');
let activeInput = leftBox;

// Aktif birim durumları
let currentInputUnit = "Standart Alfabe";
let currentOutputUnit = "Yeni Alfabe";

const unitData = {
    "Alfabe": ["Standart Alfabe", "Yeni Alfabe", "Fars Alfabesi (Yok)", "Orhun Alfabesi (Yok)"],
    "Sayı": ["Onluk (Standart)", "Onikilik (Anatolya)"],
    "Uzunluk": ["Metre", "Kilometre", "Arşın", "Menzil"],
    "Kütle": ["Kilogram", "Gram", "Batman", "Dirhem"],
    // Diğer birimler buraya eklenebilir...
};

// 1. ALFABE VERİLERİ
const alphabetMaps = {
    "Standart Alfabe": ["a", "b", "c", "ç", "d", "e", "f", "g", "ğ", "h", "ı", "i", "j", "k", "l", "m", "n", "o", "ö", "p", "r", "s", "ş", "t", "u", "ü", "v", "x", "y", "z", "0"],
    "Yeni Alfabe": ["Α", "Β", "J", "C", "D", "Ε", "F", "G", "Γ", "Η", "Ь", "Ͱ", "Σ", "Κ", "L", "Μ", "Ν", "Q", "Ω", "Π", "Ρ", "S", "Ш", "Τ", "U", "Υ", "V", "Ψ", "R", "Ζ", "θ"]
};

// 2. ÖLÇÜ BİRİMİ DÖNÜŞÜM KATSAYILARI (Baz birim: Metre/Kilogram)
const conversionRates = {
    "Metre": 1,
    "Kilometre": 1000,
    "Arşın": 0.68,
    "Menzil": 5000,
    "Kilogram": 1,
    "Gram": 0.001,
    "Batman": 7.69,
    "Dirhem": 0.0032
};

// --- ANA ÇEVİRİ VE HESAPLAMA MOTORU ---
function processConversion(value, from, to, mode) {
    if (from === to || value === "") return value;

    if (mode === "Alfabe") {
        const sourceMap = alphabetMaps[from];
        const targetMap = alphabetMaps[to];
        if (!sourceMap || !targetMap) return value;

        return value.split('').map(char => {
            let index = sourceMap.indexOf(char);
            if (index === -1) index = sourceMap.indexOf(char.toLowerCase());
            return index !== -1 ? targetMap[index] : char;
        }).join('');
    } 
    
    // Sayı, Uzunluk, Kütle gibi sayısal dönüşümler
    else {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return value;

        // Sayı sekmesi için özel 12'lik taban mantığı (Örn: Onluk -> Onikilik)
        if (mode === "Sayı") {
            if (from.includes("Onluk") && to.includes("Onikilik")) return toBase12(numValue);
            return value; 
        }

        // Ölçü birimleri için katsayı hesabı
        const inBase = numValue * (conversionRates[from] || 1);
        const result = inBase / (conversionRates[to] || 1);
        return result.toFixed(2);
    }
}

function performAction() {
    const mode = document.querySelector('.active-tab').dataset.value;
    if (activeInput === leftBox) {
        rightBox.value = processConversion(leftBox.value, currentInputUnit, currentOutputUnit, mode);
    } else {
        leftBox.value = processConversion(rightBox.value, currentOutputUnit, currentInputUnit, mode);
    }
}

// --- DINAMIK ETKİLEŞİM ---
[leftBox, rightBox].forEach(el => {
    el.addEventListener('input', (e) => {
        activeInput = e.target;
        performAction();
    });
    el.addEventListener('focus', (e) => activeInput = e.target);
});

function selectUnit(type, value) {
    const mode = document.querySelector('.active-tab').dataset.value;
    if (type === 'input') currentInputUnit = value;
    else currentOutputUnit = value;
    
    renderPills();
    performAction();
}

function renderDropdowns(mode) {
    const options = unitData[mode] || [];
    currentInputUnit = options[0];
    currentOutputUnit = options[1] || options[0];
    
    const createItems = (type) => options.map(opt => `<div class="dropdown-item" onclick="selectUnit('${type}', '${opt}')">${opt}</div>`).join('');
    dropdownInput.innerHTML = createItems('input');
    dropdownOutput.innerHTML = createItems('output');
    renderPills();
}

function renderPills() {
    pillInputLabel.innerText = currentInputUnit;
    pillOutputLabel.innerText = currentOutputUnit;
    document.querySelectorAll('.dropdown-content').forEach(d => d.classList.remove('show'));
}

function toggleDropdown(type) {
    const el = type === 'input' ? dropdownInput : dropdownOutput;
    el.classList.toggle('show');
}

// --- DİĞER FONKSİYONLAR (Tab, Zaman, Tema) ---
document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active-tab'));
        this.classList.add('active-tab');
        renderDropdowns(this.dataset.value);
        leftBox.value = ""; rightBox.value = "";
    });
});

function toBase12(n) {
    const digits = "θ123456789ΦΛ";
    if (n === 0) return "θ";
    let res = ""; let num = Math.abs(Math.floor(n));
    while (num > 0) { res = digits[num % 12] + res; num = Math.floor(num / 12); }
    return res;
}

// Başlatma
renderDropdowns("Alfabe");
