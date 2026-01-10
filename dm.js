(async () => {
    // 1. Ensure CryptoJS is loaded
    if (typeof CryptoJS === 'undefined') {
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js";
        document.head.appendChild(script);
        await new Promise(r => script.onload = r);
        console.log("%c✅ CryptoJS Loaded.", "color: #00ff00; font-weight: bold;");
    }

    // Function to handle the decryption and logging
    const processData = (prob, label) => {
        if (prob && prob._id && prob.data) {
            try {
                const bytes = CryptoJS.AES.decrypt(prob.data, prob._id);
                const decrypted = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
                const d = decrypted.data;

                // Extract answers (handles coordinate systems, substitution, etc.)
                const x = d.x ?? d.ans1 ?? (d.answer ? d.answer.x : "N/A");
                const y = d.y ?? d.ans2 ?? (d.answer ? d.answer.y : "N/A");

                console.log(`%c🔓 ${label}`, "color: white; background: #6200ee; padding: 4px 8px; border-radius: 4px; font-weight: bold;");
                
                if (x !== "N/A" || y !== "N/A") {
                    console.log(`%cSolution: (${x}, ${y})`, "font-size: 20px; color: #00eaff; font-weight: bold;");
                }

                // Log extra details like lines or equations if they exist
                if (d.line1 || d.line2) {
                    console.log(`%cLine 1: ${d.line1} | Line 2: ${d.line2}`, "color: #888;");
                }
                
                console.log("Full Decrypted Data:", d);
            } catch (e) {
                console.error("Decryption failed. The key or format might have changed.", e);
            }
        }
    };

    // 2. Hook into XMLHttpRequest
    const rawOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function() {
        this.addEventListener('load', function() {
            // Case A: Initial problem load or assignment navigation
            if (this.responseURL.includes('/api/student/problemByAssignment')) {
                try {
                    const body = JSON.parse(this.responseText);
                    processData(body.problem, "CURRENT PROBLEM DECODED");
                } catch (err) {}
            }
            
            // Case B: Checking an answer (which contains the NEXT problem)
            if (this.responseURL.includes('/api/student/check_answer')) {
                try {
                    const body = JSON.parse(this.responseText);
                    processData(body.problem, "NEXT PROBLEM PRE-DECODED");
                } catch (err) {}
            }
        });
        rawOpen.apply(this, arguments);
    };

    console.log("%c🚀 DECODER ACTIVE", "color: #ff00ff; font-family: monospace; font-size: 20px; font-weight: bold;");
    console.log("Waiting for problem data... (Click a problem or submit an answer)");
})();
