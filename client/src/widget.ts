import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { FloatingWidget } from './components/FloatingWidget';
import { Toaster } from '@/components/ui/toaster';

interface WidgetOptions {
  containerId?: string;
  onError?: (error: Error) => void;
  onReady?: () => void;
}

class VoiceWidget {
  private static instance: VoiceWidget | null = null;
  private root: ReturnType<typeof createRoot> | null = null;
  private container: HTMLElement | null = null;

  private constructor() {}

  static getInstance(): VoiceWidget {
    if (!VoiceWidget.instance) {
      VoiceWidget.instance = new VoiceWidget();
    }
    return VoiceWidget.instance;
  }

  init(options: WidgetOptions = {}) {
    try {
      const containerId = options.containerId || 'instabank-voice-widget';
      const container = document.getElementById(containerId);
      
      if (!container) {
        throw new Error(`Container with id "${containerId}" not found`);
      }

      if (this.root) {
        throw new Error('Widget is already initialized');
      }

      this.container = container;
      this.root = createRoot(container);
      
      this.root.render(
        createElement(QueryClientProvider, { client: queryClient },
          createElement('div', null, [
            createElement(FloatingWidget, null),
            createElement(Toaster, null)
          ])
        )
      );

      options.onReady?.();
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to initialize widget');
      options.onError?.(err);
      console.error('Widget initialization error:', err);
    }
  }

  destroy() {
    try {
      if (this.root) {
        this.root.unmount();
        this.root = null;
        this.container = null;
      }
    } catch (error) {
      console.error('Failed to destroy widget:', error);
    }
  }
}

// Create global instance
const widget = VoiceWidget.getInstance();

// Auto-initialize if container exists
document.addEventListener('DOMContentLoaded', () => {
  widget.init();
});

// Export for manual initialization
(window as any).InstabankVoiceWidget = widget;
