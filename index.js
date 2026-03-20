const express = require('express');
const { default: makeWASocket, useMultiFileAuthState, delay, Browsers, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const pino = require('pino');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Server Active! Use /code?number=91XXXXXXXXXX');
});

app.get('/code', async (req, res) => {
    let num = req.query.number;
    if (!num) return res.json({ error: "Number add koro!" });

    try {
        // dynamic path for every session to clear old errors
        const { state, saveCreds } = await useMultiFileAuthState('session_' + Math.floor(Math.random() * 1000));
        const sock = makeWASocket({
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
            },
            printQRInTerminal: false,
            logger: pino({ level: 'silent' }),
            // Latest Chrome version mimic to bypass security
            browser: ["Ubuntu", "Chrome", "121.0.6167.160"] 
        });

        if (!sock.authState.creds.registered) {
            // delay increase kora hoyeche jate connection stable hoy
            await delay(10000); 
            const code = await sock.requestPairingCode(num);
            res.json({ code: code });
        }
    } catch (err) {
        console.log(err);
        res.json({ error: "Try again after 30 seconds." });
    }
});

app.listen(PORT, '0.0.0.0', () => console.log('SURYA-X Server Live!'));
            
