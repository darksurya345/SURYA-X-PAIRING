const express = require('express');
const { default: makeWASocket, useMultiFileAuthState, delay, Browsers } = require('@whiskeysockets/baileys');
const pino = require('pino');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>SURYA-X FIXED</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { background: #000; color: #0f0; font-family: monospace; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                .box { border: 2px solid #0f0; padding: 20px; border-radius: 10px; text-align: center; width: 90%; max-width: 350px; }
                input { width: 100%; padding: 10px; margin: 10px 0; background: #111; border: 1px solid #0f0; color: #0f0; text-align: center; }
                button { width: 100%; padding: 10px; background: #0f0; color: #000; border: none; font-weight: bold; cursor: pointer; }
                #res { margin-top: 15px; color: #fff; word-break: break-all; }
            </style>
        </head>
        <body>
            <div class="box">
                <h2>SURYA-X PAIRING</h2>
                <input type="number" id="num" placeholder="91XXXXXXXXXX">
                <button onclick="getCode()">GET CODE</button>
                <div id="res"></div>
            </div>
            <script>
                async function getCode() {
                    const num = document.getElementById('num').value;
                    const resDiv = document.getElementById('res');
                    if (!num) return alert("Number?");
                    resDiv.innerText = "Connecting to WhatsApp...";
                    try {
                        const response = await fetch('/code?number=' + num);
                        const data = await response.json();
                        if (data.code) {
                            resDiv.innerHTML = "CODE: <br><b style='font-size:30px; color:#0f0'>" + data.code + "</b>";
                        } else {
                            resDiv.innerText = "Error: " + (data.error || "Failed");
                        }
                    } catch (e) {
                        resDiv.innerText = "Server Error. Try Refresh.";
                    }
                }
            </script>
        </body>
        </html>
    `);
});

app.get('/code', async (req, res) => {
    let num = req.query.number;
    try {
        // dynamic folder name for every request to avoid "Try after 1 minute"
        const { state } = await useMultiFileAuthState('session_' + Math.floor(Math.random() * 10000));
        const sock = makeWASocket({
            auth: state,
            printQRInTerminal: false,
            logger: pino({ level: 'silent' }),
            browser: Browsers.ubuntu("Chrome")
        });

        if (!sock.authState.creds.registered) {
            await delay(3000);
            const code = await sock.requestPairingCode(num);
            res.json({ code: code });
        }
    } catch (err) {
        res.json({ error: "WhatsApp Busy. Try again." });
    }
});

app.listen(PORT, '0.0.0.0', () => console.log('Live on ' + PORT));
