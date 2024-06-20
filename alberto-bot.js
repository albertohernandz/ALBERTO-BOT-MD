// Modulos
const { default: makeWASocket, makeInMemoryStore, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const figlet = require('figlet');
const gradient = require('gradient-string');
const fs = require('fs');
const pino = require('pino');
const { Boom } = require('@hapi/boom');

// Banner
const ascii = 'Alberto Bot';
figlet(ascii, { font: 'Fire Font-s' }, function (err, data) {
    if (err) {
        console.log('Error al cargar el banner...');
        console.dir(err);
        return;
    }
    console.log(gradient.rainbow(data));
    console.log('==============================');
    console.log('  ### WhatsApp Bot Info ###');
    console.log('[*]', gradient.rainbow('Autor: Alberto Hernandez'));
    console.log('[*]', gradient.rainbow('Repositorio: https://github.com/albertohernandz'));
    console.log('[*]', gradient.rainbow('Version: 1.0.0'));
    console.log('==============================');
    console.log('👉 ESCANEA EL CODIGO QR 👈');
});

// Conexion
async function connectToWhatsApp() {
    const store = makeInMemoryStore({
        logger: pino().child({ level: "silent", Stream: "store" })
    });
    const auth = await useMultiFileAuthState('./Alberto-Bot Session');
    const alberto = makeWASocket({
        // can provide additional config here
        printQRInTerminal: true,
        browser: ["ALBERTO-BOT-MD", "Opera", "1.0.0"],
        auth: auth.state,
        logger: pino({ level: "silent" })
    });
    alberto.ev.on("creds.update", auth.saveCreds);
    store.bind(alberto.ev)

    alberto.ev.on('chats.set', () => {
        console.log('got chats', store.chats.all())
    });

    alberto.ev.on('contacts.set', () => {
        console.log('got contacts', Object.values(store.contacts))
    });

    alberto.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update
        if (connection === "close") {
            const shouldReconnect = (lastDisconnect.error = Boom)?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect)
            // reconnect if not logged out
            if (shouldReconnect) {
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            console.log("\n✅ La sesion se inicio correctamente\nWhatsApp Bot Number: " + alberto.user.id.split(":")[0]);
        }
    });
    alberto.ev.on("messages.upsert", async ({ messages }) => {
        // console.log(JSON.stringify(messages, undefined, 2));
        for (let m of messages) {
            let msg = m.message.conversation?.toLowerCase();
            if (!m.key.fromMe) {
                const menuBot = `
Hola!! ${m.pushName} ¿Cómo le vá? 👀✨
~𝑩𝒊𝒆𝒏𝒗𝒆𝒏𝒊𝒅@ 𝒂 𝑨𝑳𝑩𝑬𝑹𝑻𝑶-𝑩𝑶𝑻 𝑴𝑫~

. . . . . . . . . . . . . . ( 🌐 )
..⃗. 🔥 •̩̩͙⁺° 𝐌𝐞𝐧𝐮 𝐩𝐫𝐢𝐧𝐜𝐢𝐩𝐚𝐥 .·˚ ༘ ◡̈
· ───────── ·

╭┈ ↷

│👨🏻‍🔧│ଽ : : :   #ᴄʀᴇᴀᴅᴏʀ

│🏖️│ଽ : : :   #ɪᴍᴀɢᴇɴ

│⏯️│ଽ : : :   #ᴠɪᴅᴇᴏ

│🧩│ଽ : : :   #sᴛɪᴄᴋᴇʀ

│🎁│ଽ : : :   #ɢɪғ

│🎧│ଽ : : :   #ᴀᴜᴅɪᴏ

│❤️│ଽ : : :   #ʏᴛ

╰─────────────────

By: Alberto Hernandez
`
                // #Comandos basicos del bot
                switch (msg) {
                    // Envia el menu del bot
                    case '#menu':
                        await alberto.sendMessage(m.key.remoteJid, {
                            image: fs.readFileSync('./multimedia/logo_bot.jpeg'),
                            caption: menuBot
                        }, { quoted: m });
                        await alberto.sendMessage(m.key.remoteJid,
                            { audio: { url: "./multimedia/intro.mpeg" }, mimetype: 'audio/mp4' },
                            { url: "./multimedia/intro.mpeg" }, { quoted: m });
                        break;
                    // Envia el nombre del owner
                    case '#creador':
                        await alberto.sendMessage(m.key.remoteJid, { text: 'Mi creador es Alberto Hernandez crack 👽' }, { quoted: m });
                        break;
                    // Envia una imagen
                    case '#imagen':
                        await alberto.sendMessage(m.key.remoteJid, {
                            image: fs.readFileSync('./multimedia/imagen.jpeg'),
                            caption: `Hola soy un bot`
                        }, { quoted: m });
                        break;
                    // Envia un video
                    case '#video':
                        await alberto.sendMessage(m.key.remoteJid, {
                            video: fs.readFileSync('./multimedia/video.mp4'),
                            caption: `Las palomas no son sucias 🕊️`
                        }, { quoted: m });
                        break;
                    // Envia un sticker
                    case '#sticker':
                        await alberto.sendMessage(m.key.remoteJid, { sticker: fs.readFileSync('./multimedia/sticker.webp') }, { quoted: m });
                        break;
                    // Envia un gif
                    case '#gif':
                        await alberto.sendMessage(m.key.remoteJid, {
                            video: fs.readFileSync('./multimedia/video-gif.mp4'),
                            gifPlayback: true,
                            // ptv: false
                        }, { quoted: m });
                        break;
                    // Envia un audio
                    case '#audio':
                        await alberto.sendMessage(m.key.remoteJid,
                            { audio: { url: "./multimedia/audio.mp4" }, mimetype: 'audio/mp4' },
                            { url: "./multimedia/audio.mp4" }, { quoted: m });
                        break;
                    // Canal de YouTube
                    case '#yt':
                        await alberto.sendMessage(m.key.remoteJid, { text: '*Suscribete a mi canal de YouTube*\nhttps://www.youtube.com/@hernandezalberto009' }, { quoted: m });
                        break;
                    // Respuesta por default si uno de los comandos es invalido.
                    default:
                        await alberto.sendMessage(m.key.remoteJid, { text: 'El comando no es valido, por favor escribe #menu' }, { quoted: m });
                        break;
                }
            }
        }
    });
}

// run in main file
connectToWhatsApp();