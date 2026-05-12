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

const ERROR_MESSAGES: Record<string, any> = {
  'Indonesian': {
    apiKey: "API Key Belum Dipasang!",
    general: "Ada gangguan pada matriks penerjemahan...",
    emotional: "Saya sedang ngemil atau baterai saya lemah. Coba lagi nanti!",
  },
  'English': {
    apiKey: "API Key Missing!",
    general: "Something went wrong in the translation matrix...",
    emotional: "I'm currently having a snack or my batteries are low. Try again later!",
  },
  'Chinese (Simplified)': {
    apiKey: "缺少 API 密钥！",
    general: "翻译矩阵出现问题...",
    emotional: "我正在吃零食或电池电量不足。请稍后再试！",
  },
  'Chinese (Traditional)': {
    apiKey: "缺少 API 金鑰！",
    general: "翻譯矩陣出現問題...",
    emotional: "我正在吃零食或電池電量不足。請稍後再試！",
  }
};

export async function translateAnimalSound(animal: string, sound: string, targetLanguage: string = 'English') {
  const langKey = ERROR_MESSAGES[targetLanguage] ? targetLanguage : 'English';
  const msgs = ERROR_MESSAGES[langKey];

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

    const response = await (ai as any).models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    
    // Clean potential markdown code blocks
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Gemini Error:", error);
    const errorStr = error instanceof Error ? error.message : String(error);
    const isApiKeyError = errorStr.includes("GEMINI_API_KEY") || 
                         errorStr.includes("API_KEY") ||
                         errorStr.includes("403") ||
                         errorStr.includes("unauthorized");

    return {
      literal: isApiKeyError ? msgs.apiKey : msgs.general,
      emotional: msgs.emotional,
      mood: "SLEEPY"
    };
  }
}
