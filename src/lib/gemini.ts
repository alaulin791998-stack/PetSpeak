import { GoogleGenAI } from "@google/genai";

let genAI: any = null;

function getGenAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set.");
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
  },
  'French': {
    apiKey: "Clé API manquante !",
    general: "Un problème est survenu dans la matrice de traduction...",
    emotional: "Je prends un goûter ou mes piles sont faibles. Réessayez plus tard !",
  },
  'Spanish': {
    apiKey: "¡Falta la clave API!",
    general: "Algo salió mal en la matriz de traducción...",
    emotional: "Estoy merendando o mis baterías están bajas. ¡Inténtalo más tarde!",
  },
  'Japanese': {
    apiKey: "APIキーがありません！",
    general: "翻訳マトリックスで何かがうまくいきませんでした...",
    emotional: "おやつを食べているか、バッテリーが不足しています。後でもう一度お試しください！",
  },
  'Korean': {
    apiKey: "API 키가 누락되었습니다!",
    general: "번역 매트릭스에 문제가 발생했습니다...",
    emotional: "간식을 먹고 있거나 배터리가 부족합니다. 나중에 다시 시도하세요!",
  },
  'German': {
    apiKey: "API-Schlüssel fehlt!",
    general: "Etwas ist in der Übersetzungsmatrix schiefgelaufen...",
    emotional: "Ich mache gerade eine Pause atau meine Batterien sind leer. Versuchen Sie es später erneut!",
  },
  'Arabic': {
    apiKey: "مفتاح API مفقود!",
    general: "حدث خطأ ما في مصفوفة الترجمة...",
    emotional: "أقوم بتناول وجبة خفيفة أو بطارياتي منخفضة. حاول مرة أخرى لاحقًا!",
  },
  'Javanese': {
    apiKey: "API Key Ora Ono!",
    general: "Wonten gangguan teng matriks terjemahan...",
    emotional: "Kulo saweg madhang nopo baterai kulo entek. Cobi malih mengke!",
  },
  'Sundanese': {
    apiKey: "API Key Teu Aya!",
    general: "Aya gangguan dina matriks terjemahan...",
    emotional: "Abdi nuju neda atanapi batréna seep. Cobian deui sakedap deui!",
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

    const response = await ai.models.generateContent({
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
                         errorStr.includes("authorized");

    return {
      literal: isApiKeyError ? msgs.apiKey : (msgs.general + " (" + errorStr.substring(0, 50) + "...)"),
      emotional: msgs.emotional,
      mood: "SLEEPY"
    };
  }
}
