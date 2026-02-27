// --- ELEMENTLER ---
const inputArea = document.getElementById('input-area');
const outputArea = document.getElementById('output-area');
const calIn = document.getElementById('calendar-input-ui');
const calOut = document.getElementById('calendar-output-ui');
let currentInputUnit = "Anatolya";
let currentOutputUnit = "Gregoryen";
let globalSyncDate = new Date();

const calConfigs = {
    "Anatolya": { cols: 5, days: ["AN", "AT", "AL", "AR", "AS"], total: 30 },
    "Gregoryen": { cols: 7, days: ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"] },
    "Rumi": { cols: 7, days: ["Pa", "Pt", "Sa", "Ça", "Pe", "Cu", "Ct"] },
    "Hicri": { cols: 7, days: ["El", "Ei", "Et", "Er", "Eh", "Ec", "Es"] }
};

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

function renderCalendar(side) {
    const unit = side === 'input' ? currentInputUnit : currentOutputUnit;
    const container = document.getElementById(`calendar-${side}-ui`);
    const config = calConfigs[unit] || calConfigs["Gregoryen"];
    
    let title = unit === "Anatolya" ? 
        `ANATOLYA ${gregorianToAnatolya(globalSyncDate).y} / AY ${gregorianToAnatolya(globalSyncDate).m}` : 
        new Intl.DateTimeFormat('tr-TR', {month:'long', year:'numeric'}).format(globalSyncDate);

    container.innerHTML = `
        <div class="cal-nav">
            <button onclick="moveDate(-1, '${unit}')" class="material-symbols-outlined">chevron_left</button>
            <div class="font-bold text-xs uppercase text-primary">${title}</div>
            <button onclick="moveDate(1, '${unit}')" class="material-symbols-outlined">chevron_right</button>
        </div>
        <div class="cal-grid" style="grid-template-columns: repeat(${config.cols}, 1fr)">
            ${config.days.map(d => `<div class="cal-head">${d}</div>`).join('')}
            <div class="cal-body contents" id="${side}-grid"></div>
        </div>`;

    const grid = document.getElementById(`${side}-grid`);
    if (unit === "Anatolya") {
        const current = gregorianToAnatolya(globalSyncDate);
        for (let i = 1; i <= 30; i++) {
            const cell = document.createElement('div');
            cell.className = `cal-cell ${current.d === i ? 'active-day' : ''}`;
            cell.innerText = i;
            cell.onclick = () => { globalSyncDate.setDate(globalSyncDate.getDate() + (i - current.d)); syncBoth(); };
            grid.appendChild(cell);
        }
    } else {
        const year = globalSyncDate.getFullYear(), month = globalSyncDate.getMonth();
        const offset = (new Date(year, month, 1).getDay() || 7) - 1;
        for (let i = 0; i < offset; i++) grid.innerHTML += `<div class="cal-cell other-month"></div>`;
        for (let i = 1; i <= new Date(year, month + 1, 0).getDate(); i++) {
            const cell = document.createElement('div');
            cell.className = `cal-cell ${globalSyncDate.getDate() === i ? 'active-day' : ''}`;
            cell.innerText = i;
            cell.onclick = () => { globalSyncDate = new Date(year, month, i); syncBoth(); };
            grid.appendChild(cell);
        }
    }
}

function moveDate(dir, unit) {
    if (unit === "Anatolya") globalSyncDate.setDate(globalSyncDate.getDate() + (dir * 30));
    else globalSyncDate.setMonth(globalSyncDate.getMonth() + dir);
    syncBoth();
}

function syncBoth() { renderCalendar('input'); renderCalendar('output'); updateHeader(); }

function renderDropdowns(mode) {
    if (mode === "Takvim") {
        inputArea.classList.add('hidden'); outputArea.classList.add('hidden');
        calIn.classList.remove('hidden'); calOut.classList.remove('hidden');
        syncBoth();
    } else {
        inputArea.classList.remove('hidden'); outputArea.classList.remove('hidden');
        calIn.classList.add('hidden'); calOut.classList.add('hidden');
    }
}

// Sekme tıklama olaylarını bağla
document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.replace('active-tab', 'inactive-tab'));
        this.classList.replace('inactive-tab', 'active-tab');
        renderDropdowns(this.dataset.value);
    });
});

function updateHeader() {
    const now = new Date();
    document.getElementById('clock').textContent = now.toLocaleTimeString('tr-TR', {hour12:false});
    const ana = gregorianToAnatolya(globalSyncDate);
    document.getElementById('date').textContent = `${ana.d}.${ana.m}.${ana.y}`;
}

setInterval(updateHeader, 1000);
renderDropdowns("Alfabe");
