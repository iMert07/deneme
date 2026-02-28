// --- YARDIMCI FORMAT FONKSİYONU ---
function formatCompact(num) {
    if (num === 0) return "0";
    return parseFloat(num.toFixed(2)).toString().replace('.', ',');
}

// --- ELEMENT SEÇİCİLER ---
const inputArea = document.getElementById('input-area');
const outputArea = document.getElementById('output-area');
const pillInputLabel = document.getElementById('pill-input-label');
const pillOutputLabel = document.getElementById('pill-output-label');
const dropdownInput = document.getElementById('dropdown-input');
const dropdownOutput = document.getElementById('dropdown-output');

let currentInputUnit = "Eski Alfabe";
let currentOutputUnit = "Yeni Alfabe";

// --- VERİ SETLERİ ---
const unitData = {
    "Alfabe": ["Eski Alfabe", "Yeni Alfabe"],
    "Sayı": ["İkilik (2)", "Onluk (10)", "Anatolya (12)", "On Altılık (16)"],
    "Para": ["Lira", "Akçe", "Dollar", "Euro", "Gümüş (Ons)", "Altın (Ons)"],
    "Zaman": [
        "Milisaniye", "Salise (Anatolya)", "Salise", 
        "Saniye (Anatolya)", "Saniye", "Dakika", 
        "Saat", "Saat (Anatolya)", "Gün", 
        "Hafta (Anatolya)", "Hafta", "Ay", "Yıl (Anatolya)", "Yıl (Gregoryen)"
    ],
    "Uzunluk": [
        "Kerrab (12⁻³)", "Milimetre (10⁻³)", "Rubu (12⁻²)", "Santimetre (10⁻²)", 
        "İnç", "Endaze (12⁻¹)", "Fit", "Arşın (12⁰)", 
        "Yard", "Metre (10⁰)", "Berid (12¹)", "Menzil (12²)", 
        "Kilometre (10³)", "Fersah (12³)", "Mil", "Merhale (12⁴)"
    ],
    "Kütle": [
        "Miligram (10⁻³)", "Dirhem (12⁻³)", "Gram (10⁰)", "Miskal (12⁻²)", 
        "Batman (12⁻¹)", "Paund", "Okka (12⁰)", "Kilogram (10³)", 
        "Kantar (12¹)", "Ton (10⁶)"
    ],
    "Hacim": [
        "Mililitre", "Sıvı Ons (ABD)", "Kile (12⁻¹)", "Hacim (12⁰)", 
        "Litre", "Litre (12¹)", "Galon (ABD)", "Şinik (12²)", "Metreküp"
    ],
    "Konum": ["Boylam (Derece)", "Meridyen (Anatolya)"],
    "Sıcaklık": ["Celsius", "Anatolya (Fahrenheit, 12)", "Fahrenheit", "Kelvin"],
    "Veri": ["Byte", "Kilobyte", "Megabyte", "Gigabyte", "Terabyte", "Anatolya Verisi"]
};

// --- KATSAYILAR (Baz: Litre) ---
const conversionRates = {
    "Uzunluk": {
        "Kerrab (12⁻³)": 0.00041666666, "Milimetre (10⁻³)": 0.001, "Rubu (12⁻²)": 0.005, "Santimetre (10⁻²)": 0.01,
        "İnç": 0.0254, "Endaze (12⁻¹)": 0.06, "Fit": 0.3048, "Arşın (12⁰)": 0.72, "Yard": 0.9144, "Metre (10⁰)": 1,
        "Berid (12¹)": 8.64, "Menzil (12²)": 103.68, "Kilometre (10³)": 1000, "Fersah (12³)": 1244.16, "Mil": 1609.34, "Merhale (12⁴)": 14929.92
    },
    "Kütle": {
        "Miligram (10⁻³)": 0.000001, "Dirhem (12⁻³)": 0.0005, "Gram (10⁰)": 0.001, "Miskal (12⁻²)": 0.006,
        "Batman (12⁻¹)": 0.072, "Paund": 0.45359, "Okka (12⁰)": 0.864, "Kilogram (10³)": 1, "Kantar (12¹)": 10.368, "Ton (10⁶)": 1000
    },
    "Hacim": {
        "Mililitre": 0.001,
        "Sıvı Ons (ABD)": 0.0295735,
        "Kile (12⁻¹)": 0.018,
        "Hacim (12⁰)": 0.216,
        "Litre": 1,
        "Litre (12¹)": 2.592,
        "Galon (ABD)": 3.78541,
        "Şinik (12²)": 31.104,
        "Metreküp": 1000
    },
    "Para": { "Lira": 1, "Akçe": 9, "Dollar": 43, "Euro": 51, "Gümüş (Ons)": 2735, "Altın (Ons)": 183787 },
    "Veri": { "Byte": 1, "Kilobyte": 1024, "Megabyte": 1048576, "Gigabyte": 1073741824, "Terabyte": 1099511627776, "Anatolya Verisi": 1200 },
    "Zaman": { 
        "Milisaniye": 0.001, "Salise (Anatolya)": 1/240, "Salise": 1/60, "Saniye (Anatolya)": 0.5, "Saniye": 1, 
        "Dakika": 60, "Saat": 3600, "Saat (Anatolya)": 7200, "Gün": 86400, "Hafta (Anatolya)": 432000, "Hafta": 604800, "Ay": 2592000
    }
};

// --- TABAN DÖNÜŞTÜRÜCÜLER ---
function toBase12(n, pad = 1, isAnatolya = true) {
    const digits = isAnatolya ? "0123456789ΦΛ" : "0123456789AB";
    let num = Math.abs(Math.floor(n));
    let res = "";
    if (num === 0) res = digits[0];
    else { while (num > 0) { res = digits[num % 12] + res; num = Math.floor(num / 12); } }
    return res.padStart(pad, digits[0]);
}

function toBase12Float(n, isAnatolya = true) {
    const digits = isAnatolya ? "0123456789ΦΛ" : "0123456789AB";
    let integerPart = Math.floor(Math.abs(n));
    let fractionPart = Math.abs(n) - integerPart;
    let res = (n < 0 ? "-" : "") + toBase12(integerPart, 1, isAnatolya);
    if (fractionPart > 0.0001) {
        let fracRes = "";
        for (let i = 0; i < 3; i++) { 
            fractionPart *= 12; 
            let d = Math.floor(fractionPart); 
            fracRes += digits[d]; 
            fractionPart -= d; 
            if (fractionPart < 0.0001) break; 
        }
        fracRes = fracRes.replace(/0+$/, '');
        if (fracRes !== "") res += "," + fracRes;
    }
    return res;
}

// ... (normalizeInput, isValidInput, universalNumberConvert, getGregorianDays, getAnatolyaDays gibi diğer fonksiyonlar aynı kalacak)

function performConversion() {
    const activeTab = document.querySelector('.active-tab');
    if (!activeTab) return;
    const mode = activeTab.dataset.value;
    const text = inputArea.value.trim();
    if (!text) { outputArea.value = ""; return; }

    if (mode === "Alfabe") {
        outputArea.value = (currentInputUnit === "Eski Alfabe") ? text.split('').map(ch => toGreek[ch] || ch).join('') : text.split('').map(ch => toLatin[ch] || ch).join('');
    } 
    else if (mode === "Sayı") { outputArea.value = universalNumberConvert(text, currentInputUnit, currentOutputUnit); }
    else if (mode === "Sıcaklık") {
        if (!isValidInput(text, currentInputUnit)) { outputArea.value = "Geçersiz Karakter"; return; }
        let fahr;
        if (currentInputUnit === "Celsius") fahr = (parseFloat(text.replace(',', '.')) * 1.8) + 32;
        else if (currentInputUnit === "Kelvin") fahr = ((parseFloat(text.replace(',', '.')) - 273.15) * 1.8) + 32;
        else if (currentInputUnit === "Fahrenheit") fahr = parseFloat(text.replace(',', '.'));
        else if (currentInputUnit === "Anatolya (Fahrenheit, 12)") {
            let input = normalizeInput(text.toUpperCase()).replace(',','.');
            const parts = input.split('.');
            let val = parseInt(parts[0], 12);
            if (parts[1]) {
                const stdDigits = "0123456789ABCDEF";
                for (let i = 0; i < parts[1].length; i++) val += stdDigits.indexOf(parts[1][i]) * Math.pow(12, -(i+1));
            }
            fahr = val + 32;
        }

        if (isNaN(fahr)) { outputArea.value = "Hata"; return; }

        let result;
        if (currentOutputUnit === "Celsius") result = (fahr - 32) / 1.8;
        else if (currentOutputUnit === "Kelvin") result = ((fahr - 32) / 1.8) + 273.15;
        else if (currentOutputUnit === "Fahrenheit") result = fahr;
        else if (currentOutputUnit === "Anatolya (Fahrenheit, 12)") {
            result = fahr - 32;
            const anaVal = toBase12Float(result, true), stdVal = toBase12Float(result, false);
            let decPart = result === 0 ? "0" : formatCompact(result);
            outputArea.value = (anaVal === stdVal) ? (anaVal === "0" ? "0" : `${anaVal} [${decPart}]`) : `${anaVal} (${stdVal}) [${decPart}]`;
            return;
        }
        outputArea.value = formatCompact(result);
    }
    // Konum, Hacim, Uzunluk vb. dönüşümler
    else if (conversionRates[mode] || mode === "Zaman") {
        if (!isValidInput(text, currentInputUnit)) { outputArea.value = "Geçersiz Karakter"; return; }
        let numericValue;
        // Hacimdeki yeni Anatolya birimlerini de "Special" listesine ekleyelim
        const specialUnits = ["Anatolya", "Gün", "Ay", "Yıl", "Arşın", "Menzil", "Endaze", "Rubu", "Kerrab", "Berid", "Fersah", "Merhale", "Okka", "Kantar", "Batman", "Miskal", "Dirhem", "Akçe", "Kile", "Hacim", "Litre (12", "Şinik"];
        const isInputSpecial = specialUnits.some(s => currentInputUnit.includes(s));
        
        if (isInputSpecial) {
            const normalizedText = normalizeInput(text.toUpperCase()).replace(',','.');
            const parts = normalizedText.split('.');
            numericValue = parseInt(parts[0], 12);
            if (parts[1]) {
                const stdDigits = "0123456789ABCDEF";
                for (let i = 0; i < parts[1].length; i++) numericValue += stdDigits.indexOf(parts[1][i]) * Math.pow(12, -(i+1));
            }
        } else { numericValue = parseFloat(text.replace(',', '.')); }
        
        if (isNaN(numericValue)) { outputArea.value = "Hata"; return; }

        let baseValue;
        const currentModeRates = conversionRates[mode] || conversionRates["Zaman"];
        if (currentInputUnit === "Yıl (Gregoryen)") baseValue = getGregorianDays(numericValue) * 86400;
        else if (currentInputUnit === "Yıl (Anatolya)") baseValue = getAnatolyaDays(numericValue) * 86400;
        else baseValue = numericValue * (currentModeRates[currentInputUnit] || 1);

        let result;
        if (currentOutputUnit === "Yıl (Gregoryen)") result = baseValue / (365.2425 * 86400);
        else if (currentOutputUnit === "Yıl (Anatolya)") result = baseValue / (365.25 * 86400);
        else result = baseValue / (currentModeRates[currentOutputUnit] || 1);

        const isOutputSpecial = specialUnits.some(s => currentOutputUnit.includes(s)) || currentOutputUnit.includes("Anatolya");
        if (isOutputSpecial) {
            const anaVal = toBase12Float(result, true), stdVal = toBase12Float(result, false);
            if (result === 0 || anaVal === "0") {
                outputArea.value = "0";
            } else {
                let resStr = anaVal;
                if (anaVal !== stdVal) resStr += ` (${stdVal})`;
                resStr += ` [${formatCompact(result)}]`;
                outputArea.value = resStr;
            }
        } else {
            outputArea.value = formatCompact(result);
        }
    }
}
// ... (Geri kalan UI ve Header fonksiyonları aynı şekilde devam eder)
