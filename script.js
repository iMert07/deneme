// --- ELEMENT SEÇİCİLER ---
const inputArea = document.getElementById('input-area');
const outputArea = document.getElementById('output-area');
const pillInputLabel = document.getElementById('pill-input-label');
const pillOutputLabel = document.getElementById('pill-output-label');
const dropdownInput = document.getElementById('dropdown-input');
const dropdownOutput = document.getElementById('dropdown-output');
const converterSection = document.getElementById('converter-section');
const calendarSection = document.getElementById('calendar-section');
const kbContainer = document.getElementById('kb-container');

let currentInputUnit = "Eski Alfabe";
let currentOutputUnit = "Yeni Alfabe";

// --- VERİ SETLERİ VE DÖNÜŞTÜRÜCÜLER ---
const unitData = {
    "Alfabe": ["Eski Alfabe", "Yeni Alfabe"],
    "Sayı": ["İkilik (2)", "Onluk (10)", "Anatolya (12)", "On Altılık (16)"],
    "Para": ["Lira", "Akçe", "Dollar", "Euro"],
    "Zaman": ["Dakika", "Saat", "Gün", "Yıl (Anatolya)", "Yıl (Gregoryen)"],
    "Uzunluk": ["Metre (10⁰)", "Arşın (12⁰)", "Kilometre (10³)", "Fersah (12³)"],
    "Kütle": ["Kilogram (10³)", "Okka (12⁰)", "Gram (10⁰)", "Batman (12⁻¹)"]
};

const toGreek = { "a":"Α","A":"Α", "e":"Ε","E":"Ε", "i":"Ͱ","İ":"Ͱ", "n":"Ν","N":"Ν", "r":"Ρ","R":"Ρ", "l":"L","L":"L", "ı":"Ь","I":"Ь", "k":"Κ","K":"Κ", "d":"D","D":"D", "m":"Μ","M":"Μ", "t":"Τ","T":"Τ", "y":"R","Y":"R", "s":"S","S":"S", "u":"U","U":"U", "o":"Q","O":"Q", "b":"Β","B":"Β", "ş":"Ш","Ş":"Ш", "ü":"Υ","Ü":"Υ", "z":"Ζ","Z":"Ζ", "g":"G","G":"G", "ç":"C","Ç":"C", "ğ":"Γ","Ğ":"Γ", "v":"V","V":"V", "c":"J","C":"J", "h":"Η","H":"Η", "p":"Π","P":"Π", "ö":"Ω","Ö":"Ω", "f":"F","F":"F", "x":"Ψ","X":"Ψ", "j":"Σ","J":"Σ", "0":"0" };
const toLatin = Object.fromEntries(Object.entries(toGreek).map(([k,v])=>[v,k.toUpperCase()]));

function toBase12(n, pad = 1, isAnatolya = true) {
    const digits = isAnatolya ? "0123456789ΦΛ" : "0123456789AB";
    let num = Math.abs(Math.floor(n));
    let res = "";
    if (num === 0) res = digits[0];
    else { while (num > 0) { res = digits[num % 12] + res; num = Math.floor(num / 12); } }
    return res.padStart(pad, digits[0]);
}

function normalizeInput(text) { 
    return text.toUpperCase().replace(/Φ/g, 'A').replace(/Λ/g, 'B').replace(/θ/g, '0'); 
}

// --- CORE MANTIK ---
function performConversion() {
    const activeTab = document.querySelector('.active-tab');
    if (!activeTab || activeTab.dataset.value === "Takvim") return;
    
    const mode = activeTab.dataset.value;
    const text = inputArea.value.trim();
    if (!text) { outputArea.value = ""; return; }

    if (mode === "Alfabe") {
        outputArea.value = (currentInputUnit === "Eski Alfabe") 
            ? text.split('').map(ch => toGreek[ch] || ch).join('') 
            : text.split('').map(ch => toLatin[ch] || ch).join('');
    } else {
        outputArea.value = "Dönüştürülüyor..."; // Diğer matematiksel fonksiyonlar buraya eklenebilir.
    }
}

// --- TAKVİM ÖZEL MANTIĞI ---
function calculateAnatolyaDate(dateObj) {
    const gregBase = new Date(1071, 2, 21);
    const diff = dateObj - gregBase;
    const daysPassed = Math.floor(diff / 86400000);
    if (daysPassed < 0) return "Tarih Çok Eski";

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
    return `${toBase12(day, 2, true)}.${toBase12(month, 2, true)}.${toBase12(year + 10369, 4, true)}`;
}

// --- UI KONTROLLERİ ---
document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.replace('active-tab', 'inactive-tab'));
        this.classList.replace('inactive-tab', 'active-tab');
        
        const mode = this.dataset.value;
        if (mode === "Takvim") {
            calendarSection.classList.remove('hidden');
            converterSection.classList.add('hidden');
            kbContainer.classList.add('hidden');
        } else {
            calendarSection.classList.add('hidden');
            converterSection.classList.remove('hidden');
            kbContainer.classList.remove('hidden');
            renderDropdowns(mode);
        }
    });
});

function renderDropdowns(mode) {
    const options = unitData[mode] || [];
    currentInputUnit = options[0]; currentOutputUnit = options[1] || options[0];
    const createItems = (type) => options.map(opt => `<div class="dropdown-item" onclick="selectUnit('${type}', '${opt}')">${opt}</div>`).join('');
    dropdownInput.innerHTML = createItems('input');
    dropdownOutput.innerHTML = createItems('output');
    renderPills();
}

function selectUnit(type, value) {
    if (type === 'input') currentInputUnit = value; else currentOutputUnit = value;
    renderPills(); performConversion();
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

// --- HEADER GÜNCELLEME ---
function updateHeader() {
    const now = new Date();
    document.getElementById('clock').textContent = calculateAnatolyaTime(now);
    document.getElementById('date').textContent = calculateAnatolyaDate(now);
}

function calculateAnatolyaTime(now) {
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 4, 30, 0);
    if (now < todayStart) todayStart.setDate(todayStart.getDate() - 1);
    const totalSecs = Math.floor(((now - todayStart) / 1000) * 2);
    const h = Math.floor(totalSecs / 14400) % 12;
    const m = Math.floor((totalSecs / 120) % 120);
    const s = totalSecs % 120;
    return `${toBase12(h, 2, true)}.${toBase12(m, 2, true)}.${toBase12(s, 2, true)}`;
}

// --- EVENT LISTENERS ---
inputArea.addEventListener('input', performConversion);
document.getElementById('greg-input').addEventListener('change', function() {
    document.getElementById('ana-result').textContent = calculateAnatolyaDate(new Date(this.value));
});

document.querySelectorAll('.key').forEach(key => {
    key.addEventListener('click', () => {
        const action = key.dataset.action;
        if(action === 'delete') inputArea.value = inputArea.value.slice(0,-1);
        else if(action === 'reset') inputArea.value = '';
        else if(!key.classList.contains('fn-key')) inputArea.value += key.innerText;
        performConversion();
    });
});

setInterval(updateHeader, 500);
updateHeader();
renderDropdowns("Alfabe");
