import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`『 🎵 』 \`Inserisci il titolo della canzone!\`\n\n⟡ _Esempio:_ ${usedPrefix + command} Push it by Kid Yugi`);

  try {
    await m.reply('⏳ _Aggiramento dei blocchi: aggancio ai server Spotify in corso... 🟢_');

    // 1. Cerca la canzone su Spotify (usiamo un'API stabile)
    let searchRes = await fetch(`https://api.siputzx.my.id/api/s/spotify?query=${encodeURIComponent(text)}`);
    let searchJson = await searchRes.json();

    if (!searchJson.data || searchJson.data.length === 0) {
        return m.reply('❌ *Nessun risultato trovato su Spotify.*');
    }

    // Prendiamo il primo risultato
    let track = searchJson.data[0]; 
    let title = track.name || track.title || text;
    let artist = track.artist || track.artists || "Sconosciuto";
    let cover = track.image || track.cover || 'https://files.catbox.moe/pyp87f.jpg';
    let spotUrl = track.url || track.link;
    
    // Fallback per l'URL se l'API usa una struttura diversa
    if (!spotUrl && track.external_urls) spotUrl = track.external_urls.spotify;

    if (!spotUrl) throw new Error("Link Spotify non trovato.");

    // 2. Grafica Legam Bot (Stile Spotify)
    let infoMsg = `ㅤㅤ⋆｡˚『 ╭ \`🎵 𝐒𝐏𝐎𝐓𝐈𝐅𝐘 𝐏𝐋𝐀𝐘 🎵\` ╯ 』˚｡⋆\n╭━━━━━━━━━━━━━━━━━━━━⬣\n`;
    infoMsg += `┃ ➤ 📌 𝐓𝐢𝐭𝐨𝐥𝐨: ${title}\n`;
    infoMsg += `┃ ➤ 🎤 𝐀𝐫𝐭𝐢𝐬𝐭𝐚: ${artist}\n`;
    infoMsg += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒*\n`;
    infoMsg += `🎧 _Estrazione audio in alta qualità (320kbps)..._`;

    await conn.sendMessage(m.chat, { image: { url: cover }, caption: infoMsg }, { quoted: m });

    // 3. Estrazione Audio da Spotify
    let dlRes = await fetch(`https://api.siputzx.my.id/api/d/spotify?url=${spotUrl}`);
    let dlJson = await dlRes.json();

    let audioUrl = dlJson.data?.download || dlJson.data?.url || dlJson.url || dlJson.data;

    if (!audioUrl || typeof audioUrl !== 'string') {
        throw new Error("I server di conversione Spotify sono temporaneamente offline.");
    }

    // 4. Download Finale e Invio (Fix memoria Buffer)
    let audioFetch = await fetch(audioUrl);
    if (!audioFetch.ok) throw new Error("Errore durante il download del file musicale.");

    let arrayBuf = await audioFetch.arrayBuffer();
    let mediaBuffer = Buffer.from(arrayBuf);

    await conn.sendMessage(m.chat, {
        audio: mediaBuffer,
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`,
        ptt: false 
    }, { quoted: m });

  } catch (e) {
    console.error('[ERRORE PLAY SPOTIFY]', e);
    m.reply(`『 ❌ 』 \`Errore:\`\n${e.message}`);
  }
};

handler.help = ['play'];
handler.tags = ['downloader'];
// Accetta sia .play che .canzone
handler.command = /^(play|canzone)$/i;

export default handler;