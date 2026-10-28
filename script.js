/**
 * Ubuntu 20.04 Web Desktop Operating System Engine
 * Jamal Idhammou Portfolio - ISTA Assaka
 */

// Application State
const state = {
    openWindows: new Set(['about']),
    activeWindow: 'about',
    highestZ: 100,
    wallpapers: [
        'wall-1.webp', 'wall-2.webp', 'wall-3.webp', 'wall-4.webp',
        'wall-5.webp', 'wall-6.webp', 'wall-7.webp', 'wall-8.webp'
    ],
    currentWallpaper: 'wall-1.webp',
    commandHistory: [],
    historyIndex: -1
};

// Available Applications
const apps = {
    about: { id: 'about', title: 'Jamal Idhammou - About System' },
    projects: { id: 'projects', title: 'Engineering Projects & Innovations' },
    terminal: { id: 'terminal', title: 'jamal@ubuntu-assaka: ~' },
    resume: { id: 'resume', title: 'Document Viewer - CV_Jamal_Idhammou.pdf' },
    settings: { id: 'settings', title: 'Settings - Background & System' },
    trash: { id: 'trash', title: 'Trash' }
};

// ============================================================================
// INITIALIZATION
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    initClock();
    initStatusCluster();
    initDockAndDesktop();
    initWindows();
    initAboutTabs();
    initProjectTabs();
    initTerminal();
    initSettingsWallpapers();
    focusApp('about');
});

// ============================================================================
// TOP BAR & CLOCK
// ============================================================================
function initClock() {
    const clockEl = document.getElementById('topClock');
    const updateTime = () => {
        const now = new Date();
        const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false };
        clockEl.textContent = now.toLocaleDateString('en-US', options).replace(',', '');
    };
    updateTime();
    setInterval(updateTime, 1000);
}

function initStatusCluster() {
    const cluster = document.getElementById('statusCluster');
    const dropdown = document.getElementById('statusDropdown');

    cluster.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
        cluster.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && !cluster.contains(e.target)) {
            dropdown.classList.remove('show');
            cluster.classList.remove('active');
        }
    });
}

// ============================================================================
// DOCK & DESKTOP LAUNCHERS
// ============================================================================
function initDockAndDesktop() {
    // Dock icon clicks
    document.querySelectorAll('.dock-icon[data-app]').forEach(btn => {
        btn.addEventListener('click', () => {
            const appId = btn.getAttribute('data-app');
            openApp(appId);
        });
    });

    // Desktop shortcut clicks
    document.querySelectorAll('.desktop-item[data-app]').forEach(item => {
        item.addEventListener('dblclick', () => {
            const appId = item.getAttribute('data-app');
            openApp(appId);
        });
        // Mobile / single click support
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                const appId = item.getAttribute('data-app');
                openApp(appId);
            }
        });
    });

    // Activities button
    const activitiesBtn = document.getElementById('activitiesBtn');
    if (activitiesBtn) {
        activitiesBtn.addEventListener('click', () => {
            // Toggle minimize all / restore
            const anyActive = Array.from(document.querySelectorAll('.window.active'))
                .some(w => !w.classList.contains('minimized'));
            if (anyActive) {
                document.querySelectorAll('.window.active').forEach(w => w.classList.add('minimized'));
            } else {
                document.querySelectorAll('.window.active').forEach(w => w.classList.remove('minimized'));
                if (state.activeWindow) focusApp(state.activeWindow);
            }
        });
    }

    const allAppsBtn = document.getElementById('allAppsBtn');
    if (allAppsBtn) {
        allAppsBtn.addEventListener('click', () => {
            openApp('settings');
        });
    }
}

// ============================================================================
// WINDOW MANAGEMENT & DRAGGING
// ============================================================================
function openApp(appId) {
    const win = document.getElementById(`win-${appId}`);
    if (!win) return;

    win.classList.remove('minimized');
    win.classList.add('active');
    state.openWindows.add(appId);
    focusApp(appId);
    updateDockIndicators();

    if (appId === 'terminal') {
        setTimeout(focusTerminalInput, 50);
    }
}

function closeApp(appId) {
    const win = document.getElementById(`win-${appId}`);
    if (!win) return;

    win.classList.remove('active', 'focused', 'minimized', 'maximized');
    state.openWindows.delete(appId);

    // Focus another open window
    const remaining = Array.from(state.openWindows);
    if (remaining.length > 0) {
        focusApp(remaining[remaining.length - 1]);
    } else {
        state.activeWindow = null;
    }
    updateDockIndicators();
}

function minimizeApp(appId) {
    const win = document.getElementById(`win-${appId}`);
    if (!win) return;

    win.classList.add('minimized');
    win.classList.remove('focused');

    const visible = Array.from(document.querySelectorAll('.window.active:not(.minimized)'));
    if (visible.length > 0) {
        const top = visible.sort((a, b) => (parseInt(b.style.zIndex) || 0) - (parseInt(a.style.zIndex) || 0))[0];
        focusApp(top.getAttribute('data-app'));
    } else {
        state.activeWindow = null;
        updateDockIndicators();
    }
}

function maximizeApp(appId) {
    const win = document.getElementById(`win-${appId}`);
    if (!win) return;
    win.classList.toggle('maximized');
    focusApp(appId);
}

function focusApp(appId) {
    state.highestZ += 1;
    state.activeWindow = appId;

    document.querySelectorAll('.window').forEach(w => w.classList.remove('focused'));
    const targetWin = document.getElementById(`win-${appId}`);
    if (targetWin) {
        targetWin.style.zIndex = state.highestZ;
        targetWin.classList.add('focused');
        targetWin.classList.remove('minimized');
    }

    updateDockIndicators();
}

function updateDockIndicators() {
    document.querySelectorAll('.dock-icon[data-app]').forEach(btn => {
        const id = btn.getAttribute('data-app');
        if (state.openWindows.has(id)) {
            btn.classList.add('running');
        } else {
            btn.classList.remove('running');
        }

        if (state.activeWindow === id && !document.getElementById(`win-${id}`)?.classList.contains('minimized')) {
            btn.classList.add('focused');
        } else {
            btn.classList.remove('focused');
        }
    });
}

function initWindows() {
    document.querySelectorAll('.window').forEach(win => {
        const appId = win.getAttribute('data-app');
        const header = win.querySelector('.window-header');

        // Focus window on click
        win.addEventListener('mousedown', () => {
            focusApp(appId);
        });

        // Draggable window via header
        let isDragging = false;
        let startX, startY, origX, origY;

        header.addEventListener('mousedown', (e) => {
            if (e.target.closest('.window-controls')) return;
            if (win.classList.contains('maximized')) return;

            isDragging = true;
            focusApp(appId);

            startX = e.clientX;
            startY = e.clientY;
            origX = win.offsetLeft;
            origY = win.offsetTop;

            const onMouseMove = (ev) => {
                if (!isDragging) return;
                const dx = ev.clientX - startX;
                const dy = ev.clientY - startY;

                let nextX = origX + dx;
                let nextY = origY + dy;

                // Bounds constrain
                if (nextY < 0) nextY = 0;
                if (nextX < 0) nextX = 0;

                win.style.left = `${nextX}px`;
                win.style.top = `${nextY}px`;
            };

            const onMouseUp = () => {
                isDragging = false;
                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('mouseup', onMouseUp);
            };

            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        });

        // Double click header to maximize
        header.addEventListener('dblclick', (e) => {
            if (e.target.closest('.window-controls')) return;
            maximizeApp(appId);
        });
    });
}

// ============================================================================
// ABOUT WINDOW TABS
// ============================================================================
function initAboutTabs() {
    const navBtns = document.querySelectorAll('.about-nav-item');
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const targetTab = btn.getAttribute('data-tab');
            document.querySelectorAll('.about-content .tab-pane').forEach(pane => {
                pane.classList.remove('active');
            });
            const targetEl = document.getElementById(targetTab);
            if (targetEl) targetEl.classList.add('active');
        });
    });
}

// ============================================================================
// PROJECTS WINDOW TABS
// ============================================================================
function initProjectTabs() {
    const projBtns = document.querySelectorAll('.proj-nav-btn');
    projBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            projBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const targetId = btn.getAttribute('data-target');
            document.querySelectorAll('.projects-detail .proj-card').forEach(card => {
                card.classList.remove('active');
            });
            const cardEl = document.getElementById(targetId);
            if (cardEl) cardEl.classList.add('active');
        });
    });
}

// ============================================================================
// SETTINGS APP (WALLPAPERS)
// ============================================================================
function initSettingsWallpapers() {
    const grid = document.getElementById('wallpapersGrid');
    if (!grid) return;

    state.wallpapers.forEach((wp, index) => {
        const item = document.createElement('div');
        item.className = `wall-thumb ${wp === state.currentWallpaper ? 'active' : ''}`;
        item.innerHTML = `<img src="images/wallpapers/${wp}" alt="Wallpaper ${index + 1}">`;
        
        item.addEventListener('click', () => {
            document.querySelectorAll('.wall-thumb').forEach(w => w.classList.remove('active'));
            item.classList.add('active');
            state.currentWallpaper = wp;
            document.body.style.backgroundImage = `url('images/wallpapers/${wp}')`;
        });

        grid.appendChild(item);
    });
}

// ============================================================================
// INTERACTIVE TERMINAL
// ============================================================================
function focusTerminalInput() {
    const input = document.getElementById('terminalInput');
    if (input) input.focus();
}

function initTerminal() {
    const input = document.getElementById('terminalInput');
    const output = document.getElementById('terminalOutput');
    const body = document.getElementById('terminalBody');

    if (!input || !output) return;

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const rawVal = input.value.trim();
            const cmd = rawVal.toLowerCase();

            if (rawVal) {
                state.commandHistory.push(rawVal);
                state.historyIndex = state.commandHistory.length;
            }

            // Print Command Row
            const cmdRow = document.createElement('div');
            cmdRow.className = 'terminal-line';
            cmdRow.innerHTML = `<span class="term-prompt"><span class="prompt-user">jamal@ubuntu-assaka</span>:<span class="prompt-dir">~</span>$</span> ${escapeHTML(rawVal)}`;
            output.appendChild(cmdRow);

            // Execute Command
            executeTerminalCommand(cmd, rawVal, output);

            input.value = '';
            body.scrollTop = body.scrollHeight;
        } else if (e.key === 'ArrowUp') {
            if (state.historyIndex > 0) {
                state.historyIndex--;
                input.value = state.commandHistory[state.historyIndex];
            }
            e.preventDefault();
        } else if (e.key === 'ArrowDown') {
            if (state.historyIndex < state.commandHistory.length - 1) {
                state.historyIndex++;
                input.value = state.commandHistory[state.historyIndex];
            } else {
                state.historyIndex = state.commandHistory.length;
                input.value = '';
            }
            e.preventDefault();
        }
    });
}

function executeTerminalCommand(cmd, originalCmd, output) {
    const res = document.createElement('div');
    res.className = 'terminal-line';

    const tokens = cmd.split(' ');
    const base = tokens[0];

    switch (base) {
        case 'help':
            res.innerHTML = `
<span class="term-highlight">Available Commands:</span><br>
  &bull; <span class="term-highlight">about</span>       : Show Jamal's background & career profile<br>
  &bull; <span class="term-highlight">skills</span>      : List technical infrastructure & cybersecurity skills<br>
  &bull; <span class="term-highlight">projects</span>    : View Voice Meaning Mapper, ESP32 IoT, and network projects<br>
  &bull; <span class="term-highlight">education</span>   : Display ISTA Assaka & secondary education credentials<br>
  &bull; <span class="term-highlight">contact</span>     : Display contact information & socials<br>
  &bull; <span class="term-highlight">resume</span>      : Open CV document viewer<br>
  &bull; <span class="term-highlight">neofetch</span>    : Display system hardware & OS banner<br>
  &bull; <span class="term-highlight">ls</span>          : List directory files<br>
  &bull; <span class="term-highlight">cat &lt;file&gt;</span>    : View file content (e.g., cat bio.txt)<br>
  &bull; <span class="term-highlight">clear</span>       : Clear the terminal screen<br>
  &bull; <span class="term-highlight">whoami</span>      : Print current active session user
`;
            break;

        case 'about':
            res.innerHTML = `<strong>Jamal Idhammou</strong><br>Digital Infrastructure Specialist (Systems & Networks) | IT Security Enthusiast<br>Studying at <strong>ISTA Assaka</strong>, Agadir, Morocco.<br>Specializing in enterprise networking, virtualization, network security, and IoT automation.`;
            break;

        case 'skills':
            res.innerHTML = `
<span class="term-highlight">[Networking]</span> Cisco Packet Tracer, TCP/IP, LAN/WAN, Wireshark, Inter-VLAN Routing, ACLs<br>
<span class="term-highlight">[Systems]</span> Linux (Ubuntu, Kali, Debian), Windows Server (AD DS, GPO, DNS, DHCP), VMware, VirtualBox<br>
<span class="term-highlight">[Cybersecurity]</span> Ethical Pentesting, Network Auditing, Nmap, Firewall Hardening, Threat Analysis<br>
<span class="term-highlight">[Scripting & IoT]</span> Python 3, Bash/Shell, ESP32 Microcontrollers, SQLite, Hardware Diagnostics
`;
            break;

        case 'projects':
            res.innerHTML = `
1. <span class="term-highlight">Voice Meaning Mapper</span>: Speech pattern & acoustic recognition assistance for communication challenges.<br>
2. <span class="term-highlight">ESP32 IoT Systems</span>: Hardware telemetry, sensor mesh, and encrypted network transmission.<br>
3. <span class="term-highlight">Tech for Hope Hackathon 2026</span>: 48-Hour sprint developing assistive tech at CNMH Agadir.<br>
4. <span class="term-highlight">Enterprise Network Labs</span>: Full multi-site virtualized campus topologies at ISTA Assaka.<br>
<em>Type 'open projects' to launch the GUI project viewer.</em>
`;
            break;

        case 'education':
            res.innerHTML = `
&bull; <strong>Specialized Technician in Digital Infrastructure</strong> (Systems & Networks)<br>  ISTA Assaka, Agadir (2025 - Present)<br>
&bull; <strong>High School Baccalaureate in Physics-Chemistry</strong><br>  Lyc&eacute;e Qualifiant Koutoubia, Drarga (2025)
`;
            break;

        case 'contact':
            res.innerHTML = `
Email : <a href="mailto:jidhmmou@gmail.com" style="color: #34e2e2;">jidhmmou@gmail.com</a><br>
Phone : +212 649-144657<br>
GitHub: <a href="https://github.com/jidhmmou-ship-it" target="_blank" style="color: #34e2e2;">github.com/jidhmmou-ship-it</a><br>
City  : Agadir, Morocco
`;
            break;

        case 'resume':
        case 'cv':
            openApp('resume');
            res.innerHTML = `Opening CV Document Viewer...`;
            break;

        case 'ls':
            res.innerHTML = `<span style="color: #34e2e2; font-weight: bold;">about.desktop  projects.desktop  CV_Jamal_Idhammou.pdf  skills.txt  VoiceMapper/  ESP32_IoT/</span>`;
            break;

        case 'cat':
            const targetFile = tokens[1];
            if (!targetFile) {
                res.innerHTML = `cat: missing file operand. Try 'cat skills.txt'`;
            } else if (targetFile.includes('skill')) {
                res.innerHTML = `TCP/IP, Cisco Packet Tracer, Wireshark, Linux, Windows Server, VMware, Cybersecurity, Python, Bash, ESP32.`;
            } else if (targetFile.includes('cv') || targetFile.includes('pdf')) {
                openApp('resume');
                res.innerHTML = `Rendering binary PDF in Document Viewer...`;
            } else {
                res.innerHTML = `cat: ${escapeHTML(targetFile)}: No such file or directory`;
            }
            break;

        case 'whoami':
            res.innerHTML = `jamal (Digital Infrastructure Specialist)`;
            break;

        case 'open':
            const appTarget = tokens[1];
            if (apps[appTarget]) {
                openApp(appTarget);
                res.innerHTML = `Opening ${apps[appTarget].title}...`;
            } else {
                res.innerHTML = `open: unknown app '${escapeHTML(appTarget || '')}'. Valid apps: about, projects, terminal, resume, settings, trash.`;
            }
            break;

        case 'clear':
            output.innerHTML = '';
            return;

        case 'neofetch':
            res.innerHTML = `
<pre style="color: #e95420; font-family: monospace; font-size: 11.5px; line-height: 1.25;">
            .-/+oossssoo+/-.               <strong style="color: #fff;">jamal</strong>@<strong style="color: #fff;">ubuntu-assaka</strong>
        \`:+ssssssssssssssssss+:\`           -------------------
      -+ssssssssssssssssssyyssss+-         <span style="color: #34e2e2;">OS:</span> Ubuntu 20.04.6 LTS (Focal Fossa)
    .ossssssssssssssssssdMMMNysssso.       <span style="color: #34e2e2;">Host:</span> ISTA Assaka Infrastructure Lab
   /ssssssssssshdmmNNmmyNMMMMhssssss/      <span style="color: #34e2e2;">Kernel:</span> 5.15.0-generic x86_64
  +ssssssssshmydMMMMMMMNddddyssssssss+     <span style="color: #34e2e2;">Uptime:</span> 100% Focused & Motivated
 /sssssssshNMMMyhhyyyyhmNMMMNhssssssss/    <span style="color: #34e2e2;">Shell:</span> bash 5.0.17
.ssssssssdMMMNhsssssssssshNMMMdssssssss.   <span style="color: #34e2e2;">DE:</span> GNOME 3.36 (Yaru Theme)
+sssshhhyNMMNyssssssssssssyNMMMysssssss+   <span style="color: #34e2e2;">Terminal:</span> gnome-terminal
ossyNMMMNyMMhsssssssssssssshmmmhssssssso   <span style="color: #34e2e2;">CPU:</span> Systems, Networks & Cybersecurity
ossyNMMMNyMMhsssssssssssssshmmmhssssssso   <span style="color: #34e2e2;">Projects:</span> Voice Meaning Mapper, ESP32 IoT
+sssshhhyNMMNyssssssssssssyNMMMysssssss+   <span style="color: #34e2e2;">Memory:</span> Low-latency / High Efficiency
.ssssssssdMMMNhsssssssssshNMMMdssssssss.
 /sssssssshNMMMyhhyyyyhdNMMMNhssssssss/
  +sssssssssdmydMMMMMMMMddddyssssssss+
   /ssssssssssshdmNNNNmyNMMMMhssssss/
    .ossssssssssssssssssdMMMNysssso.
      -+sssssssssssssssssyyyssss+-
        \`:+ssssssssssssssssss+:\`
            .-/+oossssoo+/-.
</pre>`;
            break;

        case 'onlyoffice':
        case 'office':
        case 'docs':
            openOfficeDocument('word');
            res.innerHTML = `Launching ONLYOFFICE DocumentServer editor...`;
            break;

        case '':
            return;

        default:
            res.innerHTML = `bash: ${escapeHTML(originalCmd)}: command not found. Type <span class="term-highlight">help</span> for available commands.`;
            break;
    }

    output.appendChild(res);
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

// ============================================================================
// ONLYOFFICE DOCUMENT SERVER INTEGRATION
// ============================================================================
const officeMeta = {
    word: { title: 'ONLYOFFICE Document Editor - Report.docx', file: 'Report.docx' },
    cell: { title: 'ONLYOFFICE Spreadsheet Editor - Metrics.xlsx', file: 'Metrics.xlsx' },
    slide: { title: 'ONLYOFFICE Presentation Editor - Pitch.pptx', file: 'Pitch.pptx' }
};

function openOfficeDocument(type) {
    const meta = officeMeta[type] || officeMeta.word;
    const win = document.getElementById('win-office');
    const iframe = document.getElementById('officeEditorFrame');
    const titleEl = document.getElementById('officeWindowTitle');

    if (!win || !iframe) return;

    titleEl.textContent = meta.title;
    iframe.src = `editor.html?type=${encodeURIComponent(type)}`;

    win.classList.remove('minimized');
    win.classList.add('active');
    focusApp('office');
}

function closeOfficeWindow() {
    const win = document.getElementById('win-office');
    const iframe = document.getElementById('officeEditorFrame');
    if (!win) return;
    win.classList.remove('active', 'focused', 'maximized');
    if (iframe) iframe.src = 'about:blank';
}

function minimizeOfficeWindow() {
    const win = document.getElementById('win-office');
    if (win) win.classList.add('minimized');
}

function maximizeOfficeWindow() {
    const win = document.getElementById('win-office');
    if (win) win.classList.toggle('maximized');
}

// Hook office shortcuts on initialization
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.desktop-item[data-office]').forEach(item => {
        const type = item.getAttribute('data-office');
        item.addEventListener('dblclick', () => openOfficeDocument(type));
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768) openOfficeDocument(type);
        });
    });
});

