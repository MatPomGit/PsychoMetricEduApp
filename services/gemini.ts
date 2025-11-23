import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini Client
// Note: In a production environment, keys should be handled via a secure backend proxy.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const modelId = "gemini-2.5-flash";

export const generatePsychometricItems = async (
  constructName: string,
  constructDescription: string,
  existingItems: string[]
): Promise<{ text: string; type: 'positive' | 'negative'; reason: string }[]> => {
  
  const prompt = `
    Jesteś ekspertem psychometrii. Twoim zadaniem jest stworzenie pozycji testowych (pytań) do kwestionariusza mierzącego konstrukt: "${constructName}".
    Opis konstruktu: "${constructDescription}".
    
    Wygeneruj 5 unikalnych pozycji testowych (items) w skali Likerta.
    Jedna lub dwie z nich powinny być sformułowane negatywnie (odwrócone).
    Nie powtarzaj tych pytań: ${existingItems.join(', ')}.
    
    Zwróć dane w formacie JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING, description: "Treść pytania/stwierdzenia" },
              type: { type: Type.STRING, description: "positive lub negative" },
              reason: { type: Type.STRING, description: "Krótkie uzasadnienie dlaczego to dobre pytanie psychometryczne" }
            },
            required: ["text", "type", "reason"]
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return [];
  } catch (error) {
    console.error("Error generating items:", error);
    return [
      { text: "Czuję się kompetentny w tym obszarze.", type: 'positive', reason: "Fallback item due to error." },
      { text: "Często mam trudności z tym zagadnieniem.", type: 'negative', reason: "Fallback item due to error." },
      { text: "Rzadko udaje mi się osiągnąć zamierzone cele.", type: 'negative', reason: "Fallback item due to error." },
      { text: "Inni postrzegają mnie jako osobę skuteczną.", type: 'positive', reason: "Fallback item due to error." },
      { text: "W sytuacjach stresowych zachowuję spokój.", type: 'positive', reason: "Fallback item due to error." }
    ];
  }
};

export const analyzeDefinition = async (definition: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Jako profesor psychometrii, krótko (max 2 zdania) oceń definicję konstruktu: "${definition}". Czy jest wystarczająco operacyjna?`,
    });
    return response.text || "Definicja wydaje się poprawna.";
  } catch (e) {
    return "Nie udało się pobrać opinii AI.";
  }
};