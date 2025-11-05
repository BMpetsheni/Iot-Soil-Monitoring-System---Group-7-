import { GoogleGenAI, Type } from "@google/genai";
import { SoilData, WeatherData, Recommendation, ChatMessage } from '../types';

// This error is a false positive in some environments.
// Vite ensures `import.meta.env` is defined at runtime.
// @ts-ignore
const apiKey = import.meta.env.VITE_API_KEY;

if (!apiKey) {
  // This provides a clear error message if the key is missing.
  throw new Error("VITE_API_KEY is not defined. Please check your .env file for local development or Vercel environment variables for deployment.");
}
const ai = new GoogleGenAI({ apiKey });


const formatSoilDataForPrompt = (data: SoilData): string => {
  return `
- Soil Moisture: ${data.moisture}%
- Soil Temperature: ${data.temperature}°C
- Electrical Conductivity (EC): ${data.ec} μS/cm
- pH Level: ${data.ph}
- Nitrogen (N): ${data.nitrogen} mg/kg
- Phosphorus (P): ${data.phosphorus} mg/kg
- Potassium (K): ${data.potassium} mg/kg
  `;
};

const formatWeatherDataForPrompt = (data: WeatherData): string => {
  return `
- Current Temperature: ${data.temperature}°C
- Humidity: ${data.humidity}%
- Recent Rainfall: ${data.rainfall} mm
- Wind Speed: ${data.windSpeed} km/h
- Weather Description: ${data.description}
- Forecast:
  - Tomorrow: ${data.forecast[0].temp}°C, ${data.forecast[0].description}
  - In 2 days: ${data.forecast[1].temp}°C, ${data.forecast[1].description}
  - In 3 days: ${data.forecast[2].temp}°C, ${data.forecast[2].description}
  `;
};

export const getHomePageActionable = async (soilData: SoilData, weatherData: WeatherData): Promise<string> => {
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const prompt = `
    As an expert agronomist advising a farmer, analyze the following latest soil sensor data and weather conditions for a farm.
    Provide one single, concise, and direct "Actionable Insight" for the farmer to perform today.
    Keep the insight to a maximum of two sentences. Start directly with the action.

    FARM CONTEXT:
    - Location: Franschhoek region, Western Cape, South Africa.
    - Today's Date: ${currentDate}
    - Instruction: Your advice should be practical for general farming operations. Consider the time of year (as indicated by the date) and the typical climate of the region.
    
    Latest Soil Data:
    ${formatSoilDataForPrompt(soilData)}
    
    Current Weather Data:
    ${formatWeatherDataForPrompt(weatherData)}
    
    Example responses:
    - "Soil is becoming compacted and moisture is high; consider aerating the topsoil to improve drainage and root health."
    - "Given the forecast for a hot, dry week, a deep irrigation cycle is recommended to prevent crop stress."
    - "Potassium levels are dropping. Plan for a potassium-rich fertilizer application to support overall plant health."
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return (response.text ?? '').trim();
  } catch (error) {
    console.error("Error fetching actionable insight from Gemini:", error);
    return "Could not generate AI insight at this time. Please check your connection and API key.";
  }
};

export const getDetailedRecommendations = async (soilHistory: SoilData[], weatherData: WeatherData): Promise<Recommendation[]> => {
  const latestSoilData = soilHistory[0];
  const historicalSummary = `
    Here's a summary of the soil data trend over the last few days:
    - Moisture has gone from ${soilHistory[soilHistory.length - 1].moisture}% to ${latestSoilData.moisture}%.
    - pH has trended from ${soilHistory[soilHistory.length - 1].ph} to ${latestSoilData.ph}.
    - Nitrogen has trended from ${soilHistory[soilHistory.length - 1].nitrogen} to ${latestSoilData.nitrogen}.
  `;
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const prompt = `
    You are an expert AI agronomy assistant. Analyze the latest soil data, historical trends, and weather forecast for a farm.
    Generate a list of 3 actionable recommendations for a farmer.
    For each recommendation, provide a title, a brief description, and a priority level ('High', 'Medium', or 'Low').
    Base your recommendations on potential issues or opportunities you identify.

    FARM CONTEXT:
    - Location: Franschhoek region, Western Cape, South Africa.
    - Today's Date: ${currentDate}
    - Instruction: Your advice must be practical for general agriculture and take into account the local climate, time of year (as indicated by the date), and the provided weather forecast.

    Latest Soil Data:
    ${formatSoilDataForPrompt(latestSoilData)}
    
    Historical Trends:
    ${historicalSummary}

    Weather Forecast:
    ${formatWeatherDataForPrompt(weatherData)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: "A short, catchy title for the recommendation, specific to agriculture."
              },
              description: {
                type: Type.STRING,
                description: "A detailed explanation of the recommendation and why it's necessary given the data."
              },
              priority: {
                type: Type.STRING,
                description: "The priority level: 'High', 'Medium', or 'Low'."
              }
            },
            required: ["title", "description", "priority"]
          }
        }
      }
    });

    const jsonString = (response.text ?? '').trim();
    if (!jsonString) {
      throw new Error("Received empty response from Gemini API.");
    }
    const recommendations: Recommendation[] = JSON.parse(jsonString);
    return recommendations;
  } catch (error) {
    console.error("Error fetching detailed recommendations from Gemini:", error);
    // Return a default error message as a recommendation
    return [
      {
        title: "AI Analysis Failed",
        description: "Could not generate AI recommendations at this time. Please check your connection and API key configuration.",
        priority: 'High'
      }
    ];
  }
};

export const getChatbotResponse = async (
  query: string,
  soilHistory: SoilData[],
  weatherData: WeatherData,
  chatHistory: ChatMessage[]
): Promise<string> => {
  const latestSoilData = soilHistory[0];
  const formattedChatHistory = chatHistory.map(m => `${m.role === 'user' ? 'Farmer' : 'Assistant'}: ${m.text}`).join('\n');
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const prompt = `
    You are an expert AI agronomy assistant in a chat with a farmer.
    The farmer's query is: "${query}"

    Use the following context, real-time data, and conversation history to provide a clear, helpful, and concise answer.
    Always return your answer in plain text only — no markdown formatting, no bullet points, no bold or italic text, no emojis. Write full sentences and use line breaks for clarity.

    FARM CONTEXT:
    - Location: Franschhoek region, Western Cape, South Africa.
    - Today's Date: ${currentDate}
    - Instruction: Always consider the location, time of year, and provided data in your answers. Your advice should be for general agricultural purposes.

    LATEST SOIL DATA:
    ${formatSoilDataForPrompt(latestSoilData)}

    WEATHER FORECAST:
    ${formatWeatherDataForPrompt(weatherData)}

    CONVERSATION HISTORY:
    ${formattedChatHistory}

    Your Answer (as Assistant):
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return (response.text ?? '').trim();
  } catch (error) {
    console.error("Error fetching chatbot response from Gemini:", error);
    return "I'm sorry, I encountered an error while processing your request. Please try again.";
  }
};