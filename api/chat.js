export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { question } = req.body || {};
  if (!question) {
    return res.status(400).json({ error: "Question is required" });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content: "You are K-Water Guard AI. Answer questions about Korean water quality dashboard data clearly for public users."
          },
          {
            role: "user",
            content: question
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        answer: "OpenAI API error.",
        error: data
      });
    }

    return res.status(200).json({
      answer: data.output_text || "No answer text returned."
    });
  } catch (error) {
    return res.status(500).json({
      answer: "Server error while contacting chatbot backend.",
      error: String(error)
    });
  }
}
