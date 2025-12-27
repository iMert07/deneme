const inputArea = document.getElementById('input-area');
const outputArea = document.getElementById('output-area');
const pickerContainer = document.getElementById('custom-date-picker');
const pillInputLabel = document.getElementById('pill-input-label');
const pillOutputLabel = document.getElementById('pill-output-label');
const dropdownInput = document.getElementById('dropdown-input');
const dropdownOutput = document.getElementById('dropdown-output');

let currentInputUnit = "Eski Alfabe";
let currentOutputUnit = "Yeni Alfabe";

const unitData = {
    "Alfabe": ["Eski Alfabe", "Yeni Alfabe"],
    "Sayı": ["İkilik (2)", "Onluk (10)", "On İkilik (12)", "Anatolya (12)", "On Altılık (16)"],
    "Takvim": ["Gregoryen", "Anatolya", "Anatolya (Onluk)", "İslam"],
    "Para": ["Lira", "Kuruş", "Anatolya Sikkesi"],
    "Uzunluk": ["Metre", "Kilometre", "Mil", "İnç", "Arşın", "Menzil"]
};

// --- ALFABE VE SAYI FONKSİYONLARI (KODUNUN ORİJİNAL HALİ) ---
const toGreek = { "a":"Α","A":"Α", "e":"Ε","E":"Ε", "i":"Ͱ","İ":"Ͱ", "n":"Ν","N":"Ν", "r":"Ρ","R":"Ρ", "l":"L","L":"L", "ı":"Ь","I":"Ь", "k":"Κ","K":"Κ", "d":"D","D":"D", "m":"Μ","M":"Μ", "t":"Τ","T":"Τ", "y":"R","Y":"R", "s":"S","S":"S", "u":"U","U":"U", "o":"Q","O":"Q", "b":"Β","B":"Β", "ş":"Ш","Ş":"Ш", "ü":"Υ","Ü":"Υ", "z":"Ζ","Z":"Ζ", "g":"G","G":"G", "ç":"C","Ç":"C", "ğ":"Γ","Ğ":"Γ", "v":"V","V":"V", "c":"J","C":"J", "h":"Η","H":"Η", "p":"Π","P":"Π", "ö":"Ω","Ö":"Ω", "f":"F","F":"F", "x":"Ψ","X":"Ψ", "j":"Σ","J":"Σ", "0":"θ" };
const toLatin = Object.fromEntries(Object.entries(toGreek).map(([k,v])=>[v,k.toUpperCase()]));

function toBase12(n, isAnatolya = true) {
    const digits = isAnatolya ? "θ123456789ΦΛ" : "0123456789AB";
    if (n === 0) return digits[0] + digits[0];
    let res = ""; let num = Math.floor(n);
    while (num > 0) { res = digits[num % 12] + res; num = Math.floor(num / 12); }
    return res.padStart(2, digits[0]);
}

// --- ÖZEL TAKVİM SEÇİCİ MANTIĞI ---
function fillPickerOptions() {
    const dSel = document.getElementById('p-day');
    const mSel = document.getElementById('p-month');
    const hSel = document.getElementById('p-hour');
    const minSel = document.getElementById('p-min');

    const isAnatolya = currentInputUnit.includes("Anatolya");
    const isIslamic = currentInputUnit === "İslam";
    const digits = isAnatolya && !currentInputUnit.includes("Onluk") ? "θ123456789ΦΛ" : null;

    const format = (v) => digits ? toBase12(v, true) : v.toString().padStart(2, '0');

    // Günler (Anatolya'da 30, Gregoryen'de 28-31)
    let maxDays = 31;
    if(isAnatolya) maxDays = 30;
    else if(isIslamic) maxDays = 30;

    dSel.innerHTML = Array.from({length: maxDays}, (_, i) => `<option value="${i+1}">${format(i+1)}</option>`).join('');
    mSel.innerHTML = Array.from({length: 12}, (_, i) => `<option value="${i+1}">${format(i+1)}</option>`).join('');
    hSel.innerHTML = Array.from({length: 24}, (_, i) => `<option value="${i}">${format(i)}</option>`).join('');
    minSel.innerHTML = Array.from({length: 60}, (_, i) => `<option value="${i}">${format(i)}</option>`).join('');
}

function handleCalendarConversion() {
    const day = parseInt(document.getElementById('p-day').value);
    const month = parseInt(document.getElementById('p-month').value);
    const year = parseInt(document.getElementById('p-year').value);
    
    // Basit bir Date objesi oluştur (Girdi Gregoryen varsayılır, Anatolya/İslam için matematiksel ofset eklenir)
    let date = new Date(year, month - 1, day);
    
    if(currentOutputUnit === "Gregoryen") {
        outputArea.value = date.toLocaleDateString('tr-TR');
    } else if(currentOutputUnit.includes("Anatolya")) {
        // Senin orijinal calculateCustomDate fonksiyonunu buraya bağla
        outputArea.value = "Dönüştürülüyor..."; 
    } else if(currentOutputUnit === "İslam") {
        outputArea.value = new Intl.DateTimeFormat('tr-TR-u-ca-islamic', {day:'2-digit', month:'2-digit', year:'numeric'}).format(date);
    }
}

// --- UI KONTROLLERİ ---
function renderDropdowns(mode) {
    const options = unitData[mode] || [];
    if (mode === "Takvim") {
        inputArea.classList.add('hidden');
        pickerContainer.classList.remove('hidden');
        currentInputUnit = "Gregoryen";
        currentOutputUnit = "Anatolya";
        fillPickerOptions();
    } else {
        inputArea.classList.remove('hidden');
        pickerContainer.classList.add('hidden');
        currentInputUnit = options[0];
        currentOutputUnit = options[1] || options[0];
    }
    
    dropdownInput.innerHTML = options.map(opt => `<div class="dropdown-item" onclick="selectUnit('input', '${opt}')">${opt}</div>`).join('');
    dropdownOutput.innerHTML = options.map(opt => `<div class="dropdown-item" onclick="selectUnit('output', '${opt}')">${opt}</div>`).join('');
    renderPills();
}

function selectUnit(type, value) {
    if (type === 'input') {
        currentInputUnit = value;
        if(document.querySelector('.active-tab').dataset.value === "Takvim") fillPickerOptions();
    }
    else currentOutputUnit = value;
    renderPills();
    handleCalendarConversion();
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

// --- EVENT LISTENERS ---
document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.replace('active-tab', 'inactive-tab'));
        this.classList.replace('inactive-tab', 'active-tab');
        renderDropdowns(this.dataset.value);
    });
});

document.getElementById('custom-date-picker').addEventListener('change', handleCalendarConversion);
document.getElementById('p-now').addEventListener('click', () => {
    const now = new Date();
    document.getElementById('p-year').value = now.getFullYear();
    // Diğerlerini set et...
    handleCalendarConversion();
});

// Header saati güncelleme
setInterval(() => {
    const now = new Date();
    document.getElementById('clock').textContent = now.toLocaleTimeString('tr-TR');
}, 1000);

renderDropdowns("Alfabe");
