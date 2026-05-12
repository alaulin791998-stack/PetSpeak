import { GoogleGenAI } from "@google/genai";

let genAI: GoogleGenAI | null = null;

function getGenAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set. Please add it to your Secrets.");
    }
    genAI = new GoogleGenAI({ apiKey: apiKey });
  }
  return genAI;
}

export async function translateAnimalSound(animal: string, sound: string, targetLanguage: string = 'English') {
  try {
    const ai = getGenAI();
    
    const prompt = `You are a professional animal behaviorist and a hilarious translator. 
      Translate the following ${animal} sound/behavior into the ${targetLanguage} language: "${sound}".
      
      Make it funny, creative, and relatable. 
      The entire response (literal and emotional) MUST be in ${targetLanguage}.
      
      Give a short "Literal Translation" and a more detailed "Emotional Context".
      
      Return the response in JSON format:
      {
        "literal": "string",
        "emotional": "string",
        "mood": "string" // e.g., HUNGRY, HAPPY, ANNOYED, ADVENTUROUS
      }`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      literal: error instanceof Error && error.message.includes("GEMINI_API_KEY") 
        ? "API Key Missing!" 
        : "Something went wrong in the translation matrix...",
      emotional: "I'm currently having a snack or my batteries are low. Try again later!",
      mood: "SLEEPY"
    };
  }
}
