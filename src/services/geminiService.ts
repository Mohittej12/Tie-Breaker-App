import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export enum AnalysisType {
  PROS_CONS = "PROS_CONS",
  COMPARISON_TABLE = "COMPARISON_TABLE",
  SWOT = "SWOT",
}

export interface AnalysisResult {
  title: string;
  summary: string;
  content: any; // Type-specific content
}

export async function analyzeDecision(
  decision: string,
  type: AnalysisType
): Promise<AnalysisResult> {
  const schemaMap = {
    [AnalysisType.PROS_CONS]: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        summary: { type: Type.STRING },
        content: {
          type: Type.OBJECT,
          properties: {
            pros: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  point: { type: Type.STRING },
                  impact: { type: Type.STRING, description: "High, Medium, or Low" },
                },
              },
            },
            cons: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  point: { type: Type.STRING },
                  impact: { type: Type.STRING, description: "High, Medium, or Low" },
                },
              },
            },
          },
          required: ["pros", "cons"],
        },
      },
      required: ["title", "summary", "content"],
    },
    [AnalysisType.COMPARISON_TABLE]: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        summary: { type: Type.STRING },
        content: {
          type: Type.OBJECT,
          properties: {
            attributes: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "The criteria for comparison (e.g., Cost, Features, Durability)"
            },
            options: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  values: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "Values corresponding to the attributes"
                  },
                },
              },
            },
          },
          required: ["attributes", "options"],
        },
      },
      required: ["title", "summary", "content"],
    },
    [AnalysisType.SWOT]: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        summary: { type: Type.STRING },
        content: {
          type: Type.OBJECT,
          properties: {
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
            threats: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["strengths", "weaknesses", "opportunities", "threats"],
        },
      },
      required: ["title", "summary", "content"],
    },
  };

  const prompts = {
    [AnalysisType.PROS_CONS]: `Analyze the following decision using a pros and cons list: "${decision}"`,
    [AnalysisType.COMPARISON_TABLE]: `Analyze the following decision by comparing the different options in a table format. Identify the key options and attributes first: "${decision}"`,
    [AnalysisType.SWOT]: `Perform a SWOT analysis for this decision/scenario: "${decision}"`,
  };

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompts[type],
    config: {
      responseMimeType: "application/json",
      responseSchema: schemaMap[type],
    },
  });

  return JSON.parse(response.text || "{}");
}
