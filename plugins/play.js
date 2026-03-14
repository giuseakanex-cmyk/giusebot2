import yts from 'yt-search';
import fetch from 'node-fetch';
import fg from 'api-dylux';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execPromise = promisify(exec);

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`『 🎵 』 \`Inserisci il titolo della canzone!\`\n\n⟡ _Esempio:_ ${usedPrefix + command} Push it by Kid Yugi`);

  try {
    await m.reply('⏳ _Ricerca e avvio Protocollo Fantasma..._');

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
    infoMsg += `🎧 _Infiltrazione server in corso... (Tentativi silenziosi)_`;

    await conn.sendMessage(m.chat, { image: { url: vid.thumbnail }, caption: infoMsg }, { quoted: m });

    // Funzione per scaricare file aggirando i blocchi anti-bot
    const getBuffer = async (url) => {
        let res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Referer': 'https://youtube.com/'
            }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return Buffer.from(await res.arrayBuffer());
    };

    // Funzione per usare il tuo FFmpeg per strappare l'audio dai video MP4
    const convertVideoToAudio = async (videoBuffer, id) => {
        let tmpDir = path.join(process.cwd(), 'temp');
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
        
        let randomName = `${id}_${Date.now()}`;
        let videoPath = path.join(tmpDir, `${randomName}.mp4`);
        let audioPath = path.join(tmpDir, `${randomName}.mp3`);

        fs.writeFileSync(videoPath, videoBuffer);
        await execPromise(`ffmpeg -i "${videoPath}" -vn -ar 44100 -ac 2 -b:a 192k "${audioPath}"`);
        
        let audioBuffer = fs.readFileSync(audioPath);
        
        fs.unlinkSync(videoPath);
        fs.unlinkSync(audioPath);
        
        return audioBuffer;
    };

    let finalAudioBuffer = null;

    // 3. LE 6 STRATEGIE D'ATTACCO (Se una fallisce, passa subito all'altra)
    const strategies = [
        // Strategia 1: api-dylux (Libreria interna, MP3)
        async () => {
            let res = await fg.yta(vid.url);
            if (!res || !res.dl_url) throw new Error();
            return await getBuffer(res.dl_url);
        },
        // Strategia 2: Siputzx API (MP3 diretto)
        async () => {
            let res = await fetch(`https://api.siputzx.my.id/api/d/ytmp3?url=${vid.url}`);
            let json = await res.json();
            if (!json?.data?.dl) throw new Error();
            return await getBuffer(json.data.dl);
        },
        // Strategia 3: Vreden API (MP3 diretto)
        async () => {
            let res = await fetch(`https://api.vreden.my.id/api/ytmp3?url=${vid.url}`);
            let json = await res.json();
            if (!json?.result?.download?.url) throw new Error();
            return await getBuffer(json.result.download.url);
        },
        // Strategia 4: GiftedTech API (MP3 diretto)
        async () => {
            let res = await fetch(`https://api.giftedtech.my.id/api/download/ytmp3?url=${vid.url}`);
            let json = await res.json();
            let url = json?.result?.download?.url || json?.result?.url;
            if (!url) throw new Error();
            return await getBuffer(url);
        },
        // Strategia 5: api-dylux (SCARICA VIDEO -> ESTRAE AUDIO LOCALE)
        async () => {
            let res = await fg.ytv(vid.url);
            if (!res || !res.dl_url) throw new Error();
            return await convertVideoToAudio(await getBuffer(res.dl_url), vid.videoId);
        },
        // Strategia 6: Siputzx (SCARICA VIDEO -> ESTRAE AUDIO LOCALE)
        async () => {
            let res = await fetch(`https://api.siputzx.my.id/api/d/ytmp4?url=${vid.url}`);
            let json = await res.json();
            if (!json?.data?.dl) throw new Error();
            return await convertVideoToAudio(await getBuffer(json.data.dl), vid.videoId);
        }
    ];

    // ESECUZIONE DEL CICLO: Il bot prova silenziosamente ogni strada
    for (let i = 0; i < strategies.length; i++) {
        try {
            console.log(`[LEGAM BOT] Tentativo Strategia ${i + 1}...`);
            finalAudioBuffer = await strategies[i]();
            if (finalAudioBuffer) {
                console.log(`[LEGAM BOT] ✅ Strategia ${i + 1} riuscita!`);
                break; // Se funziona, ferma il ciclo!
            }
        } catch (e) {
            console.log(`[LEGAM BOT] ⚠️ Strategia ${i + 1} fallita, passo alla prossima.`);
        }
    }

    if (!finalAudioBuffer) {
        throw new Error("I server globali di conversione sono totalmente irraggiungibili in questo momento.");
    }

    // 4. INVIO DELLA CANZONE TROVATA
    await conn.sendMessage(m.chat, {
        audio: finalAudioBuffer,
        mimetype: 'audio/mpeg',
        fileName: `${vid.title}.mp3`,
        ptt: false 
    }, { quoted: m });

  } catch (e) {
    console.error('[ERRORE PLAY]', e);
    m.reply(`『 ❌ 』 \`Errore Fatale:\`\n${e.message}`);
  }
};

handler.help = ['play'];
handler.tags = ['downloader'];
handler.command = /^(play|canzone)$/i;

export default handler;


