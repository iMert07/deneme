// --- ELEMENT SEÇİCİLER ---
const inputArea = document.getElementById('input-area');
const outputArea = document.getElementById('output-area');
const pillInputLabel = document.getElementById('pill-input-label');
const pillOutputLabel = document.getElementById('pill-output-label');
const dropdownInput = document.getElementById('dropdown-input');
const dropdownOutput = document.getElementById('dropdown-output');

let currentInputUnit = "Eski Alfabe";
let currentOutputUnit = "Yeni Alfabe";

// --- VERİ SETLERİ ---
const unitData = {
    "Alfabe": ["Eski Alfabe", "Yeni Alfabe"],
    "Sayı": ["İkilik (2)", "Onluk (10)", "Anatolya (12)", "On Altılık (16)"],
    "Para": ["Lira", "Akçe", "Dollar", "Euro", "Gümüş (Ons)", "Altın (Ons)"],
    "Zaman": ["Milisaniye", "Saniye", "Dakika", "Saat", "Gün", "Ay", "Yıl (Anatolya)", "Yıl (Gregoryen)"],
    "Uzunluk": ["Milimetre (10⁻³)", "Santimetre (10⁻²)", "Metre (10⁰)", "Kilometre (10³)", "Arşın (12⁰)", "Fersah (12³)"],
    "Kütle": ["Gram (10⁰)", "Kilogram (10³)", "Okka (12⁰)", "Kantar (12¹)"],
    "Sıcaklık": ["Celsius", "Anatolya", "Fahrenheit", "Kelvin"],
    "Veri": ["Byte", "Kilobyte", "Megabyte", "Gigabyte", "Terabyte", "Anatolya Verisi"]
};

// --- DÖNÜŞTÜRÜCÜLER ---
function toBase12(n, pad = 1, isAnatolya = true) {
    const digits = isAnatolya ? "0123456789ΦΛ" : "0123456789AB";
    let num = Math.abs(Math.floor(n));
    let res = "";
    if (num === 0) res = digits[0];
    else { while (num > 0) { res = digits[num % 12] + res; num = Math.floor(num / 12); } }
    return res.padStart(pad, digits[0]);
}

function toBase12Float(n, isAnatolya = true) {
    const digits = isAnatolya ? "0123456789ΦΛ" : "0123456789AB";
    let integerPart = Math.floor(Math.abs(n));
    let fractionPart = Math.abs(n) - integerPart;
    let res = (n < 0 ? "-" : "") + toBase12(integerPart, 1, isAnatolya);
    if (fractionPart > 0.0001) {
        res += ",";
        for (let i = 0; i < 3; i++) {
            fractionPart *= 12;
            let d = Math.floor(fractionPart);
            res += digits[d];
            fractionPart -= d;
            if (fractionPart < 0.0001) break;
        }
    }
    return res;
}

function normalizeInput(text) { return text.toUpperCase().replace(/θ/g, '0').replace(/Φ/g, 'A').replace(/Λ/g, 'B'); }

// --- SICAKLIK MANTIĞI ---
// Kural: 32 F = 0 Anatolya. 1 F artışı = 1/12 Anatolya artışı (veya tersi)
function convertTemperature(val, from, to) {
    let fahrenheit;
    // Önce her şeyi Fahrenheit'a çek
    if (from === "Celsius") fahrenheit = (val * 9/5) + 32;
    else if (from === "Fahrenheit") fahrenheit = val;
    else if (from === "Kelvin") fahrenheit = (val - 273.15) * 9/5 + 32;
    else if (from === "Anatolya") fahrenheit = (val * 12) + 32;

    // Fahrenheit'tan hedefe dönüştür
    let result;
    if (to === "Celsius") result = (fahrenheit - 32) * 5/9;
    else if (to === "Fahrenheit") result = fahrenheit;
    else if (to === "Kelvin") result = (fahrenheit - 32) * 5/9 + 273.15;
    else if (to === "Anatolya") result = (fahrenheit - 32) / 12;

    return result;
}

function performConversion() {
    const activeTab = document.querySelector('.active-tab');
    if (!activeTab) return;
    const mode = activeTab.dataset.value;
    const text = inputArea.value.trim();
    if (!text) { outputArea.value = ""; return; }

    if (mode === "Sıcaklık") {
        let cleanText = text.replace(',', '.');
        let val;
        if (currentInputUnit === "Anatolya") {
            let normalized = normalizeInput(cleanText);
            val = parseInt(normalized.split('.')[0] || "0", 12);
            // Basit ondalık Anatolya girişi desteği
        } else {
            val = parseFloat(cleanText);
        }

        if (isNaN(val)) { outputArea.value = "Hata"; return; }

        let res = convertTemperature(val, currentInputUnit, currentOutputUnit);
        
        if (currentOutputUnit === "Anatolya") {
            outputArea.value = toBase12Float(res, true) + ` (${res.toFixed(2)})`;
        } else {
            outputArea.value = res.toFixed(2).replace('.', ',');
        }
    } 
    // ... (Diğer dönüşümler buraya gelecek - Alfabe ve Sayı kısımlarını kodunuzdan buraya taşıyabilirsiniz)
    else if (mode === "Alfabe") {
        outputArea.value = (currentInputUnit === "Eski Alfabe") ? text.split('').map(ch => toGreek[ch] || ch).join('') : text.split('').map(ch => toLatin[ch] || ch).join('');
    }
}

// --- UI FONKSİYONLARI ---
function renderDropdowns(mode) {
    const options = unitData[mode] || [];
    currentInputUnit = options[0];
    currentOutputUnit = options[1] || options[0];
    
    const createItems = (type) => options.map(opt => `<div class="dropdown-item" onclick="selectUnit('${type}', '${opt}')">${opt}</div>`).join('');
    dropdownInput.innerHTML = createItems('input');
    dropdownOutput.innerHTML = createItems('output');
    renderPills();
    performConversion();
}

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

function toggleDropdown(type) {
    const el = type === 'input' ? dropdownInput : dropdownOutput;
    el.classList.toggle('show');
}

// Olay Dinleyicileri
inputArea.addEventListener('input', performConversion);
document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.replace('active-tab', 'inactive-tab'));
        this.classList.replace('inactive-tab', 'active-tab');
        renderDropdowns(this.dataset.value);
    });
});

// Başlangıç
renderDropdowns("Alfabe");
