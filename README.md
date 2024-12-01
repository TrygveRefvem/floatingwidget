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

## Support

## Version History

### v1.2.0
- Improved voice activity detection with refined thresholds
- Added streaming text display for better conversation flow
- Fixed duplicate welcome messages
- Enhanced transcript display with proper formatting
- Added conversation context preservation (up to 10 messages)

For issues and feature requests, please contact Instabank support.
