import { Router } from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';

const router = Router();
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_KEY = process.env.AZURE_OPENAI_KEY;

// Create WebSocket server
const wsServer = new WebSocketServer({ noServer: true });

// Handle WebSocket connections
wsServer.on('connection', (ws) => {
  console.log('Client connected');

  // Handle messages from client
  ws.on('message', async (message) => {
    try {
      const { text, history = [] } = JSON.parse(message.toString());

      // Prepare messages array with system message
      const messages = [
        { role: 'system', content: 'You are InstaAI, a helpful and friendly banking assistant. You communicate in Norwegian and help customers with their banking needs.' },
        ...history.map((msg: { speaker: string; text: string }) => ({
          role: msg.speaker.toLowerCase() === 'you' ? 'user' : 'assistant',
          content: msg.text
        })),
        { role: 'user', content: text }
      ];

      if (!AZURE_OPENAI_ENDPOINT || !AZURE_OPENAI_KEY) {
        throw new Error('Azure OpenAI credentials are not configured');
      }

      // Make request to Azure OpenAI API
      try {
        const response = await fetch(`${AZURE_OPENAI_ENDPOINT}/openai/deployments/gpt-4/chat/completions?api-version=2023-12-01-preview`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': AZURE_OPENAI_KEY
          },
          body: JSON.stringify({
            messages,
            max_tokens: 1000,
            temperature: 0.7,
            frequency_penalty: 0,
            presence_penalty: 0,
            top_p: 0.95,
            stream: true
          })
        });

        if (!response.ok) {
          throw new Error(`Azure OpenAI API error: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No response stream available');
        }

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // Process the chunk and send to client
          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonData = line.slice(6);
              if (jsonData === '[DONE]') continue;

              try {
                const data = JSON.parse(jsonData);
                if (data.choices && data.choices[0]?.delta?.content) {
                  ws.send(JSON.stringify({
                    content: data.choices[0].delta.content
                  }));
                }
              } catch (e) {
                console.error('Error parsing chunk:', e);
              }
            }
          }
        }

        // Signal completion
        ws.send(JSON.stringify({ done: true }));

      } catch (error) {
        console.error('Azure API error:', error);
        ws.send(JSON.stringify({
          error: 'Failed to get response',
          details: error instanceof Error ? error.message : 'Unknown error'
        }));
      }

    } catch (error) {
      console.error('Message processing error:', error);
      ws.send(JSON.stringify({
        error: 'Failed to process message',
        details: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Function to attach WebSocket server to HTTP server
export function attachWebSocket(server: ReturnType<typeof createServer>) {
  server.on('upgrade', (request, socket, head) => {
    const pathname = new URL(request.url!, `http://${request.headers.host}`).pathname;
    
    if (pathname === '/ws/chat') {
      wsServer.handleUpgrade(request, socket, head, (ws) => {
        wsServer.emit('connection', ws, request);
      });
    }
  });
}

export default router;