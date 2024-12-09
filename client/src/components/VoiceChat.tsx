import { useCallback, useState, useEffect, useRef } from 'react';
import { useConversation } from '@11labs/react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Phone, PhoneOff, Loader2, Mic } from 'lucide-react';
import { AudioProcessor } from './AudioProcessor';
import { ErrorBoundary } from './ErrorBoundary';

interface TranscriptMessage {
  speaker: 'You' | 'InstaAI';  // Changed from 'Assistant' to 'InstaAI'
  text: string;
  timestamp?: number;
}

export function VoiceChat() {
  const { toast } = useToast();
  const [isInitializing, setIsInitializing] = useState(false);
  const [agentId, setAgentId] = useState<string | null>(null);
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

    // Fetch agent configuration
    fetch('/api/elevenlabs/config')
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setAgentId(data.agentId);
      })
      .catch(error => {
        toast({
          title: "Konfigurasjonsfeil",
          description: "Kunne ikke laste inn nødvendig konfigurasjon",
          variant: "destructive",
        });
      });
  }, [toast]);

  const conversation = useConversation({
    onConnect: () => {
      setIsInitializing(false);
      // Only show Norwegian welcome message
      setTranscript([{
        speaker: 'InstaAI',  // Changed from 'Assistant' to 'InstaAI'
        text: 'Hei! Hvordan kan jeg hjelpe deg i dag?'
      }]);
    },
    onDisconnect: () => {
      // Connection status is shown in the UI
    },
    onMessage: (data: { message: string; source: string }) => {
    // Prevent duplicate welcome messages
    if (data.message.toLowerCase().includes('welcome to instabank') && 
        data.source === 'user') {
      return;
    }
    
    setTranscript(prev => {
      const filteredMessages = prev.filter(msg => msg.text !== '...');
      return [
        ...filteredMessages,
        {
          speaker: data.source === 'user' ? 'You' : 'InstaAI',
          text: data.message,
          timestamp: Date.now()
        }
      ];
    });

    // Update conversation context
    setConversationContext(prev => {
      const updatedTranscript = transcript.slice(-10);
      return updatedTranscript.map(msg => `${msg.speaker}: ${msg.text}`);
    });
  },
    onError: (message: string) => {
      toast({
        title: "Feil",
        description: message,
        variant: "destructive",
      });
      setIsInitializing(false);
    },
  });

  const startConversation = useCallback(async () => {
    if (!agentId) {
      toast({
        title: "Konfigurasjonsfeil",
        description: "Mangler nødvendig konfigurasjon for å starte samtalen",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsInitializing(true);
      
      // Start conversation session
      await conversation.startSession({
        agentId: agentId,
        overrides: {
          agent: {
            prompt: {
              prompt: conversationContext.join('\n')
            }
          }
        }
      });
    } catch (error) {
      toast({
        title: "Feil",
        description: error instanceof Error ? error.message : "Kunne ikke starte samtalen. Vennligst prøv igjen.",
        variant: "destructive",
      });
      setIsInitializing(false);
    }
  }, [conversation, toast, agentId, conversationContext]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

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
            isActive={conversation.status === 'connected'}
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
            isSpeaking={conversation.isSpeaking}
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
                // Add the user message to transcript immediately
                setTranscript(prev => [...prev, {
                  speaker: 'You',
                  text: text,
                  timestamp: Date.now()
                }]);
                e.currentTarget.value = '';
                try {
                  if (conversation.status !== 'connected') {
                    await startConversation();
                  }
                  // Use the correct method from ElevenLabs API to send text
                  await conversation.send(text);
                } catch (error) {
                  console.error('Failed to send message:', error);
                  toast({
                    title: "Feil",
                    description: "Kunne ikke sende meldingen. Vennligst prøv igjen.",
                    variant: "destructive",
                  });
                }
              }
            }}
          />
          <Button
            onClick={conversation.status === 'connected' ? stopConversation : startConversation}
            disabled={isInitializing}
            className="bg-[#4CAF50] hover:bg-[#45a049] rounded-full px-6"
          >
            {conversation.status === 'connected' ? (
              <>
                <PhoneOff className="w-4 h-4 mr-2" />
                Avslutt
              </>
            ) : isInitializing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Kobler til...
              </>
            ) : (
              <>
                <Phone className="w-4 h-4 mr-2" />
                Start tale
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="text-sm text-gray-500 text-center">
        {conversation.status === 'connected' ? (
          conversation.isSpeaking ? (
            'Assistenten snakker...'
          ) : isUserSpeaking ? (
            <span className="flex items-center justify-center gap-2">
              <Mic className="w-4 h-4 text-green-500 animate-pulse" />
              Du snakker...
            </span>
          ) : (
            'Assistenten lytter...'
          )
        ) : (
          'Klar til å starte samtale'
        )}
      </div>
    </div>
  );
}
