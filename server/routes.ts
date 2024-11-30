import type { Express } from "express";
import { getElevenLabsConfig } from "../client/src/lib/elevenlabs";

export function registerRoutes(app: Express) {
  app.get('/api/elevenlabs/config', (req, res) => {
    try {
      const config = getElevenLabsConfig();
      res.json({
        agentId: config.agentId,
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to load ElevenLabs configuration' 
      });
    }
  });
}
