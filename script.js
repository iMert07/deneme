// --- ELEMENT SEÇİCİLER ---
const inputArea = document.getElementById('input-area');
const outputArea = document.getElementById('output-area');
const calendarPicker = document.getElementById('calendar-picker');
const pillInputLabel = document.getElementById('pill-input-label');
const pillOutputLabel = document.getElementById('pill-output-label');
const dropdownInput = document.getElementById('dropdown-input');
const dropdownOutput = document.getElementById('dropdown-output');

let activeInput = inputArea;
let currentInputUnit = "Eski Alfabe";
let currentOutputUnit = "Yeni Alfabe";

const unitData = {
    "Alfabe": ["Eski Alfabe", "Yeni Alfabe"],
    "Sayı": ["İkilik (2)", "Onluk (10)", "On İkilik (12)", "Anatolya (12)", "On Altılık (16)"],
    "Takvim": ["Gregoryen", "Anatolya (Düzine)", "Anatolya (Deste)", "İslam (Hicri)"],
    "Para": ["Lira", "Kuruş", "Anatolya Sikkesi"],
    "Uzunluk": ["Metre", "Kilometre", "Mil", "İnç", "Arşın", "Menzil"],
    "Sıcaklık": ["Celsius", "Fahrenheit", "Kelvin", "Ilım", "Ayaz"]
};

const conversionRates = {
    "Uzunluk": { "Metre": 1, "Kilometre": 1000, "Mil": 1609.34, "İnç": 0.0254, "Arşın": 0.68, "Menzil": 5000 },
    "Sıcaklık": "SPECIAL"
};

const toGreek = { "a":"Α","A":"Α", "e":"Ε","E":"Ε", "i":"Ͱ","İ":"Ͱ", "n":"Ν","N":"Ν", "r":"Ρ","R":"Ρ", "l":"L","L":"L", "ı":"Ь","I":"Ь", "k":"Κ","K":"Κ", "d":"D","D":"D", "m":"Μ","M":"Μ", "t":"Τ","T":"Τ", "y":"R","Y":"R", "s":"S","S":"S", "u":"U","U":"U", "o":"Q","O":"Q", "b":"Β","B":"Β", "ş":"Ш","Ş":"Ш", "ü":"Υ","Ü":"Υ", "z":"Ζ","Z":"Ζ", "g":"G","G":"G", "ç":"C","Ç":"C", "ğ":"Γ","Ğ":"Γ", "v":"V","V":"V", "c":"J","C":"J", "h":"Η","H":"Η", "p":"Π","P":"Π", "ö":"Ω","Ö":"Ω", "f":"F","F":"F", "x":"Ψ","X":"Ψ", "j":"Σ","J":"Σ", "0":"θ" };
const toLatin = Object.fromEntries(Object.entries(toGreek).map(([k,v])=>[v,k.toUpperCase()]));

// --- ANATOLYA ZAMAN MOTORU ---
function toBase12(n, pad = 2) {
    const digits = "θ123456789ΦΛ";
    if (n === 0) return "θ".repeat(pad);
    let res = ""; let num = Math.abs(Math.floor(n));
    while (num > 0) { res = digits[num % 12] + res; num = Math.floor(num / 12); }
    return res.padStart(pad, 'θ');
}

function calculateAnatolyaDate(date, isDeste = false) {
    const gregBase = new Date(1071, 2, 21);
    const diff = date - gregBase;
    const daysPassed = Math.floor(diff / 86400000);
    let year = 0, daysCounter = 0;
    while (true) {
        let yearDays = (year + 1) % 20 === 0 && (year + 1) % 640 !== 0 ? 370 : 365;
        if (daysCounter + yearDays > daysPassed) break;
        daysCounter += yearDays; year++;
    }
    const day = (daysPassed - daysCounter) % 30 + 1;
    const month = Math.floor((daysPassed - daysCounter) / 30) + 1;
    const finalYear = year + 10369;

    if (isDeste) return `${day.toString().padStart(2,'0')}.${month.toString().padStart(2,'0')}.${finalYear}`;
    return `${toBase12(day)}.${toBase12(month)}.${toBase12(finalYear, 4)}`;
}

function getAnatolyaTime(date, isDeste = false) {
    const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 4, 30, 0);
    const secs = Math.floor(((date - (date < start ? start.setDate(start.getDate()-1) : start)) / 1000) * 2);
    const h = Math.floor(secs / 14400) % 12;
    const m = Math.floor((secs / 120) % 120);
    const s = secs % 120;
    if (isDeste) return `${h.toString().padStart(2,'0')}.${m.toString().padStart(3,'0')}.${s.toString().padStart(3,'0')}`;
    return `${toBase12(h)}.${toBase12(m)}.${toBase12(s)}`;
}

// --- SAYI MOTORU ---
function universalNumberConvert(text, fromUnit, toUnit) {
    const std = "0123456789ABCDEF";
    const ana = "θ123456789ΦΛ";
    const getB = (u) => u.match(/\d+/) ? parseInt(u.match(/\d+/)[0]) : 10;

    let input = text.toUpperCase().replace(',', '.');
    if (fromUnit.includes("Anatolya")) input = input.split('').map(c => std[ana.indexOf(c)] || c).join('');

    const dec = parseInt(input.split('.')[0], getB(fromUnit));
    if (isNaN(dec)) return "Hata";

    let res = dec.toString(getB(toUnit)).toUpperCase();
    if (toUnit.includes("Anatolya")) res = res.split('').map(c => ana[std.indexOf(c)] || c).join('');
    return res;
}

// --- MERKEZİ DÖNÜŞÜM ---
function performConversion() {
    const activeTab = document.querySelector('.active-tab');
    if (!activeTab) return;
    const mode = activeTab.dataset.value;

    if (mode === "Takvim") {
        const d = new Date(document.getElementById('cal-year').value, document.getElementById('cal-month').value - 1, document.getElementById('cal-day').value, document.getElementById('cal-hour').value, document.getElementById('cal-min').value, document.getElementById('cal-sec').value);
        if (currentOutputUnit === "Gregoryen") outputArea.value = d.toLocaleString('tr-TR');
        else if (currentOutputUnit === "Anatolya (Düzine)") outputArea.value = calculateAnatolyaDate(d, false) + " | " + getAnatolyaTime(d, false);
        else if (currentOutputUnit === "Anatolya (Deste)") outputArea.value = calculateAnatolyaDate(d, true) + " | " + getAnatolyaTime(d, true);
        else if (currentOutputUnit === "İslam (Hicri)") outputArea.value = new Intl.DateTimeFormat('tr-TR-u-ca-islamic-umaqura', {day:'2-digit', month:'2-digit', year:'numeric'}).format(d);
        return;
    }

    const text = inputArea.value.trim();
    if (!text) { outputArea.value = ""; return; }

    if (mode === "Alfabe") {
        outputArea.value = (currentInputUnit === "Eski Alfabe") ? text.split('').map(ch => toGreek[ch] || ch).join('') : text.split('').map(ch => toLatin[ch] || ch).join('');
    } else if (mode === "Sayı") {
        outputArea.value = universalNumberConvert(text, currentInputUnit, currentOutputUnit);
    } else if (conversionRates[mode]) {
        const val = parseFloat(text.replace(',', '.'));
        if (isNaN(val)) return;
        const result = (val * conversionRates[mode][currentInputUnit]) / conversionRates[mode][currentOutputUnit];
        outputArea.value = Number(result.toFixed(5)).toLocaleString('tr-TR');
    }
}

// --- UI YÖNETİMİ ---
function toggleDropdown(type) {
    const el = type === 'input' ? dropdownInput : dropdownOutput;
    dropdownInput.classList.remove('show'); dropdownOutput.classList.remove('show');
    el.classList.toggle('show');
}

function selectUnit(type, value) {
    if (type === 'input') currentInputUnit = value; else currentOutputUnit = value;
    renderPills(); performConversion();
}

function renderDropdowns(mode) {
    const options = unitData[mode] || [];
    if (mode === "Takvim") {
        inputArea.classList.add('hidden'); calendarPicker.classList.remove('hidden');
        currentInputUnit = "Seçilen Tarih"; currentOutputUnit = "Anatolya (Düzine)";
        const now = new Date();
        document.getElementById('cal-day').value = now.getDate();
        document.getElementById('cal-month').value = now.getMonth() + 1;
        document.getElementById('cal-year').value = now.getFullYear();
    } else {
        inputArea.classList.remove('hidden'); calendarPicker.classList.add('hidden');
        currentInputUnit = options[0]; currentOutputUnit = options[1] || options[0];
    }
    dropdownInput.innerHTML = mode === "Takvim" ? `<div class="dropdown-item">Seçilen Tarih</div>` : options.map(opt => `<div class="dropdown-item" onclick="selectUnit('input', '${opt}')">${opt}</div>`).join('');
    dropdownOutput.innerHTML = options.map(opt => `<div class="dropdown-item" onclick="selectUnit('output', '${opt}')">${opt}</div>`).join('');
    renderPills(); performConversion();
}

function renderPills() {
    pillInputLabel.innerText = currentInputUnit; pillOutputLabel.innerText = currentOutputUnit;
    dropdownInput.classList.remove('show'); dropdownOutput.classList.remove('show');
}

// --- EVENT LISTENERS ---
inputArea.addEventListener('input', performConversion);
document.getElementById('calendar-picker').querySelectorAll('input').forEach(i => i.addEventListener('input', performConversion));
document.getElementById('set-now').addEventListener('click', () => {
    const now = new Date();
    document.getElementById('cal-day').value = now.getDate(); document.getElementById('cal-month').value = now.getMonth() + 1;
    document.getElementById('cal-year').value = now.getFullYear(); document.getElementById('cal-hour').value = now.getHours();
    document.getElementById('cal-min').value = now.getMinutes(); document.getElementById('cal-sec').value = now.getSeconds();
    performConversion();
});

document.querySelectorAll('.nav-tab').forEach(t => t.addEventListener('click', function() {
    document.querySelectorAll('.nav-tab').forEach(x => x.classList.replace('active-tab', 'inactive-tab'));
    this.classList.replace('inactive-tab', 'active-tab');
    renderDropdowns(this.dataset.value);
}));

document.querySelectorAll('.key').forEach(k => k.addEventListener('click', () => {
    const a = k.dataset.action;
    if(a === 'delete') inputArea.value = inputArea.value.slice(0,-1);
    else if(a === 'reset') inputArea.value = "";
    else if(a === 'space') inputArea.value += " ";
    else inputArea.value += k.innerText;
    performConversion();
}));

window.onclick = (e) => { if (!e.target.closest('.unit-pill')) { dropdownInput.classList.remove('show'); dropdownOutput.classList.remove('show'); } };
document.getElementById('themeToggle').onclick = () => document.documentElement.classList.toggle('dark');

setInterval(() => {
    const now = new Date();
    document.getElementById('clock').textContent = getAnatolyaTime(now, false);
    document.getElementById('date').textContent = calculateAnatolyaDate(now, false);
}, 1000);

renderDropdowns("Alfabe");
