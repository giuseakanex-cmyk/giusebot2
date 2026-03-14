import yts from 'yt-search';
import fetch from 'node-fetch';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execPromise = promisify(exec);

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`『 🎵 』 \`Inserisci il titolo della canzone!\`\n\n⟡ _Esempio:_ ${usedPrefix + command} Push it by Kid Yugi`);

  try {
    await m.reply('⏳ _Ricerca della traccia..._');

    // 1. RICERCA INFALLIBILE
    let search = await yts(text);
    let vid = search.videos[0];
    
    if (!vid) return m.reply('❌ *Nessun risultato trovato.*');
    if (vid.seconds > 900) return m.reply('❌ *Il brano supera i 15 minuti, è troppo pesante.*');

    // 2. GRAFICA LEGAM BOT
    let infoMsg = `ㅤㅤ⋆｡˚『 ╭ \`🎵 𝐏𝐋𝐀𝐘 𝐌𝐔𝐒𝐈𝐂 🎵\` ╯ 』˚｡⋆\n╭━━━━━━━━━━━━━━━━━━━━⬣\n`;
    infoMsg += `┃ ➤ 📌 𝐓𝐢𝐭𝐨𝐥𝐨: ${vid.title}\n`;
    infoMsg += `┃ ➤ ⏱️ 𝐃𝐮𝐫𝐚𝐭𝐚: ${vid.timestamp}\n`;
    infoMsg += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒*\n`;
    infoMsg += `🎥 _Aggancio del file video per estrazione locale..._`;

    await conn.sendMessage(m.chat, { image: { url: vid.thumbnail }, caption: infoMsg }, { quoted: m });

    let videoUrl = null;

    // 3. SCARICHIAMO IL VIDEO (Gli MP4 cadono molto meno degli MP3)
    const videoApis = [
        `https://api.siputzx.my.id/api/d/ytmp4?url=${vid.url}`,
        `https://api.vreden.my.id/api/ytmp4?url=${vid.url}`,
        `https://api.agatz.xyz/api/ytmp4?url=${vid.url}`
    ];

    for (let api of videoApis) {
        try {
            let res = await fetch(api);
            let json = await res.json();
            
            // Ogni API ha una risposta diversa, le controlliamo tutte
            if (json.data?.dl) videoUrl = json.data.dl;
            else if (json.result?.download?.url) videoUrl = json.result.download.url;
            else if (json.data?.download) videoUrl = json.data.download;

            if (videoUrl) {
                console.log("✅ API Video Trovata!");
                break;
            }
        } catch (e) {
            console.log("⚠️ Un'API video ha fallito, passo alla prossima...");
        }
    }

    if (!videoUrl) throw new Error("Anche i server video sono irraggiungibili in questo momento.");

    // 4. DOWNLOAD E CONVERSIONE LOCALE
    // Prepariamo la cartella temporanea
    let tmpDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    
    // Creiamo due file: uno per scaricare il video, uno per salvare l'audio
    let randomName = `${vid.videoId}_${Date.now()}`;
    let videoPath = path.join(tmpDir, `${randomName}.mp4`);
    let audioPath = path.join(tmpDir, `${randomName}.mp3`);

    // Scarichiamo il video MP4
    let vidRes = await fetch(videoUrl);
    if (!vidRes.ok) throw new Error("Errore nel download del video base.");
    
    let bufferVid = Buffer.from(await vidRes.arrayBuffer());
    fs.writeFileSync(videoPath, bufferVid);

    // Diamo in pasto il video a FFmpeg per STRAPPARE l'audio
    // -vn (toglie il video) -ar 44100 -ac 2 -b:a 192k (qualità audio ottima)
    await execPromise(`ffmpeg -i "${videoPath}" -vn -ar 44100 -ac 2 -b:a 192k "${audioPath}"`);

    // 5. INVIO DELLA CANZONE
    if (!fs.existsSync(audioPath)) throw new Error("Estrazione locale dell'audio fallita.");

    let audioFinale = fs.readFileSync(audioPath);

    await conn.sendMessage(m.chat, {
        audio: audioFinale,
        mimetype: 'audio/mpeg',
        fileName: `${vid.title}.mp3`,
        ptt: false 
    }, { quoted: m });

    // 6. PULIZIA DELLA SCENA DEL CRIMINE (Cancelliamo i file pesanti)
    fs.unlinkSync(videoPath);
    fs.unlinkSync(audioPath);

  } catch (e) {
    console.error('[ERRORE PLAY]', e);
    m.reply(`『 ❌ 』 \`Errore:\`\n${e.message}`);
  }
};

handler.help = ['play'];
handler.tags = ['downloader'];
handler.command = /^(play|canzone)$/i;

export default handler;


