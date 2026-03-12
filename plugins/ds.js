import fs from 'fs'
import path from 'path'

let handler = async (m, { conn }) => {
    // --- 1. SISTEMA DI SICUREZZA (Owner + Admin) ---
    let isBotOwner = global.owner.some(o => m.sender.includes(o[0])) || m.fromMe
    let isAdmin = false

    // Se il comando viene usato in un gruppo, controlla se l'utente è Admin
    if (m.isGroup) {
        const groupMetadata = await conn.groupMetadata(m.chat)
        isAdmin = groupMetadata.participants.some(p => p.id === m.sender && (p.admin === 'admin' || p.admin === 'superadmin'))
    }

    // Se non è né Owner né Admin, blocca tutto
    if (!isBotOwner && !isAdmin) {
        return m.reply('🚫 *ACCESSO NEGATO:*\nSolo il mio Creatore o gli Admin del gruppo possono svuotare la cache.')
    }
    // ------------------------------------------------

    const sessionFolder = './alvare' 
    
    if (!fs.existsSync(sessionFolder)) {
        return m.reply('⚠️ *Errore:* La cartella della sessione non è stata trovata.')
    }

    // Reaction di caricamento
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } })

    let deletedFiles = 0
    let freedBytes = 0
    let files = fs.readdirSync(sessionFolder)
    const fileSalvavita = 'creds.json'

    for (let file of files) {
        if (file !== fileSalvavita) {
            try {
                let filePath = path.join(sessionFolder, file)
                let stats = fs.statSync(filePath)
                freedBytes += stats.size 
                
                fs.unlinkSync(filePath)
                deletedFiles++
            } catch (e) {
                console.error(`❌ Errore nell'eliminare ${file}:`, e)
            }
        }
    }

    let freedMB = (freedBytes / 1024 / 1024).toFixed(2)

    let txt = `
┏━━━━━━ ≪ 🧹 ≫ ━━━━━━┓
     *𝐒𝐘𝐒𝐓𝐄𝐌 𝐂𝐋𝐄𝐀𝐍𝐔𝐏*
┗━━━━━━ ≪ 🧹 ≫ ━━━━━━┛

✅ *𝐎𝐭𝐭𝐢𝐦𝐢𝐳𝐳𝐚𝐳𝐢𝐨𝐧𝐞 𝐂𝐨𝐦𝐩𝐥𝐞𝐭𝐚𝐭𝐚!*

🗑️ *𝐅𝐢𝐥𝐞 𝐞𝐥𝐢𝐦𝐢𝐧𝐚𝐭𝐢:* ${deletedFiles}
💾 *𝐒𝐩𝐚𝐳𝐢𝐨 𝐥𝐢𝐛𝐞𝐫𝐚𝐭𝐨:* ${freedMB} MB
🛡️ *𝐂𝐨𝐧𝐧𝐞𝐬𝐬𝐢𝐨𝐧𝐞:* Sicura (creds.json)
⚡ *𝐄𝐬𝐞𝐠𝐮𝐢𝐭𝐨 𝐝𝐚:* @${m.sender.split('@')[0]}

✨ _LegamBot Cache Manager_`.trim()

    await conn.sendMessage(m.chat, { 
        text: txt,
        mentions: [m.sender], // Tagga chi ha eseguito il comando
        contextInfo: {
            externalAdReply: {
                title: "⚙️ CACHE CLEARED SUCCESSFULLY",
                body: `Liberati ${freedMB} MB di RAM e Disco`,
                thumbnailUrl: "https://files.catbox.moe/k37h9r.jpg", 
                sourceUrl: "https://github.com/giuseakanex-cmyk/legambot",
                mediaType: 1,
                renderLargerThumbnail: true 
            }
        }
    }, { quoted: m })

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } })
}

handler.command = ['ds', 'clear', 'clean']

// NOTA BENE: Ho rimosso "handler.owner = true" alla fine,
// perché ora il controllo lo facciamo in modo più intelligente in cima al codice!

export default handler
