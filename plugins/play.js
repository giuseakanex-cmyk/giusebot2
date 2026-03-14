//API DI GIUSE NON PUBBLICHE
import yts from 'yt-search';
import fg from 'api-dylux';
import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`⚠️ Inserisci il titolo! Esempio: ${usedPrefix + command} Eminem Mockingbird`);

  try {
    await m.reply('⏳ _Sto elaborando la traccia, attendi un momento..._');

    // 1. Ricerca su YouTube
    const search = await yts(text);
    const vid = search.videos[0];
    if (!vid) return m.reply('❌ *Nessun risultato trovato.*');

    if (vid.seconds > 900) {
        return m.reply('❌ *Il file è troppo lungo (max 15 min).*');
    }

    // 2. Manda l'immagine estetica
    let infoMsg = `ㅤㅤ⋆｡˚『 ╭ \`🎵 𝐏𝐋𝐀𝐘 𝐌𝐔𝐒𝐈𝐂 🎵\` ╯ 』˚｡⋆\n╭━━━━━━━━━━━━━━━━━━━━⬣\n`;
    infoMsg += `┃ ➤ 📌 𝐓𝐢𝐭𝐨𝐥𝐨: ${vid.title}\n`;
    infoMsg += `┃ ➤ ⏱️ 𝐃𝐮𝐫𝐚𝐭𝐚: ${vid.timestamp}\n`;
    infoMsg += `┃ ➤ 👀 𝐕𝐢𝐞𝐰𝐬: ${vid.views}\n`;
    infoMsg += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒*\n`;
    infoMsg += `🎧 _Estrazione audio in corso..._`;

    await conn.sendMessage(m.chat, {
        image: { url: vid.thumbnail },
        caption: infoMsg
    }, { quoted: m });

    let audioUrl = null;

    // --- MOTORE DI RICERCA MULTIPLO BLINDATO ---
    
    // Tentativo 1: API Ryzendesu (Attualmente la più stabile)
    try {
        let res1 = await fetch(`https://api.ryzendesu.vip/api/downloader/ytmp3?url=${vid.url}`);
        let json1 = await res1.json();
        if (json1.url) audioUrl = json1.url;
    } catch (e) {}

    // Tentativo 2: API Vreden (Fallback 1)
    if (!audioUrl) {
        try {
            let res2 = await fetch(`https://api.vreden.my.id/api/ytmp3?url=${vid.url}`);
            let json2 = await res2.json();
            if (json2.result?.download?.url) audioUrl = json2.result.download.url;
        } catch (e) {}
    }

    // Tentativo 3: Dylux (Fallback 2)
    if (!audioUrl) {
        try {
            let audio = await fg.yta(vid.url);
            if (audio && audio.dl_url) audioUrl = audio.dl_url;
        } catch (e) {}
    }

    if (!audioUrl) throw new Error("Tutte le API di estrazione sono down.");

    // 🏆 IL FIX DEFINITIVO: arrayBuffer() corretto per la tua versione
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
    m.reply('❌ _Scusa, non riesco ad estrarre l\'audio in questo momento. Riprova più tardi!_');
  }
};

handler.help = ['play'];
handler.tags = ['downloader'];
handler.command = /^(play|canzone)$/i;

export default handler;
