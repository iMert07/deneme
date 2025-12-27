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

// --- VERİ SETLERİ ---
const unitData = {
    "Alfabe": ["Eski Alfabe", "Yeni Alfabe"],
    "Sayı": ["İkilik (2)", "Onluk (10)", "On İkilik (12)", "Anatolya (12)", "On Altılık (16)"],
    "Takvim": ["Gregoryen", "Anatolya (Düzine)", "Anatolya (Deste)", "İslam (Hicri)"],
    "Para": ["Lira", "Kuruş", "Anatolya Sikkesi"],
    "Uzunluk": ["Metre", "Kilometre", "Mil", "İnç", "Ayak (ft)", "Arşın", "Menzil"],
    "Kütle": ["Kilogram", "Gram", "Libre (lb)", "Ons (oz)", "Batman", "Dirhem"],
    "Sıcaklık": ["Celsius", "Fahrenheit", "Kelvin", "Ilım", "Ayaz"],
    "Hacim": ["Litre", "Mililitre", "Galon", "Kile", "Katre"],
    "Hız": ["km/saat", "mil/saat", "m/s", "Knot", "Anatolya Hızı"],
    "Alan": ["Metrekare", "Dönüm", "Hektar", "Evlek"],
    "Veri": ["Byte", "Kilobyte", "Megabyte", "Gigabyte", "Terabyte", "Anatolya Verisi"],
    "Meridyen": ["Standart Meridyen", "Anatolya Boylamı"],
    "Paralel": ["Standart Paralel", "Anatolya Enlemi"]
};

// --- TAKVİM İÇİN DATEPICKER OLUŞTURMA ---
const datePicker = document.createElement('input');
datePicker.type = 'datetime-local';
datePicker.id = 'date-picker';
datePicker.style.cssText = "width:100%; height:100%; padding:20px; font-size:1.2rem; border:none; outline:none; background:transparent; color:inherit; display:none;";
// Textarea'nın içine değil, yanına ekliyoruz
inputArea.parentElement.appendChild(datePicker);

const conversionRates = {
    "Uzunluk": { "Metre": 1, "Kilometre": 1000, "Mil": 1609.34, "İnç": 0.0254, "Ayak (ft)": 0.3048, "Arşın": 0.68, "Menzil": 5000 },
    "Kütle": { "Kilogram": 1, "Gram": 0.001, "Libre (lb)": 0.4535, "Ons (oz)": 0.0283, "Batman": 7.697, "Dirhem": 0.0032 },
    "Hacim": { "Litre": 1, "Mililitre": 0.001, "Galon": 3.785, "Kile": 36.5, "Katre": 0.00005 },
    "Hız": { "m/s": 1, "km/saat": 0.2777, "mil/saat": 0.4470, "Knot": 0.5144, "Anatolya Hızı": 0.85 },
    "Alan": { "Metrekare": 1, "Dönüm": 1000, "Hektar": 10000, "Evlek": 250 },
    "Veri": { "Byte": 1, "Kilobyte": 1024, "Megabyte": 1048576, "Gigabyte": 1073741824, "Terabyte": 1099511627776, "Anatolya Verisi": 1200 }
};

const toGreek = { "a":"Α","A":"Α", "e":"Ε","E":"Ε", "i":"Ͱ","İ":"Ͱ", "n":"Ν","N":"Ν", "r":"Ρ","R":"Ρ", "l":"L","L":"L", "ı":"Ь","I":"Ь", "k":"Κ","K":"Κ", "d":"D","D":"D", "m":"Μ","M":"Μ", "t":"Τ","T":"Τ", "y":"R","Y":"R", "s":"S","S":"S", "u":"U","U":"U", "o":"Q","O":"Q", "b":"Β","B":"Β", "ş":"Ш","Ş":"Ш", "ü":"Υ","Ü":"Υ", "z":"Ζ","Z":"Ζ", "g":"G","G":"G", "ç":"C","Ç":"C", "ğ":"Γ","Ğ":"Γ", "v":"V","V":"V", "c":"J","C":"J", "h":"Η","H":"Η", "p":"Π","P":"Π", "ö":"Ω","Ö":"Ω", "f":"F","F":"F", "x":"Ψ","X":"Ψ", "j":"Σ","J":"Σ", "0":"θ" };
const toLatin = Object.fromEntries(Object.entries(toGreek).map(([k,v])=>[v,k.toUpperCase()]));

// --- FONKSİYONLAR ---

function toBase12(n, pad = 2) {
    const digits = "θ123456789ΦΛ";
    if (n === 0) return "θ".repeat(pad);
    let res = ""; let num = Math.abs(Math.floor(n));
    while (num > 0) { res = digits[num % 12] + res; num = Math.floor(num / 12); }
    return res.padStart(pad, 'θ');
}

function calculateCustomDate(date, isDecimal = false) {
    const gregBase = new Date(1071, 2, 21);
    const diff = date - gregBase;
    const daysPassed = Math.floor(diff / 86400000);
    let year = 0, daysCounter = 0;
    while (true) {
        let yearDays = (year + 1) % 20 === 0 && (year + 1) % 640 !== 0 ? 370 : 365;
        if (daysCounter + yearDays > daysPassed) break;
        daysCounter += yearDays; year++;
    }
    const dayOfYear = daysPassed - daysCounter;
    const month = Math.floor(dayOfYear / 30) + 1;
    const day = (dayOfYear % 30) + 1;
    const base12Year = year + 10369;

    if (isDecimal) return `${day.toString().padStart(2,'0')}.${month.toString().padStart(2,'0')}.${base12Year}`;
    return `${toBase12(day)}.${toBase12(month)}.${toBase12(base12Year, 4)}`;
}

function performConversion() {
    const activeTab = document.querySelector('.active-tab');
    if (!activeTab) return;
    const mode = activeTab.dataset.value;

    if (mode === "Takvim") {
        inputArea.style.display = "none";
        datePicker.style.display = "block";
        const d = datePicker.value ? new Date(datePicker.value) : new Date();
        
        if (currentOutputUnit === "Gregoryen") outputArea.value = d.toLocaleString('tr-TR');
        else if (currentOutputUnit === "Anatolya (Düzine)") outputArea.value = calculateCustomDate(d, false);
        else if (currentOutputUnit === "Anatolya (Deste)") outputArea.value = calculateCustomDate(d, true);
        else if (currentOutputUnit === "İslam (Hicri)") outputArea.value = new Intl.DateTimeFormat('tr-TR-u-ca-islamic', {day:'2-digit', month:'2-digit', year:'numeric'}).format(d);
        return;
    } else {
        inputArea.style.display = "block";
        datePicker.style.display = "none";
    }

    const text = inputArea.value.trim();
    if (!text) { outputArea.value = ""; return; }

    if (mode === "Alfabe") {
        outputArea.value = (currentInputUnit === "Eski Alfabe") 
            ? text.split('').map(ch => toGreek[ch] || ch).join('') 
            : text.split('').map(ch => toLatin[ch] || ch).join('');
    } 
    // Sayı ve diğer birim dönüşüm kodlarını buraya ekleyebilirsin
}

// --- SEÇİM MANTIĞI ---

function toggleDropdown(type) {
    const el = type === 'input' ? dropdownInput : dropdownOutput;
    dropdownInput.classList.remove('show');
    dropdownOutput.classList.remove('show');
    el.classList.toggle('show');
}

function selectUnit(type, value) {
    if (type === 'input') currentInputUnit = value;
    else currentOutputUnit = value;
    renderPills();
    performConversion();
}

function renderPills() {
    pillInputLabel.innerText = currentInputUnit;
    pillOutputLabel.innerText = currentOutputUnit;
    dropdownInput.classList.remove('show');
    dropdownOutput.classList.remove('show');
}

function renderDropdowns(mode) {
    const options = unitData[mode] || [];
    
    // Özel başlangıç ayarları
    if (mode === "Takvim") {
        currentInputUnit = "Zaman Seçici";
        currentOutputUnit = "Anatolya (Düzine)";
        datePicker.value = new Date().toISOString().slice(0, 16);
    } else if (mode === "Sayı") {
        currentInputUnit = "Onluk (10)";
        currentOutputUnit = "Anatolya (12)";
    } else {
        currentInputUnit = options[0];
        currentOutputUnit = options[1] || options[0];
    }
    
    dropdownInput.innerHTML = (mode === "Takvim") ? '<div class="dropdown-item">Zaman Seçici</div>' : 
        options.map(opt => `<div class="dropdown-item" onclick="selectUnit('input', '${opt}')">${opt}</div>`).join('');
    
    dropdownOutput.innerHTML = options.map(opt => `<div class="dropdown-item" onclick="selectUnit('output', '${opt}')">${opt}</div>`).join('');
    
    renderPills();
    performConversion();
}

// --- EVENT LISTENERS ---
inputArea.addEventListener('input', performConversion);
datePicker.addEventListener('input', performConversion);

document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.replace('active-tab', 'inactive-tab'));
        this.classList.replace('inactive-tab', 'active-tab');
        renderDropdowns(this.dataset.value);
    });
});

window.onclick = function(event) {
    if (!event.target.closest('.unit-pill')) {
        dropdownInput.classList.remove('show');
        dropdownOutput.classList.remove('show');
    }
}

// Header saati için
function updateHeaderTime() {
    const now = new Date();
    // Header'daki clock ve date ID'li alanları günceller
    const hTime = calculateCustomDate(now, false); // Örnek
    if(document.getElementById('clock')) document.getElementById('clock').textContent = now.toLocaleTimeString('tr-TR');
}

setInterval(updateHeaderTime, 1000);
renderDropdowns("Alfabe");
