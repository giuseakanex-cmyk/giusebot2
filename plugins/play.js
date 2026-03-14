import yts from 'yt-search';
import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`⚠️ Inserisci il titolo!`);

  try {
    await m.reply('⏳ _Tentativo di aggiramento del blocco CAPTCHA di YouTube..._');

    // FASE 1: Ricerca
    const search = await yts(text);
    const vid = search.videos[0];
    if (!vid) return m.reply('❌ *Nessun risultato trovato.*');
    if (vid.seconds > 900) return m.reply('❌ *Troppo lungo (max 15 min).*');

    // FASE 2: Grafica Legam Bot
    let infoMsg = `ㅤㅤ⋆｡˚『 ╭ \`🎵 𝐏𝐋𝐀𝐘 𝐌𝐔𝐒𝐈𝐂 🎵\` ╯ 』˚｡⋆\n╭━━━━━━━━━━━━━━━━━━━━⬣\n`;
    infoMsg += `┃ ➤ 📌 𝐓𝐢𝐭𝐨𝐥𝐨: ${vid.title}\n`;
    infoMsg += `┃ ➤ ⏱️ 𝐃𝐮𝐫𝐚𝐭𝐚: ${vid.timestamp}\n`;
    infoMsg += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒*\n`;
    infoMsg += `🎧 _Infiltrazione nei server in corso..._`;

    await conn.sendMessage(m.chat, { image: { url: vid.thumbnail }, caption: infoMsg }, { quoted: m });

    let audioUrl = null;

    // FASE 3: API STEALTH (Aggirano il blocco Bot)
    const stealthApis = [
        `https://bk9.fun/download/ytmp3?url=${vid.url}`,
        `https://api.giftedtech.my.id/api/download/ytmp3?url=${vid.url}`,
        `https://api.davidcyriltech.my.id/download/ytmp3?url=${vid.url}`,
        `https://api.agatz.xyz/api/ytmp3?url=${vid.url}`
    ];

    for (let api of stealthApis) {
        try {
            let res = await fetch(api);
            let json = await res.json();
            
            // Ogni API ha una risposta diversa, il bot le controlla tutte
            if (json.BK9) audioUrl = json.BK9;
            else if (json.url) audioUrl = json.url;
            else if (json.result?.download?.url) audioUrl = json.result.download.url;
            else if (json.data?.dl) audioUrl = json.data.dl;
            else if (json.result?.url) audioUrl = json.result.url;

            if (audioUrl) {
                console.log("✅ API Stealth funzionante trovata!");
                break; 
            }
        } catch (e) {
            console.log("⚠️ Un'API Stealth è caduta, passo alla prossima...");
        }
    }

    if (!audioUrl) throw new Error("Tutti i server stealth sono stati respinti dal CAPTCHA di YouTube.");

    // FASE 4: Download finale
    let resBuffer = await fetch(audioUrl);
    let mediaBuffer = Buffer.from(await resBuffer.arrayBuffer());

    await conn.sendMessage(m.chat, {
        audio: mediaBuffer, 
        mimetype: 'audio/mpeg',
        fileName: `${vid.title}.mp3`,
        ptt: false 
    }, { quoted: m });

  } catch (e) {
    console.error('[ERRORE PLAY]', e);
    m.reply(`❌ *ERRORE:* ${e.message}\n_YouTube è blindato. Stiamo aspettando che gli hacker aggiornino i server._`);
  }
};

handler.help = ['play'];
handler.tags = ['downloader'];
handler.command = /^(play|canzone)$/i;

export default handler;
