import type { ChatMessage } from "./chat.types";

declare module "express-session" {
  interface SessionData {
    chatHistory?: ChatMessage[];
  }
}
