// --- ELEMENT SEÇİCİLER ---
const inputArea = document.getElementById('input-area');
const outputArea = document.getElementById('output-area');
const pillInputLabel = document.getElementById('pill-input-label');
const pillOutputLabel = document.getElementById('pill-output-label');
const dropdownInput = document.getElementById('dropdown-input');
const dropdownOutput = document.getElementById('dropdown-output');

let activeInput = inputArea;
let currentInputUnit = "Standart Alfabe";
let currentOutputUnit = "Yeni Alfabe";

// --- VERİ SETLERİ ---

// Alfabeler: İndeks tabanlı eşleşme (Sıralama aynı olmalı)
const alphabets = {
    "Standart Alfabe": ["A","B","C","Ç","D","E","F","G","Ğ","H","I","İ","J","K","L","M","N","O","Ö","P","R","S","Ş","T","U","Ü","V","Y","Z","X","W","Q","0","1","2","3","4","5","6","7","8","9"],
    "Yeni Alfabe":     ["Α","Β","J","C","D","Ε","F","G","Γ","Η","Ь","Ͱ","Σ","Κ","L","Μ","Ν","Q","Ω","Π","Ρ","S","Ш","Τ","U","Υ","V","R","Ζ","Ψ","W","Q","θ","1","2","3","4","5","6","7","8","9"]
};

// Ölçü Birimleri ve Katsayılar (Temel birimlere göre: Metre, Kilogram, Celsius, m/s)
const unitData = {
    "Alfabe": ["Standart Alfabe", "Yeni Alfabe"],
    "Uzunluk": ["Metre", "Kilometre", "Mil", "İnç", "Ayak (ft)", "Arşın", "Menzil"],
    "Kütle": ["Kilogram", "Gram", "Libre (lb)", "Ons (oz)", "Batman", "Dirhem"],
    "Hız": ["m/s", "km/saat", "mil/saat", "Knot", "Anatolya Hızı"],
    "Sıcaklık": ["Celsius", "Fahrenheit", "Kelvin", "Ilım", "Ayaz"]
};

const rates = {
    "Uzunluk": { "Metre": 1, "Kilometre": 1000, "Mil": 1609.34, "İnç": 0.0254, "Ayak (ft)": 0.3048, "Arşın": 0.68, "Menzil": 5000 },
    "Kütle": { "Kilogram": 1, "Gram": 0.001, "Libre (lb)": 0.4535, "Ons (oz)": 0.0283, "Batman": 7.697, "Dirhem": 0.0032 },
    "Hız": { "m/s": 1, "km/saat": 0.2777, "mil/saat": 0.4470, "Knot": 0.5144, "Anatolya Hızı": 0.85 }
};

// --- ANA MANTIK FONKSİYONLARI ---

function performConversion() {
    const val = inputArea.value;
    const mode = document.querySelector('.active-tab').dataset.value;

    if (mode === "Alfabe") {
        outputArea.value = translateText(val, currentInputUnit, currentOutputUnit);
    } else if (mode === "Sıcaklık") {
        outputArea.value = convertTemperature(val, currentInputUnit, currentOutputUnit);
    } else if (rates[mode]) {
        outputArea.value = convertGeneric(val, mode, currentInputUnit, currentOutputUnit);
    }
}

// Alfabe Çevirici (İndeks Metodu)
function translateText(text, fromKey, toKey) {
    const fromArr = alphabets[fromKey];
    const toArr = alphabets[toKey];
    if (!fromArr || !toArr) return text;

    return text.split('').map(char => {
        const isUpper = char === char.toUpperCase();
        const searchChar = char.toUpperCase();
        const idx = fromArr.indexOf(searchChar);
        if (idx !== -1) {
            const res = toArr[idx];
            return isUpper ? res : res.toLowerCase();
        }
        return char;
    }).join('');
}

// Genel Ölçü Çevirici
function convertGeneric(val, category, from, to) {
    const num = parseFloat(val.replace(',', '.'));
    if (isNaN(num)) return "";
    const baseValue = num * rates[category][from];
    const result = baseValue / rates[category][to];
    return result.toLocaleString('tr-TR', { maximumFractionDigits: 4 });
}

// Sıcaklık Özel Fonksiyonu (Lineer olmadığı için ayrı)
function convertTemperature(val, from, to) {
    let celsius;
    const n = parseFloat(val.replace(',', '.'));
    if (isNaN(n)) return "";

    // To Celsius
    if (from === "Celsius") celsius = n;
    else if (from === "Fahrenheit") celsius = (n - 32) * 5/9;
    else if (from === "Kelvin") celsius = n - 273.15;
    else if (from === "Ilım") celsius = n * 1.5; // Örnek katsayı
    else celsius = n;

    // From Celsius to Target
    if (to === "Celsius") return celsius.toFixed(2);
    if (to === "Fahrenheit") return (celsius * 9/5 + 32).toFixed(2);
    if (to === "Kelvin") return (celsius + 273.15).toFixed(2);
    if (to === "Ilım") return (celsius / 1.5).toFixed(2);
    return celsius.toFixed(2);
}

// --- UI KONTROLLERİ ---

function selectUnit(type, value) {
    if (type === 'input') currentInputUnit = value;
    else currentOutputUnit = value;
    renderPills();
    performConversion();
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
    
    const createItems = (type) => options.map(opt => 
        `<div class="dropdown-item" onclick="selectUnit('${type}', '${opt}')">${opt}</div>`
    ).join('');

    dropdownInput.innerHTML = createItems('input');
    dropdownOutput.innerHTML = createItems('output');
    renderPills();
}

// --- EVENT LISTENERS ---

inputArea.addEventListener('input', performConversion);

document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.replace('active-tab', 'inactive-tab'));
        this.classList.replace('inactive-tab', 'active-tab');
        renderDropdowns(this.dataset.value);
        inputArea.value = "";
        outputArea.value = "";
    });
});

// Başlat
renderDropdowns("Alfabe");
