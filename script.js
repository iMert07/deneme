/* ==========================================================================
   1. TEMA YÖNETİMİ (LocalStorage Destekli)
   ========================================================================== */
const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');
const themeToggleButton = document.getElementById('themeToggle');

// Sayfa yüklendiğinde ikonların durumunu ayarla
function initTheme() {
    if (document.documentElement.classList.contains('dark')) {
        themeToggleLightIcon.classList.remove('hidden');
        themeToggleDarkIcon.classList.add('hidden');
    } else {
        themeToggleDarkIcon.classList.remove('hidden');
        themeToggleLightIcon.classList.add('hidden');
    }
}

themeToggleButton.addEventListener('click', function() {
    // İkon görünümlerini değiştir
    themeToggleDarkIcon.classList.toggle('hidden');
    themeToggleLightIcon.classList.toggle('hidden');

    // Temayı değiştir ve tercihi tarayıcıya kaydet
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
   2. DROPDOWN MENÜ MANTIĞI
   ========================================================================== */
const dropdownBtn = document.getElementById('dropdownBtn');
const dropdownMenu = document.getElementById('dropdownMenu');
const selectedText = document.getElementById('selectedText');
const selectedIcon = document.getElementById('selectedIcon');

dropdownBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownMenu.classList.toggle('hidden');
});

document.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', function() {
        const val = this.getAttribute('data-value');
        const icon = this.getAttribute('data-icon');
        
        selectedText.innerText = val;
        selectedIcon.innerText = icon;
        dropdownMenu.classList.add('hidden');
        
        // Seçilen türe göre işlem yapmak istersen burayı kullanabilirsin
        console.log("Seçilen mod:", val);
    });
});

// Dışarı tıklandığında menüyü kapat
window.addEventListener('click', () => dropdownMenu.classList.add('hidden'));

/* ==========================================================================
   3. KLAVYE VE METİN ÇEVİRİ MANTIĞI
   ========================================================================== */
const latinArea = document.getElementById('latin');
const greekArea = document.getElementById('greek');

// Sanal klavye tuşlarına basma işlemi
document.querySelectorAll('.key').forEach(key => {
    key.addEventListener('click', function() {
        const action = this.getAttribute('data-action');
        const char = this.innerText;

        if (action === 'delete') {
            latinArea.value = latinArea.value.slice(0, -1);
        } else if (action === 'space') {
            latinArea.value += ' ';
        } else if (action === 'reset') {
            latinArea.value = '';
            greekArea.value = '';
        } else if (action === 'enter') {
            latinArea.value += '\n';
        } else if (action === 'shift') {
            // Shift mantığı eklenebilir
            this.classList.toggle('bg-primary');
            this.classList.toggle('text-white');
        } else if (!this.classList.contains('fn-key')) {
            // Fonksiyon tuşu değilse karakteri ekle
            latinArea.value += char;
        }
        
        // Her tuş basımından sonra çeviriyi tetikle (opsiyonel)
        // translateText(latinArea.value); 
    });
});

// Başlangıç fonksiyonlarını çalıştır
initTheme();
