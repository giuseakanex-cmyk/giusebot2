import yts from 'yt-search';
import ytdl from '@distube/ytdl-core';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`⚠️ Inserisci il titolo! Esempio: ${usedPrefix + command} Push it by Kid yugi`);

  try {
    await m.reply('⏳ _Motore interno avviato, aggancio diretto a YouTube in corso..._');

    // FASE 1: Ricerca
    const search = await yts(text);
    const vid = search.videos[0];
    if (!vid) return m.reply('❌ *Nessun risultato trovato.*');
    if (vid.seconds > 900) return m.reply('❌ *Il brano supera i 15 minuti, è troppo pesante.*');

    // FASE 2: Grafica Legam Bot
    let infoMsg = `ㅤㅤ⋆｡˚『 ╭ \`🎵 𝐏𝐋𝐀𝐘 𝐌𝐔𝐒𝐈𝐂 🎵\` ╯ 』˚｡⋆\n╭━━━━━━━━━━━━━━━━━━━━⬣\n`;
    infoMsg += `┃ ➤ 📌 𝐓𝐢𝐭𝐨𝐥𝐨: ${vid.title}\n`;
    infoMsg += `┃ ➤ ⏱️ 𝐃𝐮𝐫𝐚𝐭𝐚: ${vid.timestamp}\n`;
    infoMsg += `┃ ➤ 👀 𝐕𝐢𝐞𝐰𝐬: ${vid.views}\n`;
    infoMsg += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒*\n`;
    infoMsg += `🎧 _Estrazione locale in corso (bypass server attivati)..._`;

    await conn.sendMessage(m.chat, { image: { url: vid.thumbnail }, caption: infoMsg }, { quoted: m });

    // FASE 3: IL MOTORE INTERNO (@distube/ytdl-core)
    // Non stiamo più usando API esterne. Il bot scarica il flusso audio direttamente da YT.
    const stream = ytdl(vid.url, {
        filter: 'audioonly',
        quality: 'highestaudio',
        highWaterMark: 1 << 25 // Buffer aumentato per non far crashare la memoria
    });

    const chunks = [];
    
    // Raccogliamo i pezzi dell'audio man mano che arrivano
    stream.on('data', (chunk) => {
        chunks.push(chunk);
    });

    // Quando ha finito di scaricare tutto, lo unisce e te lo manda
    stream.on('end', async () => {
        const mediaBuffer = Buffer.concat(chunks);
        await conn.sendMessage(m.chat, {
            audio: mediaBuffer, 
            mimetype: 'audio/mpeg',
            fileName: `${vid.title}.mp3`,
            ptt: false 
        }, { quoted: m });
    });

    // Se YouTube riesce a bloccare anche il motore interno, ce lo dice
    stream.on('error', (err) => {
        console.error('[ERRORE STREAM YTDL]', err);
        m.reply(`❌ *ERRORE MOTORE INTERNO:*\n${err.message}\n\n_YouTube sta applicando un blocco totale in questo momento._`);
    });

  } catch (e) {
    console.error('[ERRORE PLAY]', e);
    m.reply(`❌ *DIAGNOSI ERRORE GENERALE:*\n${e.message}`);
  }
};

handler.help = ['play'];
handler.tags = ['downloader'];
handler.command = /^(play|canzone)$/i;

export default handler;
