const express = require('express');
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');
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
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f172a; color: white; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                .container { background: #1e293b; padding: 30px; border-radius: 15px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); text-align: center; width: 350px; }
                h1 { color: #22c55e; margin-bottom: 20px; }
                input { width: 90%; padding: 12px; margin-bottom: 20px; border-radius: 8px; border: 1px solid #334155; background: #334155; color: white; font-size: 16px; outline: none; }
                button { background: #22c55e; color: white; border: none; padding: 12px 25px; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold; width: 100%; transition: 0.3s; }
                button:hover { background: #16a34a; }
                #result { margin-top: 25px; font-size: 20px; font-weight: bold; color: #fbbf24; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>SURYA-X</h1>
                <p>Enter number with country code</p>
                <input type="number" id="num" placeholder="Example: 91XXXXXXXXXX">
                <button onclick="getCode()">Get Pairing Code</button>
                <div id="result"></div>
            </div>
            <script>
                async function getCode() {
                    const num = document.getElementById('num').value;
                    const resDiv = document.getElementById('result');
                    if (!num) return alert("Number kothay?");
                    resDiv.innerText = "Please wait...";
                    try {
                        const response = await fetch('/pair?number=' + num);
                        const data = await response.json();
                        if (data.code) {
                            resDiv.innerHTML = "Code: <span style='color:#fff'>" + data.code + "</span>";
                        } else {
                            resDiv.innerText = "Error! Try again.";
                        }
                    } catch (e) {
                        resDiv.innerText = "Error connecting to server.";
                    }
                }
            </script>
        </body>
        </html>
    `);
});

app.get('/pair', async (req, res) => {
    let num = req.query.number;
    if (!num) return res.send({ error: "Number missing" });
    try {
        const { state } = await useMultiFileAuthState('temp_session');
        const sock = makeWASocket({
            auth: state,
            logger: pino({ level: 'silent' }),
            browser: ["SURYA-X", "Chrome", "1.0.0"]
        });
        if (!sock.authState.creds.registered) {
            let code = await sock.requestPairingCode(num);
            res.send({ code: code });
        }
    } catch (err) {
        res.send({ error: "Connection error" });
    }
});

app.listen(PORT, () => console.log('SURYA-X Pairing Site Online!'));
      
