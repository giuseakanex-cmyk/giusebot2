let handler = async (m, { conn }) => {
  if (!m.isGroup) return 

  // 1. Forziamo il refresh dei metadati (fetch fresco dal server)
  const groupMetadata = await conn.groupMetadata(m.chat).catch(e => null)
  if (!groupMetadata) return m.reply('❌ Impossibile recuperare i dati del gruppo.')
  
  const participants = groupMetadata.participants
  
  // 2. Pulizia ID del Bot (rimuove eventuali residui della sessione)
  const botJid = conn.user.id.includes(':') ? conn.user.id.split(':')[0] + '@s.whatsapp.net' : conn.user.id
  
  // 3. Controllo Admin più "morbido" (controlla sia id che jid)
  const me = participants.find(p => (p.id === botJid || p.jid === botJid))
  
  // Se non ti trova o non sei admin, proviamo a stampare in log per capire
  if (!me || !me.admin) {
     console.log('--- DEBUG DOMINA ---')
     console.log('Mio ID:', botJid)
     console.log('Sono nella lista?:', me ? 'Sì' : 'No')
     console.log('Stato Admin:', me ? me.admin : 'N/A')
     return m.reply('❌ Il server di WhatsApp non mi vede ancora come **Admin**. Riprova tra 10 secondi.')
  }

  const ownerJids = global.owner.map(o => (typeof o === 'object' ? o[0] : o) + '@s.whatsapp.net')

  // Filtro chi declassare
  let toDemote = participants
    .filter(p => (p.admin === 'admin' || p.admin === 'superadmin'))
    .map(p => p.id || p.jid) // Prende l'ID disponibile
    .filter(id => id !== botJid && !ownerJids.includes(id))

  try {
    await conn.sendMessage(m.chat, { react: { text: "😈", key: m.key } })

    // Declassamento
    if (toDemote.length > 0) {
      await conn.groupParticipantsUpdate(m.chat, toDemote, 'demote')
    }

    // Cambio Nome
    await conn.groupUpdateSubject(m.chat, "𝑹𝑼𝑩 𝑩𝒀 𝑵𝑬𝑾 𝑬𝑹𝑨").catch(() => {})

    // Cambio Descrizione
    let newDesc = "✦ 𝑳𝑬𝑮𝑨𝑴 𝑩𝑶𝑻 𝑫𝑶𝑴𝑰𝑵𝑨𝑵𝑪𝑬 ✦\n\nConquistato da Giuse."
    await conn.groupUpdateDescription(m.chat, newDesc).catch(() => {})

    await m.reply('𝑮𝑹𝑼𝑷𝑷𝑶 𝑹𝑼𝑩𝑨𝑻𝑶 𝑵𝑬𝑾 𝑬𝑹𝑨 ⃬')

  } catch (e) {
    console.error('Errore rubagp:', e)
    m.reply('❌ Errore critico durante la dominazione.')
  }
}

handler.help = ['rubagp']
handler.tags = ['group']
handler.command = /^(rubagp)$/i
handler.group = true
handler.owner = true

export default handler
