import Groq from "groq-sdk"

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

export async function POST(request) {
  try {
    const body = await request.json()

    const {
      ingredients,
      equipment = [],
      diet = "none",
      cuisine = "any",
      servings = 2,
      difficulty = "easy"
    } = body

    if (!ingredients?.trim()) {
      return Response.json(
        { error: "No ingredients provided" },
        { status: 400 }
      )
    }

    const equipmentLine =
      equipment.length > 0
        ? `Available equipment: ${equipment.join(", ")}`
        : "No specific equipment specified — assume a basic kitchen."

    const dietLine =
      diet !== "none"
        ? `Dietary requirement: ${diet}.`
        : ""

    const cuisineLine =
      cuisine !== "any"
        ? `Cuisine style: ${cuisine}.`
        : ""

    const servingsLine = `Servings: ${servings}.`
    const difficultyLine = `Target difficulty: ${difficulty}.`

    const prompt = `
Create a recipe using ONLY these ingredients (plus basic pantry staples like oil, salt, pepper):

${ingredients}

${equipmentLine}
${dietLine}
${cuisineLine}
${servingsLine}
${difficultyLine}

Important rules:
- Respect the available equipment.
- Follow the dietary requirement if provided.
- Match the cuisine style if specified.
- Adjust ingredient quantities to match servings.

Format your response exactly like this:

🍳 Recipe Name

⏱ Cooking Time: X minutes
👤 Difficulty: Easy / Medium / Hard
🍽 Servings: X

📋 Ingredients:
- ingredient with quantity
- ingredient with quantity

👨‍🍳 Instructions:
1. Step one
2. Step two
3. Continue until finished

💡 Tips:
- Helpful cooking tip
`

    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are a professional cooking assistant that creates clear, practical recipes based only on ingredients and equipment provided."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 1024
    })

    const encoder = new TextEncoder()

    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices?.[0]?.delta?.content || ""

          if (text) {
            controller.enqueue(encoder.encode(text))
          }
        }

        controller.close()
      }
    })

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8"
      }
    })

  } catch (error) {
    console.error("API ERROR:", error)

    return Response.json(
      { error: "Recipe generation failed" },
      { status: 500 }
    )
  }
}