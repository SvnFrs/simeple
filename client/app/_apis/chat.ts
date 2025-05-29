import type {
  SendMessageRequest,
  SendMessageResponse,
  ChatHistoryResponse,
  ChatMessage,
} from "../_types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface ChatStats {
  totalMessages: number;
  totalTokens: number;
  lastActivity: string;
  aiModel: string;
}

interface AIHealthResponse {
  status: "healthy" | "unhealthy";
  service: string;
  timestamp: string;
  error?: string;
}

class ChatAPI {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Network error" }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async sendMessage(data: SendMessageRequest): Promise<SendMessageResponse> {
    return this.request<SendMessageResponse>("/chat/message", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getChatHistory(params?: {
    limit?: number;
    offset?: number;
  }): Promise<ChatHistoryResponse> {
    const searchParams = new URLSearchParams();

    if (params?.limit) {
      searchParams.append("limit", params.limit.toString());
    }
    if (params?.offset) {
      searchParams.append("offset", params.offset.toString());
    }

    const queryString = searchParams.toString();
    const endpoint = `/chat/history${queryString ? `?${queryString}` : ""}`;

    return this.request<ChatHistoryResponse>(endpoint);
  }

  async clearChatHistory(): Promise<{ message: string }> {
    return this.request<{ message: string }>("/chat/clear", {
      method: "DELETE",
    });
  }

  async getChatStats(): Promise<ChatStats> {
    return this.request<ChatStats>("/chat/stats");
  }

  async checkAIHealth(): Promise<AIHealthResponse> {
    return this.request<AIHealthResponse>("/chat/health");
  }

  // Utility method for pagination
  async loadMoreMessages(
    currentMessages: ChatMessage[],
    limit: number = 20,
  ): Promise<ChatHistoryResponse> {
    return this.getChatHistory({
      limit,
      offset: currentMessages.length,
    });
  }

  // Method to retry failed messages
  async retryMessage(content: string): Promise<SendMessageResponse> {
    return this.sendMessage({
      content,
      metadata: {
        retry: true,
        timestamp: new Date().toISOString(),
      },
    });
  }
}

export const chatAPI = new ChatAPI();
