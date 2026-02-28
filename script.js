// --- ELEMENTLER ---
const inputArea = document.getElementById('input-area');
const outputArea = document.getElementById('output-area');
const pillInputLabel = document.getElementById('pill-input-label');
const pillOutputLabel = document.getElementById('pill-output-label');
const dropdownInput = document.getElementById('dropdown-input');
const dropdownOutput = document.getElementById('dropdown-output');
const converterSection = document.getElementById('converter-section');
const calendarView = document.getElementById('calendar-view');
const kbContainer = document.getElementById('kb-container');

let currentInputUnit = "Eski Alfabe";
let currentOutputUnit = "Yeni Alfabe";

// --- VERİ SETLERİ (Tüm Birimler Korundu) ---
const unitData = {
    "Alfabe": ["Eski Alfabe", "Yeni Alfabe"],
    "Sayı": ["İkilik (2)", "Onluk (10)", "Anatolya (12)", "On Altılık (16)"],
    "Para": ["Lira", "Akçe", "Dollar", "Euro", "Gümüş (Ons)", "Altın (Ons)"],
    "Zaman": ["Milisaniye", "Salise (Anatolya)", "Saniye", "Dakika", "Saat", "Gün", "Yıl (Anatolya)", "Yıl (Gregoryen)"],
    "Uzunluk": ["Kerrab (12⁻³)", "Milimetre", "Arşın (12⁰)", "Metre", "Fersah (12³)", "Kilometre"],
    "Kütle": ["Miligram", "Dirhem (12⁻³)", "Gram", "Okka (12⁰)", "Kilogram", "Kantar (12¹)"]
};

const conversionRates = {
    "Uzunluk": { "Kerrab (12⁻³)": 0.000416, "Milimetre": 0.001, "Arşın (12⁰)": 0.72, "Metre": 1, "Fersah (12³)": 1244.16, "Kilometre": 1000 },
    "Kütle": { "Miligram": 0.000001, "Dirhem (12⁻³)": 0.0005, "Gram": 0.001, "Okka (12⁰)": 0.864, "Kilogram": 1, "Kantar (12¹)": 10.368 },
    "Para": { "Lira": 1, "Akçe": 9, "Dollar": 43, "Euro": 51, "Gümüş (Ons)": 2735, "Altın (Ons)": 183787 }
};

const toGreek = { "a":"Α","A":"Α", "e":"Ε","E":"Ε", "i":"Ͱ","İ":"Ͱ", "n":"Ν","N":"Ν", "r":"Ρ","R":"Ρ", "l":"L","L":"L", "ı":"Ь","I":"Ь", "k":"Κ","K":"Κ", "d":"D","D":"D", "m":"Μ","M":"Μ", "t":"Τ","T":"Τ", "y":"R","Y":"R", "s":"S","S":"S", "u":"U","U":"U", "o":"Q","O":"Q", "b":"Β","B":"Β", "ş":"Ш","Ş":"Ш", "ü":"Υ","Ü":"Υ", "z":"Ζ","Z":"Ζ", "g":"G","G":"G", "ç":"C","Ç":"C", "ğ":"Γ","Ğ":"Γ", "v":"V","V":"V", "c":"J","C":"J", "h":"Η","H":"Η", "p":"Π","P":"Π", "ö":"Ω","Ö":"Ω", "f":"F","F":"F", "x":"Ψ","X":"Ψ", "j":"Σ","J":"Σ", "0":"0" };
const toLatin = Object.fromEntries(Object.entries(toGreek).map(([k,v])=>[v,k.toUpperCase()]));

// --- TABAN DÖNÜŞTÜRÜCÜ ---
function toBase12(n, pad = 1, isAnatolya = true) {
    const digits = isAnatolya ? "0123456789ΦΛ" : "0123456789AB";
    let num = Math.abs(Math.floor(n));
    let res = "";
    if (num === 0) res = digits[0];
    else { while (num > 0) { res = digits[num % 12] + res; num = Math.floor(num / 12); } }
    return res.padStart(pad, digits[0]);
}

// --- TAKVİM GRİD OLUŞTURUCU ---
function renderCalendarGrids() {
    const greg = document.getElementById('greg-grid');
    const ana = document.getElementById('ana-grid');
    greg.innerHTML = ''; ana.innerHTML = '';

    for (let i = 1; i <= 31; i++) {
        const d = document.createElement('div');
        d.className = "calendar-box bg-slate-50 dark:bg-[#111a22] border-slate-100 dark:border-slate-800 text-sm";
        d.innerText = i;
        greg.appendChild(d);
    }
    for (let i = 1; i <= 30; i++) {
        const d = document.createElement('div');
        d.className = "calendar-box bg-slate-50 dark:bg-[#111a22] border-slate-100 dark:border-slate-800 text-sm";
        d.innerText = toBase12(i, 2, true);
        ana.appendChild(d);
    }
}

// --- UI NAVİGASYON ---
document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.replace('active-tab', 'inactive-tab'));
        this.classList.replace('inactive-tab', 'active-tab');
        
        const mode = this.dataset.value;
        if (mode === "Takvim") {
            converterSection.classList.add('hidden');
            kbContainer.classList.add('hidden');
            calendarView.classList.remove('hidden');
            calendarView.classList.add('grid');
            renderCalendarGrids();
        } else {
            calendarView.classList.add('hidden');
            calendarView.classList.remove('grid');
            converterSection.classList.remove('hidden');
            kbContainer.classList.remove('hidden');
            renderDropdowns(mode);
        }
    });
});

// --- DİĞER UI FONKSİYONLARI ---
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
    pillInputLabel.innerText = currentInputUnit; pillOutputLabel.innerText = currentOutputUnit;
    dropdownInput.classList.remove('show'); dropdownOutput.classList.remove('show');
}

function toggleDropdown(type) { (type === 'input' ? dropdownInput : dropdownOutput).classList.toggle('show'); }

// --- HEADER VE SAAT ---
function updateHeader() {
    const now = new Date();
    // Anatolya Saati
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 4, 30, 0);
    if (now < todayStart) todayStart.setDate(todayStart.getDate() - 1);
    const totalSecs = Math.floor(((now - todayStart) / 1000) * 2);
    const h = Math.floor(totalSecs / 14400) % 12;
    const m = Math.floor((totalSecs / 120) % 120);
    const s = totalSecs % 120;
    document.getElementById('clock').textContent = `${toBase12(h, 2, true)}.${toBase12(m, 2, true)}.${toBase12(s, 2, true)}`;

    // Anatolya Tarihi
    const gregBase = new Date(1071, 2, 21);
    const diff = now - gregBase;
    const daysPassed = Math.floor(diff / 86400000);
    let yr = 0, dc = 0;
    while(true) {
        let yd = (yr+1)%20==0 && (yr+1)%640!=0 ? 370 : 365;
        if(dc + yd > daysPassed) break;
        dc += yd; yr++;
    }
    const d = (daysPassed - dc) % 30 + 1, mo = Math.floor((daysPassed - dc) / 30) + 1;
    document.getElementById('date').textContent = `${toBase12(d,2,true)}.${toBase12(mo,2,true)}.${toBase12(yr+10369,4,true)}`;
}

setInterval(updateHeader, 500);
updateHeader();
renderDropdowns("Alfabe");

// Klavye Dinleyicileri
document.querySelectorAll('.key').forEach(key => {
    key.addEventListener('click', () => {
        const action = key.dataset.action;
        if(action === 'delete') inputArea.value = inputArea.value.slice(0,-1);
        else if(action === 'reset') inputArea.value = '';
        else if(!key.classList.contains('fn-key')) inputArea.value += key.innerText;
    });
});
