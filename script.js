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

function translateText(text, dir){
    const map = dir === "toGreek" ? toGreek : toLatin;
    return text.split('').map(ch => map[ch] || ch).join('');
}

function updateTranslation() {
    if (activeInput === latin) {
        greek.value = translateText(latin.value, "toGreek");
    } else {
        latin.value = translateText(greek.value, "toLatin");
    }
}

function deleteChar() {
    if (activeInput.value.length > 0) {
        activeInput.value = activeInput.value.slice(0, -1);
        updateTranslation();
    }
}

// KLAVYE OLAYLARI
document.querySelectorAll('.key').forEach(key => {
    const handleStart = (e) => {
        // Mobilde varsayılan seçme/menü olaylarını engelle
        if (e.type === 'touchstart') e.preventDefault(); 
        
        const action = key.dataset.action;
        const content = key.innerText.trim();

        // Görsel efekt (Harf Popup) - Sadece harflerde
        if (!action) {
            key.classList.add('key-active-effect');
        }

        if (action === 'delete') {
            deleteChar();
            // Basılı tutulursa hızlı silme başlasın
            deleteTimeout = setTimeout(() => {
                deleteInterval = setInterval(deleteChar, 70);
            }, 500);
        } else if (action === 'enter') {
            activeInput.value += '\n'; updateTranslation();
        } else if (action === 'space') {
            activeInput.value += ' '; updateTranslation();
        } else if (action === 'reset') {
            latin.value = ""; greek.value = "";
        } else if (action !== 'shift') {
            activeInput.value += content;
            updateTranslation();
        }
    };

    const handleEnd = () => {
        clearTimeout(deleteTimeout);
        clearInterval(deleteInterval);
        key.classList.remove('key-active-effect');
    };

    // Olay Dinleyicileri
    key.addEventListener('mousedown', handleStart);
    key.addEventListener('touchstart', handleStart, {passive: false});
    
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchend', handleEnd);
    window.addEventListener('mouseleave', handleEnd);
});

// Odak ve Input Takibi
latin.addEventListener('focus', () => activeInput = latin);
greek.addEventListener('focus', () => activeInput = greek);
latin.addEventListener('input', () => { greek.value = translateText(latin.value, "toGreek"); });
greek.addEventListener('input', () => { latin.value = translateText(greek.value, "toLatin"); });
