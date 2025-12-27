const leftBox = document.getElementById('latin'); // HTML'deki id'ler aynı kalabilir ama mantık Sol Kutu
const rightBox = document.getElementById('greek'); // Mantık Sağ Kutu
const pillInputLabel = document.getElementById('pill-input-label');
const pillOutputLabel = document.getElementById('pill-output-label');
const dropdownInput = document.getElementById('dropdown-input');
const dropdownOutput = document.getElementById('dropdown-output');
let activeInput = leftBox;

// Aktif birimler
let currentLeftUnit = "Eski Alfabe";
let currentRightUnit = "Yeni Alfabe";

const unitData = {
    "Alfabe": ["Eski Alfabe", "Yeni Alfabe", "Fars Alfabesi (Yok)", "Orhun Alfabesi (Yok)"],
    "Sayı": ["Onluk (Standart)", "Onikilik (Anatolya)"],
    "Para": ["Lira", "Kuruş", "Anatolya Sikkesi"],
    "Takvim": ["Gregoryen", "Anatolya Takvimi"],
    "Zaman": ["Standart Saat", "Anatolya Saati"],
    "Uzunluk": ["Metre", "Kilometre", "Arşın", "Menzil"],
    "Kütle": ["Kilogram", "Gram", "Batman", "Dirhem"],
    "Sıcaklık": ["Celsius", "Fahrenheit", "Ilım", "Ayaz"],
    "Hacim": ["Litre", "Mililitre", "Kile", "Katre"],
    "Hız": ["km/saat", "mil/saat", "Anatolya Hızı"],
    "Alan": ["Metrekare", "Dönüm", "Evlek"],
    "Veri": ["Byte", "Bit", "Anatolya Verisi"],
    "Meridyen": ["Standart Meridyen", "Anatolya Boylamı"],
    "Paralel": ["Standart Paralel", "Anatolya Enlemi"]
};

// Alfabe Verileri (Tek Satır / Sütun Eşleşme Mantığı)
const alphabetMaps = {
    "Eski Alfabe": ["a", "b", "c", "ç", "d", "e", "f", "g", "ğ", "h", "ı", "i", "j", "k", "l", "m", "n", "o", "ö", "p", "r", "s", "ş", "t", "u", "ü", "v", "x", "y", "z", "0"],
    "Yeni Alfabe": ["Α", "Β", "J", "C", "D", "Ε", "F", "G", "Γ", "Η", "Ь", "Ͱ", "Σ", "Κ", "L", "Μ", "Ν", "Q", "Ω", "Π", "Ρ", "S", "Ш", "Τ", "U", "Υ", "V", "Ψ", "R", "Ζ", "θ"]
};

// --- ANA DÖNÜŞÜM MOTORU ---
function universalTranslate(text, fromUnit, toUnit) {
    if (fromUnit === toUnit) return text;

    // Alfabe Dönüşümü
    const sourceMap = alphabetMaps[fromUnit];
    const targetMap = alphabetMaps[toUnit];

    if (sourceMap && targetMap) {
        return text.split('').map(char => {
            let index = sourceMap.indexOf(char);
            if (index === -1) index = sourceMap.indexOf(char.toLowerCase());
            return index !== -1 ? targetMap[index] : char;
        }).join('');
    }

    // Buraya ileride eklenecek Sayı/Uzunluk hesaplamaları gelecek
    return text; 
}

// Çeviri Tetikleyici (Kutudan bağımsız çalışır)
function performAction() {
    const mode = document.querySelector('.active-tab').dataset.value;
    
    if (activeInput === leftBox) {
        // Sol kutuya yazılıyorsa: Soldaki Birim -> Sağdaki Birim
        rightBox.value = universalTranslate(leftBox.value, currentLeftUnit, currentRightUnit);
    } else {
        // Sağ kutuya yazılıyorsa: Sağdaki Birim -> Soldaki Birim
        leftBox.value = universalTranslate(rightBox.value, currentRightUnit, currentLeftUnit);
    }
}

// --- ETKİLEŞİM DİNLEYİCİLERİ ---
[leftBox, rightBox].forEach(box => {
    box.addEventListener('input', () => {
        activeInput = box;
        performAction();
    });
    box.addEventListener('focus', () => activeInput = box);
});

// Dropdown ve Birim Seçimi
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
        currentLeftUnit = value;
        if (currentLeftUnit === currentRightUnit) currentRightUnit = options.find(o => o !== value);
    } else {
        currentRightUnit = value;
        if (currentRightUnit === currentLeftUnit) currentLeftUnit = options.find(o => o !== value);
    }
    renderPills();
    performAction(); // Birim değişince mevcut metni çevir
}

function renderDropdowns(mode) {
    const options = unitData[mode] || [];
    currentLeftUnit = options[0];
    currentRightUnit = options[1] || options[1]; // Eğer tek birim varsa hata vermemesi için
    
    dropdownInput.innerHTML = options.map(opt => `<div class="dropdown-item" onclick="selectUnit('input', '${opt}')">${opt}</div>`).join('');
    dropdownOutput.innerHTML = options.map(opt => `<div class="dropdown-item" onclick="selectUnit('output', '${opt}')">${opt}</div>`).join('');
    renderPills();
}

function renderPills() {
    pillInputLabel.innerText = currentLeftUnit;
    pillOutputLabel.innerText = currentRightUnit;
    dropdownInput.classList.remove('show');
    dropdownOutput.classList.remove('show');
}

// Sanal Klavye Desteği
document.querySelectorAll('.key').forEach(key => {
    key.addEventListener('click', (e) => {
        e.preventDefault();
        const action = key.dataset.action;
        if(action === 'delete') activeInput.value = activeInput.value.slice(0,-1);
        else if(action === 'enter') activeInput.value += '\n';
        else if(action === 'space') activeInput.value += ' ';
        else if(action === 'reset') { leftBox.value = ''; rightBox.value = ''; }
        else if(!key.classList.contains('fn-key')) activeInput.value += key.innerText;
        performAction();
    });
});

// Sekme (Nav) Yönetimi
const navTabs = document.querySelectorAll('.nav-tab');
navTabs.forEach(tab => {
    tab.addEventListener('click', function() {
        navTabs.forEach(t => { t.classList.remove('active-tab'); t.classList.add('inactive-tab'); });
        this.classList.add('active-tab'); this.classList.remove('inactive-tab');
        renderDropdowns(this.dataset.value);
    });
});

// Zaman ve Takvim (Orijinal haliyle korundu)
function toBase12(n, pad = 2) {
    const digits = "θ123456789ΦΛ";
    if (n === 0) return "θ".repeat(pad);
    let res = ""; let num = Math.abs(Math.floor(n));
    while (num > 0) { res = digits[num % 12] + res; num = Math.floor(num / 12); }
    return res.padStart(pad, 'θ');
}

function updateTime() {
    const clockEl = document.getElementById('clock');
    const dateEl = document.getElementById('date');
    if(!clockEl || !dateEl) return;
    const now = new Date();
    // ... Zaman hesaplama kodların ...
    clockEl.textContent = `${toBase12(now.getHours())}.${toBase12(now.getMinutes())}`; // Örnek çıktı
}

setInterval(updateTime, 100);
renderDropdowns("Alfabe");
