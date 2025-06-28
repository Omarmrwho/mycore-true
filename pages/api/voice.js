import { Readable } from 'stream';
export default async function handler(req, res) {
  try {
    const elevenResponse = await fetch('https://api.elevenlabs.io/v1/text-to-speech/VOICE_ID/stream', {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: req.body.text,
        voice_settings: { stability: 0.4, similarity_boost: 0.8 }
      })
    });

    if (!elevenResponse.ok) {
      const err = await elevenResponse.text();
      console.error("ElevenLabs API error:", err);
      return res.status(500).json({ error: "Voice generation failed" });
    }

    const reader = elevenResponse.body?.getReader();
    if (!reader) {
      return res.status(500).json({ error: "No audio stream returned" });
    }

    const stream = new Readable({
      read() {
        reader.read().then(({ done, value }) => {
          if (done) this.push(null);
          else this.push(Buffer.from(value));
        });
      }
    });

    res.setHeader('Content-Type', 'audio/mpeg');
    stream.pipe(res);
  } catch (err) {
    console.error("Voice handler error:", err);
    res.status(500).json({ error: "Unexpected server error" });
  }
}
