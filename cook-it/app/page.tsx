"use client"
import { useState, useEffect } from "react"

const EQUIPMENT_OPTIONS = ["stove", "oven", "air fryer", "microwave"]

const DIET_OPTIONS = [
  "none",
  "vegetarian",
  "vegan",
  "halal",
  "keto",
  "gluten-free"
]

const CUISINE_OPTIONS = [
  "any",
  "italian",
  "indian",
  "mexican",
  "chinese",
  "japanese",
  "mediterranean"
]

export default function Home() {
  const [ingredients, setIngredients] = useState("")
  const [equipment, setEquipment] = useState<string[]>([])

  const [diet, setDiet] = useState("none")
  const [cuisine, setCuisine] = useState("any")
  const [servings, setServings] = useState(2)
  const [difficulty, setDifficulty] = useState("easy")

  const [recipe, setRecipe] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const toggleEquipment = (item: string) => {
    setEquipment(prev =>
      prev.includes(item) ? prev.filter(e => e !== item) : [...prev, item]
    )
  }

  const generateRecipe = async () => {
    if (!ingredients.trim()) {
      setError("Please enter at least one ingredient.")
      return
    }

    setError("")
    setRecipe("")
    setLoading(true)

    let fullRecipe = ""

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({
          ingredients,
          equipment,
          diet,
          cuisine,
          servings,
          difficulty
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Something went wrong.")
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)

        fullRecipe += chunk

        await new Promise(r => setTimeout(r, 15)) // smoother streaming

        setRecipe(prev => prev + chunk)
      }

    } catch (err: any) {
      setError(err.message || "Failed to generate recipe.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`

      body {
        background:#1a1612;
        color:#e8e0d4;
        font-family: Georgia, serif;
      }

      .app{
        display:grid;
        grid-template-columns:380px 1fr;
        min-height:100vh;
      }

      .left-panel{
        padding:2rem;
        background:#211d18;
        border-right:1px solid #3a3228;
        display:flex;
        flex-direction:column;
        gap:1.5rem;
      }

      textarea{
        width:100%;
        background:#2c2620;
        border:1px solid #3a3228;
        border-radius:6px;
        color:#e8e0d4;
        padding:0.8rem;
      }

      select,input{
        width:100%;
        background:#2c2620;
        border:1px solid #3a3228;
        border-radius:6px;
        color:#e8e0d4;
        padding:0.6rem;
      }

      .equipment-grid{
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:6px;
      }

      .equipment-btn{
        background:#2c2620;
        border:1px solid #3a3228;
        padding:6px;
        border-radius:6px;
        color:#e8e0d4;
        cursor:pointer;
      }

      .equipment-btn.active{
        border-color:#e8c97a;
        color:#e8c97a;
      }

      .generate-btn{
        background:#e8c97a;
        border:none;
        padding:0.8rem;
        border-radius:6px;
        font-weight:bold;
        cursor:pointer;
      }

      .right-panel{
        padding:2rem;
      }

      .recipe-card{
        background:#211d18;
        border:1px solid #3a3228;
        border-radius:8px;
        padding:2rem;
      }

      .cursor{
        display:inline-block;
        width:2px;
        height:1em;
        background:#e8c97a;
        margin-left:2px;
        animation:blink 0.8s infinite;
      }

      @keyframes blink{
        0%,100%{opacity:1}
        50%{opacity:0}
      }

      `}</style>

      <div className="app">

        {/* LEFT PANEL */}

        <div className="left-panel">

          <h2>CookAI 🍳</h2>

          <div>
            <div>Ingredients</div>
            <textarea
              value={ingredients}
              onChange={e => setIngredients(e.target.value)}
              placeholder="chicken, rice, garlic..."
            />
          </div>

          <div>
            <div>Equipment</div>

            <div className="equipment-grid">
              {EQUIPMENT_OPTIONS.map(item => (
                <button
                  key={item}
                  className={`equipment-btn ${equipment.includes(item) ? "active" : ""}`}
                  onClick={() => toggleEquipment(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div>Diet</div>

            <select value={diet} onChange={e => setDiet(e.target.value)}>
              {DIET_OPTIONS.map(d => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <div>Cuisine</div>

            <select value={cuisine} onChange={e => setCuisine(e.target.value)}>
              {CUISINE_OPTIONS.map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <div>Servings</div>

            <input
              type="number"
              min="1"
              max="10"
              value={servings}
              onChange={e => setServings(Number(e.target.value))}
            />
          </div>

          <div>
            <div>Difficulty</div>

            <select
              value={difficulty}
              onChange={e => setDifficulty(e.target.value)}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Advanced</option>
            </select>
          </div>

          {error && <div>{error}</div>}

          <button
            className="generate-btn"
            onClick={generateRecipe}
            disabled={loading}
          >
            {loading ? "Cooking..." : "Generate Recipe"}
          </button>

        </div>

        {/* RIGHT PANEL */}

        <div className="right-panel">

          {!recipe && !loading ? (
            <div>Your recipe will appear here</div>
          ) : (
            <div className="recipe-card">
              {recipe}
              {loading && <span className="cursor" />}
            </div>
          )}

        </div>

      </div>
    </>
  )
}