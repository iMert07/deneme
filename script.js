// --- ELEMENT SEÇİCİLER ---
const inputArea = document.getElementById('input-area');
const outputArea = document.getElementById('output-area');
const pillInputLabel = document.getElementById('pill-input-label');
const pillOutputLabel = document.getElementById('pill-output-label');
const dropdownInput = document.getElementById('dropdown-input');
const dropdownOutput = document.getElementById('dropdown-output');

let activeInput = inputArea;
let currentInputUnit = "Eski Alfabe";
let currentOutputUnit = "Yeni Alfabe";

// --- VERİ SETLERİ VE KATSAYILAR ---
const unitData = {
    "Alfabe": ["Eski Alfabe", "Yeni Alfabe"],
    "Sayı": ["Onluk (10)", "Anatolya (12)", "Onikilik (12)", "İkilik (2)", "Onaltılık (16)"],
    "Para": ["Lira", "Kuruş", "Anatolya Sikkesi"],
    "Uzunluk": ["Metre", "Kilometre", "Mil", "İnç", "Ayak (ft)", "Arşın", "Menzil"],
    "Kütle": ["Kilogram", "Gram", "Libre (lb)", "Ons (oz)", "Batman", "Dirhem"],
    "Sıcaklık": ["Celsius", "Fahrenheit", "Kelvin", "Ilım", "Ayaz"],
    "Hacim": ["Litre", "Mililitre", "Galon", "Kile", "Katre"],
    "Hız": ["km/saat", "mil/saat", "m/s", "Knot", "Anatolya Hızı"],
    "Alan": ["Metrekare", "Dönüm", "Hektar", "Evlek"],
    "Veri": ["Byte", "Kilobyte", "Megabyte", "Gigabyte", "Terabyte", "Anatolya Verisi"],
    "Meridyen": ["Standart Meridyen", "Anatolya Boylamı"],
    "Paralel": ["Standart Paralel", "Anatolya Enlemi"]
};

const conversionRates = {
    "Uzunluk": { "Metre": 1, "Kilometre": 1000, "Mil": 1609.34, "İnç": 0.0254, "Ayak (ft)": 0.3048, "Arşın": 0.68, "Menzil": 5000 },
    "Kütle": { "Kilogram": 1, "Gram": 0.001, "Libre (lb)": 0.4535, "Ons (oz)": 0.0283, "Batman": 7.697, "Dirhem": 0.0032 },
    "Hacim": { "Litre": 1, "Mililitre": 0.001, "Galon": 3.785, "Kile": 36.5, "Katre": 0.00005 },
    "Hız": { "m/s": 1, "km/saat": 0.2777, "mil/saat": 0.4470, "Knot": 0.5144, "Anatolya Hızı": 0.85 },
    "Alan": { "Metrekare": 1, "Dönüm": 1000, "Hektar": 10000, "Evlek": 250 },
    "Veri": { "Byte": 1, "Kilobyte": 1024, "Megabyte": 1048576, "Gigabyte": 1073741824, "Terabyte": 1099511627776, "Anatolya Verisi": 1200 }
};

const toGreek = { "a":"Α","A":"Α", "e":"Ε","E":"Ε", "i":"Ͱ","İ":"Ͱ", "n":"Ν","N":"Ν", "r":"Ρ","R":"Ρ", "l":"L","L":"L", "ı":"Ь","I":"Ь", "k":"Κ","K":"Κ", "d":"D","D":"D", "m":"Μ","M":"Μ", "t":"Τ","T":"Τ", "y":"R","Y":"R", "s":"S","S":"S", "u":"U","U":"U", "o":"Q","O":"Q", "b":"Β","B":"Β", "ş":"Ш","Ş":"Ш", "ü":"Υ","Ü":"Υ", "z":"Ζ","Z":"Ζ", "g":"G","G":"G", "ç":"C","Ç":"C", "ğ":"Γ","Ğ":"Γ", "v":"V","V":"V", "c":"J","C":"J", "h":"Η","H":"Η", "p":"Π","P":"Π", "ö":"Ω","Ö":"Ω", "f":"F","F":"F", "x":"Ψ","X":"Ψ", "j":"Σ","J":"Σ", "0":"θ" };
const toLatin = Object.fromEntries(Object.entries(toGreek).map(([k,v])=>[v,k.toUpperCase()]));

// --- SAYI DÖNÜŞÜM MANTIĞI (Kesirli) ---
function universalNumberConvert(text, fromUnit, toUnit) {
    const stdDigits = "0123456789ABCDEF";
    const anaDigits = "θ123456789ΦΛ";

    const getBase = (unit) => {
        if (unit.includes("(2)")) return 2;
        if (unit.includes("(10)")) return 10;
        if (unit.includes("(12)")) return 12;
        if (unit.includes("(16)")) return 16;
        return 10;
    };

    // Temizleme ve Normalize Etme (Virgülü noktaya çevir, Anatolya harflerini standart tabana çek)
    let input = text.toUpperCase().replace(',', '.');
    if (fromUnit.includes("Anatolya")) {
        input = input.split('').map(c => stdDigits[anaDigits.indexOf(c)] || c).join('');
    }

    const fromBase = getBase(fromUnit);
    const toBase = getBase(toUnit);

    // Any Base to Decimal (Fractional)
    const parts = input.split('.');
    let decimalValue = parseInt(parts[0], fromBase);
    if (parts[1]) {
        for (let i = 0; i < parts[1].length; i++) {
            decimalValue += stdDigits.indexOf(parts[1][i]) * Math.pow(fromBase, -(i + 1));
        }
    }

    if (isNaN(decimalValue)) return "Hata";

    // Decimal to Any Base (Fractional)
    let integerPart = Math.floor(decimalValue);
    let fractionalPart = decimalValue - integerPart;
    
    let resInteger = integerPart.toString(toBase).toUpperCase();
    let resFraction = "";
    
    for (let i = 0; i < 6; i++) { // 6 basamak hassasiyet
        fractionalPart *= toBase;
        let digit = Math.floor(fractionalPart);
        resFraction += stdDigits[digit];
        fractionalPart -= digit;
        if (fractionalPart === 0) break;
    }

    let final = resInteger + (resFraction ? "." + resFraction : "");
    
    // Eğer hedef Anatolya ise harfleri değiştir
    if (toUnit.includes("Anatolya")) {
        final = final.split('').map(c => anaDigits[stdDigits.indexOf(c)] || c).join('');
    }
    
    return final.replace('.', ',');
}

// --- MERKEZİ DÖNÜŞÜM MOTORU ---
function performConversion() {
    const activeTab = document.querySelector('.active-tab');
    if (!activeTab) return;
    const mode = activeTab.dataset.value;
    const text = inputArea.value.trim();

    if (!text) { outputArea.value = ""; return; }

    if (mode === "Alfabe") {
        if (currentInputUnit === "Eski Alfabe" && currentOutputUnit === "Yeni Alfabe") {
            outputArea.value = text.split('').map(ch => toGreek[ch] || ch).join('');
        } else if (currentInputUnit === "Yeni Alfabe" && currentOutputUnit === "Eski Alfabe") {
            outputArea.value = text.split('').map(ch => toLatin[ch] || ch).join('');
        } else { outputArea.value = text; }
    } 
    else if (mode === "Sayı") {
        outputArea.value = universalNumberConvert(text, currentInputUnit, currentOutputUnit);
    }
    else if (mode === "Sıcaklık") {
        outputArea.value = handleTemperature(text);
    }
    else if (conversionRates[mode]) {
        const val = parseFloat(text.replace(',', '.'));
        if (isNaN(val)) { outputArea.value = "Geçersiz Sayı"; return; }
        const baseVal = val * conversionRates[mode][currentInputUnit];
        const result = baseVal / conversionRates[mode][currentOutputUnit];
        outputArea.value = result.toLocaleString('tr-TR', { maximumFractionDigits: 5 });
    }
}

function handleTemperature(text) {
    const v = parseFloat(text.replace(',', '.'));
    if (isNaN(v)) return "Hata";
    let c;
    if (currentInputUnit === "Celsius") c = v;
    else if (currentInputUnit === "Fahrenheit") c = (v - 32) * 5/9;
    else if (currentInputUnit === "Kelvin") c = v - 273.15;
    else c = v * 2; 

    if (currentOutputUnit === "Celsius") return c.toFixed(2);
    if (currentOutputUnit === "Fahrenheit") return (c * 9/5 + 32).toFixed(2);
    if (currentOutputUnit === "Kelvin") return (c + 273.15).toFixed(2);
    return (c / 2).toFixed(2);
}

// --- UI VE DİĞER FONKSİYONLAR ---

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
        if (currentInputUnit === currentOutputUnit) currentOutputUnit = options.find(o => o !== value) || options[0];
    } else {
        currentOutputUnit = value;
        if (currentOutputUnit === currentInputUnit) currentInputUnit = options.find(o => o !== value) || options[0];
    }
    renderPills();
    performConversion();
}

function renderDropdowns(mode) {
    const options = unitData[mode] || [];
    currentInputUnit = options[0];
    currentOutputUnit = options[1] || options[0];
    dropdownInput.innerHTML = options.map(opt => `<div class="dropdown-item" onclick="selectUnit('input', '${opt}')">${opt}</div>`).join('');
    dropdownOutput.innerHTML = options.map(opt => `<div class="dropdown-item" onclick="selectUnit('output', '${opt}')">${opt}</div>`).join('');
    renderPills();
    performConversion();
}

function renderPills() {
    pillInputLabel.innerText = currentInputUnit;
    pillOutputLabel.innerText = currentOutputUnit;
    dropdownInput.classList.remove('show');
    dropdownOutput.classList.remove('show');
}

// --- OLAY DİNLEYİCİLER ---
inputArea.addEventListener('input', performConversion);
inputArea.addEventListener('focus', () => activeInput = inputArea);

document.querySelectorAll('.key').forEach(key => {
    key.addEventListener('click', (e) => {
        e.preventDefault();
        const action = key.dataset.action;
        if(action === 'delete') inputArea.value = inputArea.value.slice(0,-1);
        else if(action === 'reset') { inputArea.value = ''; outputArea.value = ''; }
        else if(action === 'space') inputArea.value += ' ';
        else if(action === 'enter') inputArea.value += '\n';
        else if(!key.classList.contains('fn-key')) inputArea.value += key.innerText;
        performConversion();
    });
});

document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.replace('active-tab', 'inactive-tab'));
        this.classList.replace('inactive-tab', 'active-tab');
        renderDropdowns(this.dataset.value);
    });
});

document.getElementById('themeToggle').addEventListener('click', function() {
    document.documentElement.classList.toggle('dark');
});

// --- ZAMAN FONKSİYONLARI ---
function toBase12(n, pad = 2) {
    const digits = "θ123456789ΦΛ";
    if (n === 0) return "θ".repeat(pad);
    let res = ""; let num = Math.abs(Math.floor(n));
    while (num > 0) { res = digits[num % 12] + res; num = Math.floor(num / 12); }
    return res.padStart(pad, 'θ');
}

function calculateCustomDate(now) {
    const gregBase = new Date(1071, 2, 21);
    const diff = now - gregBase;
    const daysPassed = Math.floor(diff / 86400000);
    let year = 0; let daysCounter = 0;
    while (true) {
        let yearDays = (year + 1) % 20 === 0 && (year + 1) % 640 !== 0 ? 370 : 365;
        if (daysCounter + yearDays > daysPassed) break;
        daysCounter += yearDays; year++;
    }
    const dOY = daysPassed - daysCounter;
    const m = Math.floor(dOY / 30) + 1;
    const d = (dOY % 30) + 1;
    return { base12: `${toBase12(d)}.${toBase12(m)}.${toBase12(year + 10368, 4)}` };
}

function updateTime() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 4, 30, 0);
    if (now < todayStart) todayStart.setDate(todayStart.getDate() - 1);
    const totalSecs = Math.floor(((now - todayStart) / 1000) * 2);
    const h = Math.floor(totalSecs / 14400) % 12;
    const m = Math.floor((totalSecs / 120) % 120);
    const s = totalSecs % 120;
    document.getElementById('clock').textContent = `${toBase12(h)}.${toBase12(m)}.${toBase12(s)}`;
    document.getElementById('date').textContent = calculateCustomDate(now).base12;
}

setInterval(updateTime, 100);
updateTime();
renderDropdowns("Alfabe");
