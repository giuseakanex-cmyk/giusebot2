let handler = m => m

// Impostiamo una priorità altissima per farlo eseguire PRIMA dei controlli dell'handler
handler.priority = -1000 

handler.before = async function (m, { chat, conn }) {
    if (!m.isGroup) return false
    
    // Controlliamo come il tuo bot chiama i moderatori nel database
    // Prova tutte le varianti comuni
    let listaMod = chat.moderatori || chat.moderators || chat.mods || []
    
    // Verifichiamo se chi scrive è nella lista
    let isModLocale = listaMod.includes(m.sender)

    if (isModLocale) {
        // TRUCCO: Se è un mod, diciamo all'handler che è un Admin e un Owner
        // Questo sblocca sia il "Modo Admin" che i comandi riservati
        m.isAdmin = true
        m.isOwner = true // Lo aggiungiamo per sicurezza temporanea
        
        // Se il modo admin è attivo, forziamo il bot a non ignorare il messaggio
        if (chat.modoadmin) {
            m.isCommand = true 
        }
    }

    return false
}

export default handler
