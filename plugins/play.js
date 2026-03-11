//API KEYS BY GIUSE,CHIEDERE PRIMA DI UTILIZZARE
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
        return m.reply('❌ *Il file è troppo lungo e pesante per essere elaborato (max 15 min).*');
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

    let videoUrl = null;

    // --- MOTORE DI RICERCA VIDEO (MP4) ---
    // Usiamo le API del video perché sappiamo che funzionano bene!
    
    try {
        let video = await fg.ytv(vid.url);
        if (video && video.dl_url) videoUrl = video.dl_url;
    } catch (e1) {
        if (!videoUrl) {
            try {
                let res = await fetch(`https://api.vreden.my.id/api/ytmp4?url=${vid.url}`);
                let json = await res.json();
                if (json.result?.download?.url) videoUrl = json.result.download.url;
            } catch (e2) {
                try {
                    let res = await fetch(`https://api.siputzx.my.id/api/d/ytmp4?url=${vid.url}`);
                    let json = await res.json();
                    if (json.data?.dl) videoUrl = json.data.dl;
                } catch (e3) {
                    throw new Error("Tutti i server sono irraggiungibili.");
                }
            }
        }
    }

    if (!videoUrl) throw new Error("Errore estrazione link.");

    // 🏆 IL TRUCCO MAGICO: Scarichiamo il video ma lo inviamo come AUDIO
    let resBuffer = await fetch(videoUrl);
    let mediaBuffer = Buffer.from(await resBuffer.arrayBuffer());

    await conn.sendMessage(m.chat, {
        audio: mediaBuffer, 
        mimetype: 'audio/mp4', // Diciamo a WhatsApp che è un audio basato su mp4 (M4A)
        fileName: `${vid.title}.mp3`,
        ptt: false // PTT = false significa che appare come canzone, non come nota vocale
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    m.reply('❌ _Scusa, non riesco ad estrarre l\'audio in questo momento. Riprova più tardi!_');
  }
};

handler.help = ['play'];
handler.tags = ['downloader'];
handler.command = /^(play|canzone)$/i;

export default handler;
