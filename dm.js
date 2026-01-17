async function ask(passedText = null) {
    // Determine text: Use passed text from interceptor, or fallback to DOM selection
    const problemText = passedText || document.querySelector('.example-class')?.textContent;
    
    if (!problemText) {
        console.error("No problem text found to solve.");
        return;
    }
    const system = "";

    const guiValue = document.getElementById('gui-ai-response');
    const statusEl = document.getElementById('gui-status');

    // Visual feedback that AI is thinking
    if (statusEl) statusEl.innerText = "AI THINKING...";

    const question = `Solve this problem: ${problemText} and return only a solution; no answer sentence(s)`;

    const payload = {
        model: 'openai',
        messages: [
            { role: 'system', content: system },
            { role: 'user', content: question }
        ],
        max_tokens: 350,
        stream: false,
    };

    fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })
    .then(r => r.text())
    .then(solution => {
        if (guiValue) {
            // Clear previous and show AI solution
            guiValue.innerText = solution; 
            if (statusEl) {
                statusEl.innerText = "AI SOLVED";
                statusEl.style.color = "#ff00ff"; // Pink for AI success
            }
        }
    })
    .catch(e => console.error(`AI Error: ${e}`));
}


(async () => {
    // 1. Ensure CryptoJS is loaded
    if (typeof CryptoJS === 'undefined') {
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js";
        document.head.appendChild(script);
        await new Promise(r => script.onload = r);
    }

    // 2. GUI Creation (Standard setup)
    const gui = document.createElement('div');
    gui.id = 'decoder-gui';

gui.innerHTML = `
    <div id="gui-header">
        <span>🚀 Solution Decoder + XHR Bypass</span>
        <button id="gui-min-btn">_</button>
    </div>
    <div id="gui-content">
        <div id="gui-status">Waiting for data...</div>
        <hr style="border: 0.5px solid #444; margin: 10px 0;">
        
        <div id="gui-solution-label" style="font-size: 10px; color: #aaa; text-transform: uppercase;">Quick Ans</div>
        <div id="gui-solution-value" style="font-size: 24px; color: #00eaff; font-weight: bold; margin: 5px 0;">(?, ?)</div>
        
        <div id="gui-ai-label" style="font-size: 10px; color: #aaa; text-transform: uppercase; margin-top: 10px;">AI Full Response</div>
        <div id="gui-ai-response" style="max-height: 150px; overflow-y: auto; background: #282a36; padding: 8px; border-radius: 4px; font-size: 12px; color: #f8f8f2; margin-top: 5px; white-space: pre-wrap; border: 1px solid #444;">No response yet.</div>

        <div id="gui-details" style="font-size: 12px; color: #888; font-family: monospace; margin-top: 5px;"></div>
        <button id="ai-manual" class="ai-manual">Manually Ask AI</button>
    </div>
`;

    Object.assign(gui.style, { position: 'fixed', top: '20px', right: '20px', width: '250px', backgroundColor: '#1e1e2e', color: 'white', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', zIndex: '999999', fontFamily: 'sans-serif', padding: '12px', border: '1px solid #333', cursor: 'grab' });
    const header = gui.querySelector('#gui-header');
    Object.assign(header.style, { display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '10px', fontSize: '14px' });
// 1. Define the CSS rules as a string
let cssRules = `
.ai-manual {
    display: block;
    width: 140px;
    padding: 8px;
    margin: 4px 0;
    border: 2px solid lime;
    cursor: pointer;
    border-radius: 5px;
    background: #0ff;
    color: #000;
    transition: 0.3s;
    font-size: 10px;
    box-shadow: 0 0 8px rgba(0, 255, 255, 0.5);
}
#gui-ai-response::-webkit-scrollbar {
    width: 6px;
}
#gui-ai-response::-webkit-scrollbar-track {
    background: #1e1e2e;
}
#gui-ai-response::-webkit-scrollbar-thumb {
    background: #444;
    border-radius: 10px;
}
#gui-ai-response::-webkit-scrollbar-thumb:hover {
    background: #00eaff;
}
`;

// 2. Create the <style> element
let styleElement = document.createElement('style');

// 3. Set the CSS content for the new element
styleElement.textContent = cssRules; // or styleElement.innerHTML = cssRules;

// 4. Append the <style> ELEMENT (the Node) to the document head
document.head.appendChild(styleElement);
    document.body.appendChild(gui);

    const content = gui.querySelector('#gui-content');
    gui.querySelector('#gui-min-btn').onclick = () => {
        content.style.display = content.style.display === 'none' ? 'block' : 'none';
        gui.style.width = content.style.display === 'none' ? '150px' : '250px';
    };

    // 3. Logic to process and display data
    const updateGUI = (label, x, y, extra) => {
        const statusEl = document.getElementById('gui-status');
        statusEl.innerText = label;
        statusEl.style.color = label.includes('BYPASS') ? '#ffff00' : (label.includes('NEXT') ? '#ff00ff' : '#00ff00');
        document.getElementById('gui-solution-value').innerText = `(${x}, ${y})`;
        document.getElementById('gui-details').innerText = extra || "";
    };

const processData = (prob, label) => {
    if (!prob) return;
    try {
        let d = null;
        let decrypted = null;

        // 1. Decryption Logic
        if (prob.data && typeof prob.data === 'string' && prob._id) {
            const bytes = CryptoJS.AES.decrypt(prob.data, prob._id);
            const decryptedRaw = bytes.toString(CryptoJS.enc.Utf8);
            if (decryptedRaw) {
                decrypted = JSON.parse(decryptedRaw);
                d = decrypted.data;
            }
        } else {
            d = prob.data;
        }

        // 2. CRITICAL SAFETY CHECK: If d is still undefined/null, stop here.
if (!d) {
            console.warn("No hidden answer found. Falling back to AI OCR...");
            
            // Try to find the text from the JSON object or the web page
            const fallbackText = prob.prompt || document.getElementById('problemPrompt')?.textContent;
            
            if (fallbackText) {
                ask(fallbackText);
            }
            return; // Stop processing further hidden data logic
        }

        window.d = d;
        window.decrypted = decrypted;

        // 3. Ultra-Safe property access using Optional Chaining
        const x = d.x ?? d.ans1 ?? d.answer?.x ?? d.guidedSentenceAnswers?.[0] ?? null;
        const y = d.y ?? d.ans2 ?? d.answer?.y ?? d.guidedSentenceAnswers?.[1] ?? null;

        // 4. Update GUI if any data exists
        if (x !== null || y !== null) {
            updateGUI(label, x ?? "?", y ?? "?", "Processing AI Solution...");
            
            // Safe check for problem text
            const problemText = d.problemText || prob.prompt || d.question || document.getElementById('problemPrompt')?.textContent;
            
            if (problemText) {
                // Ensure 'system' variable is defined globally before calling ask()
                if (typeof system === 'undefined') window.system = "Solve clearly.";
                ask(problemText); 
            }
        }
    } catch (e) { 
        console.error("Process error caught:", e); 
    }
};

    // 4. FUNCTION: Manual XHR Bypass
    const sendBypassXHR = (url, originalPayload) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        
        // Add a flag so our own interceptor doesn't catch this request
        xhr.isBypassRequest = true;

        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const res = JSON.parse(xhr.responseText);
                    if (res.problem) {
                        processData(res.problem, "BYPASS SUCCESS");
                    }
                } catch (e) {}
            }
        };

        try {
            let payload = JSON.parse(originalPayload);
            if (payload) {
        payload.toggleObfuscation = false;
    }
            xhr.send(JSON.stringify(payload));
        } catch (e) {
            console.error("Bypass construction failed", e);
        }
    };

    // 5. Intercept Network Requests
    const rawOpen = XMLHttpRequest.prototype.open;
    const rawSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function(method, url) {
        this._url = url; 
        return rawOpen.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function(body) {
        // Only trigger bypass if it's the target API and NOT already a bypass request
        if (this._url && this._url.includes('/api/student/problemByAssignment') && !this.isBypassRequest) {
            sendBypassXHR(this._url, body);
        }

        this.addEventListener('load', function() {
            // Standard decryption check for the original app requests
            if (!this.isBypassRequest && (this._url.includes('problemByAssignment') || this._url.includes('check_answer'))) {
                try {
                    const res = JSON.parse(this.responseText);
                    processData(res.problem, "CURRENT PROBLEM");
                } catch (err) {}
            }
        });

        return rawSend.apply(this, arguments);
    };

    // 6. Draggable Logic
    let isDragging = false, offset = [0,0];
    header.onmousedown = (e) => { isDragging = true; offset = [gui.offsetLeft - e.clientX, gui.offsetTop - e.clientY]; };
    document.onmousemove = (e) => { if (isDragging) { gui.style.left = (e.clientX + offset[0]) + 'px'; gui.style.top = (e.clientY + offset[1]) + 'px'; gui.style.right = 'auto'; } };
    document.onmouseup = () => isDragging = false;
})();

(function() {
  "use strict";
  let messages = [];
  const baseUrl = 'https://text.pollinations.ai/';
  const system =
    'You are a simple browser agent model that returns short answers to the user, consise and simple. Selections by user in browser will be indicated by SELECTION[text], where text is what is currently selected. You will not bring up specific things like SELECTION[text]';

  function toMessage(role, content, image_blob=undefined) {
    if (image_blob) {
      let r = { role: role, content: [{type: "text", text: content}] };
      r.content.push({
        type: "image_url",
        image_url: {
          url: `data:image/jpeg;base64,${image_blob}`
        }
      });
      return r;
    }
    return { role: role, content: content };
  }

  function truncate(str) {
    if (str.length <= 150) {
      return str;
    } else {
      return str.slice(0, 147) + '...';
    }
  }

  async function askmanual() {
    let m = '';
    messages.forEach(msg => {
      let c = msg.content.replace(/SELECTION\[.*?\\\]/g, "");
      m += `${(str => str.charAt(0).toUpperCase() + str.slice(1))(msg.role)}: ${truncate(c)}\n`;
    });

    m += '========================\nWhat would you like to ask?\n(#[page] to attach page screenshot)';
     if (m.length > 1000) {
        m.slice(-1000); // ret last 1000 characters
    }

    let question = prompt(m);
    if (question === null || question === "") {
      return;
    }
    if (window.getSelection().toString() !== '') {
      question += `SELECTION[${window.getSelection().toString().trimEnd()}\\]`;
    }
    let img;

    if (question.includes('#[page]')) {
        if (window.html2canvas === undefined) {
            const r = await fetch("https://cdn.jsdelivr.net/npm/html2canvas-pro@1.5.13/dist/html2canvas-pro.min.js").catch(e => { throw new Error(`Error occurred While Fetching html2canvas-pro, check cors? ${e}`) });
            const code = await r.text();
            eval(code);
        }

        const canvas = await html2canvas(document.body, {
            x: window.scrollX,
            y: window.scrollY,
            width: window.innerWidth,
            height: window.innerHeight,
            scale: 0.5, // COMPRESSIONNNN 🤑 
            backgroundColor: "#fff",
            useCORS: true,
            logging: false
          }).catch(e => { throw new Error(`Error occurred while taking a screenshot: ${e}`) })
          img = canvas.toDataURL("image/jpeg", 0.45).split(",")[1];
    }
    const payload = {
      model: 'openai',
      messages: [{ role: 'system', content: system }, toMessage("user", question, img)].concat(messages),
      max_tokens: 350,
      stream: false,
    };
    const guiValue = document.getElementById('gui-solution-value');
    const statusEl = document.getElementById('gui-status');
    fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(r => {
        if (!r.ok) {
          throw new Error(`Error: ${r.stausText}, Code: ${r.statusCode})`);
        }
        let text = r.text();
        //messages.push(toMessage("user", question));
// Locate this section in your askmanual function
text.then(s => {
    // 1. Alert the user (optional, you can remove alert(s) now if you want)
    alert(`Assistant:\n${s}`);

    // 2. Get the new response element
    const aiResponseEl = document.getElementById('gui-ai-response');
    const statusEl = document.getElementById('gui-status');

    if (aiResponseEl) {
        // Clear previous and show large AI solution
        aiResponseEl.innerText = s;
        // Scroll to the top of the new response
        aiResponseEl.scrollTop = 0; 
    }

    if (statusEl) {
        statusEl.innerText = "AI SOLVED";
        statusEl.style.color = "#ff00ff"; // Pink for success
    }
});
      })
      .catch(e => {
        throw new Error(`Error occurred while trying to ask pollinations: ${e}`)
      });
  }
    // Place this inside the (function() { ... })(); block
// Replace your manualBtn logic with this "Event Delegation" version:
document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'ai-manual') {
        askmanual().catch(err => {
            console.error(err);
            alert(`An Error Occurred! \nTrace: ${err}`);
        });
    }
});

  function handleAltAKeyPress(event) {
    const isAltPressed = event.altKey;
    const isAPressed = event.key === 'a' || event.key === 'A';

    if (isAltPressed && isAPressed) {
      event.preventDefault();
      askmanual().catch(e => { console.error(e); alert(`An Error Occured! \nTrace: ${e}`); });
    }
  }
  document.addEventListener('keydown', handleAltAKeyPress);
})();
