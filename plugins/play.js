//API Key by Giuse 
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
    // 1. Ricerca
    const search = await yts(text);
    const vid = search.videos[0];
    if (!vid) return m.reply('❌ *Nessun risultato trovato.*');

    // 2. Info Immagine con BOTTONE per il video
    let infoMsg = `ㅤㅤ⋆｡˚『 ╭ \`🎵 𝐏𝐋𝐀𝐘 𝐌𝐔𝐒𝐈𝐂 🎵\` ╯ 』˚｡⋆\n╭━━━━━━━━━━━━━━━━━━━━⬣\n`;
    infoMsg += `┃ ➤ 📌 𝐓𝐢𝐭𝐨𝐥𝐨: ${vid.title}\n`;
    infoMsg += `┃ ➤ ⏱️ 𝐃𝐮𝐫𝐚𝐭𝐚: ${vid.timestamp}\n`;
    infoMsg += `┃ ➤ 👀 𝐕𝐢𝐞𝐰𝐬: ${vid.views}\n`;
    infoMsg += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒*\n`;
    infoMsg += `🎧 _Elaborazione traccia audio..._`;

    await conn.sendMessage(m.chat, {
      image: { url: vid.thumbnail },
      caption: infoMsg,
      footer: "✨ 𝐆𝐈𝐔𝐒𝐄𝐁𝐎𝐓 ✨",
      buttons: [
        { buttonId: `${usedPrefix}video ${vid.url}`, buttonText: { displayText: "🎥 𝐒𝐜𝐚𝐫𝐢𝐜𝐚 𝐕𝐢𝐝𝐞𝐨" }, type: 1 }
      ],
      headerType: 4,
      contextInfo: contextFake
    }, { quoted: m });

    // 3. Download URL Audio
    let audioUrl;
    try {
        let audio = await fg.yta(vid.url);
        audioUrl = audio.dl_url;
    } catch (e) {
        let res = await fetch(`https://api.vreden.my.id/api/ytmp3?url=${vid.url}`);
        let json = await res.json();
        audioUrl = json.result?.download?.url || json.url;
    }

    if (!audioUrl) throw new Error("API Down");

    // 🏆 LA MAGIA E' QUI: Scarichiamo il file in Buffer prima di mandarlo!
    let response = await fetch(audioUrl);
    let arrayBuffer = await response.arrayBuffer();
    let audioBuffer = Buffer.from(arrayBuffer);

    // Invia il Buffer reale (niente più "file non disponibile")
    await conn.sendMessage(m.chat, {
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        fileName: vid.title + '.mp3',
        contextInfo: contextFake
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    m.reply('❌ _Errore di conversione. Il brano potrebbe essere protetto da copyright, riprova con un\'altra canzone!_');
  }
};

handler.help = ['play'];
handler.tags = ['downloader'];
handler.command = /^(play|canzone)$/i;

export default handler;
