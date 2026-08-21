// Tema Değiştirici
function updateThemeIcons() {
    const isDark = document.documentElement.classList.contains('dark');
    document.getElementById('theme-toggle-dark-icon')?.classList.toggle('hidden', isDark);
    document.getElementById('theme-toggle-light-icon')?.classList.toggle('hidden', !isDark);
}

document.getElementById('theme-toggle')?.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('color-theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    updateThemeIcons();
});
updateThemeIcons();

// Dil/Çeviri Menüsü Açma/Kapama
const langBtn = document.getElementById('lang-menu-btn');
const langDropdown = document.getElementById('lang-dropdown');

langBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    langDropdown.classList.toggle('hidden');
});

// Sayfada başka bir yere tıklandığında menüyü kapat
document.addEventListener('click', () => {
    if (langDropdown && !langDropdown.classList.contains('hidden')) {
        langDropdown.classList.add('hidden');
    }
});

// Mobil Kenar Çubuğu Açma/Kapama
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sidebar-overlay');
const toggleBtn = document.getElementById('sidebar-toggle');

function toggleSidebar() {
    sidebar.classList.toggle('-translate-x-full');
    overlay.classList.toggle('hidden');
}

toggleBtn?.addEventListener('click', toggleSidebar);
overlay?.addEventListener('click', toggleSidebar);

// Arama İşlevi (Sayfa içi bölümleri bulma)
const searchInput = document.getElementById('wiki-search');
searchInput?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase().trim();
    const sections = document.querySelectorAll('main section');
    sections.forEach(sec => {
        if(term === '') {
            sec.style.opacity = '1';
            return;
        }
        const text = sec.innerText.toLowerCase();
        if(text.includes(term)) {
            sec.style.opacity = '1';
        } else {
            sec.style.opacity = '0.3';
        }
    });
});
