"use client";

import { useApp } from "./_contexts";
import { ChatWindow, AuthToggle, LoadingSpinner } from "./_components";

export default function Home() {
  const { isAuthenticated, isLoading } = useApp();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? <ChatWindow /> : <AuthToggle />;
}
