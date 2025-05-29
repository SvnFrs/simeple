import { Collection, ObjectId } from "mongodb";
import { getDB } from "../config/db.config";
import type { Chat, ChatMessage, ChatMetadata } from "../types/chat.types";

export class ChatModel {
  private collection: Collection<Chat>;

  constructor() {
    this.collection = getDB().collection<Chat>("chats");
  }

  async getChatByUserId(userId: string): Promise<Chat | null> {
    return await this.collection.findOne({ userId: new ObjectId(userId) });
  }

  async createChat(userId: string, title?: string): Promise<Chat> {
    const chat: Chat = {
      userId: new ObjectId(userId),
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      title: title || `Chat ${new Date().toLocaleDateString()}`,
      metadata: {
        totalMessages: 0,
        totalTokens: 0,
        lastActivity: new Date(),
        aiModel: "gemini-2.0-flash",
      },
    };

    const result = await this.collection.insertOne(chat);
    return { ...chat, _id: result.insertedId };
  }

  async addMessage(
    userId: string,
    message: Omit<ChatMessage, "_id">,
  ): Promise<boolean> {
    const messageWithId: ChatMessage = {
      ...message,
      _id: new ObjectId(),
      timestamp: new Date(),
    };

    const result = await this.collection.updateOne(
      { userId: new ObjectId(userId) },
      {
        $push: { messages: messageWithId },
        $set: {
          updatedAt: new Date(),
          "metadata.lastActivity": new Date(),
        },
        $inc: {
          "metadata.totalMessages": 1,
          "metadata.totalTokens": message.metadata?.tokenCount || 0,
        },
      },
      { upsert: true },
    );

    return result.modifiedCount > 0 || result.upsertedCount > 0;
  }

  async getChatHistory(
    userId: string,
    limit?: number,
    offset: number = 0,
  ): Promise<ChatMessage[]> {
    const pipeline = [
      { $match: { userId: new ObjectId(userId) } },
      { $unwind: "$messages" },
      { $sort: { "messages.timestamp": -1 } },
      { $skip: offset },
      ...(limit ? [{ $limit: limit }] : []),
      { $replaceRoot: { newRoot: "$messages" } },
      { $sort: { timestamp: 1 } }, // Return in chronological order
    ];

    const messages = await this.collection
      .aggregate<ChatMessage>(pipeline)
      .toArray();
    return messages;
  }

  async getTotalMessageCount(userId: string): Promise<number> {
    const result = await this.collection
      .aggregate([
        { $match: { userId: new ObjectId(userId) } },
        { $project: { messageCount: { $size: "$messages" } } },
      ])
      .toArray();

    return result[0]?.messageCount || 0;
  }

  async clearChatHistory(userId: string): Promise<boolean> {
    const result = await this.collection.updateOne(
      { userId: new ObjectId(userId) },
      {
        $set: {
          messages: [],
          updatedAt: new Date(),
          "metadata.totalMessages": 0,
          "metadata.totalTokens": 0,
          "metadata.lastActivity": new Date(),
        },
      },
    );

    return result.modifiedCount > 0;
  }

  async getChatStats(userId: string): Promise<ChatMetadata | null> {
    const chat = await this.collection.findOne(
      { userId: new ObjectId(userId) },
      { projection: { metadata: 1, updatedAt: 1, createdAt: 1 } },
    );

    return chat?.metadata || null;
  }

  async updateChatTitle(userId: string, title: string): Promise<boolean> {
    const result = await this.collection.updateOne(
      { userId: new ObjectId(userId) },
      {
        $set: {
          title,
          updatedAt: new Date(),
        },
      },
    );

    return result.modifiedCount > 0;
  }

  async deleteMessage(userId: string, messageId: string): Promise<boolean> {
    const result = await this.collection.updateOne(
      { userId: new ObjectId(userId) },
      {
        $pull: { messages: { _id: new ObjectId(messageId) } },
        $set: { updatedAt: new Date() },
        $inc: { "metadata.totalMessages": -1 },
      },
    );

    return result.modifiedCount > 0;
  }

  async editMessage(
    userId: string,
    messageId: string,
    newContent: string,
  ): Promise<boolean> {
    const result = await this.collection.updateOne(
      {
        userId: new ObjectId(userId),
        "messages._id": new ObjectId(messageId),
      },
      {
        $set: {
          "messages.$.content": newContent,
          "messages.$.metadata.edited": true,
          "messages.$.metadata.editedAt": new Date(),
          updatedAt: new Date(),
        },
      },
    );

    return result.modifiedCount > 0;
  }
}
