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

// --- VERİ SETLERİ ---
const unitData = {
    "Alfabe": ["Eski Alfabe", "Yeni Alfabe"],
    "Sayı": ["İkilik (2)", "Onluk (10)", "On İkilik (12)", "Anatolya (12)", "On Altılık (16)"],
    "Para": ["Lira", "Kuruş", "Anatolya Sikkesi"],
    "Zaman": [
        "Salise", "Salise (Anatolya)", 
        "Saniye", "Saniye (Anatolya)", 
        "Dakika", "Dakika (Anatolya)", 
        "Saat", "Saat (Anatolya)", 
        "Gün", "Hafta (Anatolya)", 
        "Ay (Anatolya)", "Yıl (Anatolya)"
    ],
    "Uzunluk": ["Metre", "Kilometre", "Mil", "İnç", "Ayak (ft)", "Arşın", "Menzil"],
    "Kütle": ["Kilogram", "Gram", "Libre (lb)", "Ons (oz)", "Batman", "Dirhem"],
    "Sıcaklık": ["Celsius", "Fahrenheit", "Kelvin", "Ilım", "Ayaz"],
    "Veri": ["Byte", "Kilobyte", "Megabyte", "Gigabyte", "Terabyte", "Anatolya Verisi"]
};

// --- KATSAYILAR ---
const conversionRates = {
    "Uzunluk": { "Metre": 1, "Kilometre": 1000, "Mil": 1609.34, "İnç": 0.0254, "Ayak (ft)": 0.3048, "Arşın": 0.68, "Menzil": 5000 },
    "Kütle": { "Kilogram": 1, "Gram": 0.001, "Libre (lb)": 0.4535, "Ons (oz)": 0.0283, "Batman": 7.697, "Dirhem": 0.0032 },
    "Veri": { "Byte": 1, "Kilobyte": 1024, "Megabyte": 1048576, "Gigabyte": 1073741824, "Terabyte": 1099511627776, "Anatolya Verisi": 1200 },
    "Zaman": { 
        "Salise": 1/60, "Salise (Anatolya)": 1/240, 
        "Saniye": 1, "Saniye (Anatolya)": 0.5,
        "Dakika": 60, "Dakika (Anatolya)": 60, 
        "Saat": 3600, "Saat (Anatolya)": 7200, 
        "Gün": 86400, "Hafta (Anatolya)": 432000, 
        "Ay (Anatolya)": 2592000, "Yıl (Anatolya)": 31536000 
    }
};

const toGreek = { "a":"Α","A":"Α", "e":"Ε","E":"Ε", "i":"Ͱ","İ":"Ͱ", "n":"Ν","N":"Ν", "r":"Ρ","R":"Ρ", "l":"L","L":"L", "ı":"Ь","I":"Ь", "k":"Κ","K":"Κ", "d":"D","D":"D", "m":"Μ","M":"Μ", "t":"Τ","T":"Τ", "y":"R","Y":"R", "s":"S","S":"S", "u":"U","U":"U", "o":"Q","O":"Q", "b":"Β","B":"Β", "ş":"Ш","Ş":"Ш", "ü":"Υ","Ü":"Υ", "z":"Ζ","Z":"Ζ", "g":"G","G":"G", "ç":"C","Ç":"C", "ğ":"Γ","Ğ":"Ğ", "v":"V","V":"V", "c":"J","C":"J", "h":"Η","H":"Η", "p":"Π","P":"Π", "ö":"Ω","Ö":"Ω", "f":"F","F":"F", "x":"Ψ","X":"Ψ", "j":"Σ","J":"Σ", "0":"θ" };
const toLatin = Object.fromEntries(Object.entries(toGreek).map(([k,v])=>[v,k.toUpperCase()]));

// --- ÖZEL YARDIMCI FONKSİYONLAR ---
function toBase12(n, pad = 2) {
    const digits = "θ123456789ΦΛ";
    let integerPart = Math.floor(Math.abs(n));
    let fractionPart = Math.abs(n) - integerPart;
    let res = "";
    
    if (integerPart === 0) {
        res = digits[0];
    } else {
        while (integerPart > 0) { 
            res = digits[integerPart % 12] + res; 
            integerPart = Math.floor(integerPart / 12); 
        }
    }
    
    res = res.padStart(pad, digits[0]);

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

// --- SAYI / TABAN DÖNÜŞÜMÜ ---
function universalNumberConvert(text, fromUnit, toUnit) {
    const stdDigits = "0123456789ABCDEF";
    const anaDigits = "θ123456789ΦΛ";
    const getBase = (unit) => {
        if (unit.includes("Anatolya")) return 12;
        if (unit.includes("(2)")) return 2; if (unit.includes("(10)")) return 10;
        if (unit.includes("(16)")) return 16; if (unit.includes("(12)")) return 12;
        return 10;
    };
    let input = text.toUpperCase().replace(',', '.');
    if (fromUnit.includes("Anatolya")) input = input.split('').map(c => stdDigits[anaDigits.indexOf(c)] || c).join('');
    const fromBase = getBase(fromUnit); const toBase = getBase(toUnit);
    const parts = input.split('.');
    let dec = parseInt(parts[0], fromBase);
    if (parts[1]) { for (let i = 0; i < parts[1].length; i++) { let dv = stdDigits.indexOf(parts[1][i]); if(dv!==-1) dec += dv * Math.pow(fromBase, -(i+1)); } }
    if (isNaN(dec)) return "Hata";
    let intP = Math.floor(dec); let fracP = dec - intP;
    let resI = intP.toString(toBase).toUpperCase(); let resF = "";
    if (fracP > 0) { for (let i=0; i<6; i++) { fracP *= toBase; let d = Math.floor(fracP); resF += stdDigits[d]; fracP -= d; if (fracP < 0.000001) break; } resF = resF.replace(/0+$/, ""); }
    let final = resI + (resF ? "." + resF : "");
    if (toUnit.includes("Anatolya")) final = final.split('').map(c => anaDigits[stdDigits.indexOf(c)] || c).join('');
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
        outputArea.value = (currentInputUnit === "Eski Alfabe") ? text.split('').map(ch => toGreek[ch] || ch).join('') : text.split('').map(ch => toLatin[ch] || ch).join('');
    } 
    else if (mode === "Sayı") {
        outputArea.value = universalNumberConvert(text, currentInputUnit, currentOutputUnit);
    }
    else if (mode === "Sıcaklık") {
        const v = parseFloat(text.replace(',', '.')); if (isNaN(v)) return;
        let c = (currentInputUnit==="Celsius")?v:(currentInputUnit==="Fahrenheit")?(v-32)*5/9:(currentInputUnit==="Kelvin")?v-273.15:v*2;
        let res = (currentOutputUnit==="Celsius")?c:(currentOutputUnit==="Fahrenheit")?c*9/5+32:(currentOutputUnit==="Kelvin")?c+273.15:c/2;
        outputArea.value = Number(res.toFixed(2)).toLocaleString('tr-TR');
    } 
    else if (conversionRates[mode]) {
        const isInputAna = currentInputUnit.includes("Anatolya");
        const isOutputAna = currentOutputUnit.includes("Anatolya");
        let numericValue;
        if (isInputAna) {
            const digits = "θ123456789ΦΛ";
            numericValue = text.toUpperCase().split('').reduce((acc, curr) => (acc * 12) + digits.indexOf(curr), 0);
        } else { numericValue = parseFloat(text.replace(',', '.')); }

        if (isNaN(numericValue)) { outputArea.value = "Hata"; return; }
        const baseValue = numericValue * conversionRates[mode][currentInputUnit];
        const rawResult = baseValue / conversionRates[mode][currentOutputUnit];

        if (isOutputAna) {
            const anaValue = toBase12(rawResult, 1);
            const decValue = Number(rawResult.toFixed(2)).toLocaleString('tr-TR');
            outputArea.value = `${anaValue} (${decValue})`; 
        } else {
            outputArea.value = Number(rawResult.toFixed(5)).toLocaleString('tr-TR', { maximumFractionDigits: 5 });
        }
    }
}

// --- UI FONKSİYONLARI ---
function selectUnit(type, value) {
    if (type === 'input') currentInputUnit = value; else currentOutputUnit = value;
    renderPills(); performConversion();
}

function renderDropdowns(mode) {
    const options = unitData[mode] || [];
    if (mode === "Sayı") { currentInputUnit = "Onluk (10)"; currentOutputUnit = "Anatolya (12)"; }
    else { currentInputUnit = options[0]; currentOutputUnit = options[1] || options[0]; }
    dropdownInput.innerHTML = options.map(opt => `<div class="dropdown-item" onclick="selectUnit('input', '${opt}')">${opt}</div>`).join('');
    dropdownOutput.innerHTML = options.map(opt => `<div class="dropdown-item" onclick="selectUnit('output', '${opt}')">${opt}</div>`).join('');
    renderPills(); performConversion();
}

function renderPills() {
    pillInputLabel.innerText = currentInputUnit; pillOutputLabel.innerText = currentOutputUnit;
    dropdownInput.classList.remove('show'); dropdownOutput.classList.remove('show');
}

function toggleDropdown(type) { const el = type === 'input' ? dropdownInput : dropdownOutput; el.classList.toggle('show'); }
window.onclick = function(event) { if (!event.target.closest('.unit-pill')) { dropdownInput.classList.remove('show'); dropdownOutput.classList.remove('show'); } }

// --- EVENT LISTENERS ---
inputArea.addEventListener('input', performConversion);
document.querySelectorAll('.key').forEach(key => {
    key.addEventListener('click', () => {
        const action = key.dataset.action;
        if(action === 'delete') inputArea.value = inputArea.value.slice(0,-1);
        else if(action === 'reset') { inputArea.value = ''; outputArea.value = ''; }
        else if(action === 'space') inputArea.value += ' ';
        else if(!key.classList.contains('fn-key')) inputArea.value += key.innerText;
        performConversion();
    });
});
document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.replace('active-tab', 'inactive-tab'));
        this.classList.replace('inactive-tab', 'active-tab'); renderDropdowns(this.dataset.value);
    });
});
document.getElementById('themeToggle').addEventListener('click', () => document.documentElement.classList.toggle('dark'));

// --- HEADER TAKVİM (ORİJİNAL) ---
function calculateCustomDate(now) {
    const gregBase = new Date(1071, 2, 21); const diff = now - gregBase; const daysPassed = Math.floor(diff / 86400000);
    let year = 0; let daysCounter = 0;
    while (true) {
        let yearDays = 365; let nextYear = year + 1;
        if (nextYear % 20 === 0 && nextYear % 640 !== 0) yearDays += 5;
        if (daysCounter + yearDays > daysPassed) break;
        daysCounter += yearDays; year++;
    }
    const day = (daysPassed - daysCounter) % 30 + 1;
    const month = Math.floor((daysPassed - daysCounter) / 30) + 1;
    return { base12: `${toBase12(day, 2)}.${toBase12(month, 2)}.${toBase12(year + 1 + 10368, 4)}` };
}

function updateTime() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 4, 30, 0);
    if (now < todayStart) todayStart.setDate(todayStart.getDate() - 1);
    const totalSecs = Math.floor(((now - todayStart) / 1000) * 2);
    const h = Math.floor(totalSecs / 14400) % 12;
    const m = Math.floor((totalSecs / 120) % 120);
    const s = totalSecs % 120;
    document.getElementById('clock').textContent = `${toBase12(h, 2)}.${toBase12(m, 2)}.${toBase12(s, 2)}`;
    document.getElementById('date').textContent = calculateCustomDate(now).base12;
}

setInterval(updateTime, 100);
updateTime();
renderDropdowns("Alfabe");
