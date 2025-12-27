const latin = document.getElementById('latin');
const greek = document.getElementById('greek');
const pillInputLabel = document.getElementById('pill-input-label');
const pillOutputLabel = document.getElementById('pill-output-label');
const dropdownInput = document.getElementById('dropdown-input');
const dropdownOutput = document.getElementById('dropdown-output');
let activeInput = latin;

// Aktif birimler (Başlangıç değerleri)
let currentInputUnit = "Standart";
let currentOutputUnit = "Yeni Alfabe";

// 1. ALFABE SİSTEMİ (Standart'taki her indeks diğer listelerdeki karşılığıdır)
const alphabetMaps = {
    "Standart": [
        "a", "b", "c", "ç", "d", "e", "f", "g", "ğ", "h", "ı", "i", "j", "k", "l", "m", "n", "o", "ö", "p", "r", "s", "ş", "t", "u", "ü", "v", "y", "z", "x",
        "A", "B", "C", "Ç", "D", "E", "F", "G", "Ğ", "H", "I", "İ", "J", "K", "L", "M", "N", "O", "Ö", "P", "R", "S", "Ş", "T", "U", "Ü", "V", "Y", "Z", "X",
        "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"
    ],
    "Yeni Alfabe": [
        // Küçük harf girilse bile Büyük harf karşılıkları (Senin istediğin kural)
        "Α", "Β", "J", "C", "D", "Ε", "F", "G", "Γ", "Η", "Ь", "Ͱ", "Σ", "Κ", "L", "Μ", "Ν", "Q", "Ω", "Π", "Ρ", "S", "Ш", "Τ", "U", "Υ", "V", "R", "Ζ", "Ψ",
        "Α", "Β", "J", "C", "D", "Ε", "F", "G", "Γ", "Η", "Ь", "Ͱ", "Σ", "Κ", "L", "Μ", "Ν", "Q", "Ω", "Π", "Ρ", "S", "Ш", "Τ", "U", "Υ", "V", "R", "Ζ", "Ψ",
        "θ", "1", "2", "3", "4", "5", "6", "7", "8", "9"
    ]
};

// 2. EVRENSEL ÇEVİRİ MOTORU
function universalTranslate(text, fromUnit, toUnit) {
    if (fromUnit === toUnit) return text;

    const sourceChars = alphabetMaps[fromUnit];
    const targetChars = alphabetMaps[toUnit];

    // Eğer alfabe tanımı yoksa (Sayı, Para vb. modlar için) metni koru
    if (!sourceChars || !targetChars) return text;

    return text.split('').map(char => {
        // Kaynak listede bu karakterin yerini (index) bul
        const index = sourceChars.indexOf(char);

        // Eğer karakter listede varsa, hedef listedeki aynı sıradaki karşılığını getir
        if (index !== -1) {
            return targetChars[index];
        }

        // Listede yoksa (boşluk, nokta vb.) olduğu gibi bırak
        return char;
    }).join('');
}

// 3. MERKEZİ TETİKLEYİCİ
function handleTranslation() {
    const mode = document.querySelector('.active-tab').dataset.value;

    if (mode === "Alfabe") {
        if (activeInput === latin) {
            greek.value = universalTranslate(latin.value, currentInputUnit, currentOutputUnit);
        } else {
            latin.value = universalTranslate(greek.value, currentOutputUnit, currentInputUnit);
        }
    }
}

// 4. ETKİLEŞİM AYARLARI (Event Listeners)
latin.addEventListener('input', () => { 
    activeInput = latin; 
    handleTranslation(); 
});

greek.addEventListener('input', () => { 
    activeInput = greek; 
    handleTranslation(); 
});

// Birim seçme fonksiyonunu güncelle
function selectUnit(type, value) {
    const mode = document.querySelector('.active-tab').dataset.value;
    const options = unitData[mode];

    if (type === 'input') {
        currentInputUnit = value;
        if (currentInputUnit === currentOutputUnit) currentOutputUnit = options.find(o => o !== value);
    } else {
        currentOutputUnit = value;
        if (currentOutputUnit === currentInputUnit) currentInputUnit = options.find(o => o !== value);
    }
    
    renderPills();
    handleTranslation(); // Birim değişince kutuları anında güncelle
}

// Klavye tuşları için (Scriptindeki mevcut klavye döngüsüne ekle)
document.querySelectorAll('.key').forEach(key => {
    key.addEventListener('click', () => {
        // Mevcut klavye kodların burada çalışmaya devam eder...
        handleTranslation(); // Tuşa basıldıktan sonra çeviriyi yenile
    });
});

// Sayfa yüklendiğinde başlat
renderDropdowns("Alfabe");
