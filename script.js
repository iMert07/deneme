const latin = document.getElementById('latin');
const greek = document.getElementById('greek');
const pillInputLabel = document.getElementById('pill-input-label');
const pillOutputLabel = document.getElementById('pill-output-label');
const dropdownInput = document.getElementById('dropdown-input');
const dropdownOutput = document.getElementById('dropdown-output');
const kbContainer = document.getElementById('kb-container');
let activeInput = latin;

// Aktif birimler
let currentInputUnit = "Eski Alfabe";
let currentOutputUnit = "Yeni Alfabe";

const unitData = {
    "Alfabe": ["Eski Alfabe", "Yeni Alfabe"],
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
    "Paralel": ["Standart Paralel", "Anatolya Enlemi"]
};

const toGreek = { "a":"Α","A":"Α", "e":"Ε","E":"Ε", "i":"Ͱ","İ":"Ͱ", "n":"Ν","N":"Ν", "r":"Ρ","R":"Ρ", "l":"L","L":"L", "ı":"Ь","I":"Ь", "k":"Κ","K":"Κ", "d":"D","D":"D", "m":"Μ","M":"Μ", "t":"Τ","T":"Τ", "y":"R","Y":"R", "s":"S","S":"S", "u":"U","U":"U", "o":"Q","O":"Q", "b":"Β","B":"Β", "ş":"Ш","Ş":"Ш", "ü":"Υ","Ü":"Υ", "z":"Ζ","Z":"Ζ", "g":"G","G":"G", "ç":"C","Ç":"C", "ğ":"Γ","Ğ":"Ğ", "v":"V","V":"V", "c":"J","C":"J", "h":"Η","H":"Η", "p":"Π","P":"Π", "ö":"Ω","Ö":"Ω", "f":"F","F":"F", "x":"Ψ","X":"Ψ", "j":"Σ","J":"Σ", "0":"θ" };
const toLatin = Object.fromEntries(Object.entries(toGreek).map(([k,v])=>[v,k.toUpperCase()]));

// Dropdown Mantığı
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
        if (currentInputUnit === currentOutputUnit) currentOutputUnit = options.find(o => o !== value);
    } else {
        currentOutputUnit = value;
        if (currentOutputUnit === currentInputUnit) currentInputUnit = options.find(o => o !== value);
    }
    renderPills();
}

function renderDropdowns(mode) {
    const options = unitData[mode] || [];
    currentInputUnit = options[0];
    currentOutputUnit = options[1] || options[0];
    
    dropdownInput.innerHTML = options.map(opt => `<div class="dropdown-item" onclick="selectUnit('input', '${opt}')">${opt}</div>`).join('');
    dropdownOutput.innerHTML = options.map(opt => `<div class="dropdown-item" onclick="selectUnit('output', '${opt}')">${opt}</div>`).join('');
    renderPills();
}

function renderPills() {
    pillInputLabel.innerText = currentInputUnit;
    pillOutputLabel.innerText = currentOutputUnit;
    dropdownInput.classList.remove('show');
    dropdownOutput.classList.remove('show');
}

// Çeviri ve Klavye
function translate(text, dir){
    const map = dir === "toGreek" ? toGreek : toLatin;
    return text.split('').map(ch => map[ch] || ch).join('');
}

latin.addEventListener('input', () => { greek.value = translate(latin.value, "toGreek"); });
greek.addEventListener('input', () => { latin.value = translate(greek.value, "toLatin"); });
latin.addEventListener('focus', () => activeInput = latin);
greek.addEventListener('focus', () => activeInput = greek);

document.querySelectorAll('.key').forEach(key => {
    key.addEventListener('click', (e) => {
        e.preventDefault();
        const action = key.dataset.action;
        if(action === 'delete') activeInput.value = activeInput.value.slice(0,-1);
        else if(action === 'enter') activeInput.value += '\n';
        else if(action === 'space') activeInput.value += ' ';
        else if(action === 'reset') { latin.value = ''; greek.value = ''; }
        else if(!key.classList.contains('fn-key')) activeInput.value += key.innerText;
        if(activeInput === latin) greek.value = translate(latin.value, "toGreek");
        else latin.value = translate(greek.value, "toLatin");
    });
});

const navTabs = document.querySelectorAll('.nav-tab');
navTabs.forEach(tab => {
    tab.addEventListener('click', function() {
        navTabs.forEach(t => { t.classList.remove('active-tab'); t.classList.add('inactive-tab'); });
        this.classList.add('active-tab'); this.classList.remove('inactive-tab');
        renderDropdowns(this.dataset.value);
    });
});

document.getElementById('themeToggle').addEventListener('click', function() {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('color-theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
});

// Zaman Fonksiyonları
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
        let yearDays = 365;
        let nextYear = year + 1;
        if (nextYear % 20 === 0 && nextYear % 640 !== 0) yearDays += 5;
        if (daysCounter + yearDays > daysPassed) break;
        daysCounter += yearDays; year++;
    }
    const dayOfYear = daysPassed - daysCounter;
    const month = Math.floor(dayOfYear / 30) + 1;
    const day = (dayOfYear % 30) + 1;
    const base12Year = year + 1 + 10368;
    return { base12: `${toBase12(day)}.${toBase12(month)}.${toBase12(base12Year, 4)}` };
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
