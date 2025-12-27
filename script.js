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
    "Sayı": ["Onluk (Standart)", "Onikilik (Anatolya)", "İkilik (Base 2)", "Onaltılık (Hex)"],
    "Para": ["Lira", "Kuruş", "Anatolya Sikkesi"],
    "Uzunluk": ["Metre", "Kilometre", "Mil", "İnç", "Ayak (ft)", "Arşın", "Menzil"],
    "Kütle": ["Kilogram", "Gram", "Libre (lb)", "Ons (oz)", "Batman", "Dirhem"],
    "Sıcaklık": ["Celsius", "Fahrenheit", "Kelvin", "Ilım", "Ayaz"],
    "Hacim": ["Litre", "Mililitre", "Galon", "Kile", "Katre"],
    "Hız": ["km/saat", "mil/saat", "m/s", "Knot", "Anatolya Hızı"],
    "Alan": ["Metrekare", "Dönüm", "Hektar", "Evlek"],
    "Veri": ["Byte", "Kilobyte", "Megabyte", "Gigabyte", "Terabyte", "Anatolya Verisi"]
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

// --- ÖZEL SAYI FORMATLAMA ---
function formatAnatolyaNumber(numStr) {
    if (!numStr) return "";
    let clean = numStr.toString().replace(/<[^>]*>/g, ""); // HTML'den arındır
    if (isNaN(clean.replace(',', '.'))) return numStr;
    let parts = clean.split('.');
    let integerPart = parts[0];
    let decimalPart = parts.length > 1 ? "," + parts[1] : "";
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, "<span class='sep'>'</span>");
    return integerPart + decimalPart;
}

// --- MERKEZİ DÖNÜŞÜM MOTORU ---
function performConversion(source) {
    const mode = document.querySelector('.active-tab').dataset.value;
    const target = (source === inputArea) ? outputArea : inputArea;
    const text = (source === inputArea) ? source.value : source.innerText;

    if (!text.trim()) { target.innerHTML = ""; target.value = ""; return; }

    if (mode === "Alfabe") {
        let res;
        if (source === inputArea) {
            res = (currentInputUnit === "Eski Alfabe") 
                ? text.split('').map(ch => toGreek[ch] || ch).join('')
                : text.split('').map(ch => toLatin[ch] || ch).join('');
            target.innerHTML = res;
        } else {
            res = (currentOutputUnit === "Eski Alfabe")
                ? text.split('').map(ch => toGreek[ch] || ch).join('')
                : text.split('').map(ch => toLatin[ch] || ch).join('');
            target.value = res;
        }
    } 
    else if (mode === "Sayı" || conversionRates[mode] || mode === "Sıcaklık") {
        // Sayısal işlemlerde sol her zaman ana girdi, sağ sonuçtur (Karışıklık olmaması için)
        if (source === inputArea) {
            let resultText = "";
            if (mode === "Sayı") resultText = handleNumberConversion(text);
            else if (mode === "Sıcaklık") resultText = handleTemperature(text);
            else {
                const val = parseFloat(text.replace(',', '.'));
                if (!isNaN(val)) {
                    const baseVal = val * conversionRates[mode][currentInputUnit];
                    resultText = (baseVal / conversionRates[mode][currentOutputUnit]).toFixed(5).replace(/\.?0+$/, "");
                }
            }
            target.innerHTML = formatAnatolyaNumber(resultText);
        }
    }
}

function handleNumberConversion(text) {
    let dec; const digits = "θ123456789ΦΛ";
    if (currentInputUnit === "Onluk (Standart)") dec = parseInt(text, 10);
    else if (currentInputUnit === "İkilik (Base 2)") dec = parseInt(text, 2);
    else if (currentInputUnit === "Onaltılık (Hex)") dec = parseInt(text, 16);
    else dec = text.split('').reverse().reduce((acc, c, i) => acc + digits.indexOf(c) * Math.pow(12, i), 0);
    if (isNaN(dec)) return "Hata";
    if (currentOutputUnit === "Onluk (Standart)") return dec.toString(10);
    if (currentOutputUnit === "İkilik (Base 2)") return dec.toString(2);
    if (currentOutputUnit === "Onaltılık (Hex)") return dec.toString(16).toUpperCase();
    return toBase12(dec, 1);
}

function handleTemperature(text) {
    const v = parseFloat(text.replace(',', '.')); if (isNaN(v)) return "";
    let c = (currentInputUnit === "Celsius") ? v : (currentInputUnit === "Fahrenheit") ? (v-32)*5/9 : (currentInputUnit === "Kelvin") ? v-273.15 : v*2;
    let res = (currentOutputUnit === "Celsius") ? c : (currentOutputUnit === "Fahrenheit") ? c*9/5+32 : (currentOutputUnit === "Kelvin") ? c+273.15 : c/2;
    return res.toFixed(2);
}

// --- UI VE DİĞER FONKSİYONLAR ---
function toggleDropdown(type) {
    const el = type === 'input' ? dropdownInput : dropdownOutput;
    dropdownInput.classList.remove('show'); dropdownOutput.classList.remove('show');
    el.classList.add('show');
}

function selectUnit(type, value) {
    if (type === 'input') currentInputUnit = value; else currentOutputUnit = value;
    renderPills(); performConversion(inputArea);
}

function renderDropdowns(mode) {
    const opts = unitData[mode] || [];
    currentInputUnit = opts[0]; currentOutputUnit = opts[1] || opts[0];
    const html = (type) => opts.map(o => `<div class="dropdown-item" onclick="selectUnit('${type}', '${o}')">${o}</div>`).join('');
    dropdownInput.innerHTML = html('input'); dropdownOutput.innerHTML = html('output');
    renderPills();
}

function renderPills() {
    pillInputLabel.innerText = currentInputUnit; pillOutputLabel.innerText = currentOutputUnit;
    dropdownInput.classList.remove('show'); dropdownOutput.classList.remove('show');
}

inputArea.addEventListener('input', () => performConversion(inputArea));
outputArea.addEventListener('input', () => performConversion(outputArea));
inputArea.addEventListener('focus', () => activeInput = inputArea);
outputArea.addEventListener('focus', () => activeInput = outputArea);

document.querySelectorAll('.nav-tab').forEach(t => {
    t.addEventListener('click', function() {
        document.querySelectorAll('.nav-tab').forEach(x => x.classList.replace('active-tab', 'inactive-tab'));
        this.classList.replace('inactive-tab', 'active-tab');
        renderDropdowns(this.dataset.value);
    });
});

document.querySelectorAll('.key').forEach(k => {
    k.addEventListener('click', (e) => {
        const a = k.dataset.action;
        if(a === 'delete') {
            if(activeInput === inputArea) activeInput.value = activeInput.value.slice(0,-1);
            else activeInput.innerText = activeInput.innerText.slice(0,-1);
        }
        else if(a === 'reset') { inputArea.value = ''; outputArea.innerHTML = ''; }
        else if(a === 'space') { if(activeInput === inputArea) activeInput.value += ' '; else activeInput.innerText += ' '; }
        else if(!k.classList.contains('fn-key')) {
            if(activeInput === inputArea) activeInput.value += k.innerText;
            else activeInput.innerText += k.innerText;
        }
        performConversion(activeInput);
    });
});

window.onclick = (e) => { if (!e.target.closest('.unit-pill')) { dropdownInput.classList.remove('show'); dropdownOutput.classList.remove('show'); } };
document.getElementById('themeToggle').onclick = () => document.documentElement.classList.toggle('dark');

// --- ZAMAN FONKSİYONLARI ---
function toBase12(n, pad = 2) {
    const d = "θ123456789ΦΛ"; if (n === 0) return "θ".repeat(pad);
    let r = ""; let num = Math.abs(Math.floor(n));
    while (num > 0) { r = d[num % 12] + r; num = Math.floor(num / 12); }
    return r.padStart(pad, 'θ');
}

function updateTime() {
    const now = new Date();
    const gregBase = new Date(1071, 2, 21);
    const diff = now - gregBase;
    const daysPassed = Math.floor(diff / 86400000);
    let year = 0, daysCounter = 0;
    while (true) {
        let yDays = (year + 1) % 20 === 0 && (year + 1) % 640 !== 0 ? 370 : 365;
        if (daysCounter + yDays > daysPassed) break;
        daysCounter += yDays; year++;
    }
    const dOY = daysPassed - daysCounter;
    const m = Math.floor(dOY / 30) + 1;
    const d = (dOY % 30) + 1;
    document.getElementById('date').textContent = `${toBase12(d)}.${toBase12(m)}.${toBase12(year + 10369, 4)}`;
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 4, 30, 0);
    const secs = Math.floor(((now - (now < start ? start.setDate(start.getDate()-1) : start)) / 1000) * 2);
    document.getElementById('clock').textContent = `${toBase12(Math.floor(secs/14400)%12)}.${toBase12(Math.floor((secs/120)%120))}.${toBase12(secs%120)}`;
}

setInterval(updateTime, 100);
updateTime();
renderDropdowns("Alfabe");
