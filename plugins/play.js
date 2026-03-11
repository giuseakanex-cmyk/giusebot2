import yts from 'yt-search';
import fetch from 'node-fetch';
import fg from 'api-dylux';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`⚠️ Inserisci il titolo! Esempio: ${usedPrefix + command} Eminem Mockingbird`);

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

    // --- SISTEMA ANTICRASH A DOPPIO MOTORE ---
    let audioUrl = null;

    try {
        // Tentativo 1: Il pacchetto locale (più forte contro i blocchi)
        let audio = await fg.yta(vid.url);
        audioUrl = audio.dl_url;
    } catch (e1) {
        console.log("Motore 1 fallito, provo l'API esterna...");
        
        // Tentativo 2: L'API esterna (con controllo di sicurezza)
        let apiAudio = await fetch(`https://api.siputzx.my.id/api/d/ytmp3?url=${vid.url}`);
        let jsonAudio = await apiAudio.json();
        
        // 💡 IL FIX È QUI: Controlliamo che esista "data" prima di cercare "dl"
        if (jsonAudio && jsonAudio.data && jsonAudio.data.dl) {
            audioUrl = jsonAudio.data.dl;
        }
    }

    // Se entrambi falliscono, fermiamo tutto senza far crashare il terminale
    if (!audioUrl) throw new Error("Tutti i server per il download sono down.");

    // Scarica il file audio fisico
    let res = await fetch(audioUrl);
    
    // Altro controllo: se il server ci dà una pagina web di errore invece di un MP3, bloccalo!
    if (res.headers.get('content-type')?.includes('text/html')) {
        throw new Error("Il server ha restituito una pagina web bloccata.");
    }

    let audioBuffer = Buffer.from(await res.arrayBuffer());

    // Manda l'audio
    await conn.sendMessage(m.chat, {
        audio: audioBuffer,
        mimetype: 'audio/mp4', // Meglio digerito da WhatsApp
        fileName: `${vid.title}.mp3`
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    // Ora, se qualcosa va storto, il bot non crasha ma ti avvisa in chat
    m.reply('❌ _I server per il download al momento fanno i capricci. Riprova tra poco!_');
  }
};

handler.help = ['play'];
handler.tags = ['downloader'];
handler.command = /^(play|canzone)$/i;

export default handler;
