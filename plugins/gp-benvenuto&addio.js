import { WAMessageStubType } from '@realvare/based'
import axios from 'axios'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DEFAULT_AVATAR_URL = 'https://i.ibb.co/BKHtdBNp/default-avatar-profile-icon-1280x1280.jpg'

let puppeteer
let browser

async function initPuppeteer() {
    try {
        puppeteer = await import('puppeteer')
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        })
    } catch (e) {
        console.log('⚠️ Puppeteer non disponibile')
    }
}

await initPuppeteer()

async function getUserProfilePic(conn, jid) {
    try {
        const url = await conn.profilePictureUrl(jid, 'image')
        const res = await axios.get(url, { responseType: 'arraybuffer' })
        return Buffer.from(res.data)
    } catch {
        const res = await axios.get(DEFAULT_AVATAR_URL, { responseType: 'arraybuffer' })
        return Buffer.from(res.data)
    }
}

const WelcomeCard = ({ username, groupName, pfpUrl, isGoodbye }) => {
    const title = isGoodbye ? 'ADDIO' : 'BENVENUTO'

    const styles = `
    body{
        width:1600px;
        height:900px;
        display:flex;
        justify-content:center;
        align-items:center;
        background:#111;
        font-family:sans-serif;
        color:white
    }
    .card{
        text-align:center
    }
    .pfp{
        width:250px;
        height:250px;
        border-radius:50%;
        border:8px solid white
    }
    .title{
        font-size:90px
    }
    .username{
        font-size:60px
    }
    .group{
        font-size:40px;
        opacity:.8
    }`

    return React.createElement("html", {},
        React.createElement("head", {},
            React.createElement("style", { dangerouslySetInnerHTML: { __html: styles } })
        ),
        React.createElement("body", {},
            React.createElement("div", { className: "card" },
                React.createElement("img", { src: pfpUrl, className: "pfp" }),
                React.createElement("div", { className: "title" }, title),
                React.createElement("div", { className: "username" }, username),
                React.createElement("div", { className: "group" }, groupName)
            )
        )
    )
}

async function createImage(username, groupName, profilePic, isGoodbye) {

    if (!browser) return null

    const base64 = `data:image/jpeg;base64,${profilePic.toString('base64')}`

    const element = React.createElement(WelcomeCard, {
        username,
        groupName,
        pfpUrl: base64,
        isGoodbye
    })

    const html = "<!DOCTYPE html>" + ReactDOMServer.renderToStaticMarkup(element)

    const page = await browser.newPage()

    await page.setViewport({
        width: 1600,
        height: 900
    })

    await page.setContent(html)

    const buffer = await page.screenshot({
        type: "jpeg",
        quality: 85
    })

    await page.close()

    return buffer
}

let handler = async () => { }

handler.before = async (m, { conn, groupMetadata }) => {

    if (!m.isGroup) return true
    if (!m.messageStubType) return true

    const chat = global.db?.data?.chats?.[m.chat]
    if (!chat) return true

    const who = m.messageStubParameters?.[0]
    if (!who) return true

    const jid = conn.decodeJid(who)
    const cleanUserId = jid.split('@')[0]

    const isWelcome =
        m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD

    const isGoodbye =
        m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE ||
        m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE

    if (!isWelcome && !isGoodbye) return true
    if (isWelcome && !chat.welcome) return true
    if (isGoodbye && !chat.goodbye) return true

    const groupName = groupMetadata?.subject || 'Gruppo'
    const memberCount = groupMetadata?.participants?.length || 0

    const caption = isGoodbye
        ? `
「  *BYE BYE*  」
👤 *Utente:* @${cleanUserId}
👋🏻 *𝗛𝗮 𝗹𝗮𝘀𝗰𝗶𝗮𝘁𝗼 𝗹𝗮 𝗰𝗼𝗺𝗶𝘁𝗶𝘃𝗮:* ${groupName}
👥 *Membri attuali:* ${memberCount}
`
        : `
「  *BENVENUTO*  」
𝗔𝗼 𝗮𝘁𝘁𝗲𝗻𝘁𝗼 𝗰𝗵𝗲 𝗾𝘂𝗮 𝗱𝗲𝗻𝘁𝗿𝗼 𝗳𝗮𝗻𝗻𝗼 𝗮 𝗯𝗮𝗹𝗱𝗼𝗿𝗶𝗮 𝗳𝗿𝗮𝘁è
👤 *Utente:* @${cleanUserId}
🎉 *Gruppo:* ${groupName}
👥 *Membri:* ${memberCount}
`

    try {

        const profilePic = await getUserProfilePic(conn, jid)

        const image = await createImage(
            cleanUserId,
            groupName,
            profilePic,
            isGoodbye
        )

        if (image) {
            await conn.sendMessage(m.chat, {
                image,
                caption,
                mentions: [jid]
            })
        } else {
            throw new Error()
        }

    } catch {

        await conn.sendMessage(m.chat, {
            text: caption,
            mentions: [jid]
        })

    }

    return true
}

export default handler
