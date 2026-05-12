import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/translate", async (req, res) => {
    try {
      const { animal, sound, targetLanguage } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(401).json({ 
          error: "API_KEY_ERROR", 
          message: "GEMINI_API_KEY is not set on the server." 
        });
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `You are a professional animal behaviorist and a hilarious translator. 
      TASK: Translate the following ${animal} sound/behavior: "${sound}" into the ${targetLanguage} language.
      
      CRITICAL INSTRUCTIONS:
      1. Every single value in the JSON response (literal, emotional, AND mood) MUST be written in ${targetLanguage}.
      2. If the language is Indonesian, do not use English words.
      3. Make the translation funny, creative, and relatable to pet owners.
      4. The "literal" field should be a short, direct translation of the intent.
      5. The "emotional" field should be a funny, dramatic explanation of the pet's inner thoughts.
      6. The "mood" field should be 1-3 words describing the pet's state.
      
      OUTPUT FORMAT (JSON ONLY):
      {
        "literal": "terjemahan pendek dalam ${targetLanguage}",
        "emotional": "penjelasan lucu panjang dalam ${targetLanguage}",
        "mood": "mood singkat dalam ${targetLanguage}"
      }`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      // Basic JSON cleaning if AI returns markdown
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();
      
      res.json(JSON.parse(text));
    } catch (error) {
      console.error("Gemini Error:", error);
      res.status(500).json({ 
        error: "GENERAL_ERROR", 
        message: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
