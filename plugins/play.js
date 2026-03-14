import yts from 'yt-search';
import fetch from 'node-fetch';
import fg from 'api-dylux';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`『 🎵 』 \`Inserisci il titolo della canzone!\`\n\n⟡ _Esempio:_ ${usedPrefix + command} Push it by Kid Yugi`);

  try {
    await m.reply('⏳ _Ricerca sicura tramite modulo interno..._');

    // 1. RICERCA INFALLIBILE (Usa il modulo NPM locale, non cade mai)
    let search = await yts(text);
    let vid = search.videos[0];
    
    if (!vid) return m.reply('❌ *Nessun risultato trovato.*');
    if (vid.seconds > 900) return m.reply('❌ *Il brano supera i 15 minuti, è troppo pesante.*');

    // 2. Grafica Legam Bot
    let infoMsg = `ㅤㅤ⋆｡˚『 ╭ \`🎵 𝐏𝐋𝐀𝐘 𝐌𝐔𝐒𝐈𝐂 🎵\` ╯ 』˚｡⋆\n╭━━━━━━━━━━━━━━━━━━━━⬣\n`;
    infoMsg += `┃ ➤ 📌 𝐓𝐢𝐭𝐨𝐥𝐨: ${vid.title}\n`;
    infoMsg += `┃ ➤ ⏱️ 𝐃𝐮𝐫𝐚𝐭𝐚: ${vid.timestamp}\n`;
    infoMsg += `┃ ➤ 👀 𝐕𝐢𝐞𝐰𝐬: ${vid.views}\n`;
    infoMsg += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒*\n`;
    infoMsg += `🎧 _Infiltrazione server per estrazione audio..._`;

    await conn.sendMessage(m.chat, { image: { url: vid.thumbnail }, caption: infoMsg }, { quoted: m });

    let audioUrl = null;

    // 3. ESTRAZIONE AUDIO (Cascata di emergenza)
    console.log(`Inizio estrazione per: ${vid.url}`);

    // Tentativo 1: Agatz API (Nuova e velocissima)
    try {
        let res = await fetch(`https://api.agatz.xyz/api/ytmp3?url=${vid.url}`);
        let json = await res.json();
        if (json.status === 200 && json.data?.download) {
            audioUrl = json.data.download;
            console.log("✅ Agatz API ha funzionato!");
        }
    } catch (e) { console.log("⚠️ Agatz fallito."); }

    // Tentativo 2: Vreden API
    if (!audioUrl) {
        try {
            let res = await fetch(`https://api.vreden.my.id/api/ytmp3?url=${vid.url}`);
            let json = await res.json();
            if (json.result?.download?.url) {
                audioUrl = json.result.download.url;
                console.log("✅ Vreden API ha funzionato!");
            }
        } catch (e) { console.log("⚠️ Vreden fallito."); }
    }

    // Tentativo 3: Siputzx API
    if (!audioUrl) {
        try {
            let res = await fetch(`https://api.siputzx.my.id/api/d/ytmp3?url=${vid.url}`);
            let json = await res.json();
            if (json.data?.dl) {
                audioUrl = json.data.dl;
                console.log("✅ Siputzx API ha funzionato!");
            }
        } catch (e) { console.log("⚠️ Siputzx fallito."); }
    }

    // Tentativo 4: api-dylux (Libreria interna)
    if (!audioUrl) {
        try {
            let audioDylux = await fg.yta(vid.url);
            if (audioDylux && audioDylux.dl_url) {
                audioUrl = audioDylux.dl_url;
                console.log("✅ Dylux interno ha funzionato!");
            }
        } catch (e) { console.log("⚠️ Dylux fallito."); }
    }

    if (!audioUrl) throw new Error("Tutti i server di estrazione sono bloccati dal CAPTCHA di YouTube.");

    // 4. DOWNLOAD E INVIO (Con finto browser per non farsi bloccare in fase di scaricamento)
    console.log(`Download da: ${audioUrl}`);
    let audioFetch = await fetch(audioUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        }
    });
    
    if (!audioFetch.ok) throw new Error("Il file è stato trovato ma il server non ci permette di scaricarlo.");

    let arrayBuf = await audioFetch.arrayBuffer();
    let mediaBuffer = Buffer.from(arrayBuf);

    await conn.sendMessage(m.chat, {
        audio: mediaBuffer,
        mimetype: 'audio/mpeg',
        fileName: `${vid.title}.mp3`,
        ptt: false 
    }, { quoted: m });

  } catch (e) {
    console.error('[ERRORE PLAY]', e);
    m.reply(`『 ❌ 』 \`Errore:\`\n${e.message}`);
  }
};

handler.help = ['play'];
handler.tags = ['downloader'];
handler.command = /^(play|canzone)$/i;

export default handler;