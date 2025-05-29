import type { Response } from "express";
import { ChatModel } from "../model/chat.model";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import { ObjectId } from "mongodb";
import { GeminiService } from "../services/gemini.services";
import type {
  SendMessageRequest,
  SendMessageResponse,
  ChatHistoryResponse,
  ChatMessage,
  MessageRole,
} from "../types/chat.types";

const chatModel = new ChatModel();
const geminiService = new GeminiService();

// AI user ID constant
const AI_USER_ID = new ObjectId("000000000000000000000000");

export const sendMessage = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const startTime = Date.now();

  try {
    const { content, role = "user", metadata }: SendMessageRequest = req.body;
    const userId = req.user!.userId;

    if (!content?.trim()) {
      res.status(400).json({ message: "Message content is required" });
      return;
    }

    // get recent chat history for context
    const recentHistory = await chatModel.getChatHistory(userId, 10);

    // add user message to database
    const userMessage: Omit<ChatMessage, "_id"> = {
      senderId: new ObjectId(userId),
      content: content.trim(),
      timestamp: new Date(),
      role: role,
      metadata: {
        ...metadata,
        tokenCount: content.length, // simple token estimation
      },
    };

    await chatModel.addMessage(userId, userMessage);

    // generate AI response using Gemini
    let aiResponseContent: string;
    const aiMetadata: any = {
      model: "gemini-2.0-flash",
    };

    try {
      const aiStartTime = Date.now();
      aiResponseContent = await geminiService.generateResponse(
        content,
        recentHistory,
      );
      aiMetadata.processingTime = Date.now() - aiStartTime;
      aiMetadata.tokenCount = aiResponseContent.length;
    } catch (error) {
      console.error("AI generation error:", error);
      aiResponseContent =
        "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.";
      aiMetadata.error =
        error instanceof Error ? error.message : "Unknown error";
    }

    // add AI response to database
    const aiMessage: Omit<ChatMessage, "_id"> = {
      senderId: AI_USER_ID,
      content: aiResponseContent,
      timestamp: new Date(),
      role: "ai" as MessageRole,
      metadata: aiMetadata,
    };

    await chatModel.addMessage(userId, aiMessage);

    // update session cache
    if (!req.session.chatHistory) {
      req.session.chatHistory = [];
    }

    const userMessageWithId = { ...userMessage, _id: new ObjectId() };
    const aiMessageWithId = { ...aiMessage, _id: new ObjectId() };

    req.session.chatHistory.push(userMessageWithId, aiMessageWithId);

    // keep only last 50 messages in session
    if (req.session.chatHistory.length > 50) {
      req.session.chatHistory = req.session.chatHistory.slice(-50);
    }

    const totalProcessingTime = Date.now() - startTime;

    const response: SendMessageResponse = {
      userMessage: userMessageWithId,
      aiMessage: aiMessageWithId,
      chatId: userId,
      processingTime: totalProcessingTime,
    };

    res.json(response);
  } catch (error) {
    console.error("Error in sendMessage:", error);
    res.status(500).json({
      message: "Error sending message",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getChatHistory = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;

    // try to get from session first for recent messages
    if (
      req.session.chatHistory &&
      offset === 0 &&
      limit >= req.session.chatHistory.length
    ) {
      const response: ChatHistoryResponse = {
        messages: req.session.chatHistory,
        totalCount: req.session.chatHistory.length,
        hasMore: false,
      };
      res.json(response);
      return;
    }

    // Get from database
    const messages = await chatModel.getChatHistory(userId, limit, offset);
    const totalCount = await chatModel.getTotalMessageCount(userId);

    // Cache recent messages in session
    if (offset === 0) {
      req.session.chatHistory = messages;
    }

    const response: ChatHistoryResponse = {
      messages,
      totalCount,
      hasMore: totalCount > offset + messages.length,
    };

    res.json(response);
  } catch (error) {
    console.error("Error in getChatHistory:", error);
    res.status(500).json({
      message: "Error retrieving chat history",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const clearChatHistory = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.userId;

    await chatModel.clearChatHistory(userId);

    // Clear session cache
    req.session.chatHistory = [];

    res.json({ message: "Chat history cleared successfully" });
  } catch (error) {
    console.error("Error in clearChatHistory:", error);
    res.status(500).json({
      message: "Error clearing chat history",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getChatStats = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const stats = await chatModel.getChatStats(userId);
    res.json(stats);
  } catch (error) {
    console.error("Error in getChatStats:", error);
    res.status(500).json({
      message: "Error retrieving chat statistics",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Health check for AI service
export const checkAIHealth = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const isHealthy = await geminiService.testConnection();
    res.json({
      status: isHealthy ? "healthy" : "unhealthy",
      service: "gemini",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      service: "gemini",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
};
