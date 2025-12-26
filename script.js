/* ==========================================================================
   1. TANIMLAMALAR
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
   2. ÇEVİRİ VE KLAVYE
   ========================================================================== */
function translate(text, dir){
    const map = dir === "toGreek" ? toGreek : toLatin;
    return text.split('').map(ch => map[ch] || ch).join('');
}

latin.addEventListener('input', () => { greek.value = translate(latin.value, "toGreek"); });
greek.addEventListener('input', () => { latin.value = translate(greek.value, "toLatin"); });
latin.addEventListener('focus', () => activeInput = latin);
greek.addEventListener('focus', () => activeInput = greek);

document.querySelectorAll('.key').forEach(key => {
    key.addEventListener('click', () => {
        const action = key.dataset.action;
        if(action === 'delete') activeInput.value = activeInput.value.slice(0,-1);
        else if(action === 'enter') activeInput.value += '\n';
        else if(action === 'space') activeInput.value += ' ';
        else if(action === 'reset') { latin.value = ''; greek.value = ''; }
        else if(!key.classList.contains('fn-key')) activeInput.value += key.innerText;

        if(activeInput === latin) greek.value = translate(latin.value, "toGreek");
        else latin.value = translate(greek.value, "toLatin");
    });
});

/* ==========================================================================
   3. TEMA VE SEKME YÖNETİMİ
   ========================================================================== */
const themeToggleButton = document.getElementById('themeToggle');
const navTabs = document.querySelectorAll('.nav-tab');

// Sekme Değiştirme
navTabs.forEach(tab => {
    tab.addEventListener('click', function() {
        navTabs.forEach(t => {
            t.classList.remove('active-tab');
            t.classList.add('inactive-tab');
        });
        this.classList.add('active-tab');
        this.classList.remove('inactive-tab');
        
        console.log("Seçilen Mod:", this.dataset.value);
    });
});

// Tema Değiştirme
themeToggleButton.addEventListener('click', function() {
    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('color-theme', 'light');
    } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('color-theme', 'dark');
    }
});
