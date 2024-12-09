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

  const sendMessage = async (text: string) => {
    try {
      if (!text.trim()) return;
      
      // Add user message to transcript
      setTranscript(prev => [...prev, {
        speaker: 'You',
        text: text,
        timestamp: Date.now()
      }]);

      // Create streaming request
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          history: conversationContext
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response reader available');
      }

      let currentMessage = '';
      
      // Add placeholder for assistant response
      setTranscript(prev => [...prev, {
        speaker: 'InstaAI',
        text: '',
        timestamp: Date.now()
      }]);

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        // Decode the stream
        const text = new TextDecoder().decode(value);
        const lines = text.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.done) continue;
              
              currentMessage += data.content;
              
              // Update the last message in transcript
              setTranscript(prev => {
                const newTranscript = [...prev];
                if (newTranscript[newTranscript.length - 1].speaker === 'InstaAI') {
                  newTranscript[newTranscript.length - 1].text = currentMessage;
                }
                return newTranscript;
              });
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }

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
