(async () => {
    // 1. Ensure CryptoJS is loaded
    if (typeof CryptoJS === 'undefined') {
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js";
        document.head.appendChild(script);
        await new Promise(r => script.onload = r);
    }

    // 2. Create the GUI Elements
    const gui = document.createElement('div');
    gui.id = 'decoder-gui';
    gui.innerHTML = `
        <div id="gui-header">
            <span>🚀 Solution Decoder</span>
            <button id="gui-min-btn">_</button>
        </div>
        <div id="gui-content">
            <div id="gui-status">Waiting for data...</div>
            <hr style="border: 0.5px solid #444; margin: 10px 0;">
            <div id="gui-solution-label" style="font-size: 10px; color: #aaa; text-transform: uppercase;">Solution</div>
            <div id="gui-solution-value" style="font-size: 24px; color: #00eaff; font-weight: bold; margin: 5px 0;">(?, ?)</div>
            <div id="gui-details" style="font-size: 12px; color: #888; font-family: monospace;"></div>
        </div>
    `;

    // 3. Style the GUI
    Object.assign(gui.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        width: '250px',
        backgroundColor: '#1e1e2e',
        color: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
        zIndex: '999999',
        fontFamily: 'sans-serif',
        padding: '12px',
        border: '1px solid #333',
        cursor: 'grab'
    });

    const header = gui.querySelector('#gui-header');
    Object.assign(header.style, {
        display: 'flex',
        justifyContent: 'space-between',
        fontWeight: 'bold',
        marginBottom: '10px',
        fontSize: '14px'
    });

    document.body.appendChild(gui);

    // Make it Minimizable
    const content = gui.querySelector('#gui-content');
    gui.querySelector('#gui-min-btn').onclick = () => {
        content.style.display = content.style.display === 'none' ? 'block' : 'none';
        gui.style.width = content.style.display === 'none' ? '150px' : '250px';
    };

    // 4. Decryption & GUI Update Logic
    const updateGUI = (label, x, y, extra) => {
        document.getElementById('gui-status').innerText = label;
        document.getElementById('gui-status').style.color = label.includes('NEXT') ? '#ff00ff' : '#00ff00';
        document.getElementById('gui-solution-value').innerText = `(${x}, ${y})`;
        document.getElementById('gui-details').innerText = extra || "";
    };

const processData = (prob, label) => {
        if (prob && prob._id && prob.data) {
            try {
                const bytes = CryptoJS.AES.decrypt(prob.data, prob._id);
                const decrypted = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
                const d = decrypted.data;

                // FIXED LOGIC: Fallbacks for guided sentences and standard answers
                const x = d.x ?? d.ans1 ?? (d.answer ? d.answer.x : null) ?? (d.guidedSentenceAnswers ? d.guidedSentenceAnswers[0] : `N/A; some more info ${d}`);
                const y = d.y ?? d.ans2 ?? (d.answer ? d.answer.y : null) ?? (d.guidedSentenceAnswers ? d.guidedSentenceAnswers[1] : `N/A; some more info ${d}`);
                
                const extra = (d.line1 || d.line2) ? `L1: ${d.line1}\nL2: ${d.line2}` : "";

                updateGUI(label, x, y, extra);
                console.log(`%c🔓 ${label}: (${x}, ${y})`, "color: #00eaff; font-weight: bold;");
            } catch (e) {
                document.getElementById('gui-status').innerText = "Decryption Error";
                console.error(e);
            }
        }
    };

    // 5. Intercept Network Requests
    const rawOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function() {
        this.addEventListener('load', function() {
            if (this.responseURL.includes('/api/student/problemByAssignment')) {
                try {
                    const body = JSON.parse(this.responseText);
                    processData(body.problem, "CURRENT PROBLEM");
                } catch (err) {}
            }
            if (this.responseURL.includes('/api/student/check_answer')) {
                try {
                    const body = JSON.parse(this.responseText);
                    processData(body.problem, "NEXT PROBLEM");
                } catch (err) {}
            }
        });
        rawOpen.apply(this, arguments);
    };

    // 6. Make GUI Draggable
    let isDragging = false, offset = [0,0];
    header.onmousedown = (e) => {
        isDragging = true;
        offset = [gui.offsetLeft - e.clientX, gui.offsetTop - e.clientY];
    };
    document.onmousemove = (e) => {
        if (isDragging) {
            gui.style.left = (e.clientX + offset[0]) + 'px';
            gui.style.top = (e.clientY + offset[1]) + 'px';
            gui.style.right = 'auto';
        }
    };
    document.onmouseup = () => isDragging = false;

})();
