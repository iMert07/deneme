const latin = document.getElementById('latin');
const greek = document.getElementById('greek');
let activeInput = latin;

// Silme işlemi için zamanlayıcılar
let deleteInterval;
let deleteTimeout;

const toGreek = {
    "a":"Α","A":"Α","e":"Ε","E":"Ε","i":"Ͱ","İ":"Ͱ","n":"Ν","N":"Ν","r":"Ρ","R":"Ρ","l":"L","L":"L","ı":"Ь","I":"Ь","k":"Κ","K":"Κ","d":"D","D":"D","m":"Μ","M":"Μ","t":"Τ","T":"Τ","y":"R","Y":"R","s":"S","S":"S","u":"U","U":"U","o":"Q","O":"Q","b":"Β","B":"Β","ş":"Ш","Ş":"Ш","ü":"Υ","Ü":"Υ","z":"Ζ","Z":"Ζ","g":"G","G":"G","ç":"C","Ç":"C","ğ":"Γ","Ğ":"Γ","v":"V","V":"V","c":"J","C":"J","h":"Η","H":"Η","p":"Π","P":"Π","ö":"Ω","Ö":"Ω","f":"F","F":"F","x":"Ψ","X":"Ψ","j":"Σ","J":"Σ","0":"θ"
};

const toLatin = Object.fromEntries(Object.entries(toGreek).map(([k,v])=>[v,k.toUpperCase()]));

function translate(text, dir){
    const map = dir === "toGreek" ? toGreek : toLatin;
    return text.split('').map(ch => map[ch] || ch).join('');
}

function updateTranslation() {
    if (activeInput === latin) {
        greek.value = translate(latin.value, "toGreek");
    } else {
        latin.value = translate(greek.value, "toLatin");
    }
}

function deleteChar() {
    activeInput.value = activeInput.value.slice(0, -1);
    updateTranslation();
}

// KLAVYE OLAYLARI
document.querySelectorAll('.key').forEach(key => {
    // 1. DOKUNMATİK BAŞLANGICI (Mobile & Desktop)
    const handleStart = (e) => {
        // Mobilde sağ tık menüsünü ve seçimi engelle
        if (e.type === 'touchstart') e.preventDefault(); 
        
        const action = key.dataset.action;
        const content = key.innerText.trim();

        // Görsel efekt (Harf Büyümesi)
        if (!action) {
            key.classList.add('key-active-effect');
        }

        if (action === 'delete') {
            deleteChar();
            // 500ms basılı tutunca hızlı silmeye başla
            deleteTimeout = setTimeout(() => {
                deleteInterval = setInterval(deleteChar, 70);
            }, 500);
        } else if (action === 'enter') {
            activeInput.value += '\n'; updateTranslation();
        } else if (action === 'space') {
            activeInput.value += ' '; updateTranslation();
        } else if (action === 'reset') {
            latin.value = ""; greek.value = "";
        } else if (action !== 'shift') { // Shift ve diğer aksiyon olmayanlar (Harfler)
            activeInput.value += content;
            updateTranslation();
        }
    };

    // 2. DOKUNMATİK BİTİŞİ
    const handleEnd = () => {
        clearTimeout(deleteTimeout);
        clearInterval(deleteInterval);
        key.classList.remove('key-active-effect');
    };

    // Event Listenerları Ekle
    key.addEventListener('mousedown', handleStart);
    key.addEventListener('touchstart', handleStart, {passive: false});
    
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchend', handleEnd);
});

// Input odak takibi
latin.addEventListener('focus', () => activeInput = latin);
greek.addEventListener('focus', () => activeInput = greek);
latin.addEventListener('input', () => { greek.value = translate(latin.value, "toGreek"); });
greek.addEventListener('input', () => { latin.value = translate(greek.value, "toLatin"); });
