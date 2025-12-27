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

const unitData = {
    "Alfabe": ["Eski Alfabe", "Yeni Alfabe"],
    "Sayı": ["Onluk (Standart)", "Onikilik (Anatolya)", "İkilik (Base 2)"],
    "Uzunluk": ["Metre", "Kilometre", "Arşın", "Menzil"],
    "Sıcaklık": ["Celsius", "Fahrenheit", "Ilım", "Ayaz"]
};

const toGreek = { "a":"Α","A":"Α", "e":"Ε","E":"Ε", "i":"Ͱ","İ":"Ͱ", "n":"Ν","N":"Ν", "r":"Ρ","R":"Ρ", "l":"L","L":"L", "ı":"Ь","I":"Ь", "k":"Κ","K":"Κ", "d":"D","D":"D", "m":"Μ","M":"Μ", "t":"Τ","T":"Τ", "y":"R","Y":"R", "s":"S","S":"S", "u":"U","U":"U", "o":"Q","O":"Q", "b":"Β","B":"Β", "ş":"Ш","Ş":"Ш", "ü":"Υ","Ü":"Υ", "z":"Ζ","Z":"Ζ", "g":"G","G":"G", "ç":"C","Ç":"C", "ğ":"Γ","Ğ":"Γ", "v":"V","V":"V", "c":"J","C":"J", "h":"Η","H":"Η", "p":"Π","P":"Π", "ö":"Ω","Ö":"Ω", "f":"F","F":"F", "x":"Ψ","X":"Ψ", "j":"Σ","J":"Σ", "0":"θ" };
const toLatin = Object.fromEntries(Object.entries(toGreek).map(([k,v])=>[v,k.toUpperCase()]));

// --- MERKEZİ DÖNÜŞÜM MOTORU ---
function performConversion() {
    const activeTab = document.querySelector('.active-tab');
    if (!activeTab) return;
    const mode = activeTab.dataset.value;
    const text = inputArea.value.trim();

    if (!text) { outputArea.value = ""; return; }

    if (mode === "Alfabe") {
        if (currentInputUnit === "Eski Alfabe" && currentOutputUnit === "Yeni Alfabe") {
            outputArea.value = text.split('').map(ch => toGreek[ch] || ch).join('');
        } else if (currentInputUnit === "Yeni Alfabe" && currentOutputUnit === "Eski Alfabe") {
            outputArea.value = text.split('').map(ch => toLatin[ch] || ch).join('');
        } else {
            outputArea.value = text;
        }
    } 
    else if (mode === "Sayı") {
        let decimalValue;
        const digits = "θ123456789ΦΛ";

        try {
            if (currentInputUnit === "Onluk (Standart)") decimalValue = parseInt(text, 10);
            else if (currentInputUnit === "İkilik (Base 2)") decimalValue = parseInt(text, 2);
            else if (currentInputUnit === "Onikilik (Anatolya)") {
                decimalValue = text.split('').reverse().reduce((acc, char, i) => {
                    return acc + digits.indexOf(char) * Math.pow(12, i);
                }, 0);
            }

            if (isNaN(decimalValue)) { outputArea.value = "Hata"; return; }

            if (currentOutputUnit === "Onluk (Standart)") outputArea.value = decimalValue.toString(10);
            else if (currentOutputUnit === "İkilik (Base 2)") outputArea.value = decimalValue.toString(2);
            else if (currentOutputUnit === "Onikilik (Anatolya)") outputArea.value = toBase12(decimalValue, 1);
            else outputArea.value = text;
        } catch(e) { outputArea.value = "Hata"; }
    }
}

// --- UI MANTIĞI ---
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
        if (currentInputUnit === currentOutputUnit) currentOutputUnit = options.find(o => o !== value) || options[0];
    } else {
        currentOutputUnit = value;
        if (currentOutputUnit === currentInputUnit) currentInputUnit = options.find(o => o !== value) || options[0];
    }
    renderPills();
    performConversion();
}

function renderDropdowns(mode) {
    const options = unitData[mode] || [];
    currentInputUnit = options[0];
    currentOutputUnit = options[1] || options[0];
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

// --- EVENT LISTENERS ---
inputArea.addEventListener('input', performConversion);

document.querySelectorAll('.key').forEach(key => {
    key.addEventListener('click', (e) => {
        const action = key.dataset.action;
        if (!action) {
            inputArea.value += key.innerText;
        } else if (action === 'delete') {
            inputArea.value = inputArea.value.slice(0, -1);
        } else if (action === 'reset') {
            inputArea.value = '';
            outputArea.value = '';
        } else if (action === 'space') {
            inputArea.value += ' ';
        }
        performConversion();
    });
});

document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.replace('active-tab', 'inactive-tab'));
        this.classList.replace('inactive-tab', 'active-tab');
        renderDropdowns(this.dataset.value);
    });
});

document.getElementById('themeToggle').onclick = () => document.documentElement.classList.toggle('dark');

// --- ZAMAN FONKSİYONLARI ---
function toBase12(n, pad = 2) {
    const digits = "θ123456789ΦΛ";
    if (n === 0) return "θ".repeat(pad);
    let res = ""; let num = Math.abs(Math.floor(n));
    while (num > 0) { res = digits[num % 12] + res; num = Math.floor(num / 12); }
    return res.padStart(pad, 'θ');
}

function updateTime() {
    const now = new Date();
    const gregBase = new Date(1071, 2, 21);
    const diff = now - gregBase;
    const daysPassed = Math.floor(diff / 86400000);
    let year = 0; let daysCounter = 0;
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
