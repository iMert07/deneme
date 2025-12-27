// ... (üst kısımdaki değişken tanımlamaları aynı kalıyor)

const alphabetMaps = {
    "Standart": [
        "a", "b", "c", "ç", "d", "e", "f", "g", "ğ", "h", "ı", "i", "j", "k", "l", "m", "n", "o", "ö", "p", "r", "s", "ş", "t", "u", "ü", "v", "x", "y", "z",
        "A", "B", "C", "Ç", "D", "E", "F", "G", "Ğ", "H", "I", "İ", "J", "K", "L", "M", "N", "O", "Ö", "P", "R", "S", "Ş", "T", "U", "Ü", "V", "X", "Y", "Z",
        "0"
    ],
    "Yeni Alfabe": [
        "Α", "Β", "J", "C", "D", "Ε", "F", "G", "Γ", "Η", "Ь", "Ͱ", "Σ", "Κ", "L", "Μ", "Ν", "Q", "Ω", "Π", "Ρ", "S", "Ш", "Τ", "U", "Υ", "V", "Ψ", "R", "Ζ",
        "Α", "Β", "J", "C", "D", "Ε", "F", "G", "Γ", "Η", "Ь", "Ͱ", "Σ", "Κ", "L", "Μ", "Ν", "Q", "Ω", "Π", "Ρ", "S", "Ш", "Τ", "U", "Υ", "V", "Ψ", "R", "Ζ",
        "θ"
    ]
};

// Çeviri Motoru - Geliştirilmiş Versiyon
function universalTranslate(text, fromUnit, toUnit) {
    if (fromUnit === toUnit) return text;
    
    const sourceMap = alphabetMaps[fromUnit];
    const targetMap = alphabetMaps[toUnit];
    
    if (!sourceMap || !targetMap) return text;

    return text.split('').map(char => {
        // 1. Karakteri olduğu gibi ara
        let index = sourceMap.indexOf(char);
        
        // 2. Eğer bulamazsa (büyük-küçük harf uyuşmazlığı için) alternatifini dene
        if (index === -1) {
            // "Yeni Alfabe" genellikle büyük harf olduğu için küçük harf girilse bile bulmasını sağlar
            index = sourceMap.indexOf(char.toUpperCase());
        }

        // Eğer hala index -1 ise, harf bu alfabede tanımlı değildir, olduğu gibi bırak.
        // Eğer index bulunduysa, hedef alfabedeki karşılığını getir.
        return index !== -1 ? targetMap[index] : char;
    }).join('');
}

// Merkezi Çeviri Tetikleyici (Her iki kutu için de aktif)
function performTranslation() {
    const mode = document.querySelector('.active-tab').dataset.value;
    if (mode === "Alfabe") {
        if (activeInput === latin) {
            greek.value = universalTranslate(latin.value, currentInputUnit, currentOutputUnit);
        } else {
            // Sağ kutuya yazarken: Kaynak (currentOutputUnit) -> Hedef (currentInputUnit)
            latin.value = universalTranslate(greek.value, currentOutputUnit, currentInputUnit);
        }
    }
}

// ... (Dropdown ve Event Listener kodları öncekiyle aynı şekilde devam eder)
