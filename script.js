// --- YARDIMCI FORMAT FONKSİYONU ---
function formatCompact(num) {
    if (num === 0) return "0";
    return parseFloat(num.toFixed(2)).toString().replace('.', ',');
}

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
    "Zaman": [
        "Milisaniye", "Salise (Anatolya)", "Salise", 
        "Saniye (Anatolya)", "Saniye", "Dakika", 
        "Saat", "Saat (Anatolya)", "Gün", 
        "Hafta (Anatolya)", "Hafta", "Ay", "Yıl (Anatolya)", "Yıl (Gregoryen)"
    ],
    "Uzunluk": [
        "Kerrab (12⁻³)", "Milimetre (10⁻³)", "Rubu (12⁻²)", "Santimetre (10⁻²)", 
        "İnç", "Endaze (12⁻¹)", "Fit", "Arşın (12⁰)", 
        "Yard", "Metre (10⁰)", "Berid (12¹)", "Menzil (12²)", 
        "Kilometre (10³)", "Fersah (12³)", "Mil", "Merhale (12⁴)"
    ],
    "Kütle": [
        "Miligram (10⁻³)", "Dirhem (12⁻³)", "Gram (10⁰)", "Miskal (12⁻²)", 
        "Batman (12⁻¹)", "Paund", "Okka (12⁰)", "Kilogram (10³)", 
        "Kantar (12¹)", "Ton (10⁶)"
    ],
    "Hacim": [
        "Mililitre (10⁻³)", "Sıvı Ons (ABD)", "Miskal (12⁻¹)", "Şinik (12⁰)", 
        "Litre (10⁰)", "Kıyye (12¹)", "Galon (ABD)", "Kile (12²)", "Metreküp (10³)"
    ],
    "Konum": ["Boylam (Derece)", "Meridyen (Anatolya)"],
    "Sıcaklık": ["Celsius", "Anatolya (Fahrenheit, 12)", "Fahrenheit", "Kelvin"],
    "Veri": ["Byte", "Kilobyte", "Megabyte", "Gigabyte", "Terabyte", "Anatolya Verisi"]
};

// --- KATSAYILAR (Baz: Litre) ---
const conversionRates = {
    "Uzunluk": {
        "Kerrab (12⁻³)": 0.00041666666, "Milimetre (10⁻³)": 0.001, "Rubu (12⁻²)": 0.005, "Santimetre (10⁻²)": 0.01,
        "İnç": 0.0254, "Endaze (12⁻¹)": 0.06, "Fit": 0.3048, "Arşın (12⁰)": 0.72, "Yard": 0.9144, "Metre (10⁰)": 1,
        "Berid (12¹)": 8.64, "Menzil (12²)": 103.68, "Kilometre (10³)": 1000, "Fersah (12³)": 1244.16, "Mil": 1609.34, "Merhale (12⁴)": 14929.92
    },
    "Kütle": {
        "Miligram (10⁻³)": 0.000001, "Dirhem (12⁻³)": 0.0005, "Gram (10⁰)": 0.001, "Miskal (12⁻²)": 0.006,
        "Batman (12⁻¹)": 0.072, "Paund": 0.45359, "Okka (12⁰)": 0.864, "Kilogram (10³)": 1, "Kantar (12¹)": 10.368, "Ton (10⁶)": 1000
    },
    "Hacim": {
        "Mililitre (10⁻³)": 0.001,
        "Sıvı Ons (ABD)": 0.0295735,
        "Miskal (12⁻¹)": 0.018,
        "Şinik (12⁰)": 0.216,
        "Litre (10⁰)": 1,
        "Kıyye (12¹)": 2.592,
        "Galon (ABD)": 3.78541,
        "Kile (12²)": 31.104,
        "Metreküp (10³)": 1000
    },
    "Para": { "Lira": 1, "Akçe": 9, "Dollar": 43, "Euro": 51, "Gümüş (Ons)": 2735, "Altın (Ons)": 183787 },
    "Veri": { "Byte": 1, "Kilobyte": 1024, "Megabyte": 1048576, "Gigabyte": 1073741824, "Terabyte": 1099511627776, "Anatolya Verisi": 1200 },
    "Zaman": { 
        "Milisaniye": 0.001, "Salise (Anatolya)": 1/240, "Salise": 1/60, "Saniye (Anatolya)": 0.5, "Saniye": 1, 
        "Dakika": 60, "Saat": 3600, "Saat (Anatolya)": 7200, "Gün": 86400, "Hafta (Anatolya)": 432000, "Hafta": 604800, "Ay": 2592000
    }
};

const toGreek = { "a":"Α","A":"Α", "e":"Ε","E":"Ε", "i":"Ͱ","İ":"Ͱ", "n":"Ν","N":"Ν", "r":"Ρ","R":"Ρ", "l":"L","L":"L", "ı":"Ь","I":"Ь", "k":"Κ","K":"Κ", "d":"D","D":"D", "m":"Μ","M":"Μ", "t":"Τ","T":"Τ", "y":"R","Y":"R", "s":"S","S":"S", "u":"U","U":"U", "o":"Q","O":"Q", "b":"Β","B":"Β", "ş":"Ш","Ş":"Ш", "ü":"Υ","Ü":"Υ", "z":"Ζ","Z":"Ζ", "g":"G","G":"G", "ç":"C","Ç":"C", "ğ":"Γ","Ğ":"Γ", "v":"V","V":"V", "c":"J","C":"J", "h":"Η","H":"Η", "p":"Π","P":"Π", "ö":"Ω","Ö":"Ω", "f":"F","F":"F", "x":"Ψ","X":"Ψ", "j":"Σ","J":"Σ", "0":"0" };
const toLatin = Object.fromEntries(Object.entries(toGreek).map(([k,v])=>[v,k.toUpperCase()]));

// --- FONKSİYONLAR ---
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
        let fracRes = "";
        for (let i = 0; i < 3; i++) { 
            fractionPart *= 12; 
            let d = Math.floor(fractionPart); 
            fracRes += digits[d]; 
            fractionPart -= d; 
            if (fractionPart < 0.0001) break; 
        }
        fracRes = fracRes.replace(/0+$/, '');
        if (fracRes !== "") res += "," + fracRes;
    }
    return res;
}

function normalizeInput(text) { return text.toUpperCase().replace(/θ/g, '0').replace(/Φ/g, 'A').replace(/Λ/g, 'B'); }

function isValidInput(text, unit) {
    const anaDigits = "0ΦΛ";
    let allowedChars = "0123456789ABCDEF" + anaDigits + ",.- ";
    if (unit.includes("Alfabe")) return true;
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
    if (toUnit.includes("Anatolya")) return toBase12Float(dec, true);
    return dec.toString(toBase).toUpperCase().replace('.', ',');
}

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

function performConversion() {
    const activeTab = document.querySelector('.active-tab');
    if (!activeTab) return;
    const mode = activeTab.dataset.value;
    const text = inputArea.value.trim();
    if (!text) { outputArea.value = ""; return; }

    if (mode === "Alfabe") {
        outputArea.value = (currentInputUnit === "Eski Alfabe") ? text.split('').map(ch => toGreek[ch] || ch).join('') : text.split('').map(ch => toLatin[ch] || ch).join('');
    } 
    else if (mode === "Sayı") { outputArea.value = universalNumberConvert(text, currentInputUnit, currentOutputUnit); }
    else if (mode === "Sıcaklık") {
        let fahr;
        const val = parseFloat(text.replace(',', '.'));
        if (currentInputUnit === "Celsius") fahr = (val * 1.8) + 32;
        else if (currentInputUnit === "Kelvin") fahr = ((val - 273.15) * 1.8) + 32;
        else if (currentInputUnit === "Fahrenheit") fahr = val;
        else if (currentInputUnit === "Anatolya (Fahrenheit, 12)") {
            let input = normalizeInput(text.toUpperCase()).replace(',','.');
            const parts = input.split('.');
            let decVal = parseInt(parts[0], 12);
            if (parts[1]) {
                const stdDigits = "0123456789ABCDEF";
                for (let i = 0; i < parts[1].length; i++) decVal += stdDigits.indexOf(parts[1][i]) * Math.pow(12, -(i+1));
            }
            fahr = decVal + 32;
        }

        if (isNaN(fahr)) { outputArea.value = "Hata"; return; }

        if (currentOutputUnit === "Celsius") outputArea.value = formatCompact((fahr - 32) / 1.8);
        else if (currentOutputUnit === "Kelvin") outputArea.value = formatCompact(((fahr - 32) / 1.8) + 273.15);
        else if (currentOutputUnit === "Fahrenheit") outputArea.value = formatCompact(fahr);
        else if (currentOutputUnit === "Anatolya (Fahrenheit, 12)") {
            let res = fahr - 32;
            let ana = toBase12Float(res, true);
            outputArea.value = (res === 0) ? "0" : `${ana} [${formatCompact(res)}]`;
        }
    }
    else if (conversionRates[mode] || mode === "Zaman") {
        let numericValue;
        // Hacimdeki yeni Anatolya birimleri Special listesine eklendi
        const specialUnits = ["Anatolya", "Arşın", "Miskal", "Şinik", "Kıyye", "Kile"];
        const isInputSpecial = specialUnits.some(s => currentInputUnit.includes(s));
        
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

        let baseValue;
        const currentModeRates = conversionRates[mode] || conversionRates["Zaman"];
        if (currentInputUnit === "Yıl (Gregoryen)") baseValue = getGregorianDays(numericValue) * 86400;
        else if (currentInputUnit === "Yıl (Anatolya)") baseValue = getAnatolyaDays(numericValue) * 86400;
        else baseValue = numericValue * (currentModeRates[currentInputUnit] || 1);

        let result;
        if (currentOutputUnit === "Yıl (Gregoryen)") result = baseValue / (365.2425 * 86400);
        else if (currentOutputUnit === "Yıl (Anatolya)") result = baseValue / (365.25 * 86400);
        else result = baseValue / (currentModeRates[currentOutputUnit] || 1);

        const isOutputSpecial = specialUnits.some(s => currentOutputUnit.includes(s)) || currentOutputUnit.includes("Anatolya");
        if (isOutputSpecial) {
            if (result === 0) { outputArea.value = "0"; }
            else {
                let ana = toBase12Float(result, true);
                outputArea.value = `${ana} [${formatCompact(result)}]`;
            }
        } else { outputArea.value = formatCompact(result); }
    }
}

function selectUnit(type, value) {
    if (type === 'input') currentInputUnit = value;
    else currentOutputUnit = value;
    renderPills(); performConversion();
}

function renderDropdowns(mode) {
    const options = unitData[mode] || [];
    if (mode === "Sayı") { currentInputUnit = "Onluk (10)"; currentOutputUnit = "Anatolya (12)"; }
    else if (mode === "Zaman") { currentInputUnit = "Dakika"; currentOutputUnit = "Gün"; }
    else if (mode === "Uzunluk") { currentInputUnit = "Metre (10⁰)"; currentOutputUnit = "Arşın (12⁰)"; }
    else if (mode === "Kütle") { currentInputUnit = "Kilogram (10³)"; currentOutputUnit = "Okka (12⁰)"; }
    else if (mode === "Konum") { currentInputUnit = "Boylam (Derece)"; currentOutputUnit = "Meridyen (Anatolya)"; }
    else if (mode === "Sıcaklık") { currentInputUnit = "Celsius"; currentOutputUnit = "Anatolya (Fahrenheit, 12)"; }
    else if (mode === "Hacim") { currentInputUnit = "Litre (10⁰)"; currentOutputUnit = "Şinik (12⁰)"; }
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
    
    const gregBase = new Date(1071, 2, 21);
    const diff = now - gregBase;
    const daysPassed = Math.floor(diff / 86400000);
    let year = 0; let daysCounter = 0;
    while (true) {
        let yearDays = 365;
        let nextYear = year + 1;
        if (nextYear % 20 === 0 && nextYear % 640 !== 0) yearDays += 5;
        if (daysCounter + yearDays > daysPassed) break;
        daysCounter += yearDays; year++;
    }
    const day = (daysPassed - daysCounter) % 30 + 1;
    const month = Math.floor((daysPassed - daysCounter) / 30) + 1;
    document.getElementById('date').textContent = `${toBase12(day, 2, true)}.${toBase12(month, 2, true)}.${toBase12(year + 10369, 4, true)}`;
}

setInterval(updateHeader, 500);
updateHeader();
renderDropdowns("Alfabe");
