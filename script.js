/* --- GENEL AYARLAR --- */
header h2, .material-symbols-outlined, header button {
    user-select: none;
    -webkit-user-select: none; 
    -webkit-touch-callout: none;
}

/* --- DROPDOWN VE TEMA EFEKTLERİ --- */
#dropdownMenu {
    transform-origin: top right;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

#dropdownMenu.show {
    display: block;
    animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
    from { opacity: 0; transform: translateY(-8px) scale(0.95); }
    to { opacity: 1; transform: translateY(0) scale(1); }
}

/* --- KLAVYE TASARIMI --- */
.keyboard {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px; 
    margin: 20px auto;
    width: 100%;
    max-width: 850px;
    padding: 15px;
    background: #e2e8f0;
    border-radius: 1.25rem;
    box-sizing: border-box;
    user-select: none;
}

.dark .keyboard {
    background: #111a22;
    border: 1px solid #233648;
}

.row {
    display: grid;
    grid-template-columns: repeat(12, 1fr); 
    gap: 6px; 
    width: 100%;
}

.key {
    grid-column: span 1; 
    height: 52px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #ffffff;
    color: #1e293b;
    cursor: pointer;
    font-size: 1.1rem;
    font-weight: 600;
    border-radius: 8px;
    border-bottom: 3px solid #cbd5e1;
    transition: all 0.05s ease;
}

.dark .key {
    background: #233648;
    color: #f8fafc;
    border-bottom: 3px solid #000000;
}

.key:active {
    transform: translateY(2px);
    border-bottom-width: 0;
}

.fn-key { background: #cbd5e1 !important; }
.dark .fn-key { background: #324d67 !important; }

[data-action="shift"], [data-action="delete"] { grid-column: span 2 !important; }
[data-action="reset"], [data-action="enter"] { grid-column: span 3 !important; }
[data-action="space"] { grid-column: span 6 !important; }

@media (max-width: 768px) {
    .keyboard {
        position: fixed;
        bottom: 8px;
        left: 2%;
        width: 96%;
        padding: 8px 4px 12px 4px;
        box-shadow: 0 -5px 20px rgba(0,0,0,0.3);
    }
    .key { height: 44px; font-size: 1rem; }
    main { padding-bottom: 260px !important; }
}
