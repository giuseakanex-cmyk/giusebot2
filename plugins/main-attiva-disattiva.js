import fetch from 'node-fetch';

const PERM = {
  ADMIN: 'admin',
  OWNER: 'owner',
  sam: 'sam',
};

const featureRegistry = [
  { key: 'welcome', store: 'chat', perm: PERM.ADMIN, aliases: ['benvenuto'], groupOnly: true, name: '👋 Welcome', desc: 'Messaggio di benvenuto' },
  { key: 'goodbye', store: 'chat', perm: PERM.ADMIN, aliases: ['addio'], groupOnly: true, name: '🚪 Addio', desc: 'Messaggio di addio' },
  { key: 'antispam', store: 'chat', perm: PERM.ADMIN, aliases: [], name: '🛑 Antispam', desc: 'Antispam' },
  { key: 'antisondaggi', store: 'chat', perm: PERM.ADMIN, aliases: [], name: '📊🚫 Anti-sondaggi', desc: 'Blocca la creazione di sondaggi (solo non-admin)' },
  { key: 'antiparolacce', store: 'chat', perm: PERM.ADMIN, aliases: ['antitossici'], name: '🧼 Filtro parolacce', desc: 'Avverte e rimuove per parolacce/insulti' },
  { key: 'antiBot', store: 'chat', perm: PERM.ADMIN, aliases: ['antibot', 'antibots'], name: '🤖❌ Antibot', desc: 'Rimuove eventuali bot indesiderati' },
  { key: 'antiBot2', store: 'chat', perm: PERM.ADMIN, aliases: ['antisubbots', 'antisub'], name: '🤖🚫 Anti-subbots', desc: 'Blocca sub-bot nel gruppo' },
  { key: 'antitrava', store: 'chat', perm: PERM.ADMIN, aliases: [], name: '🧨❌ Antitrava', desc: 'Blocca messaggi troppo lunghi (trava)' },
  { key: 'antimedia', store: 'chat', perm: PERM.ADMIN, aliases: [], groupOnly: true, name: '🖼️❌ Antimedia', desc: 'Elimina foto/video permanenti' },
  { key: 'antioneview', store: 'chat', perm: PERM.ADMIN, aliases: ['antiviewonce'], groupOnly: true, name: '👁️‍🗨️ Antiviewonce', desc: 'Antiviewonce' },
  { key: 'antitagall', store: 'chat', perm: PERM.ADMIN, aliases: ['anti-tagall', 'antimentioni'], groupOnly: true, name: '🏷️🚫 Anti-tagall', desc: 'Elimina e avverte se vengono menzionati troppi membri' },
  { key: 'autotrascrizione', store: 'chat', perm: PERM.ADMIN, aliases: ['autotrascrivi', 'autotranscribe', 'autotranscription'], groupOnly: true, name: '📝🎧 Auto-trascrizione', desc: 'Trascrive automaticamente i vocali/audio (anche view-once)' },
  { key: 'autotraduzione', store: 'chat', perm: PERM.ADMIN, aliases: ['autotraduci', 'autotranslate'], groupOnly: true, name: '🌍🈯 Auto-traduzione', desc: 'Traduce automaticamente i messaggi (in italiano)' },
  { key: 'rileva', store: 'chat', perm: PERM.ADMIN, aliases: ['detect'], groupOnly: true, name: '📡 Rileva', desc: 'Rileva eventi gruppo' },
  { key: 'antiporno', store: 'chat', perm: PERM.ADMIN, aliases: ['antiporn', 'antinsfw'], name: '🔞 Antiporno', desc: 'Antiporno' },
  { key: 'antigore', store: 'chat', perm: PERM.ADMIN, aliases: [], name: '🚫 Antigore', desc: 'Antigore' },
  { key: 'modoadmin', store: 'chat', perm: PERM.ADMIN, aliases: ['soloadmin'], name: '🛡️ Soloadmin', desc: 'Solo gli admin possono usare i comandi' },
  { key: 'ai', store: 'chat', perm: PERM.ADMIN, aliases: ['ia'], groupOnly: true, name: '🧠 IA', desc: 'Intelligenza artificiale' },
  { key: 'vocali', store: 'chat', perm: PERM.ADMIN, aliases: ['siri'], groupOnly: true, name: '🎤 Siri', desc: 'Risponde con audio agli audio e msg ricevuti' },
  { key: 'antivoip', store: 'chat', perm: PERM.ADMIN, aliases: [], name: '📞❌ Antivoip', desc: 'Antivoip' },
  { key: 'antiLink', store: 'chat', perm: PERM.ADMIN, aliases: ['antilink', 'nolink'], name: '🔗❌ Antilink', desc: 'Antilink whatsapp' },
  { key: 'antiLinkUni', store: 'chat', perm: PERM.ADMIN, aliases: ['antilinkuni', 'antilinkuniversale', 'antilinktutto'], name: '🌍🔗❌ Antilink universale', desc: 'Blocca tutti i tipi di link' },
  { key: 'antiLink2', store: 'chat', perm: PERM.ADMIN, aliases: ['antilink2', 'antilinkhard', 'antilinksocial'], name: '🌐❌ Antilinksocial', desc: 'Blocca tutti i link di social. Per singoli: .attiva antiig/antitiktok/antiyt..' },
  { key: 'reaction', store: 'chat', perm: PERM.ADMIN, aliases: ['reazioni'], groupOnly: true, name: '😎 Reazioni', desc: 'Reazioni automatiche' },
  { key: 'autolevelup', store: 'chat', perm: PERM.ADMIN, aliases: ['autolivello', 'autolvl'], name: '⬆️ Autolivello', desc: 'Messaggio di livello automatico' },
  { key: 'antiLink2_tiktok', store: 'chat', perm: PERM.ADMIN, aliases: ['antitiktok', 'antitk'], name: '🎵🚫 Anti-TikTok', desc: 'Blocca link TikTok' },
  { key: 'antiLink2_youtube', store: 'chat', perm: PERM.ADMIN, aliases: ['antiyoutube', 'antiyt'], name: '▶️🚫 Anti-YouTube', desc: 'Blocca link YouTube' },
  { key: 'antiLink2_instagram', store: 'chat', perm: PERM.ADMIN, aliases: ['antiinstagram', 'antiig'], name: '📸🚫 Anti-Instagram', desc: 'Blocca link Instagram' },
  { key: 'antiLink2_facebook', store: 'chat', perm: PERM.ADMIN, aliases: ['antifacebook', 'antifb'], name: '👤🚫 Anti-Facebook', desc: 'Blocca link Facebook' },
  { key: 'antiLink2_twitter', store: 'chat', perm: PERM.ADMIN, aliases: ['antitwitter', 'antix'], name: '🐦🚫 Anti-Twitter/X', desc: 'Blocca link Twitter/X' },
  { key: 'antiLink2_telegram', store: 'chat', perm: PERM.ADMIN, aliases: ['antitelegram', 'antitg'], name: '✈️🚫 Anti-Telegram', desc: 'Blocca link Telegram' },
  { key: 'antiLink2_discord', store: 'chat', perm: PERM.ADMIN, aliases: ['antidiscord', 'antidc'], name: '🎮🚫 Anti-Discord', desc: 'Blocca link Discord' },
  { key: 'antiLink2_snapchat', store: 'chat', perm: PERM.ADMIN, aliases: ['antisnapchat', 'antisnap'], name: '👻🚫 Anti-Snapchat', desc: 'Blocca link Snapchat' },
  { key: 'antiLink2_twitch', store: 'chat', perm: PERM.ADMIN, aliases: ['antitwitch'], name: '🟣🚫 Anti-Twitch', desc: 'Blocca link Twitch' },
  { key: 'antiLink2_reddit', store: 'chat', perm: PERM.ADMIN, aliases: ['antireddit'], name: '🔴🚫 Anti-Reddit', desc: 'Blocca link Reddit' },
  { key: 'antiLink2_onlyfans', store: 'chat', perm: PERM.ADMIN, aliases: ['antionlyfans', 'antiof'], name: '🔞🚫 Anti-OnlyFans', desc: 'Blocca link OnlyFans' },
  { key: 'antiLink2_linkedin', store: 'chat', perm: PERM.ADMIN, aliases: ['antilinkedin'], name: '💼🚫 Anti-LinkedIn', desc: 'Blocca link LinkedIn' },
  { key: 'antiLink2_github', store: 'chat', perm: PERM.ADMIN, aliases: ['antigithub'], name: '🐙🚫 Anti-GitHub', desc: 'Blocca link GitHub' },
  { key: 'antiprivato', store: 'bot', perm: PERM.OWNER, aliases: ['antipriv'], name: '🔒 Blocco privato', desc: 'Blocca chi scrive in privato al bot' },
  { key: 'soloe', store: 'bot', perm: PERM.sam, aliases: ['solocreatore', 'solowner', 'soloowner'], name: '👑 Solocreatore', desc: 'Solo il creatore puo usare i comandi' },
  { key: 'multiprefix', store: 'bot', perm: PERM.OWNER, aliases: ['multiprefisso', 'multipref'], onToggle: 'multiprefix', name: '🔣 Multiprefix', desc: 'Permette più prefissi (es: .!/)' },
  { key: 'jadibotmd', store: 'bot', perm: PERM.OWNER, aliases: ['subbots', 'jadibotmd'], name: '🧬 Subbots', desc: 'Bot multi-sessione' },
  { key: 'antispambot', store: 'bot', perm: PERM.OWNER, aliases: [], name: '🤖🛑 Anti-spam comandi', desc: 'Limita lo spam di comandi (globale in tutti i gruppi)' },
  { key: 'autoread', store: 'bot', perm: PERM.OWNER, aliases: ['read', 'lettura'], name: '👀 Lettura', desc: 'Il bot legge automaticamente i messaggi (poco + lag - ban)' },
  { key: 'anticall', store: 'bot', perm: PERM.sam, aliases: [], name: '❌📞 Antichiamate', desc: 'Rifiuta automaticamente le chiamate al bot' },
  { key: 'registrazioni', store: 'bot', perm: PERM.OWNER, aliases: ['registrazione', 'reg'], name: '📛 Obbligo registrazione', desc: 'Richiede registrazione per usare alcuni comandi' },
];

const aliasMap = new Map();
for (const feat of featureRegistry) {
  aliasMap.set(feat.key.toLowerCase(), feat);
  for (const alias of feat.aliases) {
    aliasMap.set(alias.toLowerCase(), feat);
  }
}

const adminkeyz = new Set([
  'welcome', 'goodbye', 'antispam', 'antisondaggi', 'antiparolacce',
  'antiBot', 'antitrava', 'antimedia', 'antioneview', 'antitagall',
  'autotrascrizione', 'autotraduzione', 'rileva', 'antiporno', 'antigore',
  'modoadmin', 'ai', 'vocali', 'antivoip', 'antiLink', 'antiLinkUni',
  'antiLink2', 'reaction', 'autolevelup'
]);
const ownerkeyz = new Set([
  'antiprivato', 'soloCreatore', 'multiprefix', 'jadibotmd',
  'antispambot', 'autoread', 'anticall', 'registrazioni'
]);

const adminz = featureRegistry.filter(f => adminkeyz.has(f.key));
const ownerz = featureRegistry.filter(f => ownerkeyz.has(f.key));

function checkPermission(feat, { m, isAdmin, isOwner, isSam }) {
  if (feat.groupOnly && !m.isGroup && !isOwner) {
    return '✦ 𝐆𝐑𝐔𝐏𝐏𝐎 ✦\n╰➤ Comando valido solo nei gruppi';
  }
  switch (feat.perm) {
    case PERM.sam:
      if (!isSam) return '✦ 𝐎𝐖𝐍𝐄𝐑 ✦\n╰➤ Richiede privilegi di proprietario';
      break;
    case PERM.OWNER:
      if (feat.store === 'bot' && !isOwner && !isSam) return '✦ 𝐎𝐖𝐍𝐄𝐑 ✦\n╰➤ Richiede privilegi di proprietario';
      if (feat.store === 'chat' && m.isGroup && !(isAdmin || isOwner || isSam))
        return '\n🛡️ 𝐒𝐎𝐋𝐎 𝐀𝐃𝐌𝐈𝐍 🛡️\n╰➤ ✦ Comando utilizzabile solo dagli Admin del gruppo';
      break;
    case PERM.ADMIN:
      if (m.isGroup && !(isAdmin || isOwner || isSam))
        return '\n🛡️ 𝐒𝐎𝐋𝐎 𝐀𝐃𝐌𝐈𝐍 🛡️\n╰➤ ✦ Comando utilizzabile solo dagli Admin del gruppo';
      break;
  }
  return null;
}

function handleMultiprefixToggle(bot) {
  try {
    const defaultSinglePrefix = (typeof global.prefisso === 'string' && global.prefisso.trim()) ? global.prefisso.trim() : '.';
    const raw = typeof bot.prefix === 'string' ? bot.prefix.trim() : '';
    const p = (bot.multiprefix === true && (!raw || raw.length <= 1)) ? (raw || global.opts.prefix) : (raw || defaultSinglePrefix);
    if (bot.multiprefix === true) {
      global.prefix = new RegExp('^[' + String(p).replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']');
    } else {
      const c = String(p)[0] || '.';
      global.prefix = new RegExp('^' + String(c).replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&'));
    }
  } catch {}
}

let handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isSam }) => {
  const userName = m.pushName || 'Utente';

  let groupProfilePicBuffer;
  try {
    const profilePicUrl = await conn.profilePictureUrl(m.chat, 'image');
    const ab = await (await fetch(profilePicUrl)).arrayBuffer();
    groupProfilePicBuffer = Buffer.from(ab);
  } catch (e) {
    try {
      const ab2 = await (await fetch(global.foto)).arrayBuffer();
      groupProfilePicBuffer = Buffer.from(ab2);
    } catch (e2) {
      groupProfilePicBuffer = Buffer.from([]);
    }
  }

  let dynamicContextInfo;
  if (global.fake && global.fake.contextInfo) {
    dynamicContextInfo = global.fake.contextInfo;
  } else {
    dynamicContextInfo = {
      externalAdReply: {
        title: "✨ 𝐆𝐈𝐔𝐒𝐄𝐁𝐎𝐓 ✨",
        body: "Pannello di Controllo Moduli",
        mediaType: 1,
        jpegThumbnail: groupProfilePicBuffer
      }
    };
  }

  let isEnable = /true|enable|attiva|(turn)?on|1/i.test(command);
  if (/disable|disattiva|off|0/i.test(command)) isEnable = false;

  global.db.data.chats = global.db.data.chats || {};
  global.db.data.users = global.db.data.users || {};
  global.db.data.settings = global.db.data.settings || {};
  global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {};
  global.db.data.users[m.sender] = global.db.data.users[m.sender] || {};
  const botJid = conn.decodeJid(conn.user.jid);
  global.db.data.settings[botJid] = global.db.data.settings[botJid] || {};
  let chat = global.db.data.chats[m.chat];
  let user = global.db.data.users[m.sender];
  let bot = global.db.data.settings[botJid];
  let settings = global.db.data.settings;

  const getStatus = (key) => {
    const feat = aliasMap.get(key.toLowerCase());
    if (!feat) return false;
    const target = feat.store === 'bot' ? bot : chat;
    return target[feat.key] || false;
  };

  const createSections = (features) => {
    const active = features.filter(f => getStatus(f.key));
    const inactive = features.filter(f => !getStatus(f.key));
    return [
      { title: '🔴 𝐃𝐢𝐬𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐢', rows: inactive.map(f => ({ title: f.name, description: f.desc, id: `${usedPrefix}attiva ${f.key}` })) },
      { title: '🟢 𝐀𝐭𝐭𝐢𝐯𝐚𝐭𝐢', rows: active.map(f => ({ title: f.name, description: f.desc, id: `${usedPrefix}disattiva ${f.key}` })) }
    ];
  };

  const buildVcard = () => `BEGIN:VCARD\nVERSION:3.0\nN:;${userName};;;\nFN:${userName}\nitem1.X-ABLabel:📱 Cellulare\nitem1.TEL;waid=${m.sender.split('@')[0]}:+${m.sender.split('@')[0]}\nitem2.EMAIL;type=INTERNET:bot@whatsapp.com\nitem2.X-ABLabel:💌 Email\nEND:VCARD`;

  if (!args.length) {
    const adminSections = createSections(adminz);
    const ownerSections = createSections(ownerz);
    const giusebotImg = 'https://i.ibb.co/6N6sXXv/giusebot.jpg'; // Puoi sostituire con la tua immagine

    const adminCard = {
      image: { url: giusebotImg },
      title: '『 👥 𝐒𝐄𝐓𝐓𝐈𝐍𝐆𝐒 𝐀𝐃𝐌𝐈𝐍 👥 』',
      body: '╰➤ ✦ *Imposta le funzioni del gruppo*',
      footer: '✨ 𝐆𝐈𝐔𝐒𝐄𝐁𝐎𝐓 𝐒𝐘𝐒𝐓𝐄𝐌 ✨',
      buttons: [{ name: 'single_select', buttonParamsJson: JSON.stringify({ title: '⚙️ Apri Pannello', sections: adminSections }) }]
    };

    let cards = [adminCard];
    if (isOwner || isSam) {
      cards.push({
        image: { url: 'https://i.ibb.co/kVdFLyGL/sam.jpg' },
        title: '『 👑 𝐒𝐄𝐓𝐓𝐈𝐍𝐆𝐒 𝐎𝐖𝐍𝐄𝐑 👑 』',
        body: '╰➤ ✦ *Imposta le funzioni globali del bot*',
        footer: '✨ 𝐆𝐈𝐔𝐒𝐄𝐁𝐎𝐓 𝐒𝐘𝐒𝐓𝐄𝐌 ✨',
        buttons: [{ name: 'single_select', buttonParamsJson: JSON.stringify({ title: '⚙️ Apri Pannello', sections: ownerSections }) }]
      });
    }

    const fkontak_menu = {
      key: { participant: m.sender, remoteJid: '0@s.whatsapp.net', fromMe: false, id: 'BotAssistant' },
      message: { contactMessage: { displayName: userName, vcard: buildVcard(), jpegThumbnail: groupProfilePicBuffer } },
      participant: m.sender
    };

    return conn.sendMessage(m.chat, {
      text: '*⚙️ 𝐏𝐀𝐍𝐍𝐄𝐋𝐋𝐎 𝐃𝐈 𝐂𝐎𝐍𝐓𝐑𝐎𝐋𝐋𝐎 ⚙️*',
      footer: '✨ 𝐆𝐈𝐔𝐒𝐄𝐁𝐎𝐓 ✨',
      cards,
      contextInfo: dynamicContextInfo
    }, { quoted: fkontak_menu });
  }

  let results = [];
  for (let type of args.map(arg => arg.toLowerCase())) {
    let result = { type, status: '', success: false };

    const feat = aliasMap.get(type);
    if (!feat) {
      result.status = '❌ *Comando Sconosciuto*';
      results.push(result);
      continue;
    }

    const permError = checkPermission(feat, { m, isAdmin, isOwner, isSam });
    if (permError) {
      result.status = permError;
      results.push(result);
      continue;
    }

    const target = feat.store === 'bot' ? bot : chat;
    if (target[feat.key] === isEnable) {
      result.status = `⚠️ *Già ${isEnable ? 'Attivo' : 'Disattivato'}*`;
      results.push(result);
      continue;
    }

    target[feat.key] = isEnable;

    if (feat.onToggle === 'multiprefix') handleMultiprefixToggle(bot);

    result.status = `✅ *${isEnable ? 'Attivato' : 'Disattivato'}*`;
    result.success = true;
    results.push(result);
  }

  let summaryMessage = `╭━━━〔 ⚙️ 𝐑𝐈𝐄𝐏𝐈𝐋𝐎𝐆𝐎 ⚙️ 〕━━━⬣\n`;
  for (const result of results) {
    const cleanType = String(result.type || '').trim();
    const cleanStatus = String(result.status || '').replace(/^\s*\n+/, ' ').replace(/^\s*-\s*/, ' ').trimEnd();
    summaryMessage += `┃ 🔹 \`${cleanType}\` ╰➤ ${cleanStatus ? ' ' + cleanStatus : ''}\n`;
  }
  summaryMessage += `╰━━━━━━━━━━━━━━━━━━⬣`;

  const fkontak_confirm = {
    key: { participant: m.sender, remoteJid: '0@s.whatsapp.net', fromMe: false, id: 'BotFunction' },
    message: { contactMessage: { displayName: userName, vcard: buildVcard(), jpegThumbnail: groupProfilePicBuffer } },
    participant: m.sender
  };

  await conn.sendMessage(m.chat, { text: summaryMessage, contextInfo: dynamicContextInfo }, { quoted: fkontak_confirm });
};

handler.help = ['attiva', 'disattiva'];
handler.tags = ['main'];
handler.command = ['enable', 'disable', 'attiva', 'disattiva', 'on', 'off'];

export default handler;
