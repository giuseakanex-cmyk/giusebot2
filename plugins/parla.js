import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  // 1. Controllo se l'utente ha scritto qualcosa
  if (!text) {
    let msg = `╭ ━━━ ❨ 🎤 𝐕𝐎𝐈𝐂𝐄 ❩ ━━━ ╮\n`;
    msg += `│ ✦ 𝐄𝐑𝐑𝐎𝐑𝐄: Cosa devo dire?\n`;
    msg += `│ ╰➤ Scrivi il testo dopo il comando.\n`;
    msg += `│ ✦ 𝐄𝐬𝐞𝐦𝐩𝐢𝐨: ${usedPrefix + command} Ciao a tutti, sono Giusebot!\n`;
    msg += `╰ ━━━━━━━━━━━━━ ╯`;
    return m.reply(msg);
  }

  // Limite di sicurezza: Google Translate legge fino a 250 caratteri alla volta senza bloccarsi
  if (text.length > 250) return m.reply('⚠️ *Testo troppo lungo!* Scrivi un messaggio più corto (max 250 caratteri).');

  try {
    // 2. Tocco di classe: Il bot mette la reaction col microfono mentre "registra"
    await conn.sendMessage(m.chat, { react: { text: "🎤", key: m.key } });

    // 3. Il trucco infallibile: usiamo l'API nascosta di Google Translate
    // Il parametro "client=tw-ob" ci permette di bypassare i blocchi di sicurezza di Google
    let ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=it&client=tw-ob`;

    let res = await fetch(ttsUrl);
    if (!res.ok) throw new Error("Google ha bloccato la richiesta");
    
    // Convertiamo l'audio in Buffer
    let audioBuffer = Buffer.from(await res.arrayBuffer());

    // 4. Inviamo l'audio come vera NOTA VOCALE
    await conn.sendMessage(m.chat, {
        audio: audioBuffer,
        mimetype: 'audio/mp4', // Formato nativo per i vocali di WhatsApp
        ptt: true // LA MAGIA: ptt=true trasforma la canzone in Nota Vocale verde!
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    m.reply('❌ _Ops, ho un po\' di mal di gola. Non riesco a parlare ora!_');
  }
};

handler.help = ['parla [testo]'];
handler.tags = ['fun'];
// Si attiva con .parla, .dici o .tts
handler.command = /^(parla|dici|tts)$/i;

export default handler;
