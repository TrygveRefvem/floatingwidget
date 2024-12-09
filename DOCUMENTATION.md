# Voice Widget Documentation

## Project Overview
The Instabank Voice Widget is an interactive voice conversation component that can be embedded in any website. It leverages ElevenLabs AI for natural language processing and provides real-time voice interactions with users in Norwegian. The widget features a modern floating interface design with audio visualization capabilities.

## Project Structure

### Root Directory Files
- `package.json`: Node.js project configuration and dependencies
- `.env.example`: Template for environment variables required by the project
- `.gitignore`: Specifies which files Git should ignore
- `vite.config.ts`: Vite configuration for building the project
- `tsconfig.json`: TypeScript configuration
- `tailwind.config.ts`: Tailwind CSS configuration
- `README.md`: Project overview and quick start guide

### Client Directory (`/client`)
The client directory contains all front-end related code:

#### Components (`/client/src/components`)

1. **FloatingWidget.tsx**
```typescript
// Main container component that implements the floating interface
- Controls widget expansion/collapse
- Manages widget positioning
- Handles brand logo display
- Implements minimize/maximize transitions
```

2. **VoiceChat.tsx**
```typescript
// Core voice chat implementation
- Manages conversation state
- Handles audio streaming
- Implements message history
- Controls voice activity detection
- Manages ElevenLabs API integration
```

3. **AudioProcessor.tsx**
```typescript
// Audio processing and voice activity detection
- Implements WebAudio API
- Manages microphone input
- Performs voice activity detection
- Handles audio cleanup
- Controls audio thresholds
```

#### Key Implementation Details

##### Voice Activity Detection (AudioProcessor.tsx)
The AudioProcessor component implements sophisticated voice detection with the following parameters:
```typescript
const MIN_VOICE_DURATION = 200; // Minimum duration for voice detection
const VOICE_THRESHOLD = 0.03;   // Voice activity threshold
const NOISE_FLOOR = 0.015;      // Background noise threshold
const DEBOUNCE_TIME = 300;      // Debounce time for voice detection
```

##### Conversation Management (VoiceChat.tsx)
The VoiceChat component maintains conversation state using:
```typescript
interface TranscriptMessage {
  speaker: 'You' | 'Magnus';  // Speaker identification
  text: string;              // Message content
  timestamp?: number;        // Message timestamp
}
```

### Component Architecture

#### FloatingWidget Component
- **Purpose**: Provides the main container and UI for the voice chat interface
- **State Management**: 
  - Uses `useState` for expansion state
  - Controls widget visibility and animations
- **Key Features**:
  - Responsive positioning
  - Smooth transitions
  - Brand integration
  - Mobile-friendly design

#### VoiceChat Component
- **Purpose**: Handles all voice interaction logic
- **State Management**:
  - Manages conversation state
  - Controls audio processing
  - Handles user interactions
- **Key Features**:
  - Real-time transcription
  - Context preservation
  - Error handling
  - Voice activity indication

#### AudioProcessor Component
- **Purpose**: Handles all audio-related processing
- **Technical Implementation**:
  - Uses Web Audio API
  - Implements voice activity detection
  - Manages audio resources
- **Key Features**:
  - Real-time audio analysis
  - Resource cleanup
  - Error handling
  - Performance optimization

## API Integration

### ElevenLabs Integration
The project integrates with ElevenLabs API for voice processing:

```typescript
// Configuration
ELEVENLABS_API_KEY=your_api_key_here
ELEVENLABS_AGENT_ID=your_agent_id_here
```

### Environment Configuration
Required environment variables:
```bash
# ElevenLabs Configuration
ELEVENLABS_API_KEY=your_api_key_here
ELEVENLABS_AGENT_ID=your_agent_id_here

# Server Configuration
PORT=5000
NODE_ENV=development
```

## Technical Features

### Voice Activity Detection
The system implements sophisticated voice activity detection with:
- Real-time audio analysis
- Configurable thresholds
- Noise floor detection
- Debounce handling

### Conversation Context
- Maintains up to 10 previous messages
- Preserves conversation flow
- Handles speaker identification
- Manages timestamps

### UI/UX Features
- Floating interface design
- Responsive layout
- Real-time audio visualization
- Status indicators
- Brand integration

## Error Handling

The system implements comprehensive error handling:
1. Audio initialization errors
2. API communication errors
3. Browser compatibility checks
4. Resource cleanup
5. Connection management

## Browser Compatibility

Supported Browsers:
- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari 14+

Required Features:
- WebRTC
- Web Audio API
- ES6+ JavaScript

## Security Considerations

1. **API Key Protection**
   - Environment variables for sensitive data
   - Secure key transmission
   - Server-side key storage

2. **Audio Permissions**
   - Explicit user consent
   - Secure audio handling
   - Resource cleanup

3. **Data Protection**
   - Secure transmission
   - Limited context storage
   - Privacy-focused design

## Performance Optimization

1. **Audio Processing**
   - Optimized buffer sizes
   - Efficient resource management
   - Memory leak prevention

2. **UI Performance**
   - Efficient rendering
   - Smooth animations
   - Resource cleanup

## Deployment Guidelines

1. **Environment Setup**
   - Configure environment variables
   - Set up API keys
   - Configure server settings

2. **Build Process**
   ```bash
   npm install
   npm run build
   ```

3. **Production Configuration**
   - Enable production mode
   - Configure security headers
   - Set up error logging

## Development Guidelines

1. **Setup Development Environment**
   ```bash
   npm install
   npm run dev
   ```

2. **Code Style**
   - TypeScript strict mode
   - React best practices
   - Component-based architecture

3. **Testing**
   - Unit tests for components
   - Integration tests for API
   - Browser compatibility testing

## Troubleshooting Guide

Common issues and solutions:

1. **Microphone Access**
   - Check browser permissions
   - Verify HTTPS in production
   - Check device connectivity

2. **Audio Issues**
   - Verify audio settings
   - Check browser compatibility
   - Review error console

3. **API Connection**
   - Verify API keys
   - Check network connectivity
   - Review server logs
