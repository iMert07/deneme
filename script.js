// --- ELEMENTLER ---
const inputArea = document.getElementById('input-area');
const outputArea = document.getElementById('output-area');
const pillInputLabel = document.getElementById('pill-input-label');
const pillOutputLabel = document.getElementById('pill-output-label');
const dropdownInput = document.getElementById('dropdown-input');
const dropdownOutput = document.getElementById('dropdown-output');
const mainConverter = document.getElementById('main-converter');
const calendarView = document.getElementById('calendar-view');
const kbContainer = document.getElementById('kb-container');

let currentInputUnit = "Eski Alfabe";
let currentOutputUnit = "Yeni Alfabe";

// --- VERİLER ---
const unitData = {
    "Alfabe": ["Eski Alfabe", "Yeni Alfabe"],
    "Sayı": ["İkilik (2)", "Onluk (10)", "Anatolya (12)", "On Altılık (16)"],
    "Para": ["Lira", "Akçe", "Dollar", "Euro"],
    "Zaman": ["Dakika", "Saat", "Gün", "Yıl (Anatolya)", "Yıl (Gregoryen)"],
    "Uzunluk": ["Metre", "Arşın (12⁰)", "Kilometre", "Fersah (12³)"],
    "Kütle": ["Kilogram", "Okka (12⁰)", "Gram", "Batman (12⁻¹)"]
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

function performConversion() {
    const activeTab = document.querySelector('.active-tab');
    if (!activeTab || activeTab.dataset.value === "Takvim") return;
    const text = inputArea.value.trim();
    if (!text) { outputArea.value = ""; return; }

    if (activeTab.dataset.value === "Alfabe") {
        outputArea.value = (currentInputUnit === "Eski Alfabe") 
            ? text.split('').map(ch => toGreek[ch] || ch).join('') 
            : text.split('').map(ch => toLatin[ch] || ch).join('');
    }
}

// --- TAKVİM ÜRETİCİ ---
function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';
    for (let i = 1; i <= 30; i++) {
        const day = document.createElement('div');
        day.className = "calendar-day bg-slate-50 dark:bg-[#111a22] border border-slate-100 dark:border-slate-800 p-2";
        day.innerHTML = `
            <span class="text-lg font-bold font-mono">${toBase12(i, 2, true)}</span>
            <span class="text-[10px] opacity-40">${i}</span>
        `;
        grid.appendChild(day);
    }
}

// --- UI KONTROLLERİ ---
document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.replace('active-tab', 'inactive-tab'));
        this.classList.replace('inactive-tab', 'active-tab');
        
        if (this.dataset.value === "Takvim") {
            mainConverter.classList.add('hidden');
            kbContainer.classList.add('hidden');
            calendarView.classList.remove('hidden');
            renderCalendar();
        } else {
            calendarView.classList.add('hidden');
            mainConverter.classList.remove('hidden');
            kbContainer.classList.remove('hidden');
            renderDropdowns(this.dataset.value);
        }
    });
});

function renderDropdowns(mode) {
    const options = unitData[mode] || [];
    currentInputUnit = options[0]; currentOutputUnit = options[1] || options[0];
    const createItems = (type) => options.map(opt => `<div class="dropdown-item" onclick="selectUnit('${type}', '${opt}')">${opt}</div>`).join('');
    dropdownInput.innerHTML = createItems('input');
    dropdownOutput.innerHTML = createItems('output');
    pillInputLabel.innerText = currentInputUnit;
    pillOutputLabel.innerText = currentOutputUnit;
}

function selectUnit(type, value) {
    if (type === 'input') currentInputUnit = value; else currentOutputUnit = value;
    pillInputLabel.innerText = currentInputUnit;
    pillOutputLabel.innerText = currentOutputUnit;
    dropdownInput.classList.remove('show');
    dropdownOutput.classList.remove('show');
    performConversion();
}

function toggleDropdown(type) {
    const el = type === 'input' ? dropdownInput : dropdownOutput;
    el.classList.toggle('show');
}

// --- HEADER SAAT VE TARİH ---
function updateHeader() {
    const now = new Date();
    // Saat Hesaplama (Anatolya usulü)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 4, 30, 0);
    if (now < todayStart) todayStart.setDate(todayStart.getDate() - 1);
    const totalSecs = Math.floor(((now - todayStart) / 1000) * 2);
    const h = Math.floor(totalSecs / 14400) % 12;
    const m = Math.floor((totalSecs / 120) % 120);
    const s = totalSecs % 120;
    document.getElementById('clock').textContent = `${toBase12(h, 2, true)}.${toBase12(m, 2, true)}.${toBase12(s, 2, true)}`;

    // Tarih Hesaplama
    const gregBase = new Date(1071, 2, 21);
    const diff = now - gregBase;
    const daysPassed = Math.floor(diff / 86400000);
    let year = 0, daysCounter = 0;
    while (true) {
        let yrDays = (year + 1) % 20 === 0 && (year + 1) % 640 !== 0 ? 370 : 365;
        if (daysCounter + yrDays > daysPassed) break;
        daysCounter += yrDays; year++;
    }
    const day = (daysPassed - daysCounter) % 30 + 1;
    const month = Math.floor((daysPassed - daysCounter) / 30) + 1;
    document.getElementById('date').textContent = `${toBase12(day, 2, true)}.${toBase12(month, 2, true)}.${toBase12(year + 10369, 4, true)}`;
}

// --- EVENT LISTENERS ---
inputArea.addEventListener('input', performConversion);
document.querySelectorAll('.key').forEach(key => {
    key.addEventListener('click', () => {
        const action = key.dataset.action;
        if(action === 'delete') inputArea.value = inputArea.value.slice(0,-1);
        else if(action === 'reset') inputArea.value = '';
        else if(!key.classList.contains('fn-key')) inputArea.value += key.innerText;
        performConversion();
    });
});

document.getElementById('themeToggle').addEventListener('click', () => document.documentElement.classList.toggle('dark'));

setInterval(updateHeader, 500);
updateHeader();
renderDropdowns("Alfabe");
