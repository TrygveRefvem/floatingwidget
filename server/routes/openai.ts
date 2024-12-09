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
    let azureWs: WebSocket | null = null;
    
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

      // Connect to Azure OpenAI API via WebSocket
      const wsUrl = `${AZURE_OPENAI_ENDPOINT.replace('https://', 'wss://')}/openai/deployments/gpt-4/chat/completions?api-version=2024-02-15-preview`;
      azureWs = new WebSocket(wsUrl, {
        headers: {
          'api-key': AZURE_OPENAI_KEY,
          'Content-Type': 'application/json'
        }
      });

      // Set up timeout for connection
      const connectionTimeout = setTimeout(() => {
        if (azureWs && azureWs.readyState !== WebSocket.OPEN) {
          azureWs.close();
          ws.send(JSON.stringify({
            error: 'Connection timeout',
            details: 'Could not establish connection to Azure OpenAI'
          }));
        }
      }, 10000);

      azureWs.on('open', () => {
        console.log('Connected to Azure OpenAI');
        clearTimeout(connectionTimeout);
        
        // Send the initial message with proper format
        if (azureWs && azureWs.readyState === WebSocket.OPEN) {
          azureWs.send(JSON.stringify({
            messages,
            stream: true,
            max_tokens: 1000,
            temperature: 0.7,
            frequency_penalty: 0,
            presence_penalty: 0,
            top_p: 0.95
          }));
        }
      });

      azureWs.on('message', (data) => {
        try {
          const response = JSON.parse(data.toString());
          
          if (response.error) {
            throw new Error(response.error.message || 'Unknown Azure API error');
          }

          if (response.choices && response.choices[0]?.delta?.content) {
            ws.send(JSON.stringify({ 
              content: response.choices[0].delta.content
            }));
          }
        } catch (error) {
          console.error('Error parsing Azure response:', error);
          ws.send(JSON.stringify({ 
            error: 'Failed to process response',
            details: error instanceof Error ? error.message : 'Unknown error'
          }));
          if (azureWs) azureWs.close();
        }
      });

      if (azureWs) {
        azureWs.on('error', (error) => {
          console.error('Azure WebSocket error:', error);
          ws.send(JSON.stringify({ 
            error: 'Azure OpenAI connection error',
            details: error.message
          }));
          if (azureWs && azureWs.readyState === WebSocket.OPEN) {
            azureWs.close();
          }
        });
      }

      azureWs.on('close', () => {
        console.log('Azure WebSocket connection closed');
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
