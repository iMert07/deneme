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
    "Takvim": ["Gregoryen", "Anatolya", "Rumi", "Hicri"],
    "Para": ["Lira", "Akçe", "Dollar", "Euro", "Gümüş (Ons)", "Altın (Ons)"],
    "Zaman": ["Milisaniye", "Salise (Anatolya)", "Salise", "Saniye (Anatolya)", "Saniye", "Dakika", "Saat", "Saat (Anatolya)", "Gün", "Hafta (Anatolya)", "Hafta", "Ay", "Yıl (Anatolya)", "Yıl (Gregoryen)"],
    "Uzunluk": ["Kerrab (12⁻³)", "Milimetre (10⁻³)", "Rubu (12⁻²)", "Santimetre (10⁻²)", "İnç", "Endaze (12⁻¹)", "Fit", "Arşın (12⁰)", "Yard", "Metre (10⁰)", "Berid (12¹)", "Menzil (12²)", "Kilometre (10³)", "Fersah (12³)", "Mil", "Merhale (12⁴)"],
    "Kütle": ["Miligram (10⁻³)", "Dirhem (12⁻³)", "Gram (10⁰)", "Miskal (12⁻²)", "Batman (12⁻¹)", "Paund", "Okka (12⁰)", "Kilogram (10³)", "Kantar (12¹)", "Ton (10⁶)"],
    "Konum": ["Boylam (Derece)", "Meridyen (Anatolya)"],
    "Sıcaklık": ["Celsius", "Fahrenheit", "Kelvin", "Ilım", "Ayaz"],
    "Veri": ["Byte", "Kilobyte", "Megabyte", "Gigabyte", "Terabyte", "Anatolya Verisi"]
};

const conversionRates = {
    "Uzunluk": { "Kerrab (12⁻³)": 0.00041666666, "Milimetre (10⁻³)": 0.001, "Rubu (12⁻²)": 0.005, "Santimetre (10⁻²)": 0.01, "İnç": 0.0254, "Endaze (12⁻¹)": 0.06, "Fit": 0.3048, "Arşın (12⁰)": 0.72, "Yard": 0.9144, "Metre (10⁰)": 1, "Berid (12¹)": 8.64, "Menzil (12²)": 103.68, "Kilometre (10³)": 1000, "Fersah (12³)": 1244.16, "Mil": 1609.34, "Merhale (12⁴)": 14929.92 },
    "Kütle": { "Miligram (10⁻³)": 0.000001, "Dirhem (12⁻³)": 0.0005, "Gram (10⁰)": 0.001, "Miskal (12⁻²)": 0.006, "Batman (12⁻¹)": 0.072, "Paund": 0.45359, "Okka (12⁰)": 0.864, "Kilogram (10³)": 1, "Kantar (12¹)": 10.368, "Ton (10⁶)": 1000 },
    "Para": { "Lira": 1, "Akçe": 9, "Dollar": 43, "Euro": 51, "Gümüş (Ons)": 2735, "Altın (Ons)": 183787 },
    "Veri": { "Byte": 1, "Kilobyte": 1024, "Megabyte": 1048576, "Gigabyte": 1073741824, "Terabyte": 1099511627776, "Anatolya Verisi": 1200 },
    "Zaman": { "Milisaniye": 0.001, "Salise (Anatolya)": 1/240, "Salise": 1/60, "Saniye (Anatolya)": 0.5, "Saniye": 1, "Dakika": 60, "Saat": 3600, "Saat (Anatolya)": 7200, "Gün": 86400, "Hafta (Anatolya)": 432000, "Hafta": 604800, "Ay": 2592000 }
};

const toGreek = { "a":"Α","A":"Α", "e":"Ε","E":"Ε", "i":"Ͱ","İ":"Ͱ", "n":"Ν","N":"Ν", "r":"Ρ","R":"Ρ", "l":"L","L":"L", "ı":"Ь","I":"Ь", "k":"Κ","K":"Κ", "d":"D","D":"D", "m":"Μ","M":"Μ", "t":"Τ","T":"Τ", "y":"R","Y":"R", "s":"S","S":"S", "u":"U","U":"U", "o":"Q","O":"Q", "b":"Β","B":"Β", "ş":"Ш","Ş":"Ш", "ü":"Υ","Ü":"Υ", "z":"Ζ","Z":"Ζ", "g":"G","G":"G", "ç":"C","Ç":"C", "ğ":"Γ","Ğ":"Γ", "v":"V","V":"V", "c":"J","C":"J", "h":"Η","H":"Η", "p":"Π","P":"Π", "ö":"Ω","Ö":"Ω", "f":"F","F":"F", "x":"Ψ","X":"Ψ", "j":"Σ","J":"Σ", "0":"0" };
const toLatin = Object.fromEntries(Object.entries(toGreek).map(([k,v])=>[v,k.toUpperCase()]));

// --- TABAN DÖNÜŞTÜRÜCÜLER ---
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
    let res = toBase12(integerPart, 1, isAnatolya);
    if (fractionPart > 0.0001) {
        res += ",";
        for (let i = 0; i < 3; i++) { fractionPart *= 12; let d = Math.floor(fractionPart); res += digits[d]; fractionPart -= d; if (fractionPart < 0.0001) break; }
    }
    return res;
}

// --- TAKVİM HESAPLAMA MANTIKLARI ---
function gregorianToAnatolya(date) {
    const gregBase = new Date(1071, 2, 21);
    const diff = date - gregBase;
    const daysPassed = Math.floor(diff / 86400000);
    let year = 0; let daysCounter = 0;
    while (true) {
        let yearDays = ((year + 1) % 20 === 0 && (year + 1) % 640 !== 0) ? 370 : 365;
        if (daysCounter + yearDays > daysPassed) break;
        daysCounter += yearDays; year++;
    }
    const day = (daysPassed - daysCounter) % 30 + 1;
    const month = Math.floor((daysPassed - daysCounter) / 30) + 1;
    return { d: day, m: month, y: year + 10369 };
}

function gregorianToHicri(date) {
    let day = date.getDate(), month = date.getMonth(), year = date.getFullYear();
    if (month < 2) { year -= 1; month += 12; }
    let a = Math.floor(year / 100), b = 2 - a + Math.floor(a / 4);
    let jd = Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 2)) + day + b - 1524.5;
    let l = Math.floor(jd) - 1948440 + 10632;
    let n = Math.floor((l - 1) / 10631);
    l = l - 10631 * n + 354;
    let j = (Math.floor((10985 - l) / 5316)) * (Math.floor((50 * l) / 17719)) + (Math.floor(l / 5670)) * (Math.floor((43 * l) / 15238));
    l = l - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) - (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
    let m = Math.floor((24 * l) / 709);
    let d = l - Math.floor((709 * m) / 24);
    let y = 30 * n + j - 30;
    return { d: d, m: m, y: y };
}

function normalizeInput(text) { return text.toUpperCase().replace(/θ/g, '0').replace(/Φ/g, 'A').replace(/Λ/g, 'B'); }

function isValidInput(text, unit) {
    const anaDigits = "0ΦΛ";
    let allowedChars = "";
    const isSpecial = ["Anatolya", "Gün", "Ay", "Yıl", "Arşın", "Menzil", "Endaze", "Rubu", "Kerrab", "Berid", "Fersah", "Merhale", "Okka", "Kantar", "Batman", "Miskal", "Dirhem", "Akçe", "Meridyen", "Takvim"].some(s => unit.includes(s));
    if (unit.includes("(2)")) allowedChars = "01,.";
    else if (unit.includes("(10)") || unit === "Boylam (Derece)" || unit === "Gregoryen") allowedChars = "0123456789,.-";
    else if (isSpecial) allowedChars = "0123456789AB" + anaDigits + ",.";
    else if (unit.includes("(16)")) allowedChars = "0123456789ABCDEF,.";
    else return true;
    for (let char of text.toUpperCase()) { if (!allowedChars.includes(char)) return false; }
    return true;
}

function universalNumberConvert(text, fromUnit, toUnit) {
    if (!isValidInput(text, fromUnit)) return "Geçersiz Karakter";
    const stdDigits = "0123456789ABCDEF";
    const getBase = (unit) => {
        if (unit.includes("(2)")) return 2;
        if (unit.includes("Anatolya") || unit.includes("(12)")) return 12;
        if (unit.includes("(16)")) return 16;
        return 10;
    };
    let input = normalizeInput(text.toUpperCase()).replace(',', '.');
    const fromBase = getBase(fromUnit); const toBase = getBase(toUnit);
    const parts = input.split('.');
    let dec = parseInt(parts[0], fromBase);
    if (parts[1]) {
        for (let i = 0; i < parts[1].length; i++) {
            let dv = stdDigits.indexOf(parts[1][i]);
            if (dv >= fromBase || dv === -1) break;
            dec += dv * Math.pow(fromBase, -(i + 1));
        }
    }
    if (isNaN(dec)) return "Hata";
    if (toUnit.includes("Anatolya")) {
        const anaVal = toBase12Float(dec, true);
        const stdVal = toBase12Float(dec, false);
        return (anaVal === stdVal) ? anaVal : `${anaVal} (${stdVal})`;
    }
    return dec.toString(toBase).toUpperCase().replace('.', ',');
}

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
    else if (mode === "Takvim") {
        let dateObj;
        if (currentInputUnit === "Gregoryen") {
            const p = text.split('.');
            if(p.length !== 3) { outputArea.value = "Format: GG.AA.YYYY"; return; }
            dateObj = new Date(p[2], p[1]-1, p[0]);
        } else {
            outputArea.value = "Bu yönde dönüşüm henüz aktif değil.";
            return;
        }

        if (!dateObj || isNaN(dateObj)) { outputArea.value = "Hata"; return; }

        if (currentOutputUnit === "Anatolya") {
            const res = gregorianToAnatolya(dateObj);
            outputArea.value = `${toBase12(res.d, 2)}.${toBase12(res.m, 2)}.${toBase12(res.y, 4)}`;
        } else if (currentOutputUnit === "Hicri") {
            const res = gregorianToHicri(dateObj);
            outputArea.value = `${toBase12(res.d, 2)}.${toBase12(res.m, 2)}.${toBase12(res.y, 4)}`;
        } else if (currentOutputUnit === "Rumi") {
            let rDate = new Date(dateObj); rDate.setDate(rDate.getDate() - 13);
            outputArea.value = `${toBase12(rDate.getDate(), 2)}.${toBase12(rDate.getMonth()+1, 2)}.${toBase12(rDate.getFullYear()-584, 4)}`;
        } else {
            outputArea.value = `${dateObj.getDate()}.${dateObj.getMonth()+1}.${dateObj.getFullYear()}`;
        }
    }
    else if (mode === "Konum") {
        let val = parseFloat(text.replace(',','.'));
        if (currentInputUnit === "Boylam (Derece)") {
            if (isNaN(val)) return;
            let res = (168.75 - val);
            while (res < 0) res += 360; res = res % 360;
            const anaVal = toBase12Float(res, true), stdVal = toBase12Float(res, false);
            outputArea.value = `${anaVal} (${stdVal}) [${res.toFixed(2)}]`;
        } else {
            let input = normalizeInput(text.toUpperCase());
            let dec = parseInt(input.split('.')[0], 12);
            let res = 168.75 - dec;
            while (res < -180) res += 360; while (res > 180) res -= 360;
            outputArea.value = res.toFixed(4).replace('.',',');
        }
    }
    else if (conversionRates[mode] || mode === "Zaman") {
        let val = parseFloat(text.replace(',','.'));
        if (isNaN(val)) { outputArea.value = "Hata"; return; }
        const rates = conversionRates[mode] || conversionRates["Zaman"];
        let base = val * rates[currentInputUnit];
        let res = base / rates[currentOutputUnit];
        outputArea.value = res.toFixed(4).replace('.',',');
    }
}

// --- UI FONKSİYONLARI ---
function selectUnit(type, value) {
    if (type === 'input') { if (value === currentOutputUnit) currentOutputUnit = currentInputUnit; currentInputUnit = value; }
    else { if (value === currentInputUnit) currentInputUnit = currentOutputUnit; currentOutputUnit = value; }
    renderPills(); performConversion();
}

function renderDropdowns(mode) {
    const options = unitData[mode] || [];
    if (mode === "Sayı") { currentInputUnit = "Onluk (10)"; currentOutputUnit = "Anatolya (12)"; }
    else if (mode === "Takvim") { currentInputUnit = "Gregoryen"; currentOutputUnit = "Anatolya"; }
    else if (mode === "Konum") { currentInputUnit = "Boylam (Derece)"; currentOutputUnit = "Meridyen (Anatolya)"; }
    else { currentInputUnit = options[0]; currentOutputUnit = options[1] || options[0]; }
    const createItems = (type) => options.map(opt => `<div class="dropdown-item" onclick="selectUnit('${type}', '${opt}')">${opt}</div>`).join('');
    dropdownInput.innerHTML = createItems('input'); dropdownOutput.innerHTML = createItems('output');
    renderPills(); performConversion();
}

function renderPills() { pillInputLabel.innerText = currentInputUnit; pillOutputLabel.innerText = currentOutputUnit; dropdownInput.classList.remove('show'); dropdownOutput.classList.remove('show'); }
function toggleDropdown(type) { const el = type === 'input' ? dropdownInput : dropdownOutput; const other = type === 'input' ? dropdownOutput : dropdownInput; other.classList.remove('show'); el.classList.toggle('show'); }

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

function updateHeader() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 4, 30, 0);
    if (now < todayStart) todayStart.setDate(todayStart.getDate() - 1);
    const totalSecs = Math.floor(((now - todayStart) / 1000) * 2);
    const h = Math.floor(totalSecs / 14400) % 12;
    const m = Math.floor((totalSecs / 120) % 120);
    const s = totalSecs % 120;
    document.getElementById('clock').textContent = `${toBase12(h, 2, true)}.${toBase12(m, 2, true)}.${toBase12(s, 2, true)}`;
    const res = gregorianToAnatolya(now);
    document.getElementById('date').textContent = `${toBase12(res.d, 2, true)}.${toBase12(res.m, 2, true)}.${toBase12(res.y, 4, true)}`;
}

setInterval(updateHeader, 500);
updateHeader();
renderDropdowns("Alfabe");
