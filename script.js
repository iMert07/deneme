const latin = document.getElementById('latin');
const greek = document.getElementById('greek');
const kbContainer = document.getElementById('kb-container');
let activeInput = latin;

// Aktif birimler ve label elementleri
let currentInputUnit = "Eski Alfabe";
let currentOutputUnit = "Yeni Alfabe";

const unitLabels = {
    input: [document.getElementById('pill-input-label'), document.getElementById('pill-input-label-mobile')],
    output: [document.getElementById('pill-output-label'), document.getElementById('pill-output-label-mobile')]
};

const dropdowns = {
    input: document.getElementById('dropdown-input'),
    output: document.getElementById('dropdown-output')
};

const unitData = {
    "Alfabe": ["Eski Alfabe", "Yeni Alfabe"], "Sayı": ["Onluk", "Onikilik"], "Para": ["Lira", "Sikke"], "Takvim": ["Gregoryen", "Anatolya"], "Zaman": ["Standart", "Anatolya"], "Uzunluk": ["Metre", "Arşın"], "Kütle": ["Kilogram", "Batman"], "Sıcaklık": ["Celsius", "Ilım"], "Hacim": ["Litre", "Kile"], "Hız": ["km/sa", "Anatolya"], "Alan": ["m2", "Dönüm"], "Veri": ["Byte", "Anatolya"], "Meridyen": ["Standart", "Anatolya"], "Paralel": ["Standart", "Anatolya"]
};

const toGreekMap = { "a":"Α","A":"Α", "e":"Ε","E":"Ε", "i":"Ͱ","İ":"Ͱ", "n":"Ν","N":"Ν", "r":"Ρ","R":"Ρ", "l":"L","L":"L", "ı":"Ь","I":"Ь", "k":"Κ","Κ":"Κ", "d":"D","D":"D", "m":"Μ","M":"Μ", "t":"Τ","T":"Τ", "y":"R","Y":"R", "s":"S","S":"S", "u":"U","U":"U", "o":"Q","O":"Q", "b":"Β","B":"Β", "ş":"Ш","Ş":"Ш", "ü":"Υ","Ü":"Υ", "z":"Ζ","Z":"Ζ", "g":"G","G":"G", "ç":"C","Ç":"C", "ğ":"Γ","Ğ":"Γ", "v":"V","V":"V", "c":"J","C":"J", "h":"Η","H":"Η", "p":"Π","P":"Π", "ö":"Ω","Ö":"Ω", "f":"F","F":"F", "x":"Ψ","X":"Ψ", "j":"Σ","J":"Σ", "0":"θ" };
const toLatinMap = Object.fromEntries(Object.entries(toGreekMap).map(([k,v])=>[v,k.toUpperCase()]));

function toggleDropdown(type) {
    const el = dropdowns[type];
    const other = type === 'input' ? dropdowns.output : dropdowns.input;
    other.classList.remove('show');
    el.classList.toggle('show');
}

window.onclick = function(event) {
    if (!event.target.closest('.unit-pill')) {
        Object.values(dropdowns).forEach(d => d.classList.remove('show'));
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

function swapAction() {
    // Metinleri yer değiştir
    let tempTxt = latin.value;
    latin.value = greek.value;
    greek.value = tempTxt;
    // Birimleri yer değiştir
    let tempUnit = currentInputUnit;
    currentInputUnit = currentOutputUnit;
    currentOutputUnit = tempUnit;
    renderPills();
}

function renderDropdowns(mode) {
    const options = unitData[mode] || [];
    currentInputUnit = options[0];
    currentOutputUnit = options[1] || options[0];
    
    dropdowns.input.innerHTML = options.map(opt => `<div class="dropdown-item" onclick="selectUnit('input', '${opt}')">${opt}</div>`).join('');
    dropdowns.output.innerHTML = options.map(opt => `<div class="dropdown-item" onclick="selectUnit('output', '${opt}')">${opt}</div>`).join('');
    renderPills();
}

function renderPills() {
    unitLabels.input.forEach(l => { if(l) l.innerText = currentInputUnit; });
    unitLabels.output.forEach(l => { if(l) l.innerText = currentOutputUnit; });
    Object.values(dropdowns).forEach(d => d.classList.remove('show'));
}

function translate(text, dir){
    const map = dir === "toGreek" ? toGreekMap : toLatinMap;
    return text.split('').map(ch => map[ch] || ch).join('');
}

latin.addEventListener('input', () => { greek.value = translate(latin.value, "toGreek"); });

document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.nav-tab').forEach(t => { t.classList.remove('active-tab'); t.classList.add('inactive-tab'); });
        this.classList.add('active-tab'); this.classList.remove('inactive-tab');
        renderDropdowns(this.dataset.value);
    });
});

document.querySelectorAll('.key').forEach(key => {
    key.addEventListener('click', () => {
        const action = key.dataset.action;
        if(action === 'delete') activeInput.value = activeInput.value.slice(0,-1);
        else if(action === 'enter') activeInput.value += '\n';
        else if(action === 'space') activeInput.value += ' ';
        else if(action === 'reset') { latin.value = ''; greek.value = ''; }
        else if(!key.classList.contains('fn-key')) activeInput.value += key.innerText;
        greek.value = translate(latin.value, "toGreek");
    });
});

document.getElementById('themeToggle').addEventListener('click', () => { document.documentElement.classList.toggle('dark'); });

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
        let yearDays = 365; let nextYear = year + 1;
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
