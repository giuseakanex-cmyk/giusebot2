let handler = async (m, { conn, command, isOwner, usedPrefix }) => {
    // 🛡️ SICUREZZA ASSOLUTA: SOLO L'OWNER PUÒ USARLO
    if (!isOwner) return m.reply('❌ Solo Giuse possiede il potere di evocare l\'ombra.')

    // Identifichiamo il bot stesso per spegnerlo globalmente (non solo nel gruppo)
    let botJid = conn.decodeJid(conn.user.jid)
    global.db.data.settings[botJid] = global.db.data.settings[botJid] || {}
    let bot = global.db.data.settings[botJid]

    if (command === 'off' || command === 'ghost') {
        if (bot.isBanned) return m.reply('⟡ _Legam Bot è già in Modalità Ghost._')
        
        bot.isBanned = true // 🔴 Spegne il bot GLOBALMENTE per tutti gli utenti

        // 👻 Fa sparire la scritta "Online" su WhatsApp
        await conn.sendPresenceUpdate('unavailable')
        
        let txt = `
⊹ ࣪ ˖ ✦ ━━ 𝐆 𝐇 𝐎 𝐒 𝐓   𝐌 𝐎 𝐃 𝐄 ━━ ✦ ˖ ࣪ ⊹

⋆ 𝐒𝐭𝐚𝐭𝐨 ➻ 𝐀𝐭𝐭𝐢𝐯𝐚𝐭𝐨 🌙
⋆ 𝐄𝐟𝐟𝐞𝐭𝐭𝐨 ➻ 𝐈𝐥 𝐛𝐨𝐭 𝐞̀ 𝐨𝐫𝐚 𝐢𝐧 𝐬𝐨𝐧𝐧𝐨 𝐩𝐫𝐨𝐟𝐨𝐧𝐝𝐨.

⟡ _Legam Bot scivola nell'ombra. Ignorerà chiunque._
⟡ _(Scrivi ${usedPrefix}on per risvegliarlo)_

👑 𝐎𝐖𝐍𝐄𝐑 ➤ 𝐆𝐈𝐔𝐒𝚵
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim()

        await conn.sendMessage(m.chat, { text: txt }, { quoted: m })

    } else if (command === 'on') {
        if (!bot.isBanned) return m.reply('⟡ _Legam Bot è già sveglio e operativo._')
        
        bot.isBanned = false // 🟢 Riaccende il bot GLOBALMENTE
        
        // ☀️ Fa riapparire la scritta "Online" su WhatsApp
        await conn.sendPresenceUpdate('available')
        
        let txt = `
⊹ ࣪ ˖ ✦ ━━━ 𝐎 𝐍 𝐋 𝐈 𝐍 𝐄 ━━━ ✦ ˖ ࣪ ⊹

⋆ 𝐒𝐭𝐚𝐭𝐨 ➻ 𝐀𝐭𝐭𝐢𝐯𝐨 ☀️
⋆ 𝐄𝐟𝐟𝐞𝐭𝐭𝐨 ➻ 𝐈𝐥 𝐛𝐨𝐭 𝐞̀ 𝐭𝐨𝐫𝐧𝐚𝐭𝐨 𝐨𝐩𝐞𝐫𝐚𝐭𝐢𝐯𝐨 𝐨𝐯𝐮𝐧𝐪𝐮𝐞.

⟡ _L'ombra si dissolve. Legam Bot è di nuovo in ascolto._

👑 𝐎𝐖𝐍𝐄𝐑 ➤ 𝐆𝐈𝐔𝐒𝚵
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim()

        await conn.sendMessage(m.chat, { text: txt }, { quoted: m })
    }
}

handler.help = ['ghost', 'on', 'off']
handler.tags = ['owner']
handler.command = /^(ghost|off|on)$/i

// Ulteriore blocco di sicurezza di base: comando riservato solo all'Owner
handler.owner = true 

export default handler
