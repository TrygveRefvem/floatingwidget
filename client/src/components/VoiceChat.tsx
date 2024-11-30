import { useCallback, useState, useEffect } from 'react';
import { useConversation } from '@11labs/react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Phone, PhoneOff, Loader2, Mic } from 'lucide-react';
import { AudioProcessor } from './AudioProcessor';
import { ErrorBoundary } from './ErrorBoundary';

interface TranscriptMessage {
  speaker: 'You' | 'Assistant';
  text: string;
}

export function VoiceChat() {
  const { toast } = useToast();
  const [isInitializing, setIsInitializing] = useState(false);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);

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
      setTranscript(prev => [...prev, {
        speaker: 'Assistant',
        text: 'Hei! Hvordan kan jeg hjelpe deg i dag?'
      }]);
    },
    onDisconnect: () => {
      // Connection status is shown in the UI
    },
    onMessage: (message: string) => {
      setTranscript(prev => [...prev, {
        speaker: 'Assistant',
        text: message
      }]);
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
      setTranscript([]);
      
      // Request microphone access
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (error) {
        if (error instanceof DOMException) {
          if (error.name === 'NotAllowedError') {
            throw new Error('Mikrofontilgang ble nektet. Vennligst gi tilgang til mikrofonen for å starte samtalen.');
          } else if (error.name === 'NotFoundError') {
            throw new Error('Ingen mikrofon funnet. Vennligst koble til en mikrofon og prøv igjen.');
          }
        }
        throw error;
      }

      // Start conversation session
      await conversation.startSession({
        agentId: agentId,
      });
    } catch (error) {
      toast({
        title: "Feil",
        description: error instanceof Error ? error.message : "Kunne ikke starte samtalen. Vennligst prøv igjen.",
        variant: "destructive",
      });
      setIsInitializing(false);
    }
  }, [conversation, toast, agentId]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-full h-[200px] bg-gray-50 rounded-md p-3 overflow-y-auto">
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
                setTranscript(prev => [...prev, {
                  speaker: 'You',
                  text: '...'
                }]);
              }
            }}
            isSpeaking={conversation.isSpeaking}
          />
        </ErrorBoundary>
      </div>

      <div className="w-full flex justify-center">
        {conversation.status === 'connected' ? (
          <Button
            onClick={stopConversation}
            className="bg-black hover:bg-gray-800 rounded-full px-8"
          >
            <PhoneOff className="w-4 h-4 mr-2" />
            Avslutt samtale
          </Button>
        ) : (
          <Button
            onClick={startConversation}
            disabled={isInitializing}
            className="bg-black hover:bg-gray-800 rounded-full px-8"
          >
            {isInitializing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Kobler til...
              </>
            ) : (
              <>
                <Phone className="w-4 h-4 mr-2" />
                Start samtale
              </>
            )}
          </Button>
        )}
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
