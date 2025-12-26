// --- ELEMENTLER ---
const latin = document.getElementById('latin');
const greek = document.getElementById('greek');
const kbContainer = document.getElementById('kb-container');
let activeInput = latin;

// --- HARF ÇEVİRİ ---
const toGreek = { "a":"Α","A":"Α","e":"Ε","E":"Ε","i":"Ͱ","İ":"Ͱ","n":"Ν","N":"Ν","r":"Ρ","R":"Ρ","l":"L","L":"L","ı":"Ь","I":"Ь","k":"Κ","K":"Κ","d":"D","D":"D","m":"Μ","M":"Μ","t":"Τ","T":"Τ","y":"R","Y":"R","s":"S","S":"S","u":"U","U":"U","o":"Q","O":"Q","b":"Β","B":"Β","ş":"Ш","Ş":"Ш","ü":"Υ","Ü":"Υ","z":"Ζ","Z":"Ζ","g":"G","G":"G","ç":"C","Ç":"C","ğ":"Γ","Ğ":"Ğ","v":"V","V":"V","c":"J","C":"J","h":"Η","H":"Η","p":"Π","P":"Π","ö":"Ω","Ö":"Ω","f":"F","F":"F","x":"Ψ","X":"Ψ","j":"Σ","J":"Σ","0":"θ" };
const toLatin = Object.fromEntries(Object.entries(toGreek).map(([k,v])=>[v,k.toUpperCase()]));

function translate(text, dir){
    const map = dir === "toGreek" ? toGreek : toLatin;
    return text.split('').map(ch => map[ch] || ch).join('');
}

latin.addEventListener('input', () => { greek.value = translate(latin.value, "toGreek"); });
greek.addEventListener('input', () => { latin.value = translate(greek.value, "toLatin"); });
latin.addEventListener('focus', () => activeInput = latin);
greek.addEventListener('focus', () => activeInput = greek);

// --- KLAVYE ---
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

// --- SEKME VE TEMA ---
const navTabs = document.querySelectorAll('.nav-tab');
navTabs.forEach(tab => {
    tab.addEventListener('click', function() {
        const mode = this.dataset.value;
        navTabs.forEach(t => { t.classList.remove('active-tab'); });
        this.classList.add('active-tab');
        kbContainer.style.display = (mode === "Alfabe") ? "block" : "none";
    });
});
document.getElementById('themeToggle').addEventListener('click', () => { document.documentElement.classList.toggle('dark'); });

// --- ÖZEL ZAMAN SİSTEMİ (HATASIZ) ---
function toBase12(n, pad = 2) {
    const digits = "θ123456789ΦΛ";
    if (n === 0) return "θ".repeat(pad);
    let res = ""; let num = Math.abs(Math.floor(n));
    while (num > 0) { res = digits[num % 12] + res; num = Math.floor(num / 12); }
    return res.padStart(pad, 'θ');
}

function calculateCustomDate(now) {
    const gregBase = new Date(1071, 2, 21); // 21 Mart 1071
    const diff = now - gregBase;
    const daysPassed = Math.floor(diff / (1000 * 60 * 60 * 24));

    let year = 0;
    let daysCounter = 0;
    
    // Yıl hesaplama (20 ve 640 kuralı)
    while (true) {
        let yearDays = 365;
        let nextYear = year + 1;
        if (nextYear % 20 === 0 && nextYear % 640 !== 0) {
            yearDays += 5; // Artık Hafta
        }
        if (daysCounter + yearDays > daysPassed) break;
        daysCounter += yearDays;
        year++;
    }

    const dayOfYear = daysPassed - daysCounter;
    const month = Math.floor(dayOfYear / 30) + 1;
    const day = (dayOfYear % 30) + 1;
    const base12Year = year + 1 + 10368; // +6000 base12

    return { base12: `${toBase12(day)}.${toBase12(month)}.${toBase12(base12Year, 4)}` };
}

function updateTime() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 4, 30, 0);
    if (now < todayStart) todayStart.setDate(todayStart.getDate() - 1);
    
    const totalSeconds = Math.floor(((now - todayStart) / 1000) * 2);
    const h = Math.floor(totalSeconds / 14400) % 12;
    const m = Math.floor((totalSeconds / 120) % 120);
    const s = totalSeconds % 120;

    document.getElementById('clock').textContent = `${toBase12(h)}.${toBase12(m)}.${toBase12(s)}`;
    document.getElementById('date').textContent = calculateCustomDate(now).base12;
}

setInterval(updateTime, 100);
updateTime();
