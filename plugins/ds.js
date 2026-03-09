let handler = async (m, { conn, usedPrefix }) => {
  const sender = m.sender;

  // Controllo se sei owner
  const isOwner = global.owner.map(o => o[0]).includes(sender);

  // Controllo se sei admin (solo in gruppo)
  let isAdmin = false;
  if (m.isGroup) {
    try {
      const metadata = await conn.groupMetadata(m.chat);
      const participant = metadata.participants.find(p => p.jid === sender);
      isAdmin = participant?.admin || participant?.superAdmin || false;
    } catch {}
  }

  if (!isOwner && !isAdmin)
    return m.reply("〘 🛡️ 〙 *`ꪶ͢Solo gli owner o gli admin del bot possono usare questa funzioneꫂ`*");

  // Numero casuale da 0 a 5000 (fake)
  const fakeCount = Math.floor(Math.random() * 5001);

  const text = `
╔══════════════════════╗
        🗑️ 𝐒𝐕𝐔𝐎𝐓𝐀 𝐀𝐑𝐂𝐇𝐈𝐕𝐈
   𝑪𝑯𝛬𝑹𝑴𝛬ᜰ𝑫𝜮𝑹 𝚩𝚯𝐓
╚══════════════════════╝

📂 𝐆𝐄𝐒𝐓𝐈𝐎𝐍𝐄 𝐀𝐑𝐂𝐇𝐈𝐕𝐈
━━━━━━━━━━━━━━━━
➤ 💨 𝐒𝐨𝐧𝐨 𝐬𝐭𝐚𝐭𝐢 𝐞𝐥𝐢𝐦𝐢𝐧𝐚𝐭𝐢 ${fakeCount} 𝐚𝐫𝐜𝐡𝐢𝐯𝐢 𝐭𝐞𝐦𝐩𝐨𝐫𝐚𝐧𝐞𝐢!
⚡ 𝐎𝐫𝐚 𝐬𝐨𝐧𝐨 𝐩𝐢ù 𝐯𝐞𝐥𝐨𝐜𝐞, 𝐠𝐫𝐚𝐳𝐢𝐞 𝐩𝐞𝐫 𝐚𝐯𝐞𝐫𝐦𝐢 𝐬𝐯𝐮𝐨𝐭𝐚𝐭𝐨 𝐛𝐚𝐛𝐲😏
━━━━━━━━━━━━━━━━
`;

  await conn.sendMessage(m.chat, {
    text,
    footer: "ꉧ𝑪𝑯𝛬𝑹𝑴𝛬ᜰ𝑫𝜮 𝚩𝚯𝐓ꉧ",
    buttons: [
      { buttonId: usedPrefix + "ds", buttonText: { displayText: "🗑️ 𝐑𝐢𝐟𝐚𝐢 𝐝𝐬" }, type: 1 },
      { buttonId: usedPrefix + "ping", buttonText: { displayText: "✧ 𝐏𝐢𝐧𝐠 ✧" }, type: 1 }
    ],
    headerType: 1
  });
};

handler.command = ['ds'];
handler.group = true;

// ✅ Non usare handler.owner = true, controllo manuale fatto sopra
export default handler;
