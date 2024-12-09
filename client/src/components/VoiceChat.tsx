import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Mic } from 'lucide-react';
import { AudioProcessor } from './AudioProcessor';
import { ErrorBoundary } from './ErrorBoundary';

interface TranscriptMessage {
  speaker: 'You' | 'InstaAI';
  text: string;
  timestamp?: number;
}

export function VoiceChat() {
  const { toast } = useToast();
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [conversationContext, setConversationContext] = useState<string[]>([]);
  const transcriptRef = useRef<HTMLDivElement>(null);

  // Add scroll into view effect
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);

  useEffect(() => {
    // Check browser compatibility
    if (!navigator.mediaDevices?.getUserMedia) {
      toast({
        title: "Ikke støttet",
        description: "Din nettleser støtter ikke talesamtaler. Vennligst bruk en moderne nettleser.",
        variant: "destructive",
      });
      return;
    }
  }, [toast]);

  useEffect(() => {
    // Show welcome message on first load
    if (transcript.length === 0) {
      setTranscript([{
        speaker: 'InstaAI',
        text: 'Hei! Hvordan kan jeg hjelpe deg i dag?'
      }]);
    }
  }, []);

  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Initialize WebSocket connection
  useEffect(() => {
    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/chat`;
    const websocket = new WebSocket(wsUrl);
    
    websocket.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.error) {
          toast({
            title: "Feil",
            description: data.details || "En feil oppstod under samtalen.",
            variant: "destructive",
          });
          return;
        }

        if (data.content) {
          setTranscript(prev => {
            const newTranscript = [...prev];
            const lastMessage = newTranscript[newTranscript.length - 1];
            
            if (lastMessage && lastMessage.speaker === 'InstaAI') {
              lastMessage.text += data.content;
            } else {
              newTranscript.push({
                speaker: 'InstaAI',
                text: data.content,
                timestamp: Date.now()
              });
            }
            
            return newTranscript;
          });
        }
      } catch (e) {
        console.error('Error parsing WebSocket message:', e);
      }
    };

    websocket.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: "Tilkoblingsfeil",
        description: "Det oppstod en feil under tilkoblingen til samtalen. Dette kan skyldes nettverksproblemer eller at tjenesten er utilgjengelig. Vennligst prøv igjen senere.",
        variant: "destructive",
        duration: 5000,
      });
    };

    // Add reconnection logic
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 3;

    const tryReconnect = () => {
      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        setTimeout(() => {
          console.log(`Attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts})...`);
          const newWs = new WebSocket(wsUrl);
          setWs(newWs);
        }, 2000 * reconnectAttempts); // Exponential backoff
      }
    };

    websocket.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      tryReconnect();
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, []);

  const sendMessage = async (text: string) => {
    try {
      if (!text.trim() || !ws) return;
      
      // Add user message to transcript
      setTranscript(prev => [...prev, {
        speaker: 'You',
        text: text,
        timestamp: Date.now()
      }]);

      // Add empty assistant message
      setTranscript(prev => [...prev, {
        speaker: 'InstaAI',
        text: '',
        timestamp: Date.now()
      }]);

      // Send message through WebSocket
      ws.send(JSON.stringify({
        text,
        history: conversationContext
      }));

      // Update conversation context
      setConversationContext(prev => {
        const updatedTranscript = transcript.slice(-10);
        return updatedTranscript.map(msg => `${msg.speaker}: ${msg.text}`);
      });

    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: "Feil",
        description: "Kunne ikke sende meldingen. Vennligst prøv igjen.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div 
        ref={transcriptRef}
        className="w-full h-[300px] bg-gray-50 rounded-md p-4 overflow-y-auto"
      >
        {transcript.map((message, index) => (
          <div key={index} className="mb-2">
            <span className="font-medium">{message.speaker}: </span>
            {message.text}
          </div>
        ))}
      </div>

      <div className="w-full">
        <ErrorBoundary>
          <AudioProcessor 
            isActive={true}
            onVoiceActivityChange={(active) => {
              console.log('Voice activity changed:', active);
              setIsUserSpeaking(active);
              if (active) {
                // Only add placeholder if not already present
                if (!transcript.some(msg => msg.text === '...')) {
                  setTranscript(prev => [
                    ...prev.filter(msg => msg.text !== '...'),
                    {
                      speaker: 'You',
                      text: '...'
                    }
                  ]);
                }
              }
            }}
            isSpeaking={false}
          />
        </ErrorBoundary>
      </div>

      <div className="w-full space-y-4">
        <div className="flex w-full gap-2">
          <input
            type="text"
            placeholder="Skriv en melding..."
            className="flex-1 px-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
            onKeyPress={async (e) => {
              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                const text = e.currentTarget.value.trim();
                e.currentTarget.value = '';
                await sendMessage(text);
              }
            }}
          />
        </div>
      </div>

      <div className="text-sm text-gray-500 text-center">
        {isUserSpeaking ? (
          <span className="flex items-center justify-center gap-2">
            <Mic className="w-4 h-4 text-green-500 animate-pulse" />
            Du snakker...
          </span>
        ) : (
          'Assistenten lytter...'
        )}
      </div>
    </div>
  );
}
