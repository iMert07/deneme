/* ==========================================================================
   1. TANIMLAMALAR VE DEĞİŞKENLER
   ========================================================================== */
const latin = document.getElementById('latin');
const greek = document.getElementById('greek');
let activeInput = latin;

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

const toLatin = Object.fromEntries(Object.entries(toGreek).map(([k,v])=>[v,k.toUpperCase()]));

/* ==========================================================================
   2. ÇEVİRİ VE KLAVYE MANTIĞI
   ========================================================================== */
function translate(text, dir){
    const map = dir === "toGreek" ? toGreek : toLatin;
    return text.split('').map(ch => map[ch] || ch).join('');
}

latin.addEventListener('input', () => { 
    greek.value = translate(latin.value, "toGreek"); 
});

greek.addEventListener('input', () => { 
    latin.value = translate(greek.value, "toLatin"); 
});

latin.addEventListener('focus', () => activeInput = latin);
greek.addEventListener('focus', () => activeInput = greek);

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

        if(activeInput === latin){
            greek.value = translate(latin.value, "toGreek");
        } else {
            latin.value = translate(greek.value, "toLatin");
        }
    });
});

/* ==========================================================================
   3. TEMA YÖNETİMİ
   ========================================================================== */
const themeToggleButton = document.getElementById('themeToggle');

themeToggleButton.addEventListener('click', function() {
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
   4. DROPDOWN MANTIĞI (Vurgulu ve Soluk İkonlar)
   ========================================================================== */
const dropdownBtn = document.getElementById('dropdownBtn');
const dropdownMenu = document.getElementById('dropdownMenu');
const dropdownItems = document.querySelectorAll('.dropdown-item');

// Paneldeki aktif/pasif renklerini güncelleyen fonksiyon
function updateDropdownUI(currentValue) {
    dropdownItems.forEach(item => {
        if (item.getAttribute('data-value') === currentValue) {
            // Seçili olan: Parlak/Beyaz
            item.classList.remove('text-slate-400', 'dark:text-slate-500');
            item.classList.add('text-slate-900', 'dark:text-white', 'font-bold');
        } else {
            // Seçili olmayan: Soluk/Gri
            item.classList.remove('text-slate-900', 'dark:text-white', 'font-bold');
            item.classList.add('text-slate-400', 'dark:text-slate-500');
        }
    });
}

if(dropdownBtn) {
    dropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle('hidden');
        // Menü her açıldığında mevcut seçime göre renkleri tazele
        updateDropdownUI(document.getElementById('selectedText').innerText);
    });
}

dropdownItems.forEach(item => {
    item.addEventListener('click', function() {
        const value = this.getAttribute('data-value');
        const icon = this.getAttribute('data-icon');
        
        document.getElementById('selectedText').innerText = value;
        document.getElementById('selectedIcon').innerText = icon;
        
        // Menüyü kapat ve renkleri güncelle
        updateDropdownUI(value);
        dropdownMenu.classList.add('hidden');
    });
});

window.addEventListener('click', () => {
    if(dropdownMenu) dropdownMenu.classList.add('hidden');
});

// İlk açılışta UI'ı ayarla
updateDropdownUI("Alfabe");
