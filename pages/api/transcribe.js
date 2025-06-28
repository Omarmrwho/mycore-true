
export const config = { api: { bodyParser: false } };
import formidable from 'formidable';
import fs from 'fs';

export default async function handler(req, res) {
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Form parsing failed' });

    const file = files.audio;
    if (!file) return res.status(400).json({ error: 'No audio file received' });

    const fileStream = fs.createReadStream(file.filepath);
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: (() => {
        const formData = new FormData();
        formData.append('file', fileStream, file.originalFilename);
        formData.append('model', 'whisper-1');
        return formData;
      })()
    });

    const data = await response.json();
    if (!data.text) return res.status(500).json({ error: 'Transcription failed' });

    res.status(200).json({ text: data.text });
  });
}
