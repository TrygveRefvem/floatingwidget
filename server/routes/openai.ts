import { Router } from 'express';
import { WebSocket, WebSocketServer } from 'ws';
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

      // Prepare messages array
      const messages = [
        ...history.map((msg: { speaker: string; text: string }) => ({
          role: msg.speaker.toLowerCase() === 'you' ? 'user' : 'assistant',
          content: msg.text
        })),
        { role: 'user', content: text }
      ];

      // Connect to Azure OpenAI Realtime API
      const wsUrl = `${AZURE_OPENAI_ENDPOINT.replace('https://', 'wss://')}/openai/realtime?api-version=2024-10-01-preview&deployment=gpt-4o-realtime-preview`;
      const azureWs = new WebSocket(wsUrl, {
        headers: {
          'api-key': AZURE_OPENAI_KEY!
        }
      });

      azureWs.on('open', () => {
        // Send the initial message
        azureWs.send(JSON.stringify({ messages }));
      });

      azureWs.on('message', (data) => {
        try {
          // Parse Azure's response and extract content
          const response = JSON.parse(data.toString());
          if (response.choices && response.choices[0]?.delta?.content) {
            // Forward the content to the client
            ws.send(JSON.stringify({ 
              content: response.choices[0].delta.content
            }));
          }
        } catch (error) {
          console.error('Error parsing Azure response:', error);
          ws.send(JSON.stringify({ 
            error: 'Failed to parse Azure response',
            details: error instanceof Error ? error.message : 'Unknown error'
          }));
        }
      });

      azureWs.on('error', (error) => {
        console.error('Azure WebSocket error:', error);
        ws.send(JSON.stringify({ 
          error: 'Azure OpenAI connection error',
          details: error.message
        }));
        azureWs.close();
      });

      azureWs.on('close', () => {
        ws.send(JSON.stringify({ done: true }));
      });

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
