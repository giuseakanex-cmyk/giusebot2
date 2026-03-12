import fs from 'fs'
import path from 'path'

let handler = async (m, { conn }) => {
    // --- 1. CONTROLLO ACCESSI (Solo Owner e Admin) ---
    let isBotOwner = global.owner.some(o => m.sender.includes(o[0])) || m.fromMe
    let isAdmin = false

    if (m.isGroup) {
        const groupMetadata = await conn.groupMetadata(m.chat)
        isAdmin = groupMetadata.participants.some(p => p.id === m.sender && (p.admin === 'admin' || p.admin === 'superadmin'))
    }

    if (!isBotOwner && !isAdmin) {
        return m.reply('🚫 *ACCESSO NEGATO:*\nComando riservato agli Admin o al Creatore del bot.')
    }

    // --- 2. IMPOSTAZIONE CARTELLA ESATTA ---
    const sessionFolder = './varesession' // <--- Inserito il nome corretto della tua repo!
    
    if (!fs.existsSync(sessionFolder)) {
        return m.reply('⚠️ *Errore:* La cartella "varesession" non è stata trovata. Il bot è già pulito o il percorso è errato.')
    }

    // Reaction clessidra: il bot sta lavorando
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } })

    let deletedFiles = 0
    let freedBytes = 0
    let files = fs.readdirSync(sessionFolder)
    
    // 🛡️ IL SALVAVITA: Questo file NON DEVE ESSERE TOCCATO
    const fileSalvavita = 'creds.json'

    // --- 3. IL CICLO DI DISTRUZIONE (SICURO AL 100%) ---
    for (let file of files) {
        // LA REGOLA D'ORO: Se il file NON È creds.json, procedi.
        if (file !== fileSalvavita) { 
            try {
                let filePath = path.join(sessionFolder, file)
                let stats = fs.statSync(filePath)
                
                // Controllo extra: elimina solo i file (non eventuali sottocartelle)
                if (stats.isFile()) {
                    freedBytes += stats.size 
                    fs.unlinkSync(filePath) // 🔥 Elimina la cache spazzatura
                    deletedFiles++
                }
            } catch (e) {
                console.error(`❌ Non sono riuscito a eliminare ${file}:`, e)
            }
        }
    }

    // Calcolo peso
    let freedMB = (freedBytes / 1024 / 1024).toFixed(2)

    // --- 4. GRAFICA E RESOCONTO ---
    let txt = `
┏━━━━━━ ≪ 🧹 ≫ ━━━━━━┓
     *𝐒𝐘𝐒𝐓𝐄𝐌 𝐂𝐋𝐄𝐀𝐍𝐔𝐏*
┗━━━━━━ ≪ 🧹 ≫ ━━━━━━┛

✅ *𝐎𝐭𝐭𝐢𝐦𝐢𝐳𝐳𝐚𝐳𝐢𝐨𝐧𝐞 𝐂𝐨𝐦𝐩𝐥𝐞𝐭𝐚𝐭𝐚!*

🗑️ *𝐅𝐢𝐥𝐞 𝐞𝐥𝐢𝐦𝐢𝐧𝐚𝐭𝐢:* ${deletedFiles}
💾 *𝐒𝐩𝐚𝐳𝐢𝐨 𝐥𝐢𝐛𝐞𝐫𝐚𝐭𝐨:* ${freedMB} MB
🛡️ *𝐂𝐨𝐧𝐧𝐞𝐬𝐬𝐢𝐨𝐧𝐞:* Intatta (creds.json al sicuro)
⚡ *𝐄𝐬𝐞𝐠𝐮𝐢𝐭𝐨 𝐝𝐚:* @${m.sender.split('@')[0]}

✨ _LegamBot Cache Manager_`.trim()

    await conn.sendMessage(m.chat, { 
        text: txt,
        mentions: [m.sender],
        contextInfo: {
            externalAdReply: {
                title: "⚙️ CACHE CLEARED SUCCESSFULLY",
                body: `Liberati ${freedMB} MB dalla cartella varesession`,
                thumbnailUrl: "https://files.catbox.moe/k37h9r.jpg", 
                sourceUrl: "https://github.com/giuseakanex-cmyk/legambot",
                mediaType: 1,
                renderLargerThumbnail: true 
            }
        }
    }, { quoted: m })

    // Reaction spunta: operazione finita
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } })
}

handler.command = ['ds', 'clear', 'clean']

export default handler
