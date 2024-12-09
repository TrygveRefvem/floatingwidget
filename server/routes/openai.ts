import { Router } from 'express';
import fetch from 'node-fetch';

const router = Router();

const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_KEY = process.env.AZURE_OPENAI_KEY;

router.post('/stream', async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Prepare messages array
    const messages = [
      ...history.map((msg: { speaker: string; text: string }) => ({
        role: msg.speaker.toLowerCase() === 'you' ? 'user' : 'assistant',
        content: msg.text
      })),
      { role: 'user', content: message }
    ];

    // Make request to Azure OpenAI
    const response = await fetch(`${AZURE_OPENAI_ENDPOINT}/openai/realtime?api-version=2024-10-01-preview&deployment=gpt-4o-realtime-preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': AZURE_OPENAI_KEY!
      },
      body: JSON.stringify({
        messages,
        stream: true,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      throw new Error(`Azure OpenAI API error: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('No response body received');
    }

    // Stream the response
    for await (const chunk of response.body) {
      const text = chunk.toString();
      if (text.trim()) {
        try {
          const lines = text.split('\n').filter(line => line.trim());
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
                continue;
              }
              const parsed = JSON.parse(data);
              if (parsed.choices[0]?.delta?.content) {
                res.write(`data: ${JSON.stringify({
                  content: parsed.choices[0].delta.content,
                  done: false
                })}\n\n`);
              }
            }
          }
        } catch (e) {
          console.error('Error parsing chunk:', e);
        }
      }
    }

    res.end();
  } catch (error) {
    console.error('Azure OpenAI Error:', error);
    res.status(500).json({ 
      error: 'Failed to process chat request',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
