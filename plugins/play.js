import yts from 'yt-search';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execPromise = promisify(exec);

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`⚠️ Inserisci il titolo!`);

  try {
    await m.reply('⏳ _Avvio protocollo yt-dlp (Termux Engine Locale)..._');

    // FASE 1: Ricerca
    const search = await yts(text);
    const vid = search.videos[0];
    if (!vid) return m.reply('❌ *Nessun risultato trovato.*');
    if (vid.seconds > 900) return m.reply('❌ *Il brano supera i 15 minuti.*');

    // FASE 2: Grafica Legam Bot
    let infoMsg = `ㅤㅤ⋆｡˚『 ╭ \`🎵 𝐏𝐋𝐀𝐘 𝐌𝐔𝐒𝐈𝐂 🎵\` ╯ 』˚｡⋆\n╭━━━━━━━━━━━━━━━━━━━━⬣\n`;
    infoMsg += `┃ ➤ 📌 𝐓𝐢𝐭𝐨𝐥𝐨: ${vid.title}\n`;
    infoMsg += `┃ ➤ ⏱️ 𝐃𝐮𝐫𝐚𝐭𝐚: ${vid.timestamp}\n`;
    infoMsg += `┃ ➤ ⚙️ 𝐌𝐨𝐭𝐨𝐫𝐞: 𝐲𝐭-𝐝𝐥𝐩 (𝐏𝐨𝐫𝐭𝐚𝐭𝐢𝐥𝐞)\n`;
    infoMsg += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒*\n`;
    infoMsg += `🎧 _Estrazione forzata dell'audio in corso..._`;

    await conn.sendMessage(m.chat, { image: { url: vid.thumbnail }, caption: infoMsg }, { quoted: m });

    // FASE 3: BAZOOKA YT-DLP (Versione Locale)
    let tmpDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
    
    let audioPath = path.join(tmpDir, `${vid.videoId}.mp3`);

    // IL SEGRETO È QUI: Usiamo ./yt-dlp per dire "usa quello nella mia cartella"
    let cmd = `./yt-dlp -x --audio-format mp3 -o "${audioPath}" "${vid.url}"`;
    
    await execPromise(cmd);

    // FASE 4: Lettura file e invio
    if (!fs.existsSync(audioPath)) throw new Error("Estrazione locale fallita.");

    let buffer = fs.readFileSync(audioPath);

    await conn.sendMessage(m.chat, {
        audio: buffer, 
        mimetype: 'audio/mpeg',
        fileName: `${vid.title}.mp3`,
        ptt: false 
    }, { quoted: m });

    // Pulizia
    fs.unlinkSync(audioPath);

  } catch (e) {
    console.error('[ERRORE YT-DLP]', e);
    
    // Se manca FFmpeg nel server, te lo dirà qui
    if (e.message.includes('ffprobe') || e.message.includes('ffmpeg')) {
        m.reply(`❌ *DIAGNOSI:* Il server non ha 'FFmpeg' installato. Dobbiamo scaricare anche quello in versione portatile!`);
    } else {
        m.reply(`❌ *ERRORE MOTORE LOCALE:*\n${e.message}`);
    }
  }
};

handler.help = ['play'];
handler.tags = ['downloader'];
handler.command = /^(play|canzone)$/i;

export default handler;
