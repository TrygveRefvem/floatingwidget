import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { FloatingWidget } from './components/FloatingWidget';
import { Toaster } from '@/components/ui/toaster';

// Initialize widget in a container
function initializeWidget(containerId: string) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with id "${containerId}" not found`);
    return;
  }

  const root = createRoot(container);
  root.render(
    createElement(QueryClientProvider, { client: queryClient },
      createElement('div', null, [
        createElement(FloatingWidget, null),
        createElement(Toaster, null)
      ])
    )
  );
}

// Auto-initialize if container exists
document.addEventListener('DOMContentLoaded', () => {
  initializeWidget('instabank-voice-widget');
});

// Export for manual initialization
(window as any).InstabankVoiceWidget = {
  init: initializeWidget
};
