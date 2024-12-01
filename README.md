# Instabank Voice Widget

A voice conversation widget using ElevenLabs AI that can be embedded in any website. The widget provides real-time voice interactions with AI in Norwegian, featuring a modern floating interface and audio visualization.

## Quick Start

1. Include the widget scripts in your HTML:

```html
<!-- Add to your HTML head -->
<script src="https://InstaVoiceWidget.repl.co/widget.js"></script>

<!-- Add to your HTML body -->
<div id="instabank-voice-widget"></div>
```

The widget will automatically initialize when the page loads.

## Advanced Installation

### Manual Initialization

For more control over the widget initialization:

```javascript
// Initialize with custom options
window.InstabankVoiceWidget.init({
  containerId: 'custom-container-id',
  onError: (error) => {
    console.error('Widget error:', error);
  },
  onReady: () => {
    console.log('Widget is ready');
  }
});

// Cleanup when needed
window.InstabankVoiceWidget.destroy();
```

### Security and Privacy

The widget requires:
- Microphone access (requested when starting a conversation)
- Secure context (HTTPS) for production use
- Browser compatibility with WebRTC

### Browser Requirements

Supported browsers:
- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari 14+

Required browser features:
- WebRTC
- Web Audio API
- ES6+ JavaScript

## Features

- Real-time voice conversations with AI
- Live audio visualization
- Responsive floating interface
- Automatic error handling
- Norwegian language support
- Context preservation (up to 10 messages)
- Voice activity detection
- Streaming text responses

## Development

To run the development server:

```bash
npm install
npm run dev
```

The widget will be available at `http://localhost:5000`.

To build for production:

```bash
npm run build
```

## Troubleshooting

Common issues and solutions:

1. **Microphone Access Denied**
   - Ensure the site has microphone permissions
   - Check browser settings for blocked permissions

2. **Widget Not Loading**
   - Verify the script is loaded from a valid URL
   - Check browser console for errors
   - Ensure container ID exists in the DOM

3. **Audio Issues**
   - Confirm microphone is properly connected
   - Check system audio settings
   - Verify browser compatibility

## Deployment Instructions

### Installation
1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Build the project:
```bash
npm run build
```

### Usage
To integrate the voice widget into your application, add the following code to your HTML:

```html
<!-- Add the widget container -->
<div id="instabank-voice-widget"></div>

<!-- Add the widget script -->
<script src="path/to/widget.js"></script>

<!-- Initialize the widget (optional if you want custom configuration) -->
<script>
  window.InstabankVoiceWidget.init({
    containerId: 'instabank-voice-widget', // Optional: defaults to 'instabank-voice-widget'
    onError: (error) => console.error('Widget error:', error),
    onReady: () => console.log('Widget ready')
  });
</script>
```

### Configuration Options
The widget supports the following configuration options:

```typescript
interface WidgetOptions {
  containerId?: string;        // Custom container ID (default: 'instabank-voice-widget')
  onError?: (error: Error) => void;  // Error callback
  onReady?: () => void;       // Ready callback
}
```

### Environment Variables
The following environment variables are required:

- `ELEVENLABS_API_KEY`: Your ElevenLabs API key
- `ELEVENLABS_AGENT_ID`: Your ElevenLabs agent ID

### Running in Development
```bash
npm run dev
```

### Running in Production
```bash
npm run build
npm run start
```

## Support

For issues and feature requests, please contact Instabank support.

## Version History

### v1.2.0
- Improved voice activity detection with refined thresholds
- Added streaming text display for better conversation flow
- Fixed duplicate welcome messages
- Enhanced transcript display with proper formatting
- Added conversation context preservation (up to 10 messages)
