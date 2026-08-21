// Mobil Menü Açma/Kapatma
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
}

// Geri Bildirim Formu Açma/Kapatma
function toggleFeedbackForm() {
    const modal = document.getElementById('feedbackModal');
    modal.classList.toggle('hidden');
}

// Sayfa Değiştirme Fonksiyonu (Örnek)
function showPage(pageId) {
    console.log("Sayfaya geçildi: ", pageId);
}

function showKelimelerPage() { /* Kodunuz */ }
function showEtyPage() { /* Kodunuz */ }
function showStatsPage() { /* Kodunuz */ }
function submitFeedback() { /* Kodunuz */ }
function closeNotification() {
    document.getElementById('notificationModal').classList.add('hidden');
}
