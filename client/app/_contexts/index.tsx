"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { authAPI } from "../_apis/auth";
import { chatAPI } from "../_apis/chat";
import type {
  User,
  ChatMessage,
  SendMessageRequest,
  AppState,
  AppAction,
  ChatStats,
  AIHealthStatus,
} from "../_types";

const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  messages: [],
  isLoadingMessages: false,
  isSendingMessage: false,
  error: null,
  hasMoreMessages: false,
  chatStats: undefined,
  aiHealth: undefined,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
      };
    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false };
    case "SET_MESSAGES":
      return { ...state, messages: action.payload };
    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.payload] };
    case "ADD_MESSAGES":
      return {
        ...state,
        messages: [...action.payload, ...state.messages], // Prepend for pagination
      };
    case "SET_LOADING_MESSAGES":
      return { ...state, isLoadingMessages: action.payload };
    case "SET_SENDING_MESSAGE":
      return { ...state, isSendingMessage: action.payload };
    case "SET_HAS_MORE_MESSAGES":
      return { ...state, hasMoreMessages: action.payload };
    case "SET_CHAT_STATS":
      return { ...state, chatStats: action.payload };
    case "SET_AI_HEALTH":
      return { ...state, aiHealth: action.payload };
    case "UPDATE_MESSAGE":
      return {
        ...state,
        messages: state.messages.map((msg) =>
          msg._id === action.payload.id
            ? { ...msg, ...action.payload.updates }
            : msg,
        ),
      };
    case "CLEAR_MESSAGES":
      return { ...state, messages: [], hasMoreMessages: false };
    default:
      return state;
  }
}

interface AppContextType extends AppState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    username: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  retryMessage: (content: string) => Promise<void>;
  loadChatHistory: () => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  clearChat: () => Promise<void>;
  loadChatStats: () => Promise<void>;
  checkAIHealth: () => Promise<void>;
  clearError: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authAPI.me();
        dispatch({ type: "SET_USER", payload: response.user });
      } catch (error) {
        dispatch({ type: "SET_USER", payload: null });
      }
    };

    checkAuth();
  }, []);

  // Load chat history when user is authenticated
  useEffect(() => {
    if (state.isAuthenticated && state.messages.length === 0) {
      loadChatHistory();
      loadChatStats();
      checkAIHealth();
    }
  }, [state.isAuthenticated]);

  // Auto-clear errors after 5 seconds
  useEffect(() => {
    if (state.error) {
      const timer = setTimeout(() => {
        dispatch({ type: "SET_ERROR", payload: null });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [state.error]);

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      const response = await authAPI.login({ email, password });
      dispatch({ type: "SET_USER", payload: response.user });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Login failed",
      });
      throw error;
    }
  };

  const register = async (data: {
    name: string;
    username: string;
    email: string;
    password: string;
  }) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      const response = await authAPI.register(data);
      dispatch({ type: "SET_USER", payload: response.user });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Registration failed",
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      dispatch({ type: "SET_USER", payload: null });
      dispatch({ type: "CLEAR_MESSAGES" });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const sendMessage = async (content: string) => {
    // Add temporary user message immediately for better UX
    const tempUserMessage: ChatMessage = {
      _id: `temp-${Date.now()}`,
      senderId: state.user?.id || "",
      content,
      timestamp: new Date().toISOString(),
      role: "user",
      metadata: { pending: true },
    };

    dispatch({ type: "ADD_MESSAGE", payload: tempUserMessage });
    dispatch({ type: "SET_SENDING_MESSAGE", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });

    try {
      const response = await chatAPI.sendMessage({ content });

      // Remove temp message and add real messages
      dispatch({
        type: "SET_MESSAGES",
        payload: state.messages.filter(
          (msg) => msg._id !== tempUserMessage._id,
        ),
      });
      dispatch({ type: "ADD_MESSAGE", payload: response.userMessage });
      dispatch({ type: "ADD_MESSAGE", payload: response.aiMessage });

      // Update stats
      loadChatStats();
    } catch (error) {
      // Mark temp message as failed
      dispatch({
        type: "UPDATE_MESSAGE",
        payload: {
          id: tempUserMessage._id!,
          updates: {
            metadata: {
              ...tempUserMessage.metadata,
              failed: true,
              pending: false,
            },
          },
        },
      });

      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error ? error.message : "Failed to send message",
      });
      throw error;
    } finally {
      dispatch({ type: "SET_SENDING_MESSAGE", payload: false });
    }
  };

  const retryMessage = async (content: string) => {
    try {
      dispatch({ type: "SET_SENDING_MESSAGE", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      const response = await chatAPI.retryMessage(content);
      dispatch({ type: "ADD_MESSAGE", payload: response.userMessage });
      dispatch({ type: "ADD_MESSAGE", payload: response.aiMessage });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error ? error.message : "Failed to retry message",
      });
      throw error;
    } finally {
      dispatch({ type: "SET_SENDING_MESSAGE", payload: false });
    }
  };

  const loadChatHistory = async () => {
    try {
      dispatch({ type: "SET_LOADING_MESSAGES", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      const response = await chatAPI.getChatHistory();
      dispatch({ type: "SET_MESSAGES", payload: response.messages });
      dispatch({ type: "SET_HAS_MORE_MESSAGES", payload: response.hasMore });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error
            ? error.message
            : "Failed to load chat history",
      });
    } finally {
      dispatch({ type: "SET_LOADING_MESSAGES", payload: false });
    }
  };

  const loadMoreMessages = async () => {
    if (!state.hasMoreMessages || state.isLoadingMessages) return;

    try {
      dispatch({ type: "SET_LOADING_MESSAGES", payload: true });

      const response = await chatAPI.loadMoreMessages(state.messages);
      dispatch({ type: "ADD_MESSAGES", payload: response.messages });
      dispatch({ type: "SET_HAS_MORE_MESSAGES", payload: response.hasMore });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error
            ? error.message
            : "Failed to load more messages",
      });
    } finally {
      dispatch({ type: "SET_LOADING_MESSAGES", payload: false });
    }
  };

  const clearChat = async () => {
    try {
      await chatAPI.clearChatHistory();
      dispatch({ type: "CLEAR_MESSAGES" });
      loadChatStats(); // Refresh stats
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error ? error.message : "Failed to clear chat",
      });
    }
  };

  const loadChatStats = async () => {
    try {
      const stats = await chatAPI.getChatStats();
      dispatch({ type: "SET_CHAT_STATS", payload: stats });
    } catch (error) {
      console.error("Failed to load chat stats:", error);
    }
  };

  const checkAIHealth = async () => {
    try {
      const health = await chatAPI.checkAIHealth();
      dispatch({ type: "SET_AI_HEALTH", payload: health });
    } catch (error) {
      console.error("Failed to check AI health:", error);
    }
  };

  const clearError = useCallback(() => {
    dispatch({ type: "SET_ERROR", payload: null });
  }, []);

  const value: AppContextType = {
    ...state,
    login,
    register,
    logout,
    sendMessage,
    retryMessage,
    loadChatHistory,
    loadMoreMessages,
    clearChat,
    loadChatStats,
    checkAIHealth,
    clearError,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
