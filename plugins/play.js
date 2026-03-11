import yts from 'yt-search';
import fg from 'api-dylux';
import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`⚠️ Inserisci il titolo! Esempio: ${usedPrefix + command} Eminem Mockingbird`);

  try {
    // 1. Messaggio di attesa
    await m.reply('⏳ _Sto cercando e scaricando il video, attendi un momento..._');

    // 2. Ricerca su YouTube
    const search = await yts(text);
    const vid = search.videos[0];
    if (!vid) return m.reply('❌ *Nessun risultato trovato.*');

    // Sicurezza: Evita di scaricare video di 3 ore che farebbero esplodere il bot
    if (vid.seconds > 900) {
        return m.reply('❌ *Il video dura più di 15 minuti, è troppo pesante da inviare su WhatsApp! Cerca un video più corto.*');
    }

    let videoUrl = null;

    // --- SISTEMA A TRIPLO MOTORE PER IL VIDEO ---

    // Motore 1: Dylux (Il più affidabile)
    try {
        let video = await fg.ytv(vid.url);
        if (video && video.dl_url) videoUrl = video.dl_url;
    } catch (e1) {
        console.log("Motore 1 video fallito, provo il 2...");
    }

    // Motore 2: Vreden API
    if (!videoUrl) {
        try {
            let res = await fetch(`https://api.vreden.my.id/api/ytmp4?url=${vid.url}`);
            let json = await res.json();
            if (json.result && json.result.download && json.result.download.url) {
                videoUrl = json.result.download.url;
            }
        } catch (e2) {
            console.log("Motore 2 video fallito, provo il 3...");
        }
    }

    // Motore 3: Siputzx
    if (!videoUrl) {
        try {
            let res = await fetch(`https://api.siputzx.my.id/api/d/ytmp4?url=${vid.url}`);
            let json = await res.json();
            if (json.data && json.data.dl) {
                videoUrl = json.data.dl;
            }
        } catch (e3) {
            console.log("Motore 3 video fallito.");
        }
    }

    // Se tutti i server falliscono
    if (!videoUrl) throw new Error("Tutti i server video sono irraggiungibili.");

    // 3. Estetica del messaggio (Didascalia del video)
    let infoMsg = `ㅤㅤ⋆｡˚『 ╭ \`🎬 𝐏𝐋𝐀𝐘 𝐕𝐈𝐃𝐄𝐎 🎬\` ╯ 』˚｡⋆\n╭━━━━━━━━━━━━━━━━━━━━⬣\n`;
    infoMsg += `┃ ➤ 📌 𝐓𝐢𝐭𝐨𝐥𝐨: ${vid.title}\n`;
    infoMsg += `┃ ➤ ⏱️ 𝐃𝐮𝐫𝐚𝐭𝐚: ${vid.timestamp}\n`;
    infoMsg += `┃ ➤ 👀 𝐕𝐢𝐞𝐰𝐬: ${vid.views}\n`;
    infoMsg += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒*`;

    // 4. Invia direttamente il VIDEO
    await conn.sendMessage(m.chat, {
        video: { url: videoUrl },
        caption: infoMsg,
        mimetype: 'video/mp4'
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    m.reply('❌ _Scusa, i server di YouTube al momento bloccano i download. Riprova tra poco!_');
  }
};

handler.help = ['play'];
handler.tags = ['downloader'];
// Puoi usare sia .play che .video
handler.command = /^(play|video)$/i;

export default handler;
