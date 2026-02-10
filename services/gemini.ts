
import { GoogleGenAI, Type } from "@google/genai";
import { RequestCategory, SocialRequest, ResourceItem } from "../types";

// Fixed: GoogleGenAI client must be initialized using process.env.API_KEY directly
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const classifyRequest = async (title: string, description: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Classify this social impact request for the Rotary Club of Panjim (GiveGoa).
      Title: ${title}
      Description: ${description}
      Categories: EDUCATION, HEALTHCARE, WATER_SANITATION, MATERNAL_CHILD_HEALTH, ENVIRONMENT, COMMUNITY_DEVELOPMENT, DISASTER_RELIEF.
      Respond in JSON only.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            reasoning: { type: Type.STRING },
            suggestedUrgency: { type: Type.STRING, description: "LOW, MEDIUM, HIGH, CRITICAL" },
            estimatedBudget: { type: Type.NUMBER, description: "Estimated cost in INR" }
          },
          required: ["category", "confidence", "reasoning", "suggestedUrgency", "estimatedBudget"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Classification Error:", error);
    return {
      category: "UNCATEGORIZED",
      confidence: 0,
      reasoning: "AI analysis failed.",
      suggestedUrgency: "MEDIUM",
      estimatedBudget: 0
    };
  }
};

export const calculatePriorityScore = async (request: SocialRequest, weights: any) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Calculate a priority score (0-100) for this NGO request.
      Request: ${JSON.stringify(request)}
      Weights: ${JSON.stringify(weights)}
      Consider: Impact per dollar, Rotary focus areas, urgency, and feasibility.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            breakdown: { type: Type.STRING, description: "Explainable scoring output" }
          },
          required: ["score", "breakdown"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    return { score: 50, breakdown: "Default score due to processing error." };
  }
};

export const suggestAllocations = async (requests: SocialRequest[], resources: ResourceItem[]) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Act as a Resource Optimization Engine for an NGO. 
      Available Resources: ${JSON.stringify(resources)}
      Pending Requests: ${JSON.stringify(requests.filter(r => r.status === 'PRIORITIZED'))}
      Goal: Maximize social impact (priority score) within budget and resource constraints.
      Recommend which projects to fund fully or partially. Provide reasoning.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            allocations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  requestId: { type: Type.STRING },
                  allocatedAmount: { type: Type.NUMBER },
                  status: { type: Type.STRING },
                  reason: { type: Type.STRING }
                },
                required: ["requestId", "allocatedAmount", "status", "reason"]
              }
            },
            totalImpact: { type: Type.NUMBER },
            remainingBudget: { type: Type.NUMBER }
          },
          required: ["allocations", "totalImpact", "remainingBudget"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Optimization Error:", error);
    return null;
  }
};
