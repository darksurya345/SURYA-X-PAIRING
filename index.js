const express = require('express');
const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    delay, 
    makeCacheableSignalKeyStore, 
    Browsers 
} = require('@whiskeysockets/baileys');
const pino = require('pino');

const app = express();
const PORT = process.env.PORT || 3000;

// Home Page Design
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>SURYA-X PAIRING</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { background: #0f172a; color: white; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                .box { background: #1e293b; padding: 30px; border-radius: 12px; text-align: center; box-shadow: 0 5px 15px rgba(0,0,0,0.3); width: 90%; max-width: 350px; }
                input { width: 100%; padding: 12px; box-sizing: border-box; margin: 15px 0; border-radius: 8px; border: 1px solid #334155; background: #0f172a; color: white; font-size: 16px; text-align: center; }
                button { width: 100%; padding: 12px; border-radius: 8px; border: none; background: #22c55e; color: white; font-weight: bold; cursor: pointer; font-size: 16px; }
                #res { margin-top: 20px; font-weight: bold; color: #fbbf24; word-wrap: break-word; }
            </style>
        </head>
        <body>
            <div class="box">
                <h2 style="color: #22c55e;">SURYA-X MD</h2>
                <p>Enter WhatsApp Number with Country Code</p>
                <input type="number" id="num" placeholder="Example: 917797099719">
                <button onclick="getCode()">GET CODE</button>
                <div id="res"></div>
            </div>
            <script>
                async function getCode() {
                    const num = document.getElementById('num').value;
                    const resDiv = document.getElementById('res');
                    if (!num) return alert("Number kothay?");
                    resDiv.innerText = "Please wait... Generating Code";
                    try {
                        const response = await fetch('/code?number=' + num);
                        const data = await response.json();
                        if (data.code) {
                            resDiv.innerHTML = "YOUR CODE: <br><span style='font-size: 30px; color: #fff; background: #22c55e; padding: 5px 10px; border-radius: 5px; display: inline-block; margin-top: 10px;'>" + data.code + "</span>";
                        } else {
                            resDiv.innerText = "Error: " + (data.error || "Failed");
                        }
                    } catch (e) {
                        resDiv.innerText = "Server error! Refresh & try again.";
                    }
                }
            </script>
        </body>
        </html>
    `);
});

// Pairing Logic
app.get('/code', async (req, res) => {
    let num = req.query.number;
    if (!num) return res.json({ error: "Number missing" });

    try {
        const { state } = await useMultiFileAuthState('session_' + num);
        const sock = makeWASocket({
            auth: state,
            printQRInTerminal: false,
            logger: pino({ level: 'silent' }),
            browser: Browsers.macOS("Desktop") 
        });

        if (!sock.authState.creds.registered) {
            await delay(3000); 
            const code = await sock.requestPairingCode(num);
            res.json({ code: code });
        } else {
            res.json({ error: "Try a different number" });
        }
    } catch (err) {
        res.json({ error: "Service Error" });
    }
});

app.listen(PORT, () => console.log('Live on ' + PORT));
                
