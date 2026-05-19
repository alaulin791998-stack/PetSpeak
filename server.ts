import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini Setup
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // API Routes
  app.post("/api/translate", async (req, res) => {
    try {
      const { animal, sound, targetLanguage } = req.body;
      
      if (!process.env.GEMINI_API_KEY) {
        return res.status(401).json({ 
          error: "API_KEY_ERROR", 
          message: "GEMINI_API_KEY is not set on the server." 
        });
      }

      const prompt = `You are a professional animal behaviorist and a hilarious translator. 
      TASK: Translate the following ${animal} sound/behavior: "${sound}" into the ${targetLanguage} language.
      
      Make the translation funny, creative, and relatable to pet owners. 
      The entire response MUST be in ${targetLanguage}.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction: `You are a professional animal behaviorist. 
          Return a JSON object with literal translation, funny emotional context, and a short mood.
          The entire response MUST be in ${targetLanguage}.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              literal: { type: Type.STRING, description: "Short direct translation" },
              emotional: { type: Type.STRING, description: "Funny detailed background thoughts" },
              mood: { type: Type.STRING, description: "1-2 words pet mood" }
            },
            required: ["literal", "emotional", "mood"]
          }
        },
      });

      const text = response.text;
      if (!text) throw new Error("Empty response from AI");
      
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
