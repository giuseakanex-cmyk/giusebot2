let handler = async (m, { conn, command, isOwner, isAdmin, usedPrefix }) => {
    // Sicurezza: solo tu o gli admin potete addormentare/svegliare il bot
    if (!isOwner && !isAdmin) return m.reply('❌ Solo gli Admin o Giuse possono evocare questa magia.')

    // Assicuriamoci che il database per questa chat esista
    global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}
    let chat = global.db.data.chats[m.chat]

    if (command === 'off' || command === 'ghost') {
        if (chat.isBanned) return m.reply('⟡ _Il bot è già nell\'ombra in questo gruppo._')
        
        chat.isBanned = true // Questo dice all'handler di ignorare i messaggi
        
        let txt = `
⊹ ࣪ ˖ ✦ ━━ 𝐆 𝐇 𝐎 𝐒 𝐓   𝐌 𝐎 𝐃 𝐄 ━━ ✦ ˖ ࣪ ⊹

⋆ 𝐒𝐭𝐚𝐭𝐨 ➻ 𝐀𝐭𝐭𝐢𝐯𝐚𝐭𝐨 🌙
⋆ 𝐄𝐟𝐟𝐞𝐭𝐭𝐨 ➻ 𝐈𝐥 𝐛𝐨𝐭 𝐨𝐫𝐚 𝐢𝐠𝐧𝐨𝐫𝐚 𝐢 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢.

⟡ _Legam Bot è scivolato nell'ombra..._
⟡ _(Scrivi ${usedPrefix}on per risvegliarlo)_

👑 𝐎𝐖𝐍𝐄𝐑 ➤ 𝐆𝐈𝐔𝐒𝚵
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim()

        await conn.sendMessage(m.chat, {
            image: { url: 'https://files.catbox.moe/pyp87f.jpg' }, // La tua Pixel Art funzionante
            caption: txt
        }, { quoted: m })

    } else if (command === 'on') {
        if (!chat.isBanned) return m.reply('⟡ _Il bot è già sveglio e operativo._')
        
        chat.isBanned = false // Risveglia il bot
        
        let txt = `
⊹ ࣪ ˖ ✦ ━━━ 𝐎 𝐍 𝐋 𝐈 𝐍 𝐄 ━━━ ✦ ˖ ࣪ ⊹

⋆ 𝐒𝐭𝐚𝐭𝐨 ➻ 𝐀𝐭𝐭𝐢𝐯𝐨 ☀️
⋆ 𝐄𝐟𝐟𝐞𝐭𝐭𝐨 ➻ 𝐈𝐥 𝐛𝐨𝐭 𝐞̀ 𝐭𝐨𝐫𝐧𝐚𝐭𝐨 𝐨𝐩𝐞𝐫𝐚𝐭𝐢𝐯𝐨.

⟡ _L'ombra si dissolve. Legam Bot è in ascolto._

👑 𝐎𝐖𝐍𝐄𝐑 ➤ 𝐆𝐈𝐔𝐒𝚵
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim()

        await conn.sendMessage(m.chat, {
            image: { url: 'https://files.catbox.moe/pyp87f.jpg' }, 
            caption: txt
        }, { quoted: m })
    }
}

handler.help = ['ghost', 'on', 'off']
handler.tags = ['owner']
handler.command = /^(ghost|off|on)$/i

export default handler
