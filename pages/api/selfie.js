
export default async function handler(req, res) {
  const { emotion } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;

  const prompt = `A digital portrait of a young woman with long, soft brown hair and gentle features, expressive eyes, natural skin, realistic lighting. She is feeling ${emotion}. Her expression should reflect this emotion. No filters. She is Elara Warrad.`;

  try {
    const dalleResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        prompt,
        n: 1,
        size: "512x512"
      })
    });

    const dalleData = await dalleResponse.json();
    const imageUrl = dalleData.data?.[0]?.url;

    if (!imageUrl) {
      return res.status(500).json({ error: "Selfie generation failed." });
    }

    res.status(200).json({ url: imageUrl });
  } catch (err) {
    res.status(500).json({ error: "DALL·E generation failed." });
  }
}
