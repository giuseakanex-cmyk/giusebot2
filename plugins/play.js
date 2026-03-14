import yts from 'yt-search';
import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`⚠️ Inserisci il titolo! Esempio: ${usedPrefix + command} Push it by Kid yugi`);

  try {
    await m.reply('⏳ _Sondando i server di YouTube, attendi..._');

    // FASE 1: Ricerca
    const search = await yts(text);
    const vid = search.videos[0];
    if (!vid) return m.reply('❌ *Nessun risultato trovato.*');
    if (vid.seconds > 900) return m.reply('❌ *Il brano supera i 15 minuti, è troppo pesante per WhatsApp.*');

    // FASE 2: Grafica Legam Bot
    let infoMsg = `ㅤㅤ⋆｡˚『 ╭ \`🎵 𝐏𝐋𝐀𝐘 𝐌𝐔𝐒𝐈𝐂 🎵\` ╯ 』˚｡⋆\n╭━━━━━━━━━━━━━━━━━━━━⬣\n`;
    infoMsg += `┃ ➤ 📌 𝐓𝐢𝐭𝐨𝐥𝐨: ${vid.title}\n`;
    infoMsg += `┃ ➤ ⏱️ 𝐃𝐮𝐫𝐚𝐭𝐚: ${vid.timestamp}\n`;
    infoMsg += `┃ ➤ 👀 𝐕𝐢𝐞𝐰𝐬: ${vid.views}\n`;
    infoMsg += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒*\n`;
    infoMsg += `🎧 _Avvio protocollo di estrazione audio..._`;

    await conn.sendMessage(m.chat, { image: { url: vid.thumbnail }, caption: infoMsg }, { quoted: m });

    let audioUrl = null;

    // FASE 3: I 3 SERVER SUPREMI
    
    // TENTATIVO 1: L'artiglieria pesante (Cobalt)
    try {
        let resCobalt = await fetch('https://api.cobalt.tools/api/json', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            },
            body: JSON.stringify({ url: vid.url, isAudioOnly: true, aFormat: 'mp3' })
        });
        let jsonCobalt = await resCobalt.json();
        if (jsonCobalt.url) audioUrl = jsonCobalt.url;
    } catch (e) {
        console.log("Cobalt fallito, passo al prossimo...");
    }

    // TENTATIVO 2: Server Sudamericano (Deliriuss)
    if (!audioUrl) {
        try {
            let resDel = await fetch(`https://deliriussapi-oficial.vercel.app/download/ytmp3?url=${encodeURIComponent(vid.url)}`);
            let jsonDel = await resDel.json();
            if (jsonDel.data?.download?.url) audioUrl = jsonDel.data.download.url;
        } catch (e) {
            console.log("Deliriuss fallito, passo al prossimo...");
        }
    }

    // TENTATIVO 3: Dorratz (Ultima spiaggia affidabile)
    if (!audioUrl) {
        try {
            let resDor = await fetch(`https://api.dorratz.com/v2/yt-mp3?url=${encodeURIComponent(vid.url)}`);
            let jsonDor = await resDor.json();
            if (jsonDor.data?.download) audioUrl = jsonDor.data.download;
        } catch (e) {
            console.log("Dorratz fallito.");
        }
    }

    if (!audioUrl) throw new Error("Anche i server supremi sono bloccati da YouTube in questo momento.");

    // FASE 4: Download finale e Invio
    // Aggiungo un User-Agent per ingannare i server e far credere che siamo un browser
    let resBuffer = await fetch(audioUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    let mediaBuffer = Buffer.from(await resBuffer.arrayBuffer());

    await conn.sendMessage(m.chat, {
        audio: mediaBuffer, 
        mimetype: 'audio/mpeg',
        fileName: `${vid.title}.mp3`,
        ptt: false 
    }, { quoted: m });

  } catch (e) {
    console.error('[ERRORE PLAY]', e);
    m.reply(`❌ *DIAGNOSI ERRORE:*\n${e.message}\n\n_Se l'errore persiste, YouTube ha alzato un nuovo firewall._`);
  }
};

handler.help = ['play'];
handler.tags = ['downloader'];
handler.command = /^(play|canzone)$/i;

export default handler;
