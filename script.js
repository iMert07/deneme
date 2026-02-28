// --- ELEMENTLER ---
const inputArea = document.getElementById('input-area');
const outputArea = document.getElementById('output-area');
const calIn = document.getElementById('calendar-input-ui');
const calOut = document.getElementById('calendar-output-ui');

let currentInputUnit = "Anatolya";
let currentOutputUnit = "Gregoryen";
let globalSyncDate = new Date(); // Tüm takvimlerin bağlı olduğu tarih objesi

const calConfigs = {
    "Anatolya": { cols: 5, days: ["1.G", "2.G", "3.G", "4.G", "5.G"] },
    "Gregoryen": { cols: 7, days: ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"] }
};

// --- DÖNÜŞÜM VE TABAN MANTIĞI ---
function gregorianToAnatolya(date) {
    const gregBase = new Date(1071, 2, 21);
    const diff = date - gregBase;
    const daysPassed = Math.floor(diff / 86400000);
    let year = 0; let daysCounter = 0;
    while (true) {
        let yearDays = ((year + 1) % 20 === 0 && (year + 1) % 640 !== 0) ? 370 : 365;
        if (daysCounter + yearDays > daysPassed) break;
        daysCounter += yearDays; year++;
    }
    const day = (daysPassed - daysCounter) % 30 + 1;
    const month = Math.floor((daysPassed - daysCounter) / 30) + 1;
    return { d: day, m: month, y: year + 10369 };
}

function toBase12(n, pad = 1) {
    const digits = "0123456789ΦΛ";
    let num = Math.abs(Math.floor(n));
    let res = (num === 0) ? digits[0] : "";
    while (num > 0) { res = digits[num % 12] + res; num = Math.floor(num / 12); }
    return res.padStart(pad, digits[0]);
}

// --- AY DÜZENİ OLUŞTURUCU ---
function renderCalendar(side) {
    const unit = side === 'input' ? currentInputUnit : currentOutputUnit;
    const container = document.getElementById(`calendar-${side}-ui`);
    const config = calConfigs[unit] || calConfigs["Gregoryen"];
    
    // Yıl ve Ay Verisi
    const ana = gregorianToAnatolya(globalSyncDate);
    const gYear = globalSyncDate.getFullYear();
    const gMonth = globalSyncDate.getMonth();

    const title = unit === "Anatolya" ? 
        `YIL: ${toBase12(ana.y, 4)} / AY: ${toBase12(ana.m, 2)}` : 
        new Intl.DateTimeFormat('tr-TR', {month:'long', year:'numeric'}).format(globalSyncDate);

    container.innerHTML = `
        <div class="cal-nav">
            <select onchange="handleJump(this.value, 'y')" class="bg-transparent text-[10px] font-bold outline-none cursor-pointer">
                ${Array.from({length:40}, (_,i)=>2010+i).map(y => `<option value="${y}" ${gYear==y?'selected':''}>${y}</option>`).join('')}
            </select>
            <div class="font-bold text-[11px] uppercase text-primary">${title}</div>
            <select onchange="handleJump(this.value, 'm')" class="bg-transparent text-[10px] font-bold outline-none cursor-pointer">
                ${Array.from({length:12}, (_,i)=>`<option value="${i}" ${gMonth==i?'selected':''}>${i+1}. Ay</option>`).join('')}
            </select>
        </div>
        <div class="cal-grid" style="grid-template-columns: repeat(${config.cols}, 1fr)">
            ${config.days.map(d => `<div class="cal-head">${d}</div>`).join('')}
            <div class="cal-body contents" id="${side}-days-grid"></div>
        </div>`;

    const grid = document.getElementById(`${side}-days-grid`);

    if (unit === "Anatolya") {
        // Anatolya: Sabit 30 gün, 6 hafta (5x6)
        for (let i = 1; i <= 30; i++) {
            const btn = document.createElement('div');
            btn.className = `cal-cell ${ana.d === i ? 'active-day' : ''}`;
            btn.innerText = toBase12(i, 2);
            btn.onclick = () => { 
                globalSyncDate.setDate(globalSyncDate.getDate() + (i - ana.d)); 
                syncAll(); 
            };
            grid.appendChild(btn);
        }
    } else {
        // Gregoryen: Gerçek ay başlangıcı ve 7 sütun
        const firstDay = new Date(gYear, gMonth, 1).getDay();
        const offset = firstDay === 0 ? 6 : firstDay - 1;
        const total = new Date(gYear, gMonth + 1, 0).getDate();

        for (let i = 0; i < offset; i++) grid.innerHTML += `<div class="cal-cell other-month"></div>`;
        for (let i = 1; i <= total; i++) {
            const btn = document.createElement('div');
            btn.className = `cal-cell ${globalSyncDate.getDate() === i ? 'active-day' : ''}`;
            if(new Date(gYear, gMonth, i).toDateString() === new Date().toDateString()) btn.classList.add('today-mark');
            btn.innerText = i;
            btn.onclick = () => { 
                globalSyncDate = new Date(gYear, gMonth, i); 
                syncAll(); 
            };
            grid.appendChild(btn);
        }
    }
}

// Senkronize Hareket
function handleJump(val, type) {
    if(type === 'y') globalSyncDate.setFullYear(val);
    else globalSyncDate.setMonth(val);
    syncAll();
}

function syncAll() { renderCalendar('input'); renderCalendar('output'); updateHeader(); }

// UI Modu Değiştirici
function toggleView(mode) {
    if (mode === "Takvim") {
        inputArea.classList.add('hidden'); outputArea.classList.add('hidden');
        calIn.classList.remove('hidden'); calOut.classList.remove('hidden');
        syncAll();
    } else {
        inputArea.classList.remove('hidden'); outputArea.classList.remove('hidden');
        calIn.classList.add('hidden'); calOut.classList.add('hidden');
    }
}

document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.replace('active-tab', 'inactive-tab'));
        this.classList.replace('inactive-tab', 'active-tab');
        toggleView(this.dataset.value);
    });
});

function updateHeader() {
    const now = new Date();
    document.getElementById('clock').textContent = now.toLocaleTimeString('tr-TR', {hour12:false});
    const ana = gregorianToAnatolya(globalSyncDate);
    document.getElementById('date').textContent = `${toBase12(ana.d, 2)}.${toBase12(ana.m, 2)}.${toBase12(ana.y, 4)}`;
}

setInterval(updateHeader, 1000);
updateHeader();
toggleView("Alfabe");
