document.addEventListener('DOMContentLoaded', () => {
    // --- Clock ---
    const clockElement = document.getElementById('taskbar-clock');
    function updateClock() {
        const now = new Date();
        const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const date = now.toLocaleDateString([], { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
        clockElement.innerHTML = `${time}<br>${date}`;
    }
    setInterval(updateClock, 1000);
    updateClock();

    // --- Make Windows Draggable ---
    const windows = document.querySelectorAll('.window');
    windows.forEach(makeDraggable);

    function makeDraggable(elmnt) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        const titleBar = elmnt.querySelector(".title-bar");

        if (titleBar) {
            titleBar.onmousedown = dragMouseDown;
            titleBar.ontouchstart = dragMouseDown;
        }

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            // get the mouse cursor position at startup:
            pos3 = e.clientX || e.touches[0].clientX;
            pos4 = e.clientY || e.touches[0].clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
            document.ontouchend = closeDragElement;
            document.ontouchmove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            // calculate the new cursor position:
            const currentX = e.clientX || e.touches[0].clientX;
            const currentY = e.clientY || e.touches[0].clientY;
            pos1 = pos3 - currentX;
            pos2 = pos4 - currentY;
            pos3 = currentX;
            pos4 = currentY;
            // set the element's new position:
            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            // stop moving when mouse button is released:
            document.onmouseup = null;
            document.onmousemove = null;
            document.ontouchend = null;
            document.ontouchmove = null;
        }
    }

    // --- Browser URL Go ---
    const browserGoBtn = document.getElementById('browser-go');
    const browserUrlInput = document.getElementById('browser-url');
    const browserContent = document.getElementById('browser-content');

    browserGoBtn.addEventListener('click', navigate);
    browserUrlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            navigate();
        }
    });

    function navigate() {
        let url = browserUrlInput.value.trim();
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            // If it's not a URL, assume it's a search query
            url = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
        }
        browserContent.src = url;
    }

    // --- Virtual Keyboard ---
    const keyboardContainer = document.getElementById('virtual-keyboard');
    let activeInputElement = null;

    // Show keyboard when an input/textarea is focused
    document.querySelectorAll('input[type="text"], textarea').forEach(input => {
        input.addEventListener('focus', () => {
            activeInputElement = input;
            keyboardContainer.style.display = 'grid';
        });
    });

    // Simple keyboard layout
    const keysLayout = [
        '`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace',
        'Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\',
        'Caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', '\'', 'Enter',
        'Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'Shift',
        'Ctrl', 'Alt', 'Space', 'Alt', 'Ctrl', 'Hide'
    ];
    
    // Generate keyboard keys
    keysLayout.forEach(key => {
        const keyElement = document.createElement('button');
        keyElement.classList.add('keyboard-key');
        keyElement.textContent = key;
        
        switch (key) {
            case 'Backspace':
                keyElement.classList.add('wide');
                keyElement.addEventListener('click', () => {
                    if (activeInputElement) {
                        activeInputElement.value = activeInputElement.value.slice(0, -1);
                    }
                });
                break;
            case 'Enter':
                keyElement.classList.add('wide');
                keyElement.addEventListener('click', () => {
                    if (activeInputElement && activeInputElement.id === 'browser-url') {
                        navigate();
                    }
                });
                break;
            case 'Space':
                keyElement.classList.add('space');
                keyElement.addEventListener('click', () => {
                   if (activeInputElement) activeInputElement.value += ' ';
                });
                break;
            case 'Tab':
            case 'Caps':
            case 'Shift':
            case 'Ctrl':
            case 'Alt':
                 keyElement.classList.add('wide');
                 // Functionalitas bisa ditambahkan nanti
                break;
            case 'Hide':
                 keyElement.addEventListener('click', () => {
                    keyboardContainer.style.display = 'none';
                 });
                 break;
            default:
                keyElement.addEventListener('click', () => {
                    if (activeInputElement) {
                        activeInputElement.value += key;
                    }
                });
                break;
        }
        keyboardContainer.appendChild(keyElement);
    });

});

// --- App Management Functions (Global) ---
function openApp(appName) {
    const windowElement = document.getElementById(`${appName}-window`);
    if (windowElement) {
        windowElement.style.display = 'flex';
        // Bring to front
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