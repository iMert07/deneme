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

// --- VERİ SETLERİ VE KATSAYILAR ---
const unitData = {
    "Alfabe": ["Eski Alfabe", "Yeni Alfabe"],
    "Sayı": ["Onluk (Standart)", "Onikilik (Anatolya)", "İkilik (Base 2)", "Onaltılık (Hex)"],
    "Para": ["Lira", "Kuruş", "Anatolya Sikkesi"],
    "Uzunluk": ["Metre", "Kilometre", "Santimetre", "Mil", "İnç", "Ayak (ft)", "Arşın", "Menzil"],
    "Kütle": ["Kilogram", "Gram", "Libre (lb)", "Ons (oz)", "Batman", "Dirhem"],
    "Sıcaklık": ["Celsius", "Fahrenheit", "Kelvin", "Ilım", "Ayaz"],
    "Hacim": ["Litre", "Mililitre", "Galon", "Kile", "Katre"],
    "Hız": ["km/saat", "mil/saat", "m/s", "Knot", "Anatolya Hızı"],
    "Alan": ["Metrekare", "Dönüm", "Hektar", "Evlek"],
    "Veri": ["Byte", "Kilobyte", "Megabyte", "Gigabyte", "Terabyte", "Anatolya Verisi"],
    "Meridyen": ["Standart Meridyen", "Anatolya Boylamı"],
    "Paralel": ["Standart Paralel", "Anatolya Enlemi"]
};

// Dönüşüm Katsayıları (Temel birimlere göre oranlar)
const conversionRates = {
    "Uzunluk": { "Metre": 1, "Kilometre": 1000, "Santimetre": 0.01, "Mil": 1609.34, "İnç": 0.0254, "Ayak (ft)": 0.3048, "Arşın": 0.68, "Menzil": 5000 },
    "Kütle": { "Kilogram": 1, "Gram": 0.001, "Libre (lb)": 0.4535, "Ons (oz)": 0.0283, "Batman": 7.697, "Dirhem": 0.0032 },
    "Hacim": { "Litre": 1, "Mililitre": 0.001, "Galon": 3.785, "Kile": 36.5, "Katre": 0.00005 },
    "Hız": { "m/s": 1, "km/saat": 0.2777, "mil/saat": 0.4470, "Knot": 0.5144, "Anatolya Hızı": 0.85 },
    "Alan": { "Metrekare": 1, "Dönüm": 1000, "Hektar": 10000, "Evlek": 250 },
    "Veri": { "Byte": 1, "Kilobyte": 1024, "Megabyte": 1048576, "Gigabyte": 1073741824, "Terabyte": 1099511627776, "Anatolya Verisi": 1200 }
};

const toGreek = { "a":"Α","A":"Α", "e":"Ε","E":"Ε", "i":"Ͱ","İ":"Ͱ", "n":"Ν","N":"Ν", "r":"Ρ","R":"Ρ", "l":"L","L":"L", "ı":"Ь","I":"Ь", "k":"Κ","K":"Κ", "d":"D","D":"D", "m":"Μ","M":"Μ", "t":"Τ","T":"Τ", "y":"R","Y":"R", "s":"S","S":"S", "u":"U","U":"U", "o":"Q","O":"Q", "b":"Β","B":"Β", "ş":"Ш","Ş":"Ш", "ü":"Υ","Ü":"Υ", "z":"Ζ","Z":"Ζ", "g":"G","G":"G", "ç":"C","Ç":"C", "ğ":"Γ","Ğ":"Γ", "v":"V","V":"V", "c":"J","C":"J", "h":"Η","H":"Η", "p":"Π","P":"Π", "ö":"Ω","Ö":"Ω", "f":"F","F":"F", "x":"Ψ","X":"Ψ", "j":"Σ","J":"Σ", "0":"θ" };
const toLatin = Object.fromEntries(Object.entries(toGreek).map(([k,v])=>[v,k.toUpperCase()]));

// --- ANA DÖNÜŞÜM MOTORU ---
function performConversion() {
    const activeTab = document.querySelector('.active-tab');
    if (!activeTab) return;
    const mode = activeTab.dataset.value;
    const text = inputArea.value.trim();

    if (!text) { outputArea.value = ""; return; }

    if (mode === "Alfabe") {
        outputArea.value = translateAlphabet(text);
    } 
    else if (mode === "Sayı") {
        outputArea.value = convertNumbers(text);
    }
    else if (mode === "Sıcaklık") {
        outputArea.value = convertTemperature(text);
    }
    else if (conversionRates[mode]) {
        outputArea.value = convertGeneric(text, mode);
    }
    else {
        outputArea.value = `[${mode}] Henüz veri girilmedi.`;
    }
}

// 1. Alfabe Çevirici
function translateAlphabet(text) {
    if (currentInputUnit === "Eski Alfabe" && currentOutputUnit === "Yeni Alfabe") {
        return text.split('').map(ch => toGreek[ch] || ch).join('');
    } else if (currentInputUnit === "Yeni Alfabe" && currentOutputUnit === "Eski Alfabe") {
        return text.split('').map(ch => toLatin[ch] || ch).join('');
    }
    return text;
}

// 2. Sayı Çevirici (Base 2, 10, 12, 16)
function convertNumbers(text) {
    let decimalValue;
    try {
        if (currentInputUnit === "Onluk (Standart)") decimalValue = parseInt(text, 10);
        else if (currentInputUnit === "İkilik (Base 2)") decimalValue = parseInt(text, 2);
        else if (currentInputUnit === "Onaltılık (Hex)") decimalValue = parseInt(text, 16);
        else if (currentInputUnit === "Onikilik (Anatolya)") {
            // Anatolya (Base 12) -> Decimal
            const digits = "θ123456789ΦΛ";
            decimalValue = text.split('').reverse().reduce((acc, char, i) => acc + digits.indexOf(char) * Math.pow(12, i), 0);
        }

        if (isNaN(decimalValue)) return "Geçersiz Sayı";

        if (currentOutputUnit === "Onluk (Standart)") return decimalValue.toString(10);
        if (currentOutputUnit === "İkilik (Base 2)") return decimalValue.toString(2);
        if (currentOutputUnit === "Onaltılık (Hex)") return decimalValue.toString(16).toUpperCase();
        if (currentOutputUnit === "Onikilik (Anatolya)") return toBase12(decimalValue, 1);
    } catch(e) { return "Hata"; }
}

// 3. Genel Birim Çevirici (Uzunluk, Kütle, Hız vb.)
function convertGeneric(text, mode) {
    const val = parseFloat(text.replace(',', '.'));
    if (isNaN(val)) return "Sayı giriniz";
    const baseVal = val * conversionRates[mode][currentInputUnit];
    const result = baseVal / conversionRates[mode][currentOutputUnit];
    return result.toLocaleString('tr-TR', { maximumFractionDigits: 5 });
}

// 4. Sıcaklık Çevirici
function convertTemperature(text) {
    let celsius;
    const val = parseFloat(text.replace(',', '.'));
    if (isNaN(val)) return "Sayı giriniz";

    if (currentInputUnit === "Celsius") celsius = val;
    else if (currentInputUnit === "Fahrenheit") celsius = (val - 32) * 5/9;
    else if (currentInputUnit === "Kelvin") celsius = val - 273.15;
    else if (currentInputUnit === "Ilım") celsius = val * 2; // Özel Anatolya
    else if (currentInputUnit === "Ayaz") celsius = val * -2; // Özel Anatolya

    if (currentOutputUnit === "Celsius") return celsius.toFixed(2);
    if (currentOutputUnit === "Fahrenheit") return (celsius * 9/5 + 32).toFixed(2);
    if (currentOutputUnit === "Kelvin") return (celsius + 273.15).toFixed(2);
    if (currentOutputUnit === "Ilım") return (celsius / 2).toFixed(2);
    if (currentOutputUnit === "Ayaz") return (celsius / -2).toFixed(2);
}

// --- DROP DOWN VE UI --- (Önceki kodlarınla aynı, performans eklendi)
function selectUnit(type, value) {
    if (type === 'input') currentInputUnit = value;
    else currentOutputUnit = value;
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

// Orijinal Saat Fonksiyonlarını Buraya Eklemeyi Unutma (Önceki mesajdaki gibi)
// ... updateTime, toBase12, calculateCustomDate ...

setInterval(updateTime, 100);
updateTime();
renderDropdowns("Alfabe");
