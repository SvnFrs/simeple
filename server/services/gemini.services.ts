import type { ChatMessage } from "../types/chat.types";

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export interface GeminiRequestContent {
  parts: Array<{
    text: string;
  }>;
  role?: "user" | "model";
}

export class GeminiService {
  private apiKey: string;
  private baseUrl = "https://generativelanguage.googleapis.com/v1beta";

  constructor() {
    this.apiKey = process.env.GEMINI_API || "";
    if (!this.apiKey) {
      throw new Error("GEMINI_API key is not defined in environment variables");
    }
  }

  private formatChatHistoryForGemini(
    messages: ChatMessage[],
  ): GeminiRequestContent[] {
    return messages.map((message) => ({
      parts: [{ text: message.content }],
      role: message.role === "ai" ? "model" : "user",
    }));
  }

  async generateResponse(
    userMessage: string,
    chatHistory: ChatMessage[] = [],
  ): Promise<string> {
    try {
      const contents: GeminiRequestContent[] = [
        ...this.formatChatHistoryForGemini(chatHistory.slice(-10)), // Last 10 messages for context
        {
          parts: [{ text: userMessage }],
          role: "user",
        },
      ];

      const requestBody = {
        contents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
        ],
      };

      const response = await fetch(
        `${this.baseUrl}/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`,
        );
      }

      const data: GeminiResponse = await response.json();

      if (!data.candidates || data.candidates.length === 0) {
        throw new Error("No response generated from Gemini API");
      }

      const aiResponse = data.candidates[0]?.content?.parts[0]?.text;

      if (!aiResponse) {
        throw new Error("Invalid response format from Gemini API");
      }

      return aiResponse;
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      throw new Error(
        `Failed to generate AI response: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.generateResponse("Hello, can you hear me?");
      return true;
    } catch (error) {
      console.error("Gemini API connection test failed:", error);
      return false;
    }
  }
}
