let handler = m => m

handler.before = async function (m, { chat, isOwner, isAdmin, isMods }) {
    // 1. Identifichiamo se l'utente è un moderatore locale (del gruppo)
    // Proviamo i due nomi più comuni: 'moderatori' o 'moderators'
    let isModLocale = (chat.moderatori && chat.moderatori.includes(m.sender)) || 
                      (chat.moderators && chat.moderators.includes(m.sender))

    // Se l'utente non è un mod locale, non facciamo nulla e usciamo
    if (!isModLocale) return false

    // 2. Se è un mod locale, gli diamo i "superpoteri" per questo messaggio:
    
    // Bypassiamo il "Modo Admin" del gruppo
    if (chat.modoadmin) {
        // Ingannevolmente diciamo al bot che per questo messaggio l'utente è un admin
        // così il controllo 'if (chat.modoadmin && !isAdmin) return' fallisce e lo fa passare
        m.isAdmin = true 
    }

    // Bypassiamo i comandi che richiedono 'handler.admin = true'
    // Forziamo isAdmin a true solo se il plugin lo richiede
    m.isModLocale = true // Creiamo questa etichetta per sicurezza

    return false // Importante: deve restituire false per far continuare l'esecuzione agli altri plugin
}

export default handler
