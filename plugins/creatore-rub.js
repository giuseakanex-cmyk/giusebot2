let handler = async (m, { conn }) => {
  if (!m.isGroup) return 

  const groupMetadata = await conn.groupMetadata(m.chat).catch(e => null)
  if (!groupMetadata) return
  
  const participants = groupMetadata.participants
  const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net'
  
  // Verifica se il bot è admin
  const me = participants.find(p => p.id === botJid)
  if (!me || !me.admin) return m.reply('❌ Devo essere **Admin** per dominare.')

  const ownerJids = global.owner.map(o => (typeof o === 'object' ? o[0] : o) + '@s.whatsapp.net')

  // Filtro admin da declassare (escludendo bot e owner)
  let toDemote = participants
    .filter(p => (p.admin === 'admin' || p.admin === 'superadmin'))
    .map(p => p.id)
    .filter(id => id !== botJid && !ownerJids.includes(id))

  try {
    await conn.sendMessage(m.chat, { react: { text: "😈", key: m.key } })

    // 1. Declassamento
    if (toDemote.length > 0) {
      await conn.groupParticipantsUpdate(m.chat, toDemote, 'demote')
    }

    // 2. Cambio Nome (Corto per non crashare)
    let newName = "𝑹𝑼𝑩 𝑩𝒀 𝑵𝑬𝑾 𝑬𝑹𝑨"
    await conn.groupUpdateSubject(m.chat, newName).catch(() => {})

    // 3. Cambio Descrizione (Qui mettiamo il marchio Legam Bot)
    let newDesc = "✦ 𝑳𝑬𝑮𝑨𝑴 𝑩𝑶𝑻 𝑫𝑶𝑴𝑰𝑵𝑨𝑵𝑪𝑬 ✦\n\nQuesto gruppo è stato conquistato da Giuse."
    await conn.groupUpdateDescription(m.chat, newDesc).catch(() => {})

    await m.reply('𝑮𝑹𝑼𝑷𝑷𝑶 𝑹𝑼𝑩𝑨𝑻𝑶 𝑵𝑬𝑾 𝑬𝑹𝑨 ⃬\n\n_Controlla la descrizione del gruppo..._')

  } catch (e) {
    console.error('Errore rubagp:', e)
    m.reply('❌ Errore durante la dominazione.')
  }
}

handler.help = ['rubagp']
handler.tags = ['group']
handler.command = /^(rubagp)$/i
handler.group = true
handler.owner = true

export default handler
