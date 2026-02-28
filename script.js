// --- ELEMENT SEÇİCİLER ---
const inputArea = document.getElementById('input-area');
const outputArea = document.getElementById('output-area');
const calIn = document.getElementById('calendar-input-ui');
const calOut = document.getElementById('calendar-output-ui');

// --- STATİK TASARIM DOLDURUCU (GÖRSEL TEST İÇİN) ---
function fillStaticGrids() {
    const gregGrid = document.getElementById('greg-grid-static');
    const anaGrid = document.getElementById('ana-grid-static');

    // SOL: Gregoryen Şubat 2026 (1 Şubat Pazar'dır, Pt'den başlanırsa 6 boşluk bırakılır)
    gregGrid.innerHTML = "";
    for(let i=0; i<6; i++) {
        gregGrid.innerHTML += '<div class="cal-cell empty"></div>';
    }
    for(let i=1; i<=28; i++) {
        const cell = document.createElement('div');
        cell.className = `cal-cell ${i === 28 ? 'active' : ''}`;
        cell.innerText = i;
        gregGrid.appendChild(cell);
    }

    // SAĞ: Anatolya (5 Sütun x 6 Hafta = 30 Gün Sabit)
    anaGrid.innerHTML = "";
    for(let i=1; i<=30; i++) {
        const cell = document.createElement('div');
        cell.className = `cal-cell ${i === 28 ? 'active' : ''}`;
        // Anatolya formatı: 01, 02...
        cell.innerText = i < 10 ? '0' + i : i; 
        anaGrid.appendChild(cell);
    }
}

// --- SEKME YÖNETİMİ ---
document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        // Aktif tabı güncelle
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.replace('active-tab', 'inactive-tab'));
        this.classList.replace('inactive-tab', 'active-tab');

        // Takvim Modu Kontrolü
        if (this.dataset.value === "Takvim") {
            inputArea.classList.add('hidden');
            outputArea.classList.add('hidden');
            calIn.classList.remove('hidden');
            calOut.classList.remove('hidden');
            fillStaticGrids(); // Tasarımı çiz
        } else {
            inputArea.classList.remove('hidden');
            outputArea.classList.remove('hidden');
            calIn.classList.add('hidden');
            calOut.classList.add('hidden');
        }
    });
});

// --- SAAT VE TARİH GÜNCELLEME ---
function updateHeader() {
    const now = new Date();
    // 12.30.45 formatı
    document.getElementById('clock').textContent = now.toLocaleTimeString('tr-TR', {hour12:false}).replace(/:/g, '.');
    // 28.02.2026 formatı
    document.getElementById('date').textContent = now.toLocaleDateString('tr-TR');
}

setInterval(updateHeader, 1000);
updateHeader();

// Başlangıç Modu
inputArea.classList.remove('hidden');
