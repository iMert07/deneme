/**
 * ANATOLYA SİSTEMİ - MERİDYEN ODAKLI GÜNCEL KOD
 * Floransa (11.25 Doğu) zıttı: -168.75. 
 * Burası 0 kabul edilir ve batıya (sola) doğru 360 birim artar.
 */

// --- ELEMENT SEÇİCİLER ---
const inputArea = document.getElementById('input-area');
const outputArea = document.getElementById('output-area');
const pillInputLabel = document.getElementById('pill-input-label');
const pillOutputLabel = document.getElementById('pill-output-label');
const dropdownInput = document.getElementById('dropdown-input');
const dropdownOutput = document.getElementById('dropdown-output');

let currentInputUnit = "Boylam (Derece)";
let currentOutputUnit = "Boylam (12)";

// --- VERİ SETLERİ ---
const unitData = {
    "Meridyen": ["Boylam (Derece)", "Boylam (12)"],
    "Alfabe": ["Eski Alfabe", "Yeni Alfabe"],
    "Sayı": ["İkilik (2)", "Onluk (10)", "Anatolya (12)", "On Altılık (16)"],
    "Para": ["Lira", "Akçe", "Dollar", "Euro", "Gümüş (Ons)", "Altın (Ons)"],
    "Zaman": ["Dakika", "Saat", "Gün", "Yıl (Gregoryen)", "Yıl (Anatolya)"],
    "Uzunluk": ["Metre (10⁰)", "Arşın (12⁰)", "Kilometre (10³)", "Fersah (12³)"],
    "Kütle": ["Kilogram (10³)", "Okka (12⁰)", "Gram (10⁰)"]
};

// --- TABAN DÖNÜŞTÜRÜCÜLER ---
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
    if (fractionPart > 0.00001) {
        res += ",";
        for (let i = 0; i < 4; i++) {
            fractionPart *= 12;
            let d = Math.floor(fractionPart);
            res += digits[d];
            fractionPart -= d;
            if (fractionPart < 0.00001) break;
        }
    }
    return res;
}

function fromBase12(text) {
    const digits = "0123456789AB";
    const normalized = text.toUpperCase().replace(/θ/g, '0').replace(/Φ/g, 'A').replace(/Λ/g, 'B').replace(',', '.');
    const [intPart, fracPart] = normalized.split('.');
    let res = parseInt(intPart, 12) || 0;
    if (fracPart) {
        for (let i = 0; i < fracPart.length; i++) {
            let val = digits.indexOf(fracPart[i]);
            if (val !== -1) res += val * Math.pow(12, -(i + 1));
        }
    }
    return res;
}

// --- ANA DÖNÜŞTÜRÜCÜ MOTOR ---
function performConversion() {
    const activeTab = document.querySelector('.active-tab');
    if (!activeTab) return;
    const mode = activeTab.dataset.value;
    const text = inputArea.value.trim();
    if (!text) { outputArea.value = ""; return; }

    const zeroPoint = 11.25 - 180; // -168.75 (Floransa zıttı)

    if (mode === "Meridyen") {
        if (currentInputUnit === "Boylam (Derece)") {
            let val = parseFloat(text.replace(',', '.'));
            if (isNaN(val)) return;

            // Sola (batıya) doğru artış için: (SıfırNoktası - MevcutBoylam)
            let res = (zeroPoint - val);
            while (res < 0) res += 360;
            res = res % 360;

            outputArea.value = `${toBase12Float(res, true)} (${toBase12Float(res, false)}) [${res.toFixed(2)}]`;
        } else {
            // Boylam (12) -> Boylam (Derece)
            let dec = fromBase12(text);
            // Ters formül: Boylam = SıfırNoktası - Değer
            let longitude = zeroPoint - dec;
            
            while (longitude <= -180) longitude += 360;
            while (longitude > 180) longitude -= 360;

            outputArea.value = longitude.toFixed(4).replace('.', ',');
        }
    }
    // Diğer modlar (Alfabe, Sayı vb.) buraya eklenebilir.
}

// --- UI FONKSİYONLARI ---
function selectUnit(type, value) {
    if (type === 'input') currentInputUnit = value;
    else currentOutputUnit = value;
    renderPills();
    performConversion();
}

function renderDropdowns(mode) {
    const options = unitData[mode] || [];
    if (mode === "Meridyen") {
        currentInputUnit = "Boylam (Derece)";
        currentOutputUnit = "Boylam (12)";
    } else {
        currentInputUnit = options[0];
        currentOutputUnit = options[1] || options[0];
    }
    const createItems = (type) => options.map(opt => `<div class="dropdown-item" onclick="selectUnit('${type}', '${opt}')">${opt}</div>`).join('');
    dropdownInput.innerHTML = createItems('input');
    dropdownOutput.innerHTML = createItems('output');
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
    const other = type === 'input' ? dropdownOutput : dropdownInput;
    other.classList.remove('show');
    el.classList.toggle('show');
}

// --- INITIALIZE ---
document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.replace('active-tab', 'inactive-tab'));
        this.classList.replace('inactive-tab', 'active-tab');
        renderDropdowns(this.dataset.value);
    });
});

inputArea.addEventListener('input', performConversion);

// Sayfa yüklendiğinde Meridyen modunu aç
renderDropdowns("Meridyen");
