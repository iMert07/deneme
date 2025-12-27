const inputArea = document.getElementById('input-area');
const outputArea = document.getElementById('output-area');
const calendarPicker = document.getElementById('calendar-picker');
const pillInputLabel = document.getElementById('pill-input-label');
const pillOutputLabel = document.getElementById('pill-output-label');
const dropdownInput = document.getElementById('dropdown-input');
const dropdownOutput = document.getElementById('dropdown-output');

let currentInputUnit = "Eski Alfabe";
let currentOutputUnit = "Yeni Alfabe";

const unitData = {
    "Alfabe": ["Eski Alfabe", "Yeni Alfabe"],
    "Sayı": ["İkilik (2)", "Onluk (10)", "On İkilik (12)", "Anatolya (12)", "On Altılık (16)"],
    "Takvim": ["Gregoryen", "Anatolya (Düzine)", "Anatolya (Deste)", "İslam (Hicri)"],
    "Para": ["Lira", "Kuruş", "Anatolya Sikkesi"],
    "Uzunluk": ["Metre", "Kilometre", "Mil", "İnç", "Arşın", "Menzil"]
};

// --- ALFABE HARİTASI ---
const toGreek = { "a":"Α","A":"Α", "e":"Ε","E":"Ε", "i":"Ͱ","İ":"Ͱ", "n":"Ν","N":"Ν", "r":"Ρ","R":"Ρ", "l":"L","L":"L", "ı":"Ь","I":"Ь", "k":"Κ","K":"Κ", "d":"D","D":"D", "m":"Μ","M":"Μ", "t":"Τ","T":"Τ", "y":"R","Y":"R", "s":"S","S":"S", "u":"U","U":"U", "o":"Q","O":"Q", "b":"Β","B":"Β", "ş":"Ш","Ş":"Ш", "ü":"Υ","Ü":"Υ", "z":"Ζ","Z":"Ζ", "g":"G","G":"G", "ç":"C","Ç":"C", "ğ":"Γ","Ğ":"Ğ", "v":"V","V":"V", "c":"J","C":"J", "h":"Η","H":"Η", "p":"Π","P":"Π", "ö":"Ω","Ö":"Ω", "f":"F","F":"F", "x":"Ψ","X":"Ψ", "j":"Σ","J":"Σ", "0":"θ" };
const toLatin = Object.fromEntries(Object.entries(toGreek).map(([k,v])=>[v,k.toUpperCase()]));

// --- ANATOLYA MATEMATİĞİ ---
const anaHex = "θ123456789ΦΛ";
const stdHex = "0123456789AB";

function toBase12(n, pad = 2, isAnatolya = true) {
    const chars = isAnatolya ? anaHex : stdHex;
    if (n === 0) return chars[0].repeat(pad);
    let res = ""; let num = Math.abs(Math.floor(n));
    while (num > 0) { res = chars[num % 12] + res; num = Math.floor(num / 12); }
    return res.padStart(pad, chars[0]);
}

function fromBase12(str, isAnatolya = true) {
    const chars = isAnatolya ? anaHex : stdHex;
    return str.toUpperCase().split('').reduce((acc, curr) => (acc * 12) + chars.indexOf(curr), 0);
}

// --- TAKVİM MOTORU ---
function calculateAnatolya(date, isDeste) {
    const gregBase = new Date(1071, 2, 21);
    const diff = date - gregBase;
    const daysPassed = Math.floor(diff / 86400000);
    let year = 0, daysCounter = 0;
    while (true) {
        let yearDays = (year + 1) % 20 === 0 && (year + 1) % 640 !== 0 ? 370 : 365;
        if (daysCounter + yearDays > daysPassed) break;
        daysCounter += yearDays; year++;
    }
    const rem = daysPassed - daysCounter;
    const day = rem % 30 + 1;
    const month = Math.floor(rem / 30) + 1;
    const finalYear = year + 10368;
    if (isDeste) return `${day.toString().padStart(2,'0')}.${month.toString().padStart(2,'0')}.${finalYear}`;
    return `${toBase12(day)}.${toBase12(month)}.${toBase12(finalYear, 4)}`;
}

function getSelectedDate() {
    let y = parseInt(document.getElementById('cal-year').value);
    let m, d, hh, mm, ss;

    if (currentInputUnit === "Gregoryen") {
        m = parseInt(document.getElementById('cal-month').value) - 1;
        d = parseInt(document.getElementById('cal-day').value);
        hh = parseInt(document.getElementById('cal-hour').value);
        mm = parseInt(document.getElementById('cal-min').value);
        ss = parseInt(document.getElementById('cal-sec').value);
        return new Date(y, m, d, hh, mm, ss);
    } else if (currentInputUnit === "Anatolya (Düzine)") {
        m = fromBase12(document.getElementById('cal-month').value, false);
        d = fromBase12(document.getElementById('cal-day').value, false);
        const days = (y - 10368) * 365 + Math.floor((y - 10368) / 20) * 5 + (m - 1) * 30 + (d - 1);
        let date = new Date(1071, 2, 21);
        date.setDate(date.getDate() + days);
        return date;
    }
    return new Date();
}

function validateInputs() {
    const y = parseInt(document.getElementById('cal-year').value);
    const mInput = document.getElementById('cal-month');
    const dInput = document.getElementById('cal-day');

    if (currentInputUnit === "Gregoryen") {
        let m = Math.max(1, Math.min(12, parseInt(mInput.value) || 1));
        mInput.value = m.toString().padStart(2, '0');
        let maxD = new Date(y, m, 0).getDate();
        dInput.value = Math.max(1, Math.min(maxD, parseInt(dInput.value) || 1)).toString().padStart(2, '0');
    } else if (currentInputUnit.includes("Anatolya")) {
        // Anatolya sınırları (12 ay 30 gün + artık yıllar)
        mInput.value = mInput.value.toUpperCase();
        dInput.value = dInput.value.toUpperCase();
    }
}

// --- MERKEZİ DÖNÜŞÜM ---
function performConversion() {
    const activeTab = document.querySelector('.active-tab').dataset.value;
    if (activeTab === "Takvim") {
        validateInputs();
        const date = getSelectedDate();
        if (currentOutputUnit === "Gregoryen") {
            outputArea.value = date.toLocaleString('tr-TR');
        } else if (currentOutputUnit.includes("Anatolya")) {
            const isDeste = currentOutputUnit.includes("(Deste)");
            outputArea.value = calculateAnatolya(date, isDeste);
        } else if (currentOutputUnit === "İslam (Hicri)") {
            const islamic = new Intl.DateTimeFormat('tr-TR-u-ca-islamic-umaqura', {day:'2-digit', month:'2-digit', year:'numeric'}).format(date);
            const iTime = new Date(date.getTime() + (3 * 3600000));
            outputArea.value = `${islamic} | ${iTime.getHours().toString().padStart(2,'0')}.${iTime.getMinutes().toString().padStart(2,'0')}`;
        }
    } else if (activeTab === "Alfabe") {
        const text = inputArea.value;
        outputArea.value = (currentInputUnit === "Eski Alfabe") ? text.split('').map(ch => toGreek[ch] || ch).join('') : text.split('').map(ch => toLatin[ch] || ch).join('');
    }
}

// --- UI ---
function selectUnit(type, value) {
    const mode = document.querySelector('.active-tab').dataset.value;
    if (type === 'input') {
        currentInputUnit = value;
        if (currentInputUnit === currentOutputUnit) currentOutputUnit = unitData[mode].find(o => o !== value);
    } else {
        currentOutputUnit = value;
        if (currentOutputUnit === currentInputUnit) currentInputUnit = unitData[mode].find(o => o !== value);
    }
    renderPills();
    performConversion();
}

function renderDropdowns(mode) {
    const options = unitData[mode];
    if (mode === "Takvim") {
        inputArea.classList.add('hidden'); calendarPicker.classList.remove('hidden');
        currentInputUnit = "Gregoryen"; currentOutputUnit = "Anatolya (Düzine)";
    } else {
        inputArea.classList.remove('hidden'); calendarPicker.classList.add('hidden');
        currentInputUnit = options[0]; currentOutputUnit = options[1];
    }
    dropdownInput.innerHTML = options.map(opt => `<div class="dropdown-item" onclick="selectUnit('input', '${opt}')">${opt}</div>`).join('');
    dropdownOutput.innerHTML = options.map(opt => `<div class="dropdown-item" onclick="selectUnit('output', '${opt}')">${opt}</div>`).join('');
    renderPills();
    performConversion();
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

function setNow() {
    const now = new Date();
    document.getElementById('cal-day').value = now.getDate().toString().padStart(2,'0');
    document.getElementById('cal-month').value = (now.getMonth() + 1).toString().padStart(2,'0');
    document.getElementById('cal-year').value = now.getFullYear();
    document.getElementById('cal-hour').value = now.getHours().toString().padStart(2,'0');
    document.getElementById('cal-min').value = now.getMinutes().toString().padStart(2,'0');
    document.getElementById('cal-sec').value = now.getSeconds().toString().padStart(2,'0');
    performConversion();
}

// --- LISTENERS ---
calendarPicker.querySelectorAll('input').forEach(i => i.addEventListener('input', performConversion));
document.getElementById('set-now').addEventListener('click', setNow);
document.querySelectorAll('.nav-tab').forEach(t => t.addEventListener('click', function() {
    document.querySelectorAll('.nav-tab').forEach(x => x.classList.replace('active-tab', 'inactive-tab'));
    this.classList.replace('inactive-tab', 'active-tab');
    renderDropdowns(this.dataset.value);
}));

setInterval(() => {
    const now = new Date();
    document.getElementById('clock').textContent = now.toLocaleTimeString('tr-TR'); // Header saati
}, 1000);

renderDropdowns("Alfabe");
