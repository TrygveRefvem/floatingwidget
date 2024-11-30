import { useCallback, useState } from 'react';
import { useConversation } from '@11labs/react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Phone, PhoneOff, Loader2 } from 'lucide-react';
import { AudioVisualizer } from './AudioVisualizer';

export function VoiceChat() {
  const { toast } = useToast();
  const [isInitializing, setIsInitializing] = useState(false);

  const conversation = useConversation({
    onConnect: () => {
      toast({
        title: "Tilkoblet",
        description: "Du kan nå snakke med assistenten",
      });
      setIsInitializing(false);
    },
    onDisconnect: () => {
      toast({
        title: "Frakoblet",
        description: "Samtalen er avsluttet",
        variant: "destructive",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Feil",
        description: error.message,
        variant: "destructive",
      });
      setIsInitializing(false);
    },
  });

  const startConversation = useCallback(async () => {
    try {
      setIsInitializing(true);
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({
        agentId: process.env.ELEVENLABS_AGENT_ID!,
      });
    } catch (error) {
      toast({
        title: "Feil",
        description: "Kunne ikke starte samtalen. Sjekk mikrofoninnstillingene dine.",
        variant: "destructive",
      });
      setIsInitializing(false);
    }
  }, [conversation, toast]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-full">
        <AudioVisualizer 
          isActive={conversation.status === 'connected'} 
        />
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
          conversation.isSpeaking ? 
            'Assistenten snakker...' : 
            'Assistenten lytter...'
        ) : (
          'Klar til å starte samtale'
        )}
      </div>
    </div>
  );
}
