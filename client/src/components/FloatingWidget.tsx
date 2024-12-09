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
          "bg-white rounded-[20px] shadow-lg w-[400px]",
          "transform transition-all duration-300 ease-in-out",
          "border border-gray-100"
        )}>
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <img 
                src="/logobank.png" 
                alt="Instabank" 
                className="h-8"
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
            "h-[68px] w-[68px] rounded-full shadow-lg p-0.5",
            "bg-[#4CAF50] hover:bg-[#45a049]",
            "border-2 border-white",
            "transform transition-all duration-300 ease-in-out",
            "flex items-center justify-center p-0"
          )}
        >
          <img 
            src="/instabankmarketing_Create_a_high_definition_Norwegian_custome_2f501652-1e6c-4fab-a650-6b1264fd9be3_3.png" 
            alt="AI Assistant"
            className="h-14 w-14 rounded-full object-cover border-2 border-white shadow-sm transform scale-90" 
          />
        </Button>
      )}
    </div>
  );
}
