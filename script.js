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
    "Para": ["Lira", "Kuruş", "Anatolya Sikkesi"],
    "Zaman": [
        "Milisaniye", "Salise (Anatolya)", "Salise", 
        "Saniye (Anatolya)", "Saniye", "Dakika", 
        "Saat", "Saat (Anatolya)", "Gün", 
        "Hafta (Anatolya)", "Hafta", "Ay", "Yıl (Anatolya)", "Yıl (Gregoryen)"
    ],
    "Uzunluk": ["Metre", "Kilometre", "Mil", "İnç", "Ayak (ft)", "Arşın", "Menzil"],
    "Kütle": ["Kilogram", "Gram", "Libre (lb)", "Ons (oz)", "Batman", "Dirhem"],
    "Sıcaklık": ["Celsius", "Fahrenheit", "Kelvin", "Ilım", "Ayaz"],
    "Veri": ["Byte", "Kilobyte", "Megabyte", "Gigabyte", "Terabyte", "Anatolya Verisi"]
};

const conversionRates = {
    "Uzunluk": { "Metre": 1, "Kilometre": 1000, "Mil": 1609.34, "İnç": 0.0254, "Ayak (ft)": 0.3048, "Arşın": 0.68, "Menzil": 5000 },
    "Kütle": { "Kilogram": 1, "Gram": 0.001, "Libre (lb)": 0.4535, "Ons (oz)": 0.0283, "Batman": 7.697, "Dirhem": 0.0032 },
    "Veri": { "Byte": 1, "Kilobyte": 1024, "Megabyte": 1048576, "Gigabyte": 1073741824, "Terabyte": 1099511627776, "Anatolya Verisi": 1200 },
    "Zaman": { 
        "Milisaniye": 0.001, "Salise (Anatolya)": 1/240, "Salise": 1/60, "Saniye (Anatolya)": 0.5, "Saniye": 1, 
        "Dakika": 60, "Saat": 3600, "Saat (Anatolya)": 7200, "Gün": 86400, "Hafta (Anatolya)": 432000, "Hafta": 604800, "Ay": 2592000
    }
};

const toGreek = { "a":"Α","A":"Α", "e":"Ε","E":"Ε", "i":"Ͱ","İ":"Ͱ", "n":"Ν","N":"Ν", "r":"Ρ","R":"Ρ", "l":"L","L":"L", "ı":"Ь","I":"Ь", "k":"Κ","K":"Κ", "d":"D","D":"D", "m":"Μ","M":"Μ", "t":"Τ","T":"Τ", "y":"R","Y":"R", "s":"S","S":"S", "u":"U","U":"U", "o":"Q","O":"Q", "b":"Β","B":"Β", "ş":"Ш","Ş":"Ш", "ü":"Υ","Ü":"Υ", "z":"Ζ","Z":"Ζ", "g":"G","G":"G", "ç":"C","Ç":"C", "ğ":"Γ","Ğ":"Ğ", "v":"V","V":"V", "c":"J","C":"J", "h":"Η","H":"Η", "p":"Π","P":"Π", "ö":"Ω","Ö":"Ω", "f":"F","F":"F", "x":"Ψ","X":"Ψ", "j":"Σ","J":"Σ", "0":"θ" };

// --- GİRDİ NORMALİZASYONU ---
function normalizeInput(text) {
    return text.toUpperCase().replace(/θ/g, '0').replace(/Φ/g, 'A').replace(/Λ/g, 'B');
}

// --- ARTIK YIL HESAPLAYICILAR ---
function getGregorianDays(years) {
    let totalDays = 0;
    for (let i = 1; i <= Math.floor(years); i++) {
        if ((i % 4 === 0 && i % 100 !== 0) || (i % 400 === 0)) totalDays += 366;
        else totalDays += 365;
    }
    totalDays += (years % 1) * 365.2425;
    return totalDays;
}

function getAnatolyaDays(years) {
    let totalDays = 0;
    for (let i = 1; i <= Math.floor(years); i++) {
        if (i % 20 === 0 && i % 640 !== 0) totalDays += 370;
        else totalDays += 365;
    }
    totalDays += (years % 1) * 365.25; 
    return totalDays;
}

// --- TABAN DÖNÜŞTÜRÜCÜ ---
function toBase12(n, pad = 1, isAnatolya = true) {
    const digits = isAnatolya ? "θ123456789ΦΛ" : "0123456789AB";
    let num = Math.abs(n);
    let integerPart = Math.floor(num);
    let fractionPart = num - integerPart;
    let res = "";
    if (integerPart === 0) res = digits[0];
    else { while (integerPart > 0) { res = digits[integerPart % 12] + res; integerPart = Math.floor(integerPart / 12); } }
    res = res.padStart(pad, digits[0]);
    if (fractionPart > 0.001) {
        res += ",";
        for (let i = 0; i < 3; i++) { fractionPart *= 12; let d = Math.floor(fractionPart); res += digits[d]; fractionPart -= d; if (fractionPart < 0.001) break; }
    }
    return res;
}

// --- SAYI / TABAN DÖNÜŞÜMÜ ---
function universalNumberConvert(text, fromUnit, toUnit) {
    const stdDigits = "0123456789ABCDEF";
    const getBase = (unit) => {
        if (unit.includes("(2)")) return 2;
        if (unit.includes("Anatolya") || unit.includes("(12)")) return 12;
        if (unit.includes("(16)")) return 16;
        return 10;
    };
    let input = normalizeInput(text.toUpperCase()).replace(',', '.');
    const fromBase = getBase(fromUnit);
    const toBase = getBase(toUnit);
    const parts = input.split('.');
    let dec = parseInt(parts[0], fromBase);
    if (parts[1]) {
        for (let i = 0; i < parts[1].length; i++) {
            let digitVal = stdDigits.indexOf(parts[1][i]);
            if (digitVal >= fromBase || digitVal === -1) break;
            dec += digitVal * Math.pow(fromBase, -(i + 1));
        }
    }
    if (isNaN(dec)) return "Hata";
    if (toUnit.includes("Anatolya")) {
        const anaVal = toBase12(dec, 1, true);
        const stdVal = toBase12(dec, 1, false);
        return (anaVal === stdVal) ? anaVal : `${anaVal} (${stdVal})`;
    }
    return dec.toString(toBase).toUpperCase().replace('.', ',');
}

// --- MERKEZİ DÖNÜŞÜM MOTORU ---
function performConversion() {
    const activeTab = document.querySelector('.active-tab');
    if (!activeTab) return;
    const mode = activeTab.dataset.value;
    const text = inputArea.value.trim();
    if (!text) { outputArea.value = ""; return; }

    if (mode === "Alfabe") {
        outputArea.value = text.split('').map(ch => toGreek[ch] || ch).join('');
    } 
    else if (mode === "Sayı") {
        outputArea.value = universalNumberConvert(text, currentInputUnit, currentOutputUnit);
    }
    else if (mode === "Zaman") {
        let numericValue;
        const isInputSpecial = currentInputUnit.includes("Anatolya") || ["Gün", "Ay"].includes(currentInputUnit);
        if (isInputSpecial) {
            const normalizedText = normalizeInput(text.toUpperCase()).replace(',','.');
            const parts = normalizedText.split('.');
            numericValue = parseInt(parts[0], 12);
            if (parts[1]) {
                const stdDigits = "0123456789ABCDEF";
                for (let i = 0; i < parts[1].length; i++) numericValue += stdDigits.indexOf(parts[1][i]) * Math.pow(12, -(i+1));
            }
        } else { numericValue = parseFloat(text.replace(',', '.')); }

        if (isNaN(numericValue)) { outputArea.value = "Hata"; return; }

        let baseSeconds;
        if (currentInputUnit === "Yıl (Gregoryen)") baseSeconds = getGregorianDays(numericValue) * 86400;
        else if (currentInputUnit === "Yıl (Anatolya)") baseSeconds = getAnatolyaDays(numericValue) * 86400;
        else baseSeconds = numericValue * (conversionRates["Zaman"][currentInputUnit] || 1);

        let result;
        if (currentOutputUnit === "Yıl (Gregoryen)") result = baseSeconds / (365.2425 * 86400);
        else if (currentOutputUnit === "Yıl (Anatolya)") result = baseSeconds / (365.25 * 86400);
        else result = baseSeconds / (conversionRates["Zaman"][currentOutputUnit] || 1);

        const isOutputSpecial = currentOutputUnit.includes("Anatolya") || ["Gün", "Ay"].includes(currentOutputUnit);
        if (isOutputSpecial) {
            const anaVal = toBase12(result, 1, true);
            const stdVal = toBase12(result, 1, false);
            const decStr = Number(result.toFixed(2)).toLocaleString('tr-TR');
            let resStr = anaVal;
            if (anaVal !== stdVal) resStr += ` (${stdVal})`;
            resStr += ` [${decStr}]`;
            outputArea.value = resStr;
        } else {
            outputArea.value = Number(result.toFixed(5)).toLocaleString('tr-TR');
        }
    }
}

// --- UI & EVENT LISTENERS ---
function selectUnit(type, value) {
    if (type === 'input') { if (value === currentOutputUnit) currentOutputUnit = currentInputUnit; currentInputUnit = value; }
    else { if (value === currentInputUnit) currentInputUnit = currentOutputUnit; currentOutputUnit = value; }
    renderPills(); performConversion();
}

function renderDropdowns(mode) {
    const options = unitData[mode] || [];
    if (mode === "Sayı") { currentInputUnit = "Onluk (10)"; currentOutputUnit = "Anatolya (12)"; }
    else { currentInputUnit = options[0]; currentOutputUnit = options[1] || options[0]; }
    const createItems = (type) => options.map(opt => `<div class="dropdown-item" onclick="selectUnit('${type}', '${opt}')">${opt}</div>`).join('');
    dropdownInput.innerHTML = createItems('input'); dropdownOutput.innerHTML = createItems('output');
    renderPills(); performConversion();
}

function renderPills() { pillInputLabel.innerText = currentInputUnit; pillOutputLabel.innerText = currentOutputUnit; dropdownInput.classList.remove('show'); dropdownOutput.classList.remove('show'); }
function toggleDropdown(type) { const el = type === 'input' ? dropdownInput : dropdownOutput; const other = type === 'input' ? dropdownOutput : dropdownInput; other.classList.remove('show'); el.classList.toggle('show'); }
window.onclick = function(event) { if (!event.target.closest('.unit-pill')) { dropdownInput.classList.remove('show'); dropdownOutput.classList.remove('show'); } }

inputArea.addEventListener('input', performConversion);
document.querySelectorAll('.key').forEach(key => { key.addEventListener('click', () => {
    const action = key.dataset.action;
    if(action === 'delete') inputArea.value = inputArea.value.slice(0,-1);
    else if(action === 'reset') { inputArea.value = ''; outputArea.value = ''; }
    else if(!key.classList.contains('fn-key')) inputArea.value += key.innerText;
    performConversion();
}); });

document.querySelectorAll('.nav-tab').forEach(tab => { tab.addEventListener('click', function() {
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.replace('active-tab', 'inactive-tab'));
    this.classList.replace('inactive-tab', 'active-tab'); renderDropdowns(this.dataset.value);
}); });

document.getElementById('themeToggle').addEventListener('click', () => document.documentElement.classList.toggle('dark'));

// --- HEADER TAKVİM VE SAAT (DÜZELTİLDİ) ---
function updateHeader() {
    const now = new Date();
    
    // 1. Saat Hesaplama (Gerçek zamana duyarlı, θθ paddingli)
    const clockStr = `${toBase12(now.getHours(), 2, true)}.${toBase12(now.getMinutes(), 2, true)}.${toBase12(now.getSeconds(), 2, true)}`;
    document.getElementById('clock').textContent = clockStr;
    
    // 2. Tarih Hesaplama (Senin orijinal kuralın: 1071-03-21 bazlı)
    const gregBase = new Date(1071, 2, 21);
    const diff = now - gregBase;
    const daysPassed = Math.floor(diff / 86400000);
    
    let year = 0; let daysCounter = 0;
    while (true) {
        let yearDays = ((year + 1) % 20 === 0 && (year + 1) % 640 !== 0) ? 370 : 365;
        if (daysCounter + yearDays > daysPassed) break;
        daysCounter += yearDays; year++;
    }
    
    const dayOfYear = daysPassed - daysCounter;
    const day = (dayOfYear % 30) + 1;
    const month = Math.floor(dayOfYear / 30) + 1;
    
    // Tarih Gösterimi (10368 katsayısı korundu)
    const dateStr = `${toBase12(day, 2, true)}.${toBase12(month, 2, true)}.${toBase12(year + 10368, 4, true)}`;
    document.getElementById('date').textContent = dateStr;
}

setInterval(updateHeader, 1000);
updateHeader();
renderDropdowns("Alfabe");
