import yts from 'yt-search';
import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`『 🎵 』 \`Inserisci il titolo della canzone!\`\n\n⟡ _Esempio:_ ${usedPrefix + command} Push it by Kid Yugi`);

  try {
    await m.reply('⏳ _Ricerca della traccia in corso..._');

    // FASE 1: Ricerca video su YouTube
    let search;
    try {
        search = await yts(text);
    } catch (e) {
        return m.reply('❌ *Errore nella ricerca su YouTube. Riprova tra poco.*');
    }

    const vid = search.videos[0];
    if (!vid) return m.reply('❌ *Nessun risultato trovato per questa canzone.*');
    if (vid.seconds > 900) return m.reply('❌ *Il brano supera i 15 minuti, è troppo pesante.*');

    // FASE 2: Grafica Legam Bot
    let infoMsg = `ㅤㅤ⋆｡˚『 ╭ \`🎵 𝐏𝐋𝐀𝐘 𝐌𝐔𝐒𝐈𝐂 🎵\` ╯ 』˚｡⋆\n╭━━━━━━━━━━━━━━━━━━━━⬣\n`;
    infoMsg += `┃ ➤ 📌 𝐓𝐢𝐭𝐨𝐥𝐨: ${vid.title}\n`;
    infoMsg += `┃ ➤ ⏱️ 𝐃𝐮𝐫𝐚𝐭𝐚: ${vid.timestamp}\n`;
    infoMsg += `┃ ➤ 👀 𝐕𝐢𝐞𝐰𝐬: ${vid.views}\n`;
    infoMsg += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒*\n`;
    infoMsg += `🎧 _Estrazione audio in corso, attendi..._`;

    await conn.sendMessage(m.chat, { image: { url: vid.thumbnail }, caption: infoMsg }, { quoted: m });

    let audioUrl = null;

    // FASE 3: Motore a Cascata Pulito (Prova 3 API diverse in silenzio)
    const apiList = [
        // 1. Siputzx (Attualmente la più stabile)
        async () => {
            let res = await fetch(`https://api.siputzx.my.id/api/d/ytmp3?url=${vid.url}`);
            let json = await res.json();
            return json.data?.dl;
        },
        // 2. Vreden (Ottima alternativa)
        async () => {
            let res = await fetch(`https://api.vreden.my.id/api/ytmp3?url=${vid.url}`);
            let json = await res.json();
            return json.result?.download?.url;
        },
        // 3. BK9 (Server Stealth)
        async () => {
            let res = await fetch(`https://bk9.fun/download/ytmp3?url=${vid.url}`);
            let json = await res.json();
            return json.BK9;
        }
    ];

    // Il bot esegue la lista. Appena una funziona, si ferma ed estrae il link.
    for (const fetchApi of apiList) {
        try {
            audioUrl = await fetchApi();
            if (audioUrl) break; 
        } catch (e) {
            continue; // Se l'API è morta, ignora l'errore e passa alla successiva
        }
    }

    if (!audioUrl) throw new Error("Tutti i server di estrazione sono attualmente bloccati da YouTube.");

    // FASE 4: Download Finale e Invio (con il fix ArrayBuffer)
    let audioRes = await fetch(audioUrl);
    let arrayBuf = await audioRes.arrayBuffer();
    let mediaBuffer = Buffer.from(arrayBuf);

    await conn.sendMessage(m.chat, {
        audio: mediaBuffer,
        mimetype: 'audio/mpeg',
        fileName: `${vid.title}.mp3`,
        ptt: false // Invia come canzone, non come nota vocale
    }, { quoted: m });

  } catch (e) {
    console.error('[ERRORE PLAY]', e);
    m.reply(`『 ❌ 』 \`Errore:\` I server musicali sono intasati a causa dei blocchi di YouTube. Riprova più tardi!`);
  }
};

handler.help = ['play'];
handler.tags = ['downloader'];
handler.command = /^(play|canzone)$/i;

export default handler;

