import translate from '@vitalets/google-translate-api'

let handler = async (m, { args, usedPrefix, command }) => {
    let lang = args[0]
    let text = args.slice(1).join(' ')
    
    if (!lang || !text) return m.reply(`✨ Esempio: *${usedPrefix + command} it Hello world*`)

    try {
        let res = await translate(text, { to: lang })
        let txt = `
✦ ⁺ . ⁺ ✦ 𝐓𝐑𝐀𝐃𝐔𝐙𝐈𝐎𝐍𝐄 ✦ ⁺ . ⁺ ✦

⋆ 𝐃𝐚 ➻ ${res.from.language.iso}
⋆ 𝐀 ➻ ${lang}

⟡ 𝐓𝐞𝐬𝐭𝐨: ${res.text}

✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim()
        
        m.reply(txt)
    } catch {
        m.reply('❌ Errore nella traduzione. Controlla il codice lingua (es: it, en, fr).')
    }
}

handler.help = ['tr']
handler.tags = ['util']
handler.command = /^(tr|translate)$/i

export default handler
