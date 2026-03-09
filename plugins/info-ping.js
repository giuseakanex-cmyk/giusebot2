// Plugin fatto da giuse

import os from 'os';
import { performance } from 'perf_hooks';

let handler = async (m, { conn, usedPrefix }) => {
  try {
    const uptimeMs = process.uptime() * 1000;
    const uptimeStr = clockString(uptimeMs);

    // Calcolo ping
    const startTime = performance.now();
    const endTime = performance.now();
    const speed = (endTime - startTime).toFixed(4);

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const percentUsed = ((usedMem / totalMem) * 100).toFixed(2);

    const botStartTime = new Date(Date.now() - uptimeMs);
    const activationTime = botStartTime.toLocaleString('it-IT', {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const textMsg =`

╔══════════════════════╗
        ⚡ 𝐏𝐈𝐍𝐆 ⚡
   𝑪𝑯𝛬𝑹𝑴𝛬ᜰ𝑫𝜮𝑹 𝚩𝚯𝐓
╚══════════════════════╝

𝐒𝐘𝐒𝐓𝐄𝐌 𝐌𝐎𝐍𝐈𝐓𝐎𝐑
━━━━━━━━━━━━━━━━
⏳ 𝐔𝐏𝐓𝐈𝐌𝐄
➤ ${activationTime}
⚡ 𝐋𝐀𝐓𝐄𝐍𝐙𝐀
➤ ${speed} ms
💾 𝐔𝐒𝐎 𝐑𝐀𝐌
➤ ${percentUsed}%
👑 𝐎𝐖𝐍𝐄𝐑
➤ 𝐆𝐈𝐔𝐒𝚵
━━━━━━━━━━━━━━━━
`.trim();

    await conn.sendMessage(m.chat, {
      text: textMsg,
      footer: "ꉧ𝑪𝑯𝛬𝑹𝑴𝛬ᜰ𝑫𝜮𝑹ꨄ 𝚩𝚯𝐓ꉧ",
      buttons: [
        { buttonId: usedPrefix + "ping", buttonText: { displayText: "📡 𝐑𝐢𝐟𝐚𝐢 𝐏𝐢𝐧𝐠" }, type: 1 },
        { buttonId: usedPrefix + "menu", buttonText: { displayText: "✧ 𝐌𝐞𝐧𝐮 ✧" }, type: 1 },
        { buttonId: usedPrefix + "ds", buttonText: { displayText: "🗑️ 𝐒𝐯𝐮𝐨𝐭𝐚 𝐬𝐞𝐬𝐬𝐢𝐨𝐧𝐢" }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m });

  } catch (err) {
    console.error("Errore nell'handler:", err);
  }
};

function clockString(ms) {
  const d = Math.floor(ms / 86400000);
  const h = Math.floor(ms / 3600000) % 24;
  const m = Math.floor(ms / 60000) % 60;
  const s = Math.floor(ms / 1000) % 60;
  return [d, h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}

handler.help = ['ping'];
handler.tags = ['info'];
handler.command = /^(ping)$/i;

// ✅ deve funzionare ovunque: niente requisito admin
handler.admin = false;

export default handler;
