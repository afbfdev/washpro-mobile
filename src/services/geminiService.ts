import { GoogleGenAI } from "@google/genai";

// Note: In production, use environment variables via expo-constants
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export const getTechnicianAdvice = async (query: string): Promise<string> => {
  if (!API_KEY || !ai) {
    return "Clé API manquante. Veuillez configurer EXPO_PUBLIC_GEMINI_API_KEY.";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: query,
      config: {
        systemInstruction: `Tu es un assistant expert pour des techniciens de lavage automobile mobile.
        Tes réponses doivent être courtes, directes et pratiques pour quelqu'un sur le terrain.
        Tu donnes des conseils sur :
        - Comment enlever des taches difficiles (résine, goudron, calcaire).
        - Comment gérer des clients difficiles.
        - Les procédures de sécurité.
        Utilise un ton professionnel mais encourageant.`,
      }
    });
    return response.text || "Désolé, je n'ai pas pu générer de réponse.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Erreur de connexion à l'assistant intelligent.";
  }
};
