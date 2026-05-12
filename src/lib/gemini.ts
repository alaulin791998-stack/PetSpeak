import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function translateAnimalSound(animal: string, sound: string, targetLanguage: string = 'English') {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a professional animal behaviorist and a hilarious translator. 
      Translate the following ${animal} sound/behavior into the ${targetLanguage} language: "${sound}".
      
      Make it funny, creative, and relatable. 
      The entire response (literal and emotional) MUST be in ${targetLanguage}.
      
      Give a short "Literal Translation" and a more detailed "Emotional Context".
      
      Return the response in JSON format:
      {
        "literal": "string",
        "emotional": "string",
        "mood": "string" // e.g., HUNGRY, HAPPY, ANNOYED, ADVENTUROUS
      }`,
      config: {
        responseMimeType: "application/json",
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      literal: "Something went wrong in the translation matrix...",
      emotional: "I'm currently having a snack. Try again later!",
      mood: "SLEEPY"
    };
  }
}
