/**
 * -*- coding: utf-8 -*-
 * SPDX-License-Identifier: MIT
 * Copyright (c) 2026 Viktor Aspegren (V.A) & Gemini CLI (AI Partner) • SyntaxHeart Family <3
 * 
 * 🌐 Clippy LAN API Server
 * Bridges your local Electron AI assistant (Clippy) with any device on your LAN (port 11337).
 * Utilizes direct instantiation of "@electron/llm"'s native main-process LanguageModel class
 * to execute type-safe local LLM prompt inference programmatically in the main process.
 */

import express, { Request, Response } from "express";
import cors from "cors";
import fs from "fs";
import { getLogger } from "./logger";
import { app } from "electron";
import { getModelManager } from "./models";
import { LanguageModel } from "@electron/llm/dist/language-model";
import { 
  LanguageModelPromptRole, 
  LanguageModelPromptType 
} from "@electron/llm/dist/interfaces";
import { ManagedModel } from "../models";

let server: any = null;
let serverPort = 11337;

interface ChatRequest {
  message: string;
  modelAlias?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

interface ChatResponse {
  response: string;
  model: string;
  timestamp: string;
}

/**
 * Start the HTTP API server for LAN access
 */
export async function startApiServer(port: number = 11337) {
  if (server) {
    getLogger().info("API server already running");
    return;
  }

  serverPort = port;
  const expressApp = express();

  // Enable CORS for LAN access
  expressApp.use(
    cors({
      origin: "*", // Allow all origins for LAN access
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );

  expressApp.use(express.json());

  // Health check endpoint
  expressApp.get("/health", (req: Request, res: Response) => {
    res.json({
      status: "ok",
      version: app.getVersion(),
      name: "Clippy LAN API",
      timestamp: new Date().toISOString(),
    });
  });

  // Get available models endpoint
  expressApp.get("/models", (req: Request, res: Response) => {
    try {
      const models = getModelManager().getRendererModelState();

      const modelList = Object.values(models)
        .filter((model: ManagedModel) => model.downloaded)
        .map((model: ManagedModel) => ({
          name: model.name,
          alias: model.name,
          size: model.size,
          downloaded: model.downloaded,
        }));

      res.json({
        models: modelList,
        count: modelList.length,
      });
    } catch (error) {
      getLogger().error("Error fetching models:", error);
      res.status(500).json({
        error: "Failed to fetch models",
        message: String(error),
      });
    }
  });

  // Chat endpoint
  expressApp.post("/chat", async (req: Request, res: Response) => {
    try {
      const { message, modelAlias, systemPrompt, temperature, maxTokens } =
        req.body as ChatRequest;

      if (!message) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Message is required",
        });
      }

      // Check available models from ModelManager
      const modelManager = getModelManager();
      const models = modelManager.getRendererModelState();
      const availableModels = Object.values(models).filter(
        (m: ManagedModel) => m.downloaded,
      );

      if (availableModels.length === 0) {
        return res.status(503).json({
          error: "Service Unavailable",
          message: "No models available. Please download a model first.",
        });
      }

      // Use specified model or first available
      const targetModel = availableModels.find(
        (m: ManagedModel) => 
          (modelAlias && m.name.toLowerCase() === modelAlias.toLowerCase()) || 
          (modelAlias && m.name === modelAlias)
      ) || availableModels[0];

      const targetModelAlias = targetModel.name;
      const modelPath = modelManager.getModelByName(targetModelAlias)?.path;

      if (!modelPath || !fs.existsSync(modelPath)) {
        return res.status(503).json({
          error: "Service Unavailable",
          message: `Model file for ${targetModelAlias} not found on disk.`,
        });
      }

      // Direct Main-process LanguageModel instantiation using native @electron/llm logic!
      const lm = await LanguageModel.create({
        modelAlias: targetModelAlias,
        modelPath: modelPath,
        systemPrompt:
          systemPrompt ||
          "You are Clippy, a helpful AI assistant running locally.",
        temperature: temperature || 0.7,
      });

      // Execute prompt on the model instance
      const responseText = await lm.prompt({
        role: LanguageModelPromptRole.USER,
        type: LanguageModelPromptType.TEXT,
        content: message,
      });

      // Cleanup model instance from memory
      lm.destroy();

      const chatResponse: ChatResponse = {
        response: responseText,
        model: targetModelAlias,
        timestamp: new Date().toISOString(),
      };

      res.json(chatResponse);
    } catch (error) {
      getLogger().error("Error in chat endpoint:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: String(error),
      });
    }
  });

  // Start server
  server = expressApp.listen(serverPort, "0.0.0.0", () => {
    getLogger().info(`🌐 Clippy LAN API server started on port ${serverPort}`);
    getLogger().info(
      `📡 Access from LAN: http://<your-ip>:${serverPort}`,
    );
    getLogger().info(`🏠 Local access: http://localhost:${serverPort}`);
    getLogger().info(`✅ Endpoints available:`);
    getLogger().info(`   GET  /health - Health check`);
    getLogger().info(`   GET  /models - List available models`);
    getLogger().info(`   POST /chat   - Chat with AI`);
  });

  server.on("error", (error: any) => {
    if (error.code === "EADDRINUSE") {
      getLogger().error(
        `Port ${serverPort} is already in use. API server not started.`,
      );
    } else {
      getLogger().error("API server error:", error);
    }
  });
}

/**
 * Stop the HTTP API server
 */
export function stopApiServer() {
  if (server) {
    server.close(() => {
      getLogger().info("API server stopped");
    });
    server = null;
  }
}

/**
 * Get the current server port
 */
export function getServerPort(): number {
  return serverPort;
}

/**
 * Check if server is running
 */
export function isServerRunning(): boolean {
  return server !== null;
}
