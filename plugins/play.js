import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`⚠️ Inserisci il titolo! Esempio: ${usedPrefix + command} Push it by Kid yugi`);

  try {
    await m.reply('⏳ _YouTube è blindato. Cambio rotta: aggancio ai server di Spotify in corso... 🟢_');

    // FASE 1: Ricerca su Spotify
    let searchRes = await fetch(`https://api.vreden.my.id/api/spotifysearch?query=${encodeURIComponent(text)}`);
    let searchJson = await searchRes.json();
    let track = searchJson.result?.[0]; 

    // Se la prima API fallisce la ricerca, proviamo la seconda
    if (!track) {
        searchRes = await fetch(`https://api.ryzendesu.vip/api/search/spotify?query=${encodeURIComponent(text)}`);
        searchJson = await searchRes.json();
        track = searchJson[0];
    }

    if (!track || !track.url) return m.reply('❌ *Nessun risultato trovato su Spotify.*');

    let title = track.title || track.name || text;
    let artist = track.artist || track.artists || "Sconosciuto";
    let cover = track.image || track.cover || "https://files.catbox.moe/pyp87f.jpg"; // Cover di default se manca
    let spotUrl = track.url || track.link;

    // FASE 2: Grafica Legam Bot (Stile Spotify)
    let infoMsg = `ㅤㅤ⋆｡˚『 ╭ \`🎵 𝐒𝐏𝐎𝐓𝐈𝐅𝐘 𝐏𝐋𝐀𝐘 🎵\` ╯ 』˚｡⋆\n╭━━━━━━━━━━━━━━━━━━━━⬣\n`;
    infoMsg += `┃ ➤ 📌 𝐓𝐢𝐭𝐨𝐥𝐨: ${title}\n`;
    infoMsg += `┃ ➤ 🎤 𝐀𝐫𝐭𝐢𝐬𝐭𝐚: ${artist}\n`;
    infoMsg += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒*\n`;
    infoMsg += `🎧 _Estrazione audio da Spotify in corso..._`;

    await conn.sendMessage(m.chat, { image: { url: cover }, caption: infoMsg }, { quoted: m });

    // FASE 3: Download da Spotify
    let audioUrl = null;

    try {
        let dlRes = await fetch(`https://api.vreden.my.id/api/spotify?url=${spotUrl}`);
        let dlJson = await dlRes.json();
        if (dlJson.result?.download?.url) audioUrl = dlJson.result.download.url;
    } catch (e) {
        console.log("Vreden Spotify fallito, passo a Ryzendesu...");
    }

    if (!audioUrl) {
        let dlRes = await fetch(`https://api.ryzendesu.vip/api/downloader/spotify?url=${spotUrl}`);
        let dlJson = await dlRes.json();
        if (dlJson.url) audioUrl = dlJson.url;
    }

    if (!audioUrl) throw new Error("Anche i server di Spotify sono irraggiungibili al momento.");

    // FASE 4: Invio a WhatsApp
    let resBuffer = await fetch(audioUrl);
    let mediaBuffer = Buffer.from(await resBuffer.arrayBuffer());

    await conn.sendMessage(m.chat, {
        audio: mediaBuffer, 
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`,
        ptt: false 
    }, { quoted: m });

  } catch (e) {
    console.error('[ERRORE PLAY SPOTIFY]', e);
    m.reply(`❌ *ERRORE:* ${e.message}\n_Sistemi musicali compromessi. Riprova più tardi._`);
  }
};

handler.help = ['play'];
handler.tags = ['downloader'];
handler.command = /^(play|canzone)$/i;

export default handler;
