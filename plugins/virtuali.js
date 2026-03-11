// Database temporaneo per le partite in corso, By Giuse
global.virtualMatches = global.virtualMatches || {}

// Funzione presa dal tuo wallet per formattare i numeri
function formatNumber(num) {
    return new Intl.NumberFormat('it-IT').format(num)
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let chatId = m.chat

    // ==========================================
    // COMANDO 1: .virtuali (Crea la partita)
    // ==========================================
    if (command === 'virtuali') {
        if (global.virtualMatches[chatId]) {
            return m.reply(`⚠️ *C'è già una partita in corso in questo gruppo!* Aspetta il fischio finale.`)
        }

        const squadre = ["Napoli", "Inter", "Juventus", "Milan", "Bologna", "Roma", "Atalanta", "Lazio", "Fiorentina", "Torino", "Monza", "Genoa", "Lecce", "Udinese", "Verona", "Cagliari", "Empoli", "Como", "Parma", "Venezia"]
        let shuffled = squadre.sort(() => 0.5 - Math.random())
        let sq1 = shuffled[0]
        let sq2 = shuffled[1]

        global.virtualMatches[chatId] = {
            state: 'betting',
            sq1: sq1,
            sq2: sq2,
            score1: 0,
            score2: 0,
            bets: [],
            timer: null
        }

        // Il nuovo tabellone con quote e nuove scommesse!
        let msg = `
╭━━✧⚽SERIE A VIRTUALE⚽✦━━╮

🏟️ *${sq1}* vs *${sq2}*

📊 *QUOTE DISPONIBILI:*
🔹 *1* (Vince ${sq1}) ➔ *2.0x*
🔹 *X* (Pareggio) ➔ *3.0x*
🔹 *2* (Vince ${sq2}) ➔ *2.0x*
🔹 *GG* (Entrambe segnano) ➔ *1.8x*
🔹 *NG* (Almeno una a secco) ➔ *1.8x*
🔹 *OVER* (Più di 2 gol totali) ➔ *2.0x*
🔹 *UNDER* (Max 2 gol totali) ➔ *1.8x*
🔹 *1X* / *X2* (Doppia Chance) ➔ *1.3x*
🔹 *12* (Nessun Pareggio) ➔ *1.2x*

⏳ *BOTTEGHINO APERTO!*
Avete *25 secondi* per puntare!

👉 Usa: *${usedPrefix}punta [ESITO] [EURO]*
_Es: ${usedPrefix}punta OVER 500_
╰━━━━━━✧✦━━━━━━━━━━━━╯`.trim()

        m.reply(msg)

        // Timer impostato a 25 secondi (25000 millisecondi)
        global.virtualMatches[chatId].timer = setTimeout(async () => {
            await avviaPartita(conn, chatId)
        }, 25000)
        
        return
    }

    // ==========================================
    // COMANDO 2: .punta (Piazza la scommessa)
    // ==========================================
    if (command === 'punta' || command === 'bet') {
        let match = global.virtualMatches[chatId]
        
        if (!match) return m.reply(`⚠️ Nessun match in programma! Usa *${usedPrefix}virtuali* per crearne uno.`)
        if (match.state !== 'betting') return m.reply(`⛔ Troppo tardi! L'arbitro ha già fischiato l'inizio.`)

        let user = global.db.data.users[m.sender]
        if (!args[0] || !args[1]) return m.reply(`👉 Usa: *${usedPrefix}punta [ESITO] [EURO]*\nGuarda il tabellone per gli esiti!`)
        
        let scommessa = args[0].toUpperCase()
        let puntata = parseInt(args[1])
        
        // Nuova lista di giocate valide
        let valide = ['1', 'X', '2', 'GG', 'NG', 'OVER', 'UNDER', '1X', 'X2', '12']

        if (!valide.includes(scommessa)) return m.reply(`⚠️ Esito non valido!\nScegli tra: *1, X, 2, GG, NG, OVER, UNDER, 1X, X2, 12*.`)
        if (isNaN(puntata) || puntata <= 0) return m.reply(`⚠️ Inserisci una puntata valida!`)
        if (user.euro < puntata) return m.reply(`💸 Fondi insufficienti! Hai solo *${formatNumber(user.euro)} €*.`)
        
        if (match.bets.some(b => b.sender === m.sender)) {
            return m.reply(`⚠️ Hai già piazzato la tua scommessa! Guarda la partita ora.`)
        }

        user.euro -= puntata
        match.bets.push({ sender: m.sender, scommessa, puntata })

        m.reply(`🎟️ *SCHEDINA REGISTRATA*\nHai puntato *${formatNumber(puntata)} €* sull'esito *${scommessa}*\n🏦 Saldo: *${formatNumber(user.euro)} €*`)
    }
}

// ==========================================
// TELECRONACA E RISULTATI
// ==========================================
async function avviaPartita(conn, chatId) {
    let match = global.virtualMatches[chatId]
    if (!match) return
    
    match.state = 'playing'

    await conn.sendMessage(chatId, { text: `⛔ *SCOMMESSE CHIUSE!*\n\n⚽ L'arbitro fischia l'inizio del match tra *${match.sq1}* e *${match.sq2}*!\n_Collegamento con il campo per gli highlights..._` })

    let eventsCount = Math.floor(Math.random() * 3) + 4 // Da 4 a 6 eventi salienti
    
    // Genera i minuti casuali per le azioni
    let minutiAzione = []
    for (let i = 0; i < eventsCount; i++) {
        minutiAzione.push(Math.floor(Math.random() * 89) + 1) // Genera minuti da 1 a 89
    }
    
    // ORDINA i minuti dal più piccolo al più grande per creare senso logico temporale
    minutiAzione.sort((a, b) => a - b)
    
    for (let i = 0; i < eventsCount; i++) {
        await new Promise(resolve => setTimeout(resolve, 6000)) 
        
        let isTeam1 = Math.random() > 0.5
        let team = isTeam1 ? match.sq1 : match.sq2
        let actionType = Math.random()
        let msg = ''

        if (actionType < 0.35) {
            if (isTeam1) match.score1++
            else match.score2++
            msg = `⚽ *RETEEE!!! GOOOAAALLLL!!!*\nIl ${team} la sblocca con un tiro all'incrocio dei pali!\n\n📊 *${match.sq1} ${match.score1} - ${match.score2} ${match.sq2}*`
        } else if (actionType < 0.60) {
            msg = `😱 *OCCASIONE CLAMOROSA!*\nL'attaccante del ${team} a tu per tu col portiere tira fuori di un soffio!`
        } else if (actionType < 0.80) {
            let color = Math.random() > 0.8 ? '🟥 *CARTELLINO ROSSO*' : '🟨 *CARTELLINO GIALLO*'
            msg = `${color}!\nBrutto fallo di un giocatore del ${team}, l'arbitro non perdona.`
        } else {
            msg = `💥 *PALO PIENO!*\nChe sfortuna per il ${team}, legno pieno a portiere battuto!`
        }

        let minuto = minutiAzione[i]
        await conn.sendMessage(chatId, { text: `⏱️ *Minuto ${minuto}'*\n${msg}` })
    }

    await new Promise(resolve => setTimeout(resolve, 5000))

    // ==========================================
    // CALCOLO DEI NUOVI ESITI
    // ==========================================
    let is1 = match.score1 > match.score2
    let isX = match.score1 === match.score2
    let is2 = match.score1 < match.score2
    let isGG = match.score1 > 0 && match.score2 > 0
    let isNG = match.score1 === 0 || match.score2 === 0
    let isOver = (match.score1 + match.score2) > 2
    let isUnder = (match.score1 + match.score2) <= 2
    let is1X = is1 || isX
    let isX2 = is2 || isX
    let is12 = is1 || is2

    let winnersTxt = ''
    let scommettitori = match.bets.map(b => b.sender)
    
    for (let b of match.bets) {
        let won = false
        let multiplier = 0.0
        
        // Verifica vincite con le nuove quote
        switch(b.scommessa) {
            case '1': if (is1) { won = true; multiplier = 2.0; } break;
            case 'X': if (isX) { won = true; multiplier = 3.0; } break;
            case '2': if (is2) { won = true; multiplier = 2.0; } break;
            case 'GG': if (isGG) { won = true; multiplier = 1.8; } break;
            case 'NG': if (isNG) { won = true; multiplier = 1.8; } break;
            case 'OVER': if (isOver) { won = true; multiplier = 2.0; } break;
            case 'UNDER': if (isUnder) { won = true; multiplier = 1.8; } break;
            case '1X': if (is1X) { won = true; multiplier = 1.3; } break;
            case 'X2': if (isX2) { won = true; multiplier = 1.3; } break;
            case '12': if (is12) { won = true; multiplier = 1.2; } break;
        }

        if (won) {
            let winAmount = Math.floor(b.puntata * multiplier)
            global.db.data.users[b.sender].euro += winAmount
            winnersTxt += `\n👤 @${b.sender.split('@')[0]} vince *+${formatNumber(winAmount)} €* (Quota ${multiplier}x)`
        }
    }

    let finale = `
╭━━✧🏁TRIPLICE FISCHIO🏁✦━━╮

🏟️ *${match.sq1} ${match.score1} - ${match.score2} ${match.sq2}*
─────────────────`

    if (match.bets.length === 0) {
        finale += `\n😅 Nessuno ha scommesso!`
    } else if (winnersTxt === '') {
        finale += `\n😭 *STRAGE!* Nessuno ha indovinato.`
    } else {
        finale += `\n🏆 *VINCITORI:*${winnersTxt}`
    }
    
    finale += `\n╰━━━━━━✧✦━━━━━━━━━━━━╯`

    await conn.sendMessage(chatId, { text: finale.trim(), mentions: scommettitori })
    
    delete global.virtualMatches[chatId]
}

handler.command = ['virtuali', 'punta']
handler.group = true
export default handler
