import { Readable } from 'stream';
import formidable from 'formidable';
import fs from 'fs';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  const form = formidable({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Formidable error:", err);
      return res.status(500).json({ error: 'Error parsing audio' });
    }

    const file = files.audio;
    const fileStream = fs.createReadStream(file.filepath);

    try {
      const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: (() => {
          const formData = new FormData();
          formData.append("file", fileStream);
          formData.append("model", "whisper-1");
          return formData;
        })()
      });

      const result = await response.json();
      res.status(200).json({ text: result.text });
    } catch (err) {
      console.error("Whisper error:", err);
      res.status(500).json({ error: "Transcription failed" });
    }
  });
}
