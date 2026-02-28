// --- ELEMENT SEÇİCİLER ---
const inputArea = document.getElementById('input-area');
const outputArea = document.getElementById('output-area');
const calIn = document.getElementById('calendar-input-ui');
const calOut = document.getElementById('calendar-output-ui');
const pillInputLabel = document.getElementById('pill-input-label');
const pillOutputLabel = document.getElementById('pill-output-label');

let currentInputUnit = "Eski Alfabe";
let currentOutputUnit = "Yeni Alfabe";

// --- VERİ SETLERİ VE FONKSİYONLAR (MEVCUTLARI KORUNDU) ---
const unitData = { "Alfabe": ["Eski Alfabe", "Yeni Alfabe"], "Sayı": ["İkilik (2)", "Onluk (10)", "Anatolya (12)", "On Altılık (16)"], "Takvim": ["Gregoryen", "Anatolya"] };
function toBase12(n, pad = 1) { const digits = "θ123456789ΦΛ"; let num = Math.abs(Math.floor(n)); let res = ""; if (num === 0) res = digits[0]; else { while (num > 0) { res = digits[num % 12] + res; num = Math.floor(num / 12); } } return res.padStart(pad, digits[0]); }

// --- STATİK TAKVİM ÇİZİCİ ---
function drawStaticVisuals() {
    const gregGrid = document.getElementById('greg-grid-static');
    const anaGrid = document.getElementById('ana-grid-static');

    // SOL: Gregoryen Şubat 2026 (1 Şubat Pazar'dır, Pt başlarsa 6 boşluk)
    gregGrid.innerHTML = "";
    for(let i=0; i<6; i++) gregGrid.innerHTML += '<div class="cal-cell empty"></div>';
    for(let i=1; i<=28; i++) {
        const cell = document.createElement('div');
        cell.className = `cal-cell ${i === 28 ? 'active' : ''}`;
        cell.innerText = i;
        gregGrid.appendChild(cell);
    }

    // SAĞ: Anatolya (5x6 = 30 Gün Sabit)
    anaGrid.innerHTML = "";
    for(let i=1; i<=30; i++) {
        const cell = document.createElement('div');
        cell.className = `cal-cell ${i === 28 ? 'active' : ''}`;
        cell.innerText = toBase12(i, 2); 
        anaGrid.appendChild(cell);
    }
}

// --- SEKME YÖNETİMİ ---
document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.replace('active-tab', 'inactive-tab'));
        this.classList.replace('inactive-tab', 'active-tab');

        if (this.dataset.value === "Takvim") {
            inputArea.classList.add('hidden');
            outputArea.classList.add('hidden');
            calIn.classList.remove('hidden');
            calOut.classList.remove('hidden');
            pillInputLabel.innerText = "Gregoryen";
            pillOutputLabel.innerText = "Anatolya";
            drawStaticVisuals();
        } else {
            inputArea.classList.remove('hidden');
            outputArea.classList.remove('hidden');
            calIn.classList.add('hidden');
            calOut.classList.add('hidden');
            pillInputLabel.innerText = "Eski Alfabe";
            pillOutputLabel.innerText = "Yeni Alfabe";
        }
    });
});

// --- SAAT GÜNCELLEME (MEVCUT) ---
function updateHeader() {
    const now = new Date();
    document.getElementById('clock').textContent = now.toLocaleTimeString('tr-TR', {hour12:false}).replace(/:/g, '.');
    document.getElementById('date').textContent = now.toLocaleDateString('tr-TR');
}
setInterval(updateHeader, 1000);
updateHeader();
