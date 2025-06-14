document.addEventListener('DOMContentLoaded', () => {
    // --- Jam di Taskbar ---
    const clockElement = document.getElementById('taskbar-clock');
    function updateClock() {
        const now = new Date();
        const time = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        const date = now.toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' });
        clockElement.innerHTML = `${time}<br>${date}`;
    }
    setInterval(updateClock, 1000);
    updateClock();

    // --- Membuat Jendela Bisa Digeser & Menjadi Aktif ---
    document.querySelectorAll('.window').forEach(win => {
        makeDraggable(win);
        win.addEventListener('mousedown', () => {
            document.querySelectorAll('.window').forEach(w => w.classList.remove('active-window'));
            win.classList.add('active-window');
            document.querySelectorAll('.window').forEach(w => w.style.zIndex = '10');
            win.style.zIndex = '11';
        });
    });

    function makeDraggable(elmnt) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        const titleBar = elmnt.querySelector(".title-bar");
        if (titleBar) { titleBar.onmousedown = dragMouseDown; }

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    // --- Logika Browser ---
    const browserGoBtn = document.getElementById('browser-go');
    const browserUrlInput = document.getElementById('browser-url');
    const browserContent = document.getElementById('browser-content');
    browserGoBtn.addEventListener('click', navigate);
    browserUrlInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') navigate(); });

    function navigate() {
        let url = browserUrlInput.value.trim();
        if (!url) return;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = `https://duckduckgo.com/?q=${encodeURIComponent(url)}`;
        }
        browserContent.src = url;
    }
    
    // --- Variabel Status untuk Keyboard ---
    let isShiftActive = false;
    let isCapsActive = false;
    let isCtrlActive = false;
    let isAltActive = false;
    let internalClipboard = "";

    // --- Logika Keyboard Virtual ---
    const keyboardContainer = document.getElementById('virtual-keyboard');
    let activeInputElement = null;

    document.querySelectorAll('input[type="text"], textarea').forEach(input => {
        input.addEventListener('focus', () => {
            activeInputElement = input;
            document.body.classList.add('keyboard-active');
            keyboardContainer.style.display = 'grid';
        });
    });

    document.addEventListener('click', (e) => {
        if (!activeInputElement) return;
        const isClickInsideInput = activeInputElement.contains(e.target);
        const isClickInsideKeyboard = keyboardContainer.contains(e.target);
        if (!isClickInsideInput && !isClickInsideKeyboard) {
            document.body.classList.remove('keyboard-active');
            keyboardContainer.style.display = 'none';
            activeInputElement.blur();
            activeInputElement = null;
        }
    });

    const focusableElements = [browserUrlInput, document.querySelector('.notepad-content')];

    // Layout Keyboard
    const keysLayout = [
        ['`', '~'], ['1', '!'], ['2', '@'], ['3', '#'], ['4', '$'], ['5', '%'], ['6', '^'], ['7', '&'], ['8', '*'], ['9', '('], ['0', ')'], ['-', '_'], ['=', '+'], 'Backspace',
        'Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', ['[', '{'], [']', '}'], ['\\', '|'],
        'Caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', [';', ':'], ['\'', '"'], 'Enter',
        'Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', [',', '<'], ['.', '>'], ['/', '?'], 'Shift',
        'Ctrl', 'Alt', 'Space', 'Alt', 'Ctrl'
    ];
    
    // Generate tombol-tombol keyboard
    keysLayout.forEach(keyData => {
        const keyElement = document.createElement('button');
        keyElement.classList.add('keyboard-key');
        
        const isArray = Array.isArray(keyData);
        const primaryKey = isArray ? keyData[0] : keyData;
        keyElement.textContent = primaryKey;
        keyElement.dataset.primary = primaryKey;
        if (isArray) { keyElement.dataset.shift = keyData[1]; }

        switch (primaryKey) {
            case 'Backspace':
                keyElement.classList.add('wide');
                keyElement.addEventListener('click', () => { if (activeInputElement) activeInputElement.value = activeInputElement.value.slice(0, -1); });
                break;
            case 'Enter':
                keyElement.classList.add('wide');
                keyElement.addEventListener('click', () => { if (activeInputElement && activeInputElement.id === 'browser-url') navigate(); });
                break;
            case 'Space':
                keyElement.classList.add('space');
                keyElement.addEventListener('click', () => { if (activeInputElement) activeInputElement.value += ' '; });
                break;
            case 'Shift':
                keyElement.classList.add('wide');
                keyElement.addEventListener('click', () => {
                    isShiftActive = !isShiftActive;
                    keyElement.classList.toggle('active', isShiftActive);
                    updateKeyboardAppearance();
                });
                break;
            case 'Caps':
                keyElement.classList.add('wide');
                keyElement.addEventListener('click', () => {
                    isCapsActive = !isCapsActive;
                    keyElement.classList.toggle('active', isCapsActive);
                    updateKeyboardAppearance();
                });
                break;
            case 'Tab':
                keyElement.classList.add('wide');
                keyElement.addEventListener('click', () => {
                    const currentIndex = focusableElements.indexOf(activeInputElement);
                    const nextIndex = (currentIndex + 1) % focusableElements.length;
                    focusableElements[nextIndex].focus();
                });
                break;
            case 'Ctrl':
            case 'Alt':
                keyElement.classList.add('wide');
                const stateKey = primaryKey.toLowerCase();
                keyElement.addEventListener('click', () => {
                    if (stateKey === 'ctrl') isCtrlActive = !isCtrlActive;
                    if (stateKey === 'alt') isAltActive = !isAltActive;
                    keyElement.classList.toggle('active', stateKey === 'ctrl' ? isCtrlActive : isAltActive);
                });
                break;
            default:
                keyElement.addEventListener('click', () => {
                    if (!activeInputElement) return;
                    const char = keyElement.textContent;

                    // Logika Shortcut
                    if (isCtrlActive) {
                        if (char.toLowerCase() === 'c') { internalClipboard = window.getSelection().toString(); } 
                        else if (char.toLowerCase() === 'v') { activeInputElement.value += internalClipboard; }
                        isCtrlActive = false; 
                        document.querySelectorAll('.keyboard-key[data-primary="Ctrl"]').forEach(k => k.classList.remove('active'));
                        return;
                    }
                    if (isAltActive) {
                        if (char.toLowerCase() === 'f') { 
                           const activeWindow = document.querySelector('.window.active-window');
                           if(activeWindow) closeApp(activeWindow.id.replace('-window', ''));
                        }
                         isAltActive = false;
                         document.querySelectorAll('.keyboard-key[data-primary="Alt"]').forEach(k => k.classList.remove('active'));
                        return;
                    }
                    
                    activeInputElement.value += char;

                    if (isShiftActive) {
                        isShiftActive = false;
                        document.querySelectorAll('.keyboard-key[data-primary="Shift"]').forEach(k => k.classList.remove('active'));
                        updateKeyboardAppearance();
                    }
                });
                break;
        }
        keyboardContainer.appendChild(keyElement);
    });

    // Fungsi untuk update tampilan keyboard (Huruf Besar/Kecil/Simbol)
    function updateKeyboardAppearance() {
        const showShift = isShiftActive || isCapsActive;
        document.querySelectorAll('.keyboard-key').forEach(keyEl => {
            const isLetter = keyEl.dataset.primary.length === 1 && keyEl.dataset.primary.match(/[a-z]/i);
            if (isLetter) {
                keyEl.textContent = showShift ? keyEl.dataset.primary.toUpperCase() : keyEl.dataset.primary.toLowerCase();
            }
            if (keyEl.dataset.shift) {
                keyEl.textContent = isShiftActive ? keyEl.dataset.shift : keyEl.dataset.primary;
            }
        });
    }
});

// --- Fungsi Manajemen Aplikasi ---
function openApp(appName) {
    const windowElement = document.getElementById(`${appName}-window`);
    if (windowElement) {
        windowElement.style.display = 'flex';
        document.querySelectorAll('.window').forEach(win => win.classList.remove('active-window'));
        windowElement.classList.add('active-window');
        document.querySelectorAll('.window').forEach(win => win.style.zIndex = '10');
        windowElement.style.zIndex = '11';
    }
}

function closeApp(appName) {
    const windowElement = document.getElementById(`${appName}-window`);
    if (windowElement) {
        windowElement.style.display = 'none';
    }
}