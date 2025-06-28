
export default async function handler(req, res) {
  const { text } = req.body;
  const response = await fetch("https://api.elevenlabs.io/v1/text-to-speech/VE9YvGtgWtBJ3J7qh6P9/stream", {
    method: "POST",
    headers: {
      "xi-api-key": process.env.ELEVENLABS_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      text,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75
      }
    })
  });

  const stream = await response.body;
  res.setHeader("Content-Type", "audio/mpeg");
  stream.pipe(res);
}
