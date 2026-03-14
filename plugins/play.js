import yts from 'yt-search';
import fetch from 'node-fetch';
import fg from 'api-dylux';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`『 🎵 』 \`Inserisci il titolo della canzone!\`\n\n⟡ _Esempio:_ ${usedPrefix + command} Push it by Kid Yugi`);

  try {
    await m.reply('⏳ _Avvio ricerca tattica della traccia..._');

    // FASE 1: Ricerca video
    let search;
    try {
        search = await yts(text);
    } catch (e) {
        return m.reply('❌ *Errore nella ricerca su YouTube. Riprova tra poco.*');
    }

    const vid = search.videos[0];
    if (!vid) return m.reply('❌ *Nessun risultato trovato per questa canzone.*');
    if (vid.seconds > 900) return m.reply('❌ *Il brano supera i 15 minuti, è troppo pesante.*');

    // FASE 2: Grafica Legam Bot
    let infoMsg = `ㅤㅤ⋆｡˚『 ╭ \`🎵 𝐏𝐋𝐀𝐘 𝐌𝐔𝐒𝐈𝐂 🎵\` ╯ 』˚｡⋆\n╭━━━━━━━━━━━━━━━━━━━━⬣\n`;
    infoMsg += `┃ ➤ 📌 𝐓𝐢𝐭𝐨𝐥𝐨: ${vid.title}\n`;
    infoMsg += `┃ ➤ ⏱️ 𝐃𝐮𝐫𝐚𝐭𝐚: ${vid.timestamp}\n`;
    infoMsg += `┃ ➤ 👀 𝐕𝐢𝐞𝐰𝐬: ${vid.views}\n`;
    infoMsg += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒*\n`;
    infoMsg += `🎧 _Aggancio ai server Cobalt in corso..._`;

    await conn.sendMessage(m.chat, { image: { url: vid.thumbnail }, caption: infoMsg }, { quoted: m });

    let audioUrl = null;

    // FASE 3: MOTORE COBALT (Bypassa i blocchi di YouTube)
    try {
        let resCobalt = await fetch('https://api.cobalt.tools/api/json', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Origin': 'https://cobalt.tools',
                'Referer': 'https://cobalt.tools/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
            },
            body: JSON.stringify({
                url: vid.url,
                isAudioOnly: true,
                aFormat: 'mp3'
            })
        });
        
        let jsonCobalt = await resCobalt.json();
        if (jsonCobalt && jsonCobalt.url) {
            audioUrl = jsonCobalt.url;
            console.log("✅ Cobalt API ha funzionato!");
        }
    } catch (e) {
        console.log("⚠️ Cobalt fallito, passo ad API-Dylux...");
    }

    // PIANO B: La libreria interna (api-dylux)
    if (!audioUrl) {
        try {
            let audioDylux = await fg.yta(vid.url);
            if (audioDylux && audioDylux.dl_url) {
                audioUrl = audioDylux.dl_url;
                console.log("✅ Dylux ha funzionato!");
            }
        } catch (e) {
            console.log("⚠️ Dylux fallito, passo al Piano C...");
        }
    }

    // PIANO C: Ultima spiaggia (GiftedTech)
    if (!audioUrl) {
        try {
            let resGifted = await fetch(`https://api.giftedtech.my.id/api/download/ytmp3?url=${vid.url}`);
            let jsonGifted = await resGifted.json();
            if (jsonGifted.result?.download?.url) audioUrl = jsonGifted.result.download.url;
            else if (jsonGifted.result?.url) audioUrl = jsonGifted.result.url;
        } catch (e) {
            console.log("⚠️ Anche GiftedTech è offline.");
        }
    }

    if (!audioUrl) throw new Error("YouTube sta bloccando tutte le estrazioni. I server sono caduti.");

    // FASE 4: Download Finale e Invio
    let audioRes = await fetch(audioUrl);
    if (!audioRes.ok) throw new Error("Il file audio non è raggiungibile o è corrotto.");
    
    let arrayBuf = await audioRes.arrayBuffer();
    let mediaBuffer = Buffer.from(arrayBuf);

    await conn.sendMessage(m.chat, {
        audio: mediaBuffer,
        mimetype: 'audio/mpeg',
        fileName: `${vid.title}.mp3`,
        ptt: false 
    }, { quoted: m });

  } catch (e) {
    console.error('[ERRORE PLAY]', e);
    m.reply(`『 ❌ 』 \`Sistema In Down:\`\n${e.message}`);
  }
};

handler.help = ['play'];
handler.tags = ['downloader'];
handler.command = /^(play|canzone)$/i;

export default handler;


