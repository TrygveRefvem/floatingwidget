import { z } from 'zod';

export const ElevenLabsConfigSchema = z.object({
  apiKey: z.string(),
  agentId: z.string(),
});

export type ElevenLabsConfig = z.infer<typeof ElevenLabsConfigSchema>;

export const getElevenLabsConfig = (): ElevenLabsConfig => {
  const config = {
    apiKey: process.env.ELEVENLABS_API_KEY,
    agentId: process.env.ELEVENLABS_AGENT_ID,
  };

  const result = ElevenLabsConfigSchema.safeParse(config);
  
  if (!result.success) {
    throw new Error('Invalid ElevenLabs configuration');
  }

  return result.data;
};
