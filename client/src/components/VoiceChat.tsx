import { useCallback, useState } from 'react';
import { useConversation } from '@11labs/react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { AudioVisualizer } from './AudioVisualizer';
import { Card, CardContent } from '@/components/ui/card';

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
    onError: (error) => {
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
    <div className="flex flex-col items-center gap-6">
          <div className="w-full max-w-sm">
            <AudioVisualizer 
              isActive={conversation.status === 'connected'} 
            />
          </div>

          <div className="flex gap-4">
            <Button
              onClick={startConversation}
              disabled={conversation.status === 'connected' || isInitializing}
              className="bg-[#4CAF50] hover:bg-[#45a049]"
            >
              {isInitializing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Mic className="w-4 h-4 mr-2" />
              )}
              {isInitializing ? 'Kobler til...' : 'Start samtale'}
            </Button>

            <Button
              onClick={stopConversation}
              disabled={conversation.status !== 'connected'}
              variant="destructive"
            >
              <MicOff className="w-4 h-4 mr-2" />
              Avslutt samtale
            </Button>
          </div>

          <div className="text-sm text-gray-500">
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
