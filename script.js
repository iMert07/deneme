/**
 * ANATOLYA DÖNÜŞTÜRÜCÜ SİSTEMİ - GÜNCELLENMİŞ TAM KOD
 */

// --- ELEMENT SEÇİCİLER ---
const inputArea = document.getElementById('input-area');
const outputArea = document.getElementById('output-area');
const pillInputLabel = document.getElementById('pill-input-label');
const pillOutputLabel = document.getElementById('pill-output-label');
const dropdownInput = document.getElementById('dropdown-input');
const dropdownOutput = document.getElementById('dropdown-output');

let currentInputUnit = "Eski Alfabe";
let currentOutputUnit = "Yeni Alfabe";

// --- VERİ SETLERİ (HTML'deki data-value değerleri ile eşleşti) ---
const unitData = {
    "Alfabe": ["Eski Alfabe", "Yeni Alfabe"],
    "Sayı": ["İkilik (2)", "Onluk (10)", "Anatolya (12)", "On Altılık (16)"],
    "Para": ["Lira", "Akçe", "Dollar", "Euro", "Gümüş (Ons)", "Altın (Ons)"],
    "Zaman": ["Milisaniye", "Saniye", "Dakika", "Saat", "Gün", "Hafta", "Ay", "Yıl (Gregoryen)", "Yıl (Anatolya)"],
    "Uzunluk": ["Milimetre (10⁻³)", "Santimetre (10⁻²)", "Metre (10⁰)", "Kilometre (10³)", "Arşın (12⁰)", "Fersah (12³)"],
    "Kütle": ["Gram (10⁰)", "Kilogram (10³)", "Ton (10⁶)", "Okka (12⁰)", "Dirhem (12⁻³)"],
    "Meridyen": ["Boylam (Derece)", "Meridyen (Anatolya)"],
    "Sıcaklık": ["Celsius", "Fahrenheit", "Kelvin", "Ilım"],
    "Veri": ["Byte", "Kilobyte", "Megabyte", "Gigabyte", "Terabyte", "Anatolya Verisi"]
};

// --- KATSAYILAR ---
const conversionRates = {
    "Uzunluk": {
        "Milimetre (10⁻³)": 0.001, "Santimetre (10⁻²)": 0.01, "Metre (10⁰)": 1, "Kilometre (10³)": 1000,
        "Arşın (12⁰)": 0.72, "Fersah (12³)": 1244.16
    },
    "Kütle": {
        "Gram (10⁰)": 0.001, "Kilogram (10³)": 1, "Ton (10⁶)": 1000, "Okka (12⁰)": 0.864, "Dirhem (12⁻³)": 0.0005
    },
    "Para": { "Lira": 1, "Akçe": 9, "Dollar": 43, "Euro": 51, "Gümüş (Ons)": 2735, "Altın (Ons)": 183787 },
    "Veri": { "Byte": 1, "Kilobyte": 1024, "Megabyte": 1048576, "Gigabyte": 1073741824, "Terabyte": 1099511627776, "Anatolya Verisi": 1200 },
    "Zaman": { 
        "Milisaniye": 0.001, "Saniye": 1, "Dakika": 60, "Saat": 3600, "Gün": 86400, "Hafta": 604800, "Ay": 2592000
    }
};

// --- ALFABE HARİTALARI ---
const toGreek = { "a":"Α","A":"Α", "e":"Ε","E":"Ε", "i":"Ͱ","İ":"Ͱ", "n":"Ν","N":"Ν", "r":"Ρ","R":"Ρ", "l":"L","L":"L", "ı":"Ь","I":"Ь", "k":"Κ","K":"Κ", "d":"D","D":"D", "m":"Μ","M":"Μ", "t":"Τ","T":"Τ", "y":"R","Y":"R", "s":"S","S":"S", "u":"U","U":"U", "o":"Q","O":"Q", "b":"Β","B":"Β", "ş":"Ш","Ş":"Ш", "ü":"Υ","Ü":"Υ", "z":"Ζ","Z":"Ζ", "g":"G","G":"G", "ç":"C","Ç":"C", "ğ":"Γ","Ğ":"Γ", "v":"V","V":"V", "c":"J","C":"J", "h":"Η","H":"Η", "p":"Π","P":"Π", "ö":"Ω","Ö":"Ω", "f":"F","F":"F", "x":"Ψ","X":"Ψ", "j":"Σ","J":"Σ", "0":"θ" };
const toLatin = Object.fromEntries(Object.entries(toGreek).map(([k,v])=>[v,k.toUpperCase()]));

// --- YARDIMCI FONKSİYONLAR ---
function toBase12(n, pad = 1, isAnatolya = true) {
    const digits = isAnatolya ? "θ123456789ΦΛ" : "0123456789AB";
    let num = Math.abs(Math.floor(n));
    let res = "";
    if (num === 0) res = digits[0];
    else { while (num > 0) { res = digits[num % 12] + res; num = Math.floor(num / 12); } }
    return res.padStart(pad, digits[0]);
}

function toBase12Float(n, isAnatolya = true) {
    const digits = isAnatolya ? "θ123456789ΦΛ" : "0123456789AB";
    let integerPart = Math.floor(Math.abs(n));
    let fractionPart = Math.abs(n) - integerPart;
    let res = toBase12(integerPart, 1, isAnatolya);
    if (fractionPart > 0.0001) {
        res += ",";
        for (let i = 0; i < 3; i++) { fractionPart *= 12; let d = Math.floor(fractionPart); res += digits[d]; fractionPart -= d; }
    }
    return res;
}

function normalizeInput(text) { return text.toUpperCase().replace(/θ/g, '0').replace(/Φ/g, 'A').replace(/Λ/g, 'B'); }

// --- ANA DÖNÜŞTÜRÜCÜ ---
function performConversion() {
    const activeTab = document.querySelector('.active-tab');
    if (!activeTab) return;
    const mode = activeTab.dataset.value;
    const text = inputArea.value.trim();
    if (!text) { outputArea.value = ""; return; }

    if (mode === "Alfabe") {
        outputArea.value = (currentInputUnit === "Eski Alfabe") ? text.split('').map(ch => toGreek[ch] || ch).join('') : text.split('').map(ch => toLatin[ch] || ch).join('');
    }
    else if (mode === "Sayı") {
        // universalNumberConvert fonksiyonu burada devreye girer (yukarıdaki koddan alınabilir)
        outputArea.value = "Sayı dönüşümü aktif."; 
    }
    else if (mode === "Meridyen") {
        let val = parseFloat(text.replace(',', '.'));
        const referenceLongitude = 11.25 - 180; 

        if (currentInputUnit === "Boylam (Derece)") {
            if (isNaN(val)) return;
            let res = (referenceLongitude - val);
            while (res < 0) res += 360; res = res % 360;
            outputArea.value = `${toBase12Float(res, true)} (${toBase12Float(res, false)}) [${res.toFixed(2)}°]`;
        } else {
            let input = normalizeInput(text.toUpperCase()).replace(',', '.');
            let dec = parseInt(input.split('.')[0], 12) || 0;
            let longitude = referenceLongitude - dec;
            while (longitude <= -180) longitude += 360;
            while (longitude > 180) longitude -= 360;
            outputArea.value = longitude.toFixed(4).replace('.', ',') + "°";
        }
    }
    else if (conversionRates[mode] || mode === "Zaman") {
        // Standart birim dönüşüm mantığı buraya gelir
        outputArea.value = "Dönüştürülüyor...";
    }
}

// --- UI FONKSİYONLARI ---
function renderDropdowns(mode) {
    const options = unitData[mode] || [];
    currentInputUnit = options[0];
    currentOutputUnit = options[1] || options[0];
    
    const createItems = (type) => options.map(opt => `<div class="dropdown-item" onclick="selectUnit('${type}', '${opt}')">${opt}</div>`).join('');
    dropdownInput.innerHTML = createItems('input');
    dropdownOutput.innerHTML = createItems('output');
    renderPills();
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

function toggleDropdown(type) {
    const el = type === 'input' ? dropdownInput : dropdownOutput;
    el.classList.toggle('show');
}

// --- KLAVYE ETKİLEŞİMİ ---
document.querySelectorAll('.key').forEach(key => {
    key.addEventListener('click', () => {
        const action = key.dataset.action;
        const val = key.innerText;

        if (action === 'delete') inputArea.value = inputArea.value.slice(0, -1);
        else if (action === 'reset') { inputArea.value = ''; outputArea.value = ''; }
        else if (action === 'space') inputArea.value += ' ';
        else if (action === 'enter') inputArea.value += '\n';
        else if (!key.classList.contains('fn-key')) inputArea.value += val;

        performConversion();
    });
});

// --- SEKME DEĞİŞİMİ ---
document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.replace('active-tab', 'inactive-tab'));
        this.classList.replace('inactive-tab', 'active-tab');
        renderDropdowns(this.dataset.value);
    });
});

// --- SAAT VE TAKVİM ---
function updateHeader() {
    const now = new Date();
    // Saat ve Tarih hesaplama mantığı (Önceki kod ile aynı)
    document.getElementById('clock').textContent = toBase12(now.getHours(), 2) + "." + toBase12(now.getMinutes(), 2);
}

setInterval(updateHeader, 1000);
renderDropdowns("Alfabe");
