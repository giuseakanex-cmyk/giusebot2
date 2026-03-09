var handler = async (m, { conn, text, command }) => {
  let action, successMsg, errorMsg, helpMsg;
  if (['promote', 'promuovi', 'p'].includes(command)) {
    action = 'promote';
    successMsg = `『 ✅ 』 \`𝐆𝐢𝐮𝐬𝐞 𝐫𝐢𝐩𝐨𝐧𝐞 𝐢𝐧 𝐭𝐞 𝐦𝐨𝐥𝐭𝐚 𝐟𝐢𝐝𝐮𝐜𝐢𝐚 𝐩𝐞𝐫 𝐚𝐯𝐞𝐫𝐭𝐢 𝐝𝐚𝐭𝐨 𝐪𝐮𝐞𝐬𝐭𝐨 𝐩𝐫𝐢𝐯𝐢𝐥𝐞𝐠𝐢𝐨,𝐧𝐨𝐧 𝐝𝐞𝐥𝐮𝐝𝐞𝐫𝐥𝐨.\``;
    errorMsg = `『 ❌ 』 \`Errore nel promuovere l'utente.\``;
    helpMsg = `『 👤 』 \`A chi vuoi dare amministratore?\``;
  } else if (['demote', 'retrocedi', 'r'].includes(command)) {
    action = 'demote';
    successMsg = `『 ✅ 』 \`𝐍𝐨𝐧 𝐡𝐚𝐢 𝐬𝐚𝐩𝐮𝐭𝐨 𝐬𝐟𝐫𝐮𝐭𝐭𝐚𝐫𝐞 𝐥’𝐨𝐜𝐜𝐚𝐬𝐢𝐨𝐧𝐞,𝐚𝐝𝐞𝐬𝐬𝐨 𝐭𝐢 𝐯𝐞𝐫𝐫𝐚𝐧𝐧𝐨 𝐚𝐭𝐭𝐫𝐢𝐛𝐮𝐢𝐭𝐞 𝐝𝐞𝐥𝐥𝐞 𝐜𝐨𝐧𝐬𝐞𝐠𝐮𝐞𝐧𝐳𝐞.𝐋𝐨 𝐬𝐭𝐚𝐟𝐟 𝐧𝐨𝐧 𝐟𝐚 𝐩𝐞𝐫 𝐭𝐞 𝐠𝐮𝐚𝐠𝐥𝐢ò.\``;
    errorMsg = `『 ❌ 』 \`Errore nel retrocedere l'utente.\``;
    helpMsg = `『 👤 』 \`A chi vuoi togliere amministratore?\``;
  } else {
    return;
  }

  let number;
  if (m.mentionedJid && m.mentionedJid[0]) {
    number = m.mentionedJid[0].split('@')[0];
  } else if (m.quoted && m.quoted.sender) {
    number = m.quoted.sender.split('@')[0];
  } else if (text && !isNaN(text)) {
    number = text;
  } else if (text) {
    let match = text.match(/@(\d+)/);
    if (match) number = match[1];
  } else {
    return conn.reply(m.chat, helpMsg, m, rcanal);
  }

  if (!number || number.length < 10 || number.length > 15) {
    return conn.reply(m.chat, `『 🩼 』 \`Menziona un numero valido.\``, m, rcanal);
  }

  try {
    let user = number + '@s.whatsapp.net';
    await conn.groupParticipantsUpdate(m.chat, [user], action);
    conn.reply(m.chat, successMsg, m, fake);
  } catch (e) {
    conn.reply(m.chat, errorMsg, m, rcanal);
  }
};

handler.help = ['promuovi', 'retrocedi', 'p', 'r'];
handler.tags = ['gruppo'];
handler.command = ['promote', 'promuovi', 'p', 'demote', 'retrocedi', 'r'];
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
