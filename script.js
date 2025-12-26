// --- ELEMENTLER ---
const latin = document.getElementById('latin');
const greek = document.getElementById('greek');
const kbContainer = document.getElementById('kb-container');
let activeInput = latin;

// --- HARF ÇEVİRİ SİSTEMİ ---
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

function translate(text, dir){
    const map = dir === "toGreek" ? toGreek : toLatin;
    return text.split('').map(ch => map[ch] || ch).join('');
}

latin.addEventListener('input', () => { greek.value = translate(latin.value, "toGreek"); });
greek.addEventListener('input', () => { latin.value = translate(greek.value, "toLatin"); });
latin.addEventListener('focus', () => activeInput = latin);
greek.addEventListener('focus', () => activeInput = greek);

// --- KLAVYE İŞLEVLERİ ---
document.querySelectorAll('.key').forEach(key => {
    key.addEventListener('click', (e) => {
        e.preventDefault();
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

// --- SEKME YÖNETİMİ ---
const navTabs = document.querySelectorAll('.nav-tab');
navTabs.forEach(tab => {
    tab.addEventListener('click', function() {
        const mode = this.dataset.value;
        navTabs.forEach(t => { t.classList.remove('active-tab'); t.classList.add('inactive-tab'); });
        this.classList.add('active-tab'); this.classList.remove('inactive-tab');
        kbContainer.style.display = (mode === "Alfabe") ? "block" : "none";
    });
});

// --- TEMA ---
document.getElementById('themeToggle').addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
});

// --- ÖZEL ZAMAN SİSTEMİ ---
function toBase12(n) {
    const digits = "θ123456789ΦΛ";
    if (n === 0) return "θθ";
    let res = ""; let num = Math.abs(Math.floor(n));
    while (num > 0) { res = digits[num % 12] + res; num = Math.floor(num / 12); }
    return res.padStart(2, 'θ');
}

function calculateCustomDate(now) {
    const gregBase = new Date(1071, 2, 21);
    const daysPassed = Math.floor((now - gregBase) / 86400000);
    let estYear = Math.floor(daysPassed / 365);
    let extra = 0;
    for(let i=1; i<=estYear; i++) { if(i%20===0 && i%640!==0) extra += 5; }
    let total = estYear * 365 + extra;
    const dayOfYear = daysPassed - total;
    const month = Math.floor(dayOfYear / 30) + 1;
    const day = (dayOfYear % 30) + 1;
    const year = estYear + 1 + 10368;
    return { base12: `${toBase12(day)}.${toBase12(month)}.${toBase12(year)}` };
}

function updateTime() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 4, 30, 0);
    if (now < todayStart) todayStart.setDate(todayStart.getDate() - 1);
    const totalSecs = Math.floor(((now - todayStart) / 1000) * 2);
    const h = Math.floor(totalSecs / 14400) % 12;
    const m = Math.floor((totalSecs / 120) % 120);
    const s = totalSecs % 120;
    document.getElementById('clock').textContent = `${toBase12(h)}.${toBase12(m)}.${toBase12(s)}`;
    document.getElementById('date').textContent = calculateCustomDate(now).base12;
}
setInterval(updateTime, 500);
updateTime();
