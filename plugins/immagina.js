import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`『 🎨 』 \`Inserisci cosa vuoi generare!\`\n\n⟡ _Esempio:_ ${usedPrefix + command} un cane che vola`);

  try {
    let attesaMsg = `
⊹ ࣪ ˖ ✦ ━━ 𝐋 𝐄 𝐆 𝐀 𝐌 𝐀 𝐈 ━━ ✦ ˖ ࣪ ⊹

🖌️ \`𝐆𝐞𝐧𝐞𝐫𝐚𝐳𝐢𝐨𝐧𝐞 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨...\`
⟡ *Richiesta:* ${text}

✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();

    await conn.reply(m.chat, attesaMsg, m);

    // Connessione diretta a Pollinations
    const randomSeed = Math.floor(Math.random() * 1000000);
    const apiUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(text)}?seed=${randomSeed}&width=1024&height=1024&nologo=true`;

    // Aggiungiamo un finto browser (User-Agent) per aggirare i blocchi del server
    let res = await fetch(apiUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    });

    if (!res.ok) throw new Error('Il server grafico ha rifiutato la connessione.');

    // 🏆 IL FIX: Leggiamo l'immagine correttamente in ArrayBuffer
    let arrayBuffer = await res.arrayBuffer();
    let mediaBuffer = Buffer.from(arrayBuffer);

    let caption = `『 🎨 𝐋 𝐄 𝐆 𝐀 𝐌 ✧ 𝐁 𝐎 𝐓 🎨 』\n\n⟡ _Richiesta:_ ${text}`;

    await conn.sendMessage(m.chat, { 
        image: mediaBuffer, 
        caption: caption 
    }, { quoted: m });

  } catch (e) {
    console.error('[ERRORE IMMAGINA]', e);
    // Ora se fallisce ti dice ESATTAMENTE qual è l'errore tecnico
    m.reply(`『 ❌ 』 \`Errore Tecnico:\` ${e.message}`);
  }
};

handler.help = ['immagina <testo>'];
handler.tags = ['ai'];
handler.command = /^(immagina|genera|ai|disegna)$/i;

export default handler;


