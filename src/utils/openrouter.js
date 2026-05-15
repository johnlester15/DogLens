const MODELS = [
  "google/gemini-2.0-flash-exp",
  "qwen/qwen2.5-vl-72b-instruct",
  "openai/gpt-4o-mini",
];

async function tryModel(model, base64Image) {
  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          model,

          temperature: 0.2,

          messages: [
            {
              role: "system",

              content: `
You are a professional dog breed identification AI.

Rules:
- Return ONLY valid JSON
- No markdown
- No explanation
- Confidence must be 1-100
- Detect the MOST probable breed
- If unsure, still give closest breed
- Use real dog breed names only
              `,
            },

            {
              role: "user",

              content: [
                {
                  type: "text",

                  text: `
Analyze this dog image carefully.

Return format:

{
  "breed": "",
  "confidence": 0,
  "description": "",
  "temperament": "",
  "size": ""
}
                  `,
                },

                {
                  type: "image_url",

                  image_url: {
                    url: base64Image,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    const content =
      data?.choices?.[0]?.message?.content || "";

    const cleaned = content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);
  } catch (error) {
    console.log(`Failed model: ${model}`, error);

    return null;
  }
}

export async function analyzeDogImage(base64Image) {
  for (const model of MODELS) {
    const result = await tryModel(model, base64Image);

    if (result?.breed) {
      return {
        breed: result.breed,
        confidence: Math.min(
          99,
          Math.max(55, result.confidence || 70)
        ),

        description:
          result.description ||
          "Dog breed detected successfully.",

        temperament:
          result.temperament || "Friendly",

        size:
          result.size || "Medium",
      };
    }
  }

  return {
    breed: "Unknown Dog",
    confidence: 50,
    description: "AI could not confidently identify breed.",
    temperament: "Unknown",
    size: "Unknown",
  };
}
````
