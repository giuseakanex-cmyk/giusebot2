import yts from 'yt-search';
import fg from 'api-dylux';
import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`╭ ━━━ ❨ ⚠️ 𝐀𝐕𝐕𝐈𝐒𝐎 ❩ ━━━ ╮\n│ ✦ 𝐄𝐑𝐑𝐎𝐑𝐄\n│ ╰➤ Inserisci il titolo di una canzone!\n│ ✦ 𝐄𝐬𝐞𝐦𝐩𝐢𝐨: ${usedPrefix + command} Eminem Mockingbird\n╰ ━━━━━━━━━━━━━ ╯`);
  }

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
    await conn.sendMessage(m.chat, { 
        text: `⏳ _Sto cercando *${text}*..._`, 
        contextInfo: contextFake 
    }, { quoted: m });

    // 1. Ricerca
    const search = await yts(text);
    const vid = search.videos[0];

    if (!vid) return m.reply('❌ *Nessun risultato trovato per questa ricerca.*');

    // 2. Info Immagine
    let infoMsg = `ㅤㅤ⋆｡˚『 ╭ \`🎵 𝐏𝐋𝐀𝐘 𝐌𝐔𝐒𝐈𝐂 🎵\` ╯ 』˚｡⋆\n╭━━━━━━━━━━━━━━━━━━━━⬣\n`;
    infoMsg += `┃ ➤ 📌 𝐓𝐢𝐭𝐨𝐥𝐨: ${vid.title}\n`;
    infoMsg += `┃ ➤ ⏱️ 𝐃𝐮𝐫𝐚𝐭𝐚: ${vid.timestamp}\n`;
    infoMsg += `┃ ➤ 👀 𝐕𝐢𝐞𝐰𝐬: ${vid.views}\n`;
    infoMsg += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒*\n`;
    infoMsg += `_Download in corso, attendi qualche secondo..._ 🎧`;

    await conn.sendMessage(m.chat, {
      image: { url: vid.thumbnail },
      caption: infoMsg,
      contextInfo: contextFake
    }, { quoted: m });

    // 3. Download Audio (Doppio sistema di sicurezza)
    let audioUrl;
    try {
        // Tenta col metodo principale (più stabile)
        let audio = await fg.yta(vid.url);
        audioUrl = audio.dl_url;
    } catch (e) {
        // Se fallisce, tenta con l'API di riserva
        console.log("Metodo 1 fallito, provo API di riserva...");
        let res = await fetch(`https://api.vreden.my.id/api/ytmp3?url=${vid.url}`);
        let json = await res.json();
        audioUrl = json.result?.download?.url || json.url;
    }

    if (!audioUrl) throw new Error("Entrambi i server down");

    // Invia Audio
    await conn.sendMessage(m.chat, {
        audio: { url: audioUrl },
        mimetype: 'audio/mpeg',
        fileName: vid.title + '.mp3',
        contextInfo: contextFake
    }, { quoted: m });

    // 4. Download Video (se sotto i 15 min per non laggare)
    if (vid.seconds < 900) {
        let videoUrl;
        try {
            let video = await fg.ytv(vid.url);
            videoUrl = video.dl_url;
        } catch (e) {
            let res = await fetch(`https://api.vreden.my.id/api/ytmp4?url=${vid.url}`);
            let json = await res.json();
            videoUrl = json.result?.download?.url || json.url;
        }

        if (videoUrl) {
            await conn.sendMessage(m.chat, {
                video: { url: videoUrl },
                mimetype: 'video/mp4',
                caption: `🎬 *Ecco il tuo video:* ${vid.title}`,
                contextInfo: contextFake
            }, { quoted: m });
        }
    }

  } catch (e) {
    console.error(e);
    m.reply('❌ _Scusa, i server di YouTube al momento stanno bloccando i download. Riprova tra poco!_');
  }
};

handler.help = ['play', 'canzone'];
handler.tags = ['downloader'];
handler.command = /^(play|canzone|video)$/i;

export default handler;
