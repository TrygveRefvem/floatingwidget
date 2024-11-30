import { useState } from 'react';
import { VoiceChat } from './VoiceChat';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FloatingWidget() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isExpanded ? (
        <div className={cn(
          "bg-white rounded-[20px] shadow-lg w-[320px]",
          "transform transition-all duration-300 ease-in-out",
          "border border-gray-100"
        )}>
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <img 
                src="/logobank.png" 
                alt="Instabank" 
                className="h-6"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(false)}
                className="hover:bg-gray-100 rounded-full"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
            <VoiceChat />
          </div>
        </div>
      ) : (
        <Button
          onClick={() => setIsExpanded(true)}
          className={cn(
            "h-16 w-16 rounded-full shadow-lg",
            "bg-[#4CAF50] hover:bg-[#45a049]",
            "transform transition-all duration-300 ease-in-out",
            "flex items-center justify-center p-0"
          )}
        >
          <img 
            src="/smalllogo.png" 
            alt="iB"
            className="h-12 w-12" 
          />
        </Button>
      )}
    </div>
  );
}
