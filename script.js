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

// Açılır Kapanır Bölümler (Akordiyon) Fonksiyonu
function toggleSection(contentId, buttonElement) {
    const content = document.getElementById(contentId);
    const arrow = buttonElement.querySelector('span');
    
    if (content.style.maxHeight && content.style.maxHeight !== "0px") {
        content.style.maxHeight = "0px";
        content.style.opacity = "0";
        arrow.style.transform = "rotate(0deg)";
    } else {
        content.style.maxHeight = content.scrollHeight + "px";
        content.style.opacity = "1";
        arrow.style.transform = "rotate(180deg)";
    }
}
