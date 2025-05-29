/* eslint-disable @typescript-eslint/no-explicit-any */
export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginCredentials {
  name: string;
  username: string;
}

export interface AuthResponse {
  message: string;
  user: User;
}

export interface ChatMessage {
  _id?: string;
  senderId: string;
  content: string;
  timestamp: string;
  role: "user" | "ai" | "system";
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  tokenCount?: number;
  processingTime?: number;
  model?: string;
  error?: string;
  edited?: boolean;
  editedAt?: string;
  retry?: boolean;
  failed?: boolean;
  pending?: boolean;
}

export interface SendMessageRequest {
  content: string;
  role?: "user" | "ai" | "system";
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

export interface ChatMetadata {
  totalMessages: number;
  totalTokens: number;
  lastActivity: string;
  aiModel: string;
  settings?: ChatSettings;
}

export interface ChatSettings {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  enableMemory?: boolean;
}

export interface ChatStats {
  totalMessages: number;
  totalTokens: number;
  lastActivity: string;
  aiModel: string;
}

export interface AIHealthStatus {
  status: "healthy" | "unhealthy";
  service: string;
  timestamp: string;
  error?: string;
}

export interface ApiError {
  message: string;
  error?: any;
}

// UI State types
export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  messages: ChatMessage[];
  isLoadingMessages: boolean;
  isSendingMessage: boolean;
  error: string | null;
  hasMoreMessages: boolean;
  chatStats?: ChatStats;
  aiHealth?: AIHealthStatus;
}

export type AppAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_USER"; payload: User | null }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_MESSAGES"; payload: ChatMessage[] }
  | { type: "ADD_MESSAGE"; payload: ChatMessage }
  | { type: "ADD_MESSAGES"; payload: ChatMessage[] }
  | { type: "SET_LOADING_MESSAGES"; payload: boolean }
  | { type: "SET_SENDING_MESSAGE"; payload: boolean }
  | { type: "SET_HAS_MORE_MESSAGES"; payload: boolean }
  | { type: "SET_CHAT_STATS"; payload: ChatStats }
  | { type: "SET_AI_HEALTH"; payload: AIHealthStatus }
  | {
      type: "UPDATE_MESSAGE";
      payload: { id: string; updates: Partial<ChatMessage> };
    }
  | { type: "CLEAR_MESSAGES" };
