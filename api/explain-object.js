export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { imageDataURL } = req.body;

  if (!imageDataURL) {
    return res.status(400).json({ error: "No image data provided." });
  }

  try {
    console.log("✅ Received imageDataURL.");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "What is this object in the photo? Explain what it is, what it's used for, and any interesting or helpful facts about it. Format your explanation with short paragraphs." },
              { type: "image_url", image_url: { url: imageDataURL } }
            ]
          }
        ],
        max_tokens: 600
      })
    });

    const data = await response.json();
    console.log("✅ OpenAI response:", JSON.stringify(data));

    if (data?.choices?.[0]?.message?.content) {
      res.status(200).json(data);
    } else {
      console.warn("⚠️ No usable content in OpenAI response.");
      res.status(200).json({ choices: [ { message: { content: "Sorry, I couldn’t identify that object. Try using a clearer or closer photo." } } ] });
    }
  } catch (error) {
    console.error("❌ Error calling OpenAI API:", error);
    res.status(500).json({ error: "Failed to analyze image. Please try again later." });
  }
}
