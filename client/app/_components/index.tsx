"use client";

import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../_contexts";
import type { ChatMessage } from "../_types";

// Auth Components (keeping existing ones)
export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, error, clearError } = useApp();

  useEffect(() => {
    // Clear error when component mounts or inputs change
    if (error) clearError();
  }, [email, password, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      // Error is handled by context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
        Login
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={clearError}
            className="text-red-700 hover:text-red-900"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Signing In..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}

export function RegisterForm() {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register, error, clearError } = useApp();

  useEffect(() => {
    if (error) clearError();
  }, [formData, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await register(formData);
    } catch (error) {
      // Error is handled by context
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
        Register
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={clearError}
            className="text-red-700 hover:text-red-900"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Choose a username"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Create a password"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Creating Account..." : "Create Account"}
        </button>
      </form>
    </div>
  );
}

// Enhanced Chat Components
export function MessageBubble({
  message,
  onRetry,
}: {
  message: ChatMessage;
  onRetry?: (content: string) => void;
}) {
  const isAI = message.role === "ai";
  const isUser = message.role === "user";
  const isFailed = message.metadata?.failed;
  const isPending = message.metadata?.pending;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative ${
          isUser
            ? isFailed
              ? "bg-red-600 text-white"
              : isPending
                ? "bg-blue-400 text-white opacity-70"
                : "bg-blue-600 text-white"
            : isAI
              ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
              : "bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100"
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>

        <div className="flex justify-between items-center mt-1">
          <p className="text-xs opacity-70">
            {new Date(message.timestamp).toLocaleTimeString()}
            {message.metadata?.processingTime && (
              <span className="ml-2">
                ({message.metadata.processingTime}ms)
              </span>
            )}
          </p>

          {isFailed && onRetry && (
            <button
              onClick={() => onRetry(message.content)}
              className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded hover:bg-opacity-30"
              title="Retry message"
            >
              ↻ Retry
            </button>
          )}
        </div>

        {isPending && (
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-300 rounded-full animate-pulse"></div>
        )}

        {message.metadata?.error && (
          <div className="text-xs mt-1 text-red-200">
            Error: {message.metadata.error}
          </div>
        )}
      </div>
    </div>
  );
}

export function MessageInput() {
  const [message, setMessage] = useState("");
  const { sendMessage, isSendingMessage, error } = useApp();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSendingMessage) return;

    const messageToSend = message.trim();
    setMessage(""); // Clear input immediately

    try {
      await sendMessage(messageToSend);
    } catch (error) {
      // Restore message on error
      setMessage(messageToSend);
    }
  };

  return (
    <div className="border-t dark:border-gray-700">
      {error && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-200 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2 p-4">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={isSendingMessage}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
          maxLength={2000}
        />
        <button
          type="submit"
          disabled={!message.trim() || isSendingMessage}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSendingMessage ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}

export function ChatStats() {
  const { chatStats, aiHealth } = useApp();

  if (!chatStats) return null;

  return (
    <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
      <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-400">
        <div className="flex gap-4">
          <span>Messages: {chatStats.totalMessages}</span>
          <span>Tokens: {chatStats.totalTokens}</span>
          <span>Model: {chatStats.aiModel}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>AI Status:</span>
          <div
            className={`w-2 h-2 rounded-full ${
              aiHealth?.status === "healthy" ? "bg-green-500" : "bg-red-500"
            }`}
            title={aiHealth?.status || "Unknown"}
          />
        </div>
      </div>
    </div>
  );
}

export function ChatWindow() {
  const {
    messages,
    isLoadingMessages,
    user,
    logout,
    clearChat,
    retryMessage,
    loadMoreMessages,
    hasMoreMessages,
  } = useApp();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (
      container &&
      container.scrollTop === 0 &&
      hasMoreMessages &&
      !isLoadingMessages
    ) {
      loadMoreMessages();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            AI Chat
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Welcome, {user?.name}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={clearChat}
            className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Clear Chat
          </button>
          <button
            onClick={logout}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Stats */}
      <ChatStats />

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4"
        onScroll={handleScroll}
      >
        {hasMoreMessages && (
          <div className="text-center py-2">
            <button
              onClick={loadMoreMessages}
              disabled={isLoadingMessages}
              className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
            >
              {isLoadingMessages ? "Loading..." : "Load more messages"}
            </button>
          </div>
        )}

        {isLoadingMessages && messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-gray-500 dark:text-gray-400">
              Loading messages...
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <p className="text-lg mb-2">👋 Welcome to AI Chat!</p>
              <p>Send a message to get started</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <MessageBubble
                key={message._id || index}
                message={message}
                onRetry={retryMessage}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <MessageInput />
    </div>
  );
}

export function AuthToggle() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="flex mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 px-4 text-center rounded-l-md border ${
              isLogin
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 px-4 text-center rounded-r-md border-t border-r border-b ${
              !isLogin
                ? "bg-green-600 text-white border-green-600"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
            }`}
          >
            Register
          </button>
        </div>

        {isLogin ? <LoginForm /> : <RegisterForm />}
      </div>
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}
