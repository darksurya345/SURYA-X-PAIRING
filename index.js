const express = require('express');
const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    delay, 
    Browsers 
} = require('@whiskeysockets/baileys');
const pino = require('pino');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>SURYA-X PAIRING</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { background: #0b0e11; color: #00ffcc; font-family: 'Courier New', monospace; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                .box { background: #1a1d21; padding: 30px; border-radius: 15px; text-align: center; border: 1px solid #00ffcc; box-shadow: 0 0 20px rgba(0,255,204,0.2); width: 85%; max-width: 400px; }
                input { width: 100%; padding: 12px; margin: 15px 0; border-radius: 8px; border: 1px solid #00ffcc; background: #0b0e11; color: white; text-align: center; font-size: 18px; }
                button { width: 100%; padding: 12px; border-radius: 8px; border: none; background: #00ffcc; color: #0b0e11; font-weight: bold; cursor: pointer; font-size: 16px; transition: 0.3s; }
                button:hover { background: #00ccaa; transform: scale(1.02); }
                #res { margin-top: 20px; font-weight: bold; color: #ffffff; min-height: 50px; }
            </style>
        </head>
        <body>
            <div class="box">
                <h2 style="margin-top:0;">SURYA-X MD</h2>
                <p>Enter WhatsApp Number (With Country Code)</p>
                <input type="number" id="num" placeholder="Example: 917797099719">
                <button onclick="getCode()">GENERATE PAIRING CODE</button>
                <div id="res"></div>
            </div>
            <script>
                async function getCode() {
                    const num = document.getElementById('num').value;
                    const resDiv = document.getElementById('res');
                    if (!num) return alert("Number kothay?");
                    resDiv.innerText = "Please wait... Requesting Session";
                    try {
                        const response = await fetch('/code?number=' + num);
                        const data = await response.json();
                        if (data.code) {
                            resDiv.innerHTML = "YOUR CODE: <br><span style='font-size: 32px; letter-spacing: 5px; color: #00ffcc; display: block; margin-top: 10px; background: #2c3136; padding: 10px; border-radius: 8px;'>" + data.code + "</span>";
                        } else {
                            resDiv.innerText = "Error: " + (data.error || "Failed. Try again.");
                        }
                    } catch (e) {
                        resDiv.innerText = "Server busy. Refresh page.";
                    }
                }
            </script>
        </body>
        </html>
    `);
});

app.get('/code', async (req, res) => {
    let num = req.query.number;
    if (!num) return res.json({ error: "Number missing" });

    try {
        const { state } = await useMultiFileAuthState('session_' + num);
        const sock = makeWASocket({
            auth: state,
            printQRInTerminal: false,
            logger: pino({ level: 'silent' }),
            // Latest Browser to bypass "Couldn't link"
            browser: ["Ubuntu", "Chrome", "110.0.5481.177"]
             
        });

        if (!sock.authState.creds.registered) {
            await delay(5000); 
            const code = await sock.requestPairingCode(num);
            res.json({ code: code });
        } else {
            res.json({ error: "Session exists. Clear 'session' folder." });
        }
    } catch (err) {
        console.log(err);
        res.json({ error: "Try after 1 minute." });
    }
});

app.listen(PORT, () => console.log('Live on ' + PORT));
