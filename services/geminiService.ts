import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ForgeryType, TrustLevel, MediaType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeMediaForensics = async (
  mediaData: string | string[], 
  type: MediaType
): Promise<AnalysisResult> => {
  const isVideo = type === MediaType.VIDEO;
  
  const prompt = `Perform a high-precision digital forensic audit on this ${isVideo ? 'sequence of video frames' : 'image'}.
  
  SPECIAL INSTRUCTION:
  - If the image is a screenshot of a software interface or a forensic tool (like this app itself), tag it as 'RECURSIVE_AUDIT' and 'UI_SCREENSHOT'.
  - Distinguish between the 'Container' (the screenshot) and the 'Content' (what is inside the screenshot).
  
  CRITICAL CLASSIFICATION RULES:
  - AUTHENTIC: ONLY real-world photography captured by a physical optical sensor of a real physical scene.
  - AI_GENERATED: Includes AI imagery, CGI (3D Renders), animations, and digital UI mockups.
  - FORGED: Real photos that have been modified or spliced.

  Respond STRICTLY in JSON.`;

  const contents = {
    parts: [
      { text: prompt },
      ...(Array.isArray(mediaData) 
        ? mediaData.map(data => ({
            inlineData: {
              mimeType: "image/jpeg",
              data: data.split(',')[1]
            }
          }))
        : [{
            inlineData: {
              mimeType: "image/jpeg",
              data: mediaData.split(',')[1]
            }
          }]
      )
    ]
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents,
    config: {
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 16384 },
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          classification: {
            type: Type.STRING,
            enum: [ForgeryType.AUTHENTIC, ForgeryType.FORGED, ForgeryType.AI_GENERATED],
          },
          confidence: { type: Type.NUMBER },
          aiGeneratedScore: { type: Type.NUMBER },
          trustScore: {
            type: Type.STRING,
            enum: [TrustLevel.HIGH, TrustLevel.MEDIUM, TrustLevel.LOW],
          },
          explanation: { type: Type.STRING },
          tags: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          metadata: {
            type: Type.OBJECT,
            properties: {
              sourceDevice: { type: Type.STRING },
              softwareUsed: { type: Type.STRING },
              colorSpace: { type: Type.STRING },
              resolutionEstimate: { type: Type.STRING }
            }
          },
          metrics: {
            type: Type.OBJECT,
            properties: {
              colorConsistency: { type: Type.NUMBER },
              edgeContinuity: { type: Type.NUMBER },
              noiseUniformity: { type: Type.NUMBER },
              compressionPatterns: { type: Type.NUMBER },
              temporalStability: { type: Type.NUMBER }
            }
          },
          hotspots: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER },
                width: { type: Type.NUMBER },
                height: { type: Type.NUMBER },
                severity: { type: Type.NUMBER },
                description: { type: Type.STRING }
              }
            }
          }
        },
        required: ["classification", "confidence", "aiGeneratedScore", "trustScore", "explanation", "metrics", "hotspots", "tags", "metadata"]
      }
    }
  });

  if (!response.text) {
    throw new Error("Forensic engine returned no data.");
  }

  const rawData = JSON.parse(response.text.trim());
  return {
    ...rawData,
    timestamp: new Date().toISOString(),
    mediaType: type
  };
};

export const chatWithForensicAI = async (
  message: string, 
  history: { role: 'user' | 'bot'; text: string }[]
) => {
  const contents = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));
  
  contents.push({
    role: 'user',
    parts: [{ text: message }]
  });

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: contents,
    config: {
      systemInstruction: "You are the DeepScan Intelligence Unit. Professional, technical, and precise forensic assistant.",
      thinkingConfig: { thinkingBudget: 24576 }
    }
  });

  return response.text;
};