import { GoogleGenAI, Type } from "@google/genai";

function cleanAndParseJSON(text: string, targetLanguage: string): { literal: string; emotional: string; mood: string } {
  const defaultFallback = {
    literal: `Terjemahan untuk bahasa ${targetLanguage}`,
    emotional: "Ada sedikit gangguan saat menguak emosi hewan piaraanmu, cobalah menerjemahkan sekali lagi!",
    mood: "MELANCHOLY"
  };

  if (!text) {
    return defaultFallback;
  }

  let cleanText = text.trim();
  // Strip code block fence if returned by model
  if (cleanText.startsWith("```")) {
    cleanText = cleanText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  }

  try {
    const parsed = JSON.parse(cleanText);
    return {
      literal: typeof parsed.literal === 'string' && parsed.literal.trim() ? parsed.literal : `Suara ${targetLanguage}`,
      emotional: typeof parsed.emotional === 'string' && parsed.emotional.trim() ? parsed.emotional : "Ada emosi tersembunyi yang sulit diuraikan.",
      mood: typeof parsed.mood === 'string' && parsed.mood.trim() ? parsed.mood : "CURIOSITY"
    };
  } catch (error) {
    console.warn("JSON Parsing failed on Gemini output, attempting regex recovery:", cleanText, error);

    let literal = "";
    let emotional = "";
    let mood = "";

    const literalMatch = cleanText.match(/"literal"\s*:\s*"([^"]+)"/);
    if (literalMatch) literal = literalMatch[1];

    const emotionalMatch = cleanText.match(/"emotional"\s*:\s*"([^"]+)"/);
    if (emotionalMatch) emotional = emotionalMatch[1];

    const moodMatch = cleanText.match(/"mood"\s*:\s*"([^"]+)"/);
    if (moodMatch) mood = moodMatch[1];

    if (literal || emotional || mood) {
      return {
        literal: literal || `Suara ${targetLanguage}`,
        emotional: emotional || "Konteks emosional terdeteksi namun tidak terbaca sempurna.",
        mood: mood || "WONDER"
      };
    }

    // Ultimate fallback putting whole raw output into emotional context
    return {
      literal: "Pesan Misterius",
      emotional: cleanText.substring(0, 300),
      mood: "SLEEPY"
    };
  }
}

export default async function handler(req: any, res: any) {
  // Allow only POST method
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED", message: `Method ${req.method} Not Allowed` });
  }

  try {
    const { animal, sound, targetLanguage } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(401).json({ 
        error: "API_KEY_ERROR", 
        message: "GEMINI_API_KEY is not set on Vercel's environment variables." 
      });
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `You are a professional animal behaviorist and a hilarious translator. 
    TASK: Translate the following ${animal} sound/behavior: "${sound}" into the ${targetLanguage} language.
    
    Make the translation funny, creative, and relatable to pet owners. 
    The entire response MUST be in ${targetLanguage}.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
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
    const parsedData = cleanAndParseJSON(text || "", targetLanguage);
    res.status(200).json(parsedData);
  } catch (error) {
    console.error("Gemini Vercel Error:", error);
    res.status(500).json({ 
      error: "GENERAL_ERROR", 
      message: error instanceof Error ? error.message : String(error) 
    });
  }
}
