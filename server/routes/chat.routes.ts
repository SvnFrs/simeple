import { Router } from "express";
import {
  sendMessage,
  getChatHistory,
  clearChatHistory,
  getChatStats,
  checkAIHealth,
} from "../controllers/chat.controllers";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// Apply authentication middleware to all chat routes
router.use(authenticateToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     ChatMessage:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         senderId:
 *           type: string
 *         content:
 *           type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 *         role:
 *           type: string
 *           enum: [user, ai, system]
 *         metadata:
 *           type: object
 *           properties:
 *             tokenCount:
 *               type: number
 *             processingTime:
 *               type: number
 *             model:
 *               type: string
 *             error:
 *               type: string
 *             edited:
 *               type: boolean
 *             editedAt:
 *               type: string
 *               format: date-time
 *
 *     SendMessageRequest:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         content:
 *           type: string
 *           minLength: 1
 *         role:
 *           type: string
 *           enum: [user, ai, system]
 *           default: user
 *         metadata:
 *           type: object
 *
 *     SendMessageResponse:
 *       type: object
 *       properties:
 *         userMessage:
 *           $ref: '#/components/schemas/ChatMessage'
 *         aiMessage:
 *           $ref: '#/components/schemas/ChatMessage'
 *         chatId:
 *           type: string
 *         processingTime:
 *           type: number
 *
 *     ChatHistoryResponse:
 *       type: object
 *       properties:
 *         messages:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ChatMessage'
 *         totalCount:
 *           type: number
 *         hasMore:
 *           type: boolean
 *         chatMetadata:
 *           type: object
 */

/**
 * @swagger
 * /chat/message:
 *   post:
 *     summary: Send a message to AI (Gemini)
 *     tags: [Chat]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendMessageRequest'
 *     responses:
 *       200:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SendMessageResponse'
 *       400:
 *         description: Bad request - Missing or invalid content
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/message", sendMessage);

/**
 * @swagger
 * /chat/history:
 *   get:
 *     summary: Get chat history with pagination
 *     tags: [Chat]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           minimum: 1
 *           maximum: 100
 *         description: Number of messages to retrieve
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *           minimum: 0
 *         description: Number of messages to skip
 *     responses:
 *       200:
 *         description: Chat history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatHistoryResponse'
 *       401:
 *         description: Unauthorized
 */
router.get("/history", getChatHistory);

/**
 * @swagger
 * /chat/clear:
 *   delete:
 *     summary: Clear all chat history
 *     tags: [Chat]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Chat history cleared successfully
 *       401:
 *         description: Unauthorized
 */
router.delete("/clear", clearChatHistory);

/**
 * @swagger
 * /chat/stats:
 *   get:
 *     summary: Get chat statistics
 *     tags: [Chat]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Chat statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalMessages:
 *                   type: number
 *                 totalTokens:
 *                   type: number
 *                 lastActivity:
 *                   type: string
 *                   format: date-time
 *                 aiModel:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */
router.get("/stats", getChatStats);

/**
 * @swagger
 * /chat/health:
 *   get:
 *     summary: Check AI service health
 *     tags: [Chat]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: AI service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [healthy, unhealthy]
 *                 service:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       503:
 *         description: AI service is unhealthy
 */
router.get("/health", checkAIHealth);

export default router;
