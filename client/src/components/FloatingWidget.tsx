import { useState } from 'react';
import { VoiceChat } from './VoiceChat';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FloatingWidget() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isExpanded ? (
        <div className="bg-white rounded-lg shadow-lg w-[400px] transform transition-all duration-300 ease-in-out">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <img 
                src="https://instabank.no/logo.svg" 
                alt="Instabank" 
                className="h-6"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(false)}
                className="hover:bg-gray-100"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
            <VoiceChat />
            <div className="text-center text-xs text-gray-500 mt-4">
              Powered by ElevenLabs Conversational AI
            </div>
          </div>
        </div>
      ) : (
        <Button
          onClick={() => setIsExpanded(true)}
          className={cn(
            "h-16 w-16 rounded-full shadow-lg",
            "bg-[#4CAF50] hover:bg-[#45a049]",
            "transform transition-all duration-300 ease-in-out",
            "flex flex-col items-center justify-center gap-1"
          )}
        >
          <div className="text-sm text-center leading-tight">
            Trenger du hjelp?
          </div>
          <ChevronUp className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
