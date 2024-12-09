import type { Express } from "express";

export function registerRoutes(app: Express) {
  app.get('/api/elevenlabs/config', (req, res) => {
    try {
      const { ELEVENLABS_AGENT_ID } = process.env;
      
      if (!ELEVENLABS_AGENT_ID) {
        throw new Error('Missing required configuration');
      }

      res.json({
        agentId: ELEVENLABS_AGENT_ID,
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to load ElevenLabs configuration' 
      });
    }
  });
}
