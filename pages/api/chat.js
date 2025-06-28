export default async function handler(req, res) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: req.body.messages
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("OpenAI API error:", err);
      return res.status(500).json({ error: "GPT failed to reply" });
    }

    const data = await response.json();
    res.status(200).json({ reply: data.choices[0].message.content });
  } catch (err) {
    console.error("Chat handler error:", err);
    res.status(500).json({ error: "Unexpected GPT error" });
  }
}
