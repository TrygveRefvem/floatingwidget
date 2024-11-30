# Instabank Voice Widget

A voice conversation widget using ElevenLabs AI that can be embedded in any website.

## Installation

1. Include the required scripts in your HTML:

```html
<!-- Add to your HTML head -->
<script src="https://your-replit-url.repl.co/widget.js"></script>

<!-- Add to your HTML body -->
<div id="instabank-voice-widget"></div>
```

## Configuration

The widget will automatically initialize when the page loads. No additional configuration is required.

### Manual Initialization

If you need to initialize the widget manually or add it to a specific container:

```javascript
window.InstabankVoiceWidget.init('custom-container-id');
```

## Features

- Real-time voice conversations with AI
- Audio visualization
- Responsive floating UI
- Error handling for microphone access and browser compatibility
- Norwegian language support

## Browser Support

The widget requires a modern browser with support for:
- WebRTC (for microphone access)
- Web Audio API
- ES6+ JavaScript features

## Development

To run the development server:

```bash
npm run dev
```

The widget will be available at `http://localhost:5000`.
