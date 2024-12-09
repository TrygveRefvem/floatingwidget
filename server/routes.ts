import type { Express } from "express";
import openaiRouter from "./routes/openai";

export function registerRoutes(app: Express) {
  // Register the OpenAI router
  app.use('/api/chat', openaiRouter);
  
  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });
}
