const express = require('express');
const { default: makeWASocket, useMultiFileAuthState, delay, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>SURYA-X PAIRING CODE</title>
            <style>
                body { font-family: 'Segoe UI', sans-serif; background: #0f172a; color: white; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                .container { background: #1e293b; padding: 30px; border-radius: 15px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); text-align: center; width: 320px; }
                h1 { color: #22c55e; margin-bottom: 20px; }
                input { width: 90%; padding: 12px; margin-bottom: 20px; border-radius: 8px; border: 1px solid #334155; background: #334155; color: white; font-size: 16px; outline: none; }
                button { background: #22c55e; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold; width: 100%; transition: 0.3s; }
                #result { margin-top: 25px; font-size: 20px; font-weight: bold; color: #fbbf24; word-break: break-all; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>SURYA-X</h1>
                <p>Enter number with country code</p>
                <input type="number" id="num" placeholder="e.g. 917797099719">
                <button onclick="getCode()">Get Pairing Code</button>
                <div id="result"></div>
            </div>
            <script>
                async function getCode() {
                    const num = document.getElementById('num').value;
                    const resDiv = document.getElementById('result');
                    if (!num) return alert("Please enter number!");
                    resDiv.innerText = "Generating... Please wait";
                    try {
                        const response = await fetch('/code?number=' + num);
                        const data = await response.json();
                        if (data.code) {
                            resDiv.innerHTML = "Your Code: <span style='color:white; background:#22c55e; padding:5px 10px; border-radius:5px;'>" + data.code + "</span>";
                        } else {
                            resDiv.innerText = "Error: " + (data.error || "Try again");
                        }
                    } catch (e) {
                        resDiv.innerText = "Server Error. Try again later.";
                    }
                }
            </script>
        </body>
        </html>
    `);
});

app.get('/code', async (req, res) => {
    let num = req.query.number;
    if (!num) return res.status(400).json({ error: "Number is required" });

    try {
        const { state, saveCreds } = await useMultiFileAuthState('temp_session_' + num);
        const sock = makeWASocket({
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
            },
            printQRInTerminal: false,
            logger: pino({ level: 'silent' }),
            browser: ["SURYA-X", "Chrome", "1.0.0"]
        });

        if (!sock.authState.creds.registered) {
            await delay(1500); // Thora wait koro connection stable hote
            const code = await sock.requestPairingCode(num);
            res.json({ code: code });
        } else {
            res.json({ error: "Already registered or error" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Service Error" });
    }
});

app.listen(PORT, () => console.log('SURYA-X Server is live on port ' + PORT));
