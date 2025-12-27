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

// --- ANATOLYA VE ZAMAN MATEMATİĞİ ---
function toBase12(n, pad = 2) {
    const digits = "θ123456789ΦΛ";
    if (n === 0) return "θ".repeat(pad);
    let res = ""; let num = Math.abs(Math.floor(n));
    while (num > 0) { res = digits[num % 12] + res; num = Math.floor(num / 12); }
    return res.padStart(pad, 'θ');
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
    const rem = daysPassed - daysCounter;
    const day = rem % 30 + 1;
    const month = Math.floor(rem / 30) + 1;
    const finalYear = year + 10369;
    if (isDeste) return `${day.toString().padStart(2,'0')}.${month.toString().padStart(2,'0')}.${finalYear}`;
    return `${toBase12(day)}.${toBase12(month)}.${toBase12(finalYear, 4)}`;
}

// --- AKILLI TAKVİM SINIRLARI ---
function validateCalendarInputs() {
    const y = parseInt(document.getElementById('cal-year').value);
    const m = parseInt(document.getElementById('cal-month').value);
    const d = document.getElementById('cal-day');
    
    let maxD = 31;
    if (currentInputUnit === "Gregoryen") {
        maxD = new Date(y, m, 0).getDate();
    } else if (currentInputUnit.includes("Anatolya")) {
        const gregYearFromAna = y - 10369; // Yaklaşık
        const isArtik = (gregYearFromAna % 20 === 0 && gregYearFromAna % 640 !== 0);
        maxD = (m === 13) ? (isArtik ? 5 : 0) : 30;
    } else if (currentInputUnit === "İslam (Hicri)") {
        maxD = 30; // Ay döngüsüne göre 29/30 dinamikleşebilir
    }
    d.max = maxD;
    if (parseInt(d.value) > maxD) d.value = maxD;
}

function getSelectedDateObject() {
    const y = parseInt(document.getElementById('cal-year').value);
    const m = parseInt(document.getElementById('cal-month').value);
    const d = parseInt(document.getElementById('cal-day').value);
    const hh = parseInt(document.getElementById('cal-hour').value);
    const mm = parseInt(document.getElementById('cal-min').value);
    const ss = parseInt(document.getElementById('cal-sec').value);

    if (currentInputUnit === "Gregoryen") return new Date(y, m - 1, d, hh, mm, ss);
    if (currentInputUnit === "İslam (Hicri)") {
        // Basit Hicri -> Miladi çevrim (Yaklaşık sabit gün farkı ile)
        return new Date(y * 354.36 + m * 29.5 + d); // Detaylı kütüphane eklenebilir
    }
    // Anatolya -> Miladi
    const daysSinceBase = (y - 10369) * 365 + Math.floor((y - 10369) / 20) * 5 + (m - 1) * 30 + (d - 1);
    const date = new Date(1071, 2, 21);
    date.setDate(date.getDate() + daysSinceBase);
    date.setHours(hh, mm, ss);
    return date;
}

// --- MERKEZİ DÖNÜŞÜM ---
function performConversion() {
    const activeTab = document.querySelector('.active-tab');
    if (activeTab.dataset.value === "Takvim") {
        validateCalendarInputs();
        const date = getSelectedDateObject();
        if (currentOutputUnit === "Gregoryen") outputArea.value = date.toLocaleString('tr-TR');
        else if (currentOutputUnit.includes("Anatolya")) {
            const isDeste = currentOutputUnit.includes("(Deste)");
            outputArea.value = calculateAnatolyaDate(date, isDeste) + " | " + getAnatolyaTime(date, isDeste);
        } else if (currentOutputUnit === "İslam (Hicri)") {
            const islamicTime = new Date(date.getTime() + (3 * 3600000));
            const h = islamicTime.getHours().toString().padStart(2,'0');
            const m = islamicTime.getMinutes().toString().padStart(2,'0');
            const s = islamicTime.getSeconds().toString().padStart(2,'0');
            const d = new Intl.DateTimeFormat('tr-TR-u-ca-islamic-umaqura', {day:'2-digit', month:'2-digit', year:'numeric'}).format(date);
            outputArea.value = d + " | " + `${h}.${m}.${s}`;
        }
    } else {
        // Alfabe, Sayı vb. mantığı burada devam eder
    }
}

// --- UI YÖNETİMİ ---
function renderDropdowns(mode) {
    const options = unitData[mode] || [];
    if (mode === "Takvim") {
        inputArea.classList.add('hidden'); calendarPicker.classList.remove('hidden');
        currentInputUnit = "Gregoryen"; currentOutputUnit = "Anatolya (Düzine)";
        setNow();
    } else {
        inputArea.classList.remove('hidden'); calendarPicker.classList.add('hidden');
        currentInputUnit = options[0]; currentOutputUnit = options[1] || options[0];
    }
    dropdownInput.innerHTML = options.map(opt => `<div class="dropdown-item" onclick="selectUnit('input', '${opt}')">${opt}</div>`).join('');
    dropdownOutput.innerHTML = options.map(opt => `<div class="dropdown-item" onclick="selectUnit('output', '${opt}')">${opt}</div>`).join('');
    renderPills(); performConversion();
}

function selectUnit(type, value) {
    if (type === 'input') currentInputUnit = value; else currentOutputUnit = value;
    renderPills(); validateCalendarInputs(); performConversion();
}

function renderPills() {
    pillInputLabel.innerText = currentInputUnit; pillOutputLabel.innerText = currentOutputUnit;
    dropdownInput.classList.remove('show'); dropdownOutput.classList.remove('show');
}

function toggleDropdown(type) {
    const el = type === 'input' ? dropdownInput : dropdownOutput;
    el.classList.toggle('show');
}

function setNow() {
    const now = new Date();
    document.getElementById('cal-day').value = now.getDate();
    document.getElementById('cal-month').value = now.getMonth() + 1;
    document.getElementById('cal-year').value = now.getFullYear();
    document.getElementById('cal-hour').value = now.getHours();
    document.getElementById('cal-min').value = now.getMinutes();
    document.getElementById('cal-sec').value = now.getSeconds();
    performConversion();
}

// --- BAŞLATMA ---
document.getElementById('calendar-picker').querySelectorAll('input').forEach(i => i.addEventListener('input', performConversion));
document.getElementById('set-now').addEventListener('click', setNow);
document.querySelectorAll('.nav-tab').forEach(t => t.addEventListener('click', function() {
    document.querySelectorAll('.nav-tab').forEach(x => x.classList.replace('active-tab', 'inactive-tab'));
    this.classList.replace('inactive-tab', 'active-tab');
    renderDropdowns(this.dataset.value);
}));

setInterval(() => {
    const now = new Date();
    document.getElementById('clock').textContent = getAnatolyaTime(now, false);
    document.getElementById('date').textContent = calculateAnatolyaDate(now, false);
}, 1000);

renderDropdowns("Alfabe");
