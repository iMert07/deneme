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
    "Zaman": ["Milisaniye", "Salise (Anatolya)", "Salise", "Saniye (Anatolya)", "Saniye", "Dakika", "Saat", "Saat (Anatolya)", "Gün", "Hafta (Anatolya)", "Hafta", "Ay", "Yıl (Anatolya)", "Yıl (Gregoryen)"],
    "Uzunluk": ["Kerrab (12⁻³)", "Milimetre (10⁻³)", "Rubu (12⁻²)", "Santimetre (10⁻²)", "İnç", "Endaze (12⁻¹)", "Fit", "Arşın (12⁰)", "Yard", "Metre (10⁰)", "Berid (12¹)", "Menzil (12²)","Kilometre (10³)", "Fersah (12³)", "Mil", "Merhale (12⁴)"],
    "Kütle": ["Miligram (10⁻³)", "Dirhem (12⁻³)", "Gram (10⁰)", "Miskal (12⁻²)", "Batman (12⁻¹)", "Paund", "Okka (12⁰)", "Kilogram (10³)", "Kantar (12¹)", "Ton (10⁶)"],
    "Konum": ["Boylam (Derece)", "Meridyen (Anatolya)"],
    "Sıcaklık": ["Celsius", "Anatolya (Fahrenheit)", "Fahrenheit", "Kelvin"],
    "Veri": ["Byte", "Kilobyte", "Megabyte", "Gigabyte", "Terabyte", "Anatolya Verisi"]
};

// --- DÖNÜŞÜM MANTIĞI VE DİĞER FONKSİYONLAR (DEĞİŞMEDİ) ---
// ... (Burada daha önce paylaştığın conversionRates, toGreek, toBase12 gibi fonksiyonlar aynen durmalı)

// --- ÖNEMLİ: BAŞLIKLARIN GÖRÜNÜMÜNÜ DÜZELTEN KISIM ---
function renderPills() { 
    // .innerText veya .textContent kullanarak veriyi ham haliyle (On Altılık gibi) yazdırıyoruz.
    pillInputLabel.textContent = currentInputUnit; 
    pillOutputLabel.textContent = currentOutputUnit; 
    dropdownInput.classList.remove('show'); 
    dropdownOutput.classList.remove('show'); 
}

function renderDropdowns(mode) {
    const options = unitData[mode] || [];
    
    // Varsayılan birimleri ata
    if (mode === "Sayı") { currentInputUnit = "Onluk (10)"; currentOutputUnit = "Anatolya (12)"; }
    else if (mode === "Alfabe") { currentInputUnit = "Eski Alfabe"; currentOutputUnit = "Yeni Alfabe"; }
    else { currentInputUnit = options[0]; currentOutputUnit = options[1] || options[0]; }

    // Dropdown öğelerini oluştur (BÜYÜK HARFE ZORLAMA YAPILMIYOR)
    const createItems = (type) => options.map(opt => 
        `<div class="dropdown-item" onclick="selectUnit('${type}', '${opt}')">${opt}</div>`
    ).join('');
    
    dropdownInput.innerHTML = createItems('input'); 
    dropdownOutput.innerHTML = createItems('output');
    
    renderPills(); 
    performConversion();
}

// --- KLAVYE OLAY DİNLEYİCİSİ (KLAVYE GÖRÜNTÜSÜNÜN ÇALIŞMASI İÇİN) ---
document.querySelectorAll('.key').forEach(key => { 
    key.addEventListener('click', () => {
        const action = key.dataset.action;
        if(action === 'delete') {
            inputArea.value = inputArea.value.slice(0,-1);
        } else if(action === 'reset') {
            inputArea.value = ''; outputArea.value = '';
        } else if(action === 'space') {
            inputArea.value += ' ';
        } else if(action === 'enter') {
            inputArea.value += '\n';
        } else if(!key.classList.contains('fn-key')) {
            inputArea.value += key.innerText;
        }
        performConversion();
    }); 
});

// --- DİĞER UI ETKİLEŞİMLERİ ---
function selectUnit(type, value) {
    if (type === 'input') { 
        if (value === currentOutputUnit) currentOutputUnit = currentInputUnit; 
        currentInputUnit = value; 
    } else { 
        if (value === currentInputUnit) currentInputUnit = currentOutputUnit; 
        currentOutputUnit = value; 
    }
    renderPills(); 
    performConversion();
}

function toggleDropdown(type) { 
    const el = type === 'input' ? dropdownInput : dropdownOutput; 
    const other = type === 'input' ? dropdownOutput : dropdownInput; 
    other.classList.remove('show'); 
    el.classList.toggle('show'); 
}

// Navigasyon sekmeleri için:
document.querySelectorAll('.nav-tab').forEach(tab => { 
    tab.addEventListener('click', function() {
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.replace('active-tab', 'inactive-tab'));
        this.classList.replace('inactive-tab', 'active-tab'); 
        renderDropdowns(this.dataset.value);
    }); 
});

// Sayfa yüklendiğinde başlat
renderDropdowns("Alfabe");
