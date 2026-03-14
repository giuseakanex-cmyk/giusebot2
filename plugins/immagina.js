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

    let mediaBuffer = null;

    // 🎯 TENTATIVO 1: Pollinations (Versione Pura e Pulita)
    // Aggiungiamo un numeretto invisibile al testo per assicurarci che non ci dia un'immagine vecchia in memoria (cache)
    try {
        let cleanText = text + " " + Math.floor(Math.random() * 10000);
        let res1 = await fetch(`https://image.pollinations.ai/prompt/${encodeURIComponent(cleanText)}`);
        
        if (res1.ok) {
            let arrayBuffer = await res1.arrayBuffer();
            mediaBuffer = Buffer.from(arrayBuffer);
        }
    } catch (e) {
        console.log("Pollinations ha fallito, passo al piano B...");
    }

    // 🛟 TENTATIVO 2: Server di Backup (GiftedTech) in caso di emergenza
    if (!mediaBuffer) {
        try {
            let res2 = await fetch(`https://api.giftedtech.my.id/api/ai/text2img?prompt=${encodeURIComponent(text)}`);
            if (res2.ok) {
                let arrayBuffer = await res2.arrayBuffer();
                mediaBuffer = Buffer.from(arrayBuffer);
            }
        } catch (e) {
            console.log("Anche il server di backup è offline.");
        }
    }

    // Se arriviamo qui e non c'è la foto, è un'apocalisse server
    if (!mediaBuffer) throw new Error('Tutti i server di generazione grafica sono attualmente bloccati o offline.');

    let caption = `『 🎨 𝐋 𝐄 𝐆 𝐀 𝐌 ✧ 𝐁 𝐎 𝐓 🎨 』\n\n⟡ _Richiesta:_ ${text}`;

    await conn.sendMessage(m.chat, { 
        image: mediaBuffer, 
        caption: caption 
    }, { quoted: m });

  } catch (e) {
    console.error('[ERRORE IMMAGINA]', e);
    m.reply(`『 ❌ 』 \`Errore Tecnico:\` ${e.message}`);
  }
};

handler.help = ['immagina <testo>'];
handler.tags = ['ai'];
handler.command = /^(immagina|genera|ai|disegna)$/i;

export default handler;


