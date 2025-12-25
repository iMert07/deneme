// 1. Elementleri Tasarımdaki ID'lere Göre Seçelim
const latin = document.querySelector('textarea[placeholder*="Metin girin"]'); // Sol kutu
const greek = document.querySelector('textarea[placeholder*="Çeviri burada"]'); // Sağ kutu
const translateBtn = document.querySelector('button.bg-primary'); // Büyük Çevir Butonu

// Dinamik ID ataması yapalım (Scriptin çalışması için garanti yol)
latin.id = "latin";
greek.id = "greek";

let activeInput = latin;

// 2. Çeviri Haritası (Senin sağladığın harita)
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

// 3. Çeviri Fonksiyonu
function translate(text, dir){
    const map = dir === "toGreek" ? toGreek : toLatin;
    return text.split('').map(ch => map[ch] || ch).join('');
}

// 4. Olay İzleyicileri (Input takibi)
latin.addEventListener('input', () => { 
    greek.value = translate(latin.value, "toGreek"); 
});

greek.addEventListener('input', () => { 
    latin.value = translate(greek.value, "toLatin"); 
});

// Hangi kutunun aktif olduğunu takip et (Klavye için)
latin.addEventListener('focus', () => activeInput = latin);
greek.addEventListener('focus', () => activeInput = greek);

// 5. Sanal Klavye Uyarlaması
document.querySelectorAll('.key-btn').forEach(key => {
    key.addEventListener('click', () => {
        const keyText = key.innerText.trim();
        const iconElement = key.querySelector('.material-symbols-outlined');
        
        // Özel Tuş Kontrolleri
        if (iconElement && iconElement.innerText === 'backspace') {
            activeInput.value = activeInput.value.slice(0, -1);
        } else if (keyText === 'Enter') {
            activeInput.value += '\n';
        } else if (keyText === 'Tab') {
            activeInput.value += '    ';
        } else if (key.classList.contains('flex-grow') && keyText === '') { // Boşluk tuşu
            activeInput.value += ' ';
        } else if (keyText.length <= 2) { // Normal harf tuşları
            activeInput.value += keyText;
        }

        // Çeviriyi tetikle
        if (activeInput === latin) {
            greek.value = translate(latin.value, "toGreek");
        } else {
            latin.value = translate(greek.value, "toLatin");
        }
    });
});

// 6. Ekstra Fonksiyonlar (Kopyala ve Temizle)
// Temizle Butonu
document.querySelector('button[title="Temizle"]').addEventListener('click', () => {
    latin.value = "";
    greek.value = "";
});

// Kopyala Butonları
document.querySelectorAll('button[title="Kopyala"]').forEach((btn, index) => {
    btn.addEventListener('click', () => {
        const target = index === 0 ? latin : greek;
        navigator.clipboard.writeText(target.value);
        
        // Küçük bir görsel geri bildirim
        const originalIcon = btn.innerHTML;
        btn.innerHTML = '<span class="material-symbols-outlined text-lg">done</span>';
        setTimeout(() => btn.innerHTML = originalIcon, 1500);
    });
});
