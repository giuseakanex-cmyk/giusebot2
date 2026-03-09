let handler = async (m) => {
  if (!m.isGroup) return m.reply("❌ Solo nei gruppi.");

  const chat = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {});
  const cmd = m.text.toLowerCase();

  // Attiva o disattiva tramite .contronuke on / off
  if (cmd.startsWith('.contronuke on')) {
    chat.antinuke = true;
    m.reply(`
╭━━━━━━•✦•━━━━━━╮
       🛡 𝗔𝗡𝗧𝗜𝗡𝗨𝗞𝗘 𝗔𝗧𝗧𝗜𝗩𝗔𝗧𝗢
╰━━━━━━•✦•━━━━━━╯
La protezione del gruppo è ora attiva.
`);
  } else if (cmd.startsWith('.contronuke off')) {
    chat.antinuke = false;
    m.reply(`
╭━━━━━━•✦•━━━━━━╮
       ❌ 𝗔𝗡𝗧𝗜𝗡𝗨𝗞𝗘 𝗗𝗜𝗦𝗔𝗧𝗧𝗜𝗩𝗔𝗧𝗢
╰━━━━━━•✦•━━━━━━╯
La protezione del gruppo è stata disattivata.
`);
  }
};

handler.command = ['contronuke'];
handler.owner = true;
handler.group = true;

// --------------------------------------
// LISTENER AUTOMATICO ANTINUKE
handler.before = async function (m, { conn, isBotAdmin }) {
  if (!m.isGroup) return;
  if (!isBotAdmin) return;

  const chat = global.db.data.chats[m.chat];
  if (!chat?.antinuke) return;

  const sender = m.key?.participant || m.participant || m.sender;

  // Eventi da bloccare
  const stub = m.messageStubType;
  if (![21, 22, 29, 30].includes(stub)) return;

  const botJid = conn.user.jid;
  const owners = global.owner.map(o => o[0] + '@s.whatsapp.net');

  let metadata;
  try { metadata = await conn.groupMetadata(m.chat); } catch { metadata = null; }
  const founder = metadata?.owner;

  const allowed = [botJid, ...owners, founder].filter(Boolean);

  if (allowed.includes(sender)) return;

  const participants = metadata.participants;
  const admins = participants.filter(p => p.admin).map(p => p.jid);

  // Utenti da retrocedere
  const usersToDemote = admins.filter(jid => !allowed.includes(jid));
  if (usersToDemote.length > 0) {
    await conn.groupParticipantsUpdate(m.chat, usersToDemote, 'demote');
  }

  await conn.groupSettingUpdate(m.chat, 'announcement');

  const actionName = stub === 21 ? '𝑪𝑨𝑴𝑩𝑰𝑶 𝑵𝑶𝑴𝐸' :
                     stub === 22 ? '𝑪𝑨𝑴𝑩𝑰𝑶 𝑭𝑶𝑻𝑶' :
                     stub === 29 ? '𝑷𝑹𝑶𝑴𝑶𝒁𝑰𝑶𝑵𝐄' :
                     '𝑹𝑬𝑻𝑹𝑶𝐂𝑬𝑺𝑺𝐼𝑶𝑵𝐄';

  const text = `
╭━━━━━━•✦•━━━━━━╮
          𝑨𝑵𝑻𝐼-𝑵𝑼𝐊𝐄
╰━━━━━━•✦•━━━━━━╯

👤 𝑹𝑬𝑺𝑷𝑶𝑵𝑺𝐀𝐁𝐈𝐋𝐄: @${sender.split('@')[0]}
⚠️ 𝑨𝒁𝑰𝑶𝑵𝐄: ${actionName}

❌ 𝑨𝑫𝑴𝐼𝑵 𝑹𝑬𝑽𝑶𝐂𝐀𝑻𝐼:
${usersToDemote.map(jid => `💀 @${jid.split('@')[0]}`).join('\n') || 'Nessuno'}

🔒 𝑮𝑹𝑼𝑷𝑷𝑶 𝑪𝐇𝐈𝐔𝐒𝐎, troppo stupido😔

👑 𝑶𝑾𝑵𝐸𝑹 𝑨𝑽𝑽𝐼𝑺𝐀𝑻𝐼:
${owners.map(x => `🛡 @${x.split('@')[0]}`).join('\n')}
══════════════════
`.trim();

  // Menziona sender, owners e gli admin retrocessi
  await conn.sendMessage(m.chat, { text, mentions: [sender, ...owners, ...usersToDemote] });
};

export default handler;
