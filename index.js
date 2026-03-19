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

app.get('/', (req, res) => {
    // Agey dewa HTML design-ta ekhane thakbe (Same thakle hobe)
    res.send(`<!DOCTYPE html>...`); // HTML part-ta kete diye uporer moto design-e thakte dao
});

app.get('/code', async (req, res) => {
    let num = req.query.number;
    if (!num) return res.status(400).json({ error: "Number missing" });

    try {
        const { state, saveCreds } = await useMultiFileAuthState('session_' + num);
        const sock = makeWASocket({
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
            },
            printQRInTerminal: false,
            logger: pino({ level: 'silent' }),
            // Professional Browser Setting (Eita change korle block hobe na)
            browser: Browsers.macOS("Desktop") 
        });

        if (!sock.authState.creds.registered) {
            await delay(2000); // 2 second opekkha connection stable korte
            const code = await sock.requestPairingCode(num);
            res.json({ code: code });
        } else {
            res.json({ error: "Already paired or session error" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Server busy. Try again." });
    }
});

app.listen(PORT, () => console.log('SURYA-X Server Live!'));
