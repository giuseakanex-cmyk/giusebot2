import yts from 'yt-search';
import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  // Se l'utente non scrive la canzone
  if (!text) {
    return m.reply(`╭ ━━━ ❨ ⚠️ 𝐀𝐕𝐕𝐈𝐒𝐎 ❩ ━━━ ╮\n│ ✦ 𝐄𝐑𝐑𝐎𝐑𝐄\n│ ╰➤ Inserisci il titolo di una canzone!\n│ ✦ 𝐄𝐬𝐞𝐦𝐩𝐢𝐨: ${usedPrefix + command} Eminem Mockingbird\n╰ ━━━━━━━━━━━━━ ╯`);
  }

  // Canale Fake per l'estetica
  let contextFake = {
    mentionedJid: [m.sender],
    isForwarded: true,
    forwardingScore: 999,
    forwardedNewsletterMessageInfo: {
      newsletterJid: '120363233544482011@newsletter',
      newsletterName: "✨.✦★彡 Music by Giuse Ξ★✦.•",
      serverMessageId: 100
    }
  };

  try {
    // Messaggio di attesa
    await conn.sendMessage(m.chat, { 
        text: `⏳ _Sto cercando e scaricando *${text}*..._`, 
        contextInfo: contextFake 
    }, { quoted: m });

    // 1. Ricerca su YouTube
    const search = await yts(text);
    const vid = search.videos[0];

    if (!vid) return m.reply('❌ *Nessun risultato trovato per questa ricerca.*');

    // 2. Formattazione del messaggio con l'immagine
    let infoMsg = `ㅤㅤ⋆｡˚『 ╭ \`🎵 𝐏𝐋𝐀𝐘 𝐌𝐔𝐒𝐈𝐂 🎵\` ╯ 』˚｡⋆\n╭━━━━━━━━━━━━━━━━━━━━⬣\n`;
    infoMsg += `┃ ➤ 📌 𝐓𝐢𝐭𝐨𝐥𝐨: ${vid.title}\n`;
    infoMsg += `┃ ➤ ⏱️ 𝐃𝐮𝐫𝐚𝐭𝐚: ${vid.timestamp}\n`;
    infoMsg += `┃ ➤ 👀 𝐕𝐢𝐞𝐰𝐬: ${vid.views}\n`;
    infoMsg += `┃ ➤ 🔗 𝐋𝐢𝐧𝐤: ${vid.url}\n`;
    infoMsg += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒*\n`;
    infoMsg += `_Preparazione Audio e Video in corso..._ 🎧📺`;

    // Invia l'immagine (thumbnail) con la didascalia
    await conn.sendMessage(m.chat, {
      image: { url: vid.thumbnail },
      caption: infoMsg,
      contextInfo: contextFake
    }, { quoted: m });

    // 3. API pubblica per scaricare Audio e Video
    // (Usiamo un'API affidabile per i bot Baileys)
    
    // --- DOWNLOAD AUDIO ---
    const audioApi = `https://api.siputzx.my.id/api/d/ytmp3?url=${vid.url}`;
    const audioRes = await fetch(audioApi);
    const audioData = await audioRes.json();
    
    if (audioData.status && audioData.data.dl) {
        await conn.sendMessage(m.chat, {
            audio: { url: audioData.data.dl },
            mimetype: 'audio/mpeg',
            fileName: vid.title + '.mp3',
            contextInfo: contextFake
        }, { quoted: m });
    } else {
        m.reply('⚠️ _Errore nel server durante il download dell\'audio._');
    }

    // --- DOWNLOAD VIDEO ---
    // Limito il video a 15 minuti (900 secondi) per evitare che WhatsApp crashi
    // per file troppo pesanti. Se è più corto, lo scarica.
    if (vid.seconds < 900) {
        const videoApi = `https://api.siputzx.my.id/api/d/ytmp4?url=${vid.url}`;
        const videoRes = await fetch(videoApi);
        const videoData = await videoRes.json();

        if (videoData.status && videoData.data.dl) {
            await conn.sendMessage(m.chat, {
                video: { url: videoData.data.dl },
                mimetype: 'video/mp4',
                caption: `🎬 *Ecco il tuo video:* ${vid.title}`,
                contextInfo: contextFake
            }, { quoted: m });
        }
    } else {
        m.reply('⚠️ _Il video dura più di 15 minuti. Ho inviato solo l\'audio per evitare blocchi a WhatsApp!_');
    }

  } catch (e) {
    console.error(e);
    m.reply('❌ *Ops! C\'è stato un errore durante il download della canzone.*');
  }
};

handler.help = ['play', 'canzone'];
handler.tags = ['downloader'];
// Puoi usare .play, .canzone o .video
handler.command = /^(play|canzone|video)$/i;

export default handler;
