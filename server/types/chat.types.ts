import type { ObjectId } from "mongodb";

export interface Chat {
  _id?: ObjectId;
  userId: ObjectId;
  messages: ChatMessage[];
  createdAt?: Date;
  updatedAt?: Date;
  title?: string;
  metadata?: ChatMetadata;
}

export interface ChatMessage {
  _id?: ObjectId;
  senderId: ObjectId;
  content: string;
  timestamp: Date;
  role: MessageRole;
  metadata?: MessageMetadata;
}

export type MessageRole = "user" | "ai" | "system";

export interface MessageMetadata {
  tokenCount?: number;
  processingTime?: number;
  model?: string;
  error?: string;
  edited?: boolean;
  editedAt?: Date;
}

export interface ChatMetadata {
  totalMessages?: number;
  totalTokens?: number;
  lastActivity?: Date;
  aiModel?: string;
  settings?: ChatSettings;
}

export interface ChatSettings {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  enableMemory?: boolean;
}

export interface SendMessageRequest {
  content: string;
  role?: MessageRole;
  metadata?: Partial<MessageMetadata>;
}

export interface SendMessageResponse {
  userMessage: ChatMessage;
  aiMessage: ChatMessage;
  chatId: string;
  processingTime: number;
}

export interface ChatHistoryResponse {
  messages: ChatMessage[];
  totalCount: number;
  hasMore: boolean;
  chatMetadata?: ChatMetadata;
}

export interface CreateChatRequest {
  title?: string;
  settings?: ChatSettings;
}

export interface UpdateChatRequest {
  title?: string;
  settings?: Partial<ChatSettings>;
}

// Error types for better error handling
export interface ChatError {
  code: string;
  message: string;
  details?: any;
}

export interface AIServiceError extends ChatError {
  provider: "gemini" | "openai" | "other";
  retryable: boolean;
}
