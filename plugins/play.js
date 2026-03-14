//BY GIUSE API KEYS
import yts from 'yt-search';
import fg from 'api-dylux';
import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`⚠️ Inserisci il titolo! Esempio: ${usedPrefix + command} Eminem Mockingbird`);

  try {
    await m.reply('⏳ _Sto cercando la traccia nei meandri di YouTube..._');

    // FASE 1: Ricerca
    const search = await yts(text);
    const vid = search.videos[0];
    if (!vid) return m.reply('❌ *Nessun risultato trovato.*');
    if (vid.seconds > 900) return m.reply('❌ *Il brano supera i 15 minuti, è troppo pesante.*');

    // FASE 2: Invio Dati Estetici
    let infoMsg = `ㅤㅤ⋆｡˚『 ╭ \`🎵 𝐏𝐋𝐀𝐘 𝐌𝐔𝐒𝐈𝐂 🎵\` ╯ 』˚｡⋆\n╭━━━━━━━━━━━━━━━━━━━━⬣\n`;
    infoMsg += `┃ ➤ 📌 𝐓𝐢𝐭𝐨𝐥𝐨: ${vid.title}\n`;
    infoMsg += `┃ ➤ ⏱️ 𝐃𝐮𝐫𝐚𝐭𝐚: ${vid.timestamp}\n`;
    infoMsg += `┃ ➤ 👀 𝐕𝐢𝐞𝐰𝐬: ${vid.views}\n`;
    infoMsg += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒*\n`;
    infoMsg += `🎧 _Estrazione audio in corso, attendi..._`;

    await conn.sendMessage(m.chat, { image: { url: vid.thumbnail }, caption: infoMsg }, { quoted: m });

    // FASE 3: L'Assalto delle 5 API (Mitragliatrice)
    let audioUrl = null;

    // Array con i 5 server di estrazione più potenti attualmente in circolazione
    const serverDiEstrazione = [
        async () => { let r = await fetch(`https://api.siputzx.my.id/api/d/ytmp3?url=${vid.url}`); let j = await r.json(); return j.data.dl; },
        async () => { let d = await fg.yta(vid.url); return d.dl_url; },
        async () => { let r = await fetch(`https://aemt.me/youtube?url=${vid.url}`); let j = await r.json(); return j.result.mp3; },
        async () => { let r = await fetch(`https://api.vreden.my.id/api/ytmp3?url=${vid.url}`); let j = await r.json(); return j.result.download.url; },
        async () => { let r = await fetch(`https://api.ryzendesu.vip/api/downloader/ytmp3?url=${vid.url}`); let j = await r.json(); return j.url || j.data.url; }
    ];

    // Il bot le prova tutte, una per volta, finché una non funziona
    for (let estrai of serverDiEstrazione) {
        try {
            audioUrl = await estrai();
            if (audioUrl) break; // Se trova il link, esce subito dal ciclo!
        } catch (e) {
            continue; // Se il server è morto, passa zitto zitto al prossimo
        }
    }

    // Se arrivato fin qui audioUrl è ancora null, vuol dire che è l'apocalisse e sono morti tutti i 5 server
    if (!audioUrl) throw new Error("Tutti i 5 server di estrazione sono attualmente offline.");

    // FASE 4: Download e Invio a WhatsApp
    let resBuffer = await fetch(audioUrl);
    let mediaBuffer = Buffer.from(await resBuffer.arrayBuffer());

    await conn.sendMessage(m.chat, {
        audio: mediaBuffer, 
        mimetype: 'audio/mpeg',
        fileName: `${vid.title}.mp3`,
        ptt: false 
    }, { quoted: m });

  } catch (e) {
    console.error('[ERRORE PLAY]', e);
    m.reply(`❌ _Errore di sistema:_ ${e.message}\n_Riprova tra qualche minuto._`);
  }
};

handler.help = ['play'];
handler.tags = ['downloader'];
handler.command = /^(play|canzone)$/i;

export default handler;
