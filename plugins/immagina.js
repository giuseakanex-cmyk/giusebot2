import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  // Se non scrive niente dopo il comando, gli spieghiamo come fare
  if (!text) return m.reply(`『 🎨 』 \`Inserisci cosa vuoi generare!\`\n\n⟡ _Esempio:_ ${usedPrefix + command} un gatto vestito da boss mafioso a Napoli, 4k`);

  try {
    // Messaggio di attesa con lo stile Legam
    let attesaMsg = `
⊹ ࣪ ˖ ✦ ━━ 𝐋 𝐄 𝐆 𝐀 𝐌 𝐀 𝐈 ━━ ✦ ˖ ࣪ ⊹

🖌️ \`𝐆𝐞𝐧𝐞𝐫𝐚𝐳𝐢𝐨𝐧𝐞 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨...\`
⟡ *Richiesta:* ${text}

✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();

    await conn.reply(m.chat, attesaMsg, m);

    // Connessione diretta al motore grafico (Pollinations)
    // Aggiungiamo un numero casuale alla fine (seed) così se ti chiede due volte la stessa cosa, fa due foto diverse
    const randomSeed = Math.floor(Math.random() * 1000000);
    const apiUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(text)}?seed=${randomSeed}&width=1024&height=1024&nologo=true`;

    // Scarichiamo l'immagine
    let res = await fetch(apiUrl);
    if (!res.ok) throw new Error('Errore di connessione al server AI');
    
    let buffer = await res.buffer();

    // Didascalia sotto la foto
    let caption = `『 🎨 𝐋 𝐄 𝐆 𝐀 𝐌 ✧ 𝐁 𝐎 𝐓 🎨 』\n\n⟡ _Ecco la tua creazione!_`;

    // Invio della foto nel gruppo
    await conn.sendMessage(m.chat, { 
        image: buffer, 
        caption: caption 
    }, { quoted: m });

  } catch (e) {
    console.error('[ERRORE IMMAGINA]', e);
    m.reply('『 ❌ 』 `Errore: Il server grafico è sovraccarico, riprova tra poco.`');
  }
};

// Configurazione del comando
handler.help = ['immagina <testo>'];
handler.tags = ['ai'];
handler.command = /^(immagina|genera|ai|disegna)$/i;

export default handler;