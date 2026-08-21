// Mobil Menü Açma/Kapatma
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}

// Geri Bildirim Formu (Modal) Açma/Kapatma
function toggleFeedbackForm() {
    const modal = document.getElementById('feedbackModal');
    if (modal) {
        modal.classList.toggle('hidden');
    }
}

// Sayfa Yönlendirme / Görünüm Fonksiyonları
function showPage(pageId) {
    console.log("Ana sayfaya dönülüyor:", pageId);
    // İlgili bölümleri açıp kapatma mantığını buraya ekleyebilirsin
}

function showKelimelerPage() {
    console.log("Kelimeler sayfasına geçildi.");
}

function showEtyPage() {
    console.log("Köken Dağılımı sayfasına geçildi.");
}

function showStatsPage() {
    console.log("Harf Dağılımı sayfasına geçildi.");
}

// Geri Bildirim Gönderme
function submitFeedback() {
    const message = document.getElementById('feedback-message').value;
    const contact = document.getElementById('feedback-contact').value;
    
    console.log("Geri bildirim gönderildi:", { message, contact });
    toggleFeedbackForm();
    
    // Bilgilendirme penceresini tetikleme örneği
    showNotification("Teşekkürler", "Geri bildiriminiz başarıyla alındı!");
}

// Bildirim Modalı Kapatma
function closeNotification() {
    const notificationModal = document.getElementById('notificationModal');
    if (notificationModal) {
        notificationModal.classList.add('hidden');
    }
}

// Bildirim Gösterme Yardımcısı
function showNotification(title, message) {
    const titleEl = document.getElementById('notificationTitle');
    const msgEl = document.getElementById('notificationMessage');
    const modal = document.getElementById('notificationModal');
    
    if (titleEl && msgEl && modal) {
        titleEl.textContent = title;
        msgEl.textContent = message;
        modal.classList.remove('hidden');
    }
}

// Tema ve Tema Değiştirici Mantığı (Opsiyonel / Genişletilebilir)
document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            if (document.documentElement.classList.contains('dark')) {
                localStorage.setItem('color-theme', 'dark');
            } else {
                localStorage.setItem('color-theme', 'light');
            }
        });
    }
});
