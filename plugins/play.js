import yts from 'yt-search';
import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`⚠️ Inserisci il titolo! Esempio: ${usedPrefix + command} Eminem Mockingbird`);

  // Canale fake (SOLO PER L'IMMAGINE)
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
    const search = await yts(text);
    const vid = search.videos[0];
    if (!vid) return m.reply('❌ *Nessun risultato trovato.*');

    let infoMsg = `ㅤㅤ⋆｡˚『 ╭ \`🎵 𝐏𝐋𝐀𝐘 𝐌𝐔𝐒𝐈𝐂 🎵\` ╯ 』˚｡⋆\n╭━━━━━━━━━━━━━━━━━━━━⬣\n`;
    infoMsg += `┃ ➤ 📌 𝐓𝐢𝐭𝐨𝐥𝐨: ${vid.title}\n`;
    infoMsg += `┃ ➤ ⏱️ 𝐃𝐮𝐫𝐚𝐭𝐚: ${vid.timestamp}\n`;
    infoMsg += `┃ ➤ 👀 𝐕𝐢𝐞𝐰𝐬: ${vid.views}\n`;
    infoMsg += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒*\n`;
    infoMsg += `🎧 _Scaricamento traccia audio..._`;

    // 1. Manda l'immagine col bottone (QUI IL CANALE FAKE CI STA BENISSIMO)
    await conn.sendMessage(m.chat, {
      image: { url: vid.thumbnail },
      caption: infoMsg,
      footer: "✨ 𝐆𝐈𝐔𝐒𝐄𝐁𝐎𝐓 ✨",
      buttons: [
        { buttonId: `${usedPrefix}ytv ${vid.url}`, buttonText: { displayText: "🎥 𝐒𝐜𝐚𝐫𝐢𝐜𝐚 𝐕𝐢𝐝𝐞𝐨" }, type: 1 }
      ],
      headerType: 4,
      contextInfo: contextFake 
    }, { quoted: m });

    // 2. Download Audio
    let apiAudio = await fetch(`https://api.siputzx.my.id/api/d/ytmp3?url=${vid.url}`);
    let jsonAudio = await apiAudio.json();
    let audioUrl = jsonAudio?.data?.dl;

    if (!audioUrl) throw new Error("Link audio non trovato");

    // Prepara il file
    let res = await fetch(audioUrl);
    if (!res.ok) throw new Error("Errore nel fetch del buffer");
    let audioBuffer = Buffer.from(await res.arrayBuffer());

    // 🏆 3. INVIA AUDIO (FIX PER IPHONE) 🏆
    await conn.sendMessage(m.chat, {
        audio: audioBuffer,
        mimetype: 'audio/mpeg', // MP3 puro
        fileName: `${vid.title}.mp3`,
        ptt: false,
        // FORZIAMO LA RIMOZIONE DI QUALSIASI CANALE FAKE GLOBALE
        contextInfo: {} 
    }); 
    // NOTA: Ho tolto anche { quoted: m }! Così arriva come messaggio pulito e non si bugga su iOS.

  } catch (e) {
    console.error(e);
    m.reply('❌ _Impossibile scaricare questa canzone. Riprova tra poco!_');
  }
};

handler.help = ['play'];
handler.tags = ['downloader'];
handler.command = /^(play|canzone)$/i;

export default handler;
