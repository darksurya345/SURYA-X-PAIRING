const express = require('express');
const { default: makeWASocket, useMultiFileAuthState, delay, Browsers, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const pino = require('pino');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Server is Running! Go to /code?number=your_number to get code.');
});

app.get('/code', async (req, res) => {
    let num = req.query.number;
    if (!num) return res.json({ error: "Number add koro!" });

    try {
        const { state, saveCreds } = await useMultiFileAuthState('session_auth');
        const sock = makeWASocket({
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
            },
            printQRInTerminal: false,
            logger: pino({ level: 'silent' }),
            browser: Browsers.ubuntu("Chrome")
        });

        if (!sock.authState.creds.registered) {
            await delay(2000);
            const code = await sock.requestPairingCode(num);
            res.json({ code: code });
        } else {
            res.json({ error: "Already paired! Session folder delete koro." });
        }
    } catch (err) {
        res.json({ error: "WhatsApp block korche. Ektu por try koro." });
    }
});

app.listen(PORT, '0.0.0.0', () => console.log('Live on ' + PORT));
        
