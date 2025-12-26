/* ==========================================================================
   1. TANIMLAMALAR VE DEĞİŞKENLER
   ========================================================================== */
const latin = document.getElementById('latin');
const greek = document.getElementById('greek');
let activeInput = latin;

// Senin harf haritan
const toGreek = {
    "a":"Α","A":"Α", "e":"Ε","E":"Ε", "i":"Ͱ","İ":"Ͱ", "n":"Ν","N":"Ν",
    "r":"Ρ","R":"Ρ", "l":"L","L":"L", "ı":"Ь","I":"Ь", "k":"Κ","K":"Κ",
    "d":"D","D":"D", "m":"Μ","M":"Μ", "t":"Τ","T":"Τ", "y":"R","Y":"R",
    "s":"S","S":"S", "u":"U","U":"U", "o":"Q","O":"Q", "b":"Β","B":"Β",
    "ş":"Ш","Ş":"Ш", "ü":"Υ","Ü":"Υ", "z":"Ζ","Z":"Ζ", "g":"G","G":"G",
    "ç":"C","Ç":"C", "ğ":"Γ","Ğ":"Γ", "v":"V","V":"V", "c":"J","C":"J",
    "h":"Η","H":"Η", "p":"Π","P":"Π", "ö":"Ω","Ö":"Ω", "f":"F","F":"F",
    "x":"Ψ","X":"Ψ", "j":"Σ","J":"Σ", "0":"θ"
};

// Tersten harf haritası (Otomatik oluşturulur)
const toLatin = Object.fromEntries(Object.entries(toGreek).map(([k,v])=>[v,k.toUpperCase()]));

/* ==========================================================================
   2. ÇEVİRİ VE KLAVYE MANTIĞI (Senin Orijinal Kodun)
   ========================================================================== */
function translate(text, dir){
    const map = dir === "toGreek" ? toGreek : toLatin;
    return text.split('').map(ch => map[ch] || ch).join('');
}

// Input olayları
latin.addEventListener('input', () => { 
    greek.value = translate(latin.value, "toGreek"); 
});

greek.addEventListener('input', () => { 
    latin.value = translate(greek.value, "toLatin"); 
});

// Fokus takibi
latin.addEventListener('focus', () => activeInput = latin);
greek.addEventListener('focus', () => activeInput = greek);

// Sanal Klavye Etkileşimi
document.querySelectorAll('.key').forEach(key => {
    key.addEventListener('click', () => {
        const action = key.dataset.action;
        
        if(action === 'delete') {
            activeInput.value = activeInput.value.slice(0,-1);
        } else if(action === 'enter') {
            activeInput.value += '\n';
        } else if(action === 'space') {
            activeInput.value += ' ';
        } else if(action === 'reset') {
            latin.value = '';
            greek.value = '';
        } else if(!key.classList.contains('fn-key')) {
            activeInput.value += key.innerText;
        }

        // Çeviriyi tetikle
        if(activeInput === latin){
            greek.value = translate(latin.value, "toGreek");
        } else {
            latin.value = translate(greek.value, "toLatin");
        }
    });
});

/* ==========================================================================
   3. TEMA YÖNETİMİ (Örnek Koddan Uyarlanan Modern Sistem)
   ========================================================================== */
const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');
const themeToggleButton = document.getElementById('themeToggle');

function setupThemeIcons() {
    if (document.documentElement.classList.contains('dark')) {
        themeToggleLightIcon.classList.remove('hidden');
        themeToggleDarkIcon.classList.add('hidden');
    } else {
        themeToggleDarkIcon.classList.remove('hidden');
        themeToggleLightIcon.classList.add('hidden');
    }
}

// İlk açılışta ikonları ayarla
setupThemeIcons();

themeToggleButton.addEventListener('click', function() {
    // İkonları değiştir
    themeToggleDarkIcon.classList.toggle('hidden');
    themeToggleLightIcon.classList.toggle('hidden');

    // Temayı değiştir ve LocalStorage'a kaydet
    if (localStorage.getItem('color-theme')) {
        if (localStorage.getItem('color-theme') === 'light') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('color-theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('color-theme', 'light');
        }
    } else {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('color-theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('color-theme', 'dark');
        }
    }
});

/* ==========================================================================
   4. DROPDOWN MANTIĞI
   ========================================================================== */
const dropdownBtn = document.getElementById('dropdownBtn');
const dropdownMenu = document.getElementById('dropdownMenu');

if(dropdownBtn) {
    dropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle('hidden');
    });
}

document.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', function() {
        document.getElementById('selectedText').innerText = this.getAttribute('data-value');
        document.getElementById('selectedIcon').innerText = this.getAttribute('data-icon');
        dropdownMenu.classList.add('hidden');
    });
});

window.addEventListener('click', () => {
    if(dropdownMenu) dropdownMenu.classList.add('hidden');
});
