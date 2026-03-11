import yts from 'yt-search';
import fg from 'api-dylux';
import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`⚠️ Inserisci il titolo! Esempio: ${usedPrefix + command} Eminem Mockingbird`);

  try {
    // 1. Ricerca del video
    const search = await yts(text);
    const vid = search.videos[0];
    if (!vid) return m.reply('❌ *Nessun risultato trovato.*');

    let infoMsg = `ㅤㅤ⋆｡˚『 ╭ \`🎵 𝐏𝐋𝐀𝐘 𝐌𝐔𝐒𝐈𝐂 🎵\` ╯ 』˚｡⋆\n╭━━━━━━━━━━━━━━━━━━━━⬣\n`;
    infoMsg += `┃ ➤ 📌 𝐓𝐢𝐭𝐨𝐥𝐨: ${vid.title}\n`;
    infoMsg += `┃ ➤ ⏱️ 𝐃𝐮𝐫𝐚𝐭𝐚: ${vid.timestamp}\n`;
    infoMsg += `┃ ➤ 👀 𝐕𝐢𝐞𝐰𝐬: ${vid.views}\n`;
    infoMsg += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒*\n`;
    infoMsg += `🎧 _Scaricamento traccia audio..._`;

    // 2. Invio immagine con bottone (SENZA CANALE FAKE)
    await conn.sendMessage(m.chat, {
      image: { url: vid.thumbnail },
      caption: infoMsg,
      footer: "✨ 𝐆𝐈𝐔𝐒𝐄𝐁𝐎𝐓 ✨",
      buttons: [
        { buttonId: `${usedPrefix}ytv ${vid.url}`, buttonText: { displayText: "🎥 𝐒𝐜𝐚𝐫𝐢𝐜𝐚 𝐕𝐢𝐝𝐞𝐨" }, type: 1 }
      ],
      headerType: 4
    }, { quoted: m });

    let audioUrl = null;

    // --- SISTEMA A TRIPLO MOTORE ---

    // Motore 1: Dylux (Il più stabile)
    try {
        let audio = await fg.yta(vid.url);
        if (audio && audio.dl_url) audioUrl = audio.dl_url;
    } catch (e1) {
        console.log("Motore 1 fallito, provo il 2...");
    }

    // Motore 2: Vreden API (Se Dylux fallisce)
    if (!audioUrl) {
        try {
            let res = await fetch(`https://api.vreden.my.id/api/ytmp3?url=${vid.url}`);
            let json = await res.json();
            if (json.result && json.result.download && json.result.download.url) {
                audioUrl = json.result.download.url;
            }
        } catch (e2) {
            console.log("Motore 2 fallito, provo il 3...");
        }
    }

    // Motore 3: Siputzx (L'ultima spiaggia)
    if (!audioUrl) {
        try {
            let res = await fetch(`https://api.siputzx.my.id/api/d/ytmp3?url=${vid.url}`);
            let json = await res.json();
            if (json.data && json.data.dl) {
                audioUrl = json.data.dl;
            }
        } catch (e3) {
            console.log("Motore 3 fallito.");
        }
    }

    // Se nessuno dei 3 ha funzionato, blocca tutto.
    if (!audioUrl) throw new Error("Tutti i server sono irraggiungibili.");

    // 3. Scaricamento reale del file MP3
    let resBuffer = await fetch(audioUrl);
    if (!resBuffer.ok) throw new Error("File corrotto sul server.");
    let audioBuffer = Buffer.from(await resBuffer.arrayBuffer());

    // 4. Invio dell'audio pulito (Senza fake channel)
    await conn.sendMessage(m.chat, {
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        fileName: `${vid.title}.mp3`,
        ptt: false
    }, { quoted: m }); // Ora possiamo rimettere il quoted perché non c'è il canale fake a far crashare iOS

  } catch (e) {
    console.error(e);
    m.reply('❌ _Scusa, i server di YouTube al momento bloccano i download. Riprova tra poco!_');
  }
};

handler.help = ['play'];
handler.tags = ['downloader'];
handler.command = /^(play|canzone)$/i;

export default handler;
