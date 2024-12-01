import { useEffect, useRef } from 'react';

interface AudioProcessorProps {
  isActive: boolean;
  isSpeaking?: boolean;
  onVoiceActivityChange?: (isActive: boolean) => void;
}

// Increased constants for more stringent voice detection
const MIN_VOICE_DURATION = 300; // ms
const VOICE_THRESHOLD = 0.05;
const NOISE_FLOOR = 0.02;
const DEBOUNCE_TIME = 500; // ms

export function AudioProcessor({ isActive, isSpeaking, onVoiceActivityChange }: AudioProcessorProps) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastVoiceDetectionRef = useRef<number>(0);
  const voiceDetectionTimeoutRef = useRef<number>(0);

  // Synchronous cleanup function
  const cleanup = () => {
    console.log('Cleaning up audio resources');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (audioContextRef.current?.state !== 'closed') {
      audioContextRef.current?.close();
      audioContextRef.current = null;
    }
    if (voiceDetectionTimeoutRef.current) {
      clearTimeout(voiceDetectionTimeoutRef.current);
      voiceDetectionTimeoutRef.current = 0;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!mounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        streamRef.current = stream;

        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();

        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = 0.8;
        source.connect(analyser);

        audioContextRef.current = audioContext;
        sourceRef.current = source;
        analyserRef.current = analyser;

        const dataArray = new Float32Array(analyser.frequencyBinCount);
        
        const processAudio = () => {
          if (!analyser || !mounted) {
            return;
          }

          analyser.getFloatTimeDomainData(dataArray);
          
          // Calculate RMS with noise floor
          const rms = Math.sqrt(
            dataArray.reduce((acc, val) => acc + val * val, 0) / dataArray.length
          );

          // More stringent voice detection logic
          const now = Date.now();
          const isVoiceActive = rms > VOICE_THRESHOLD && rms > NOISE_FLOOR;
          
          if (isVoiceActive && (now - lastVoiceDetectionRef.current > MIN_VOICE_DURATION)) {
            if (!voiceDetectionTimeoutRef.current) {
              onVoiceActivityChange?.(true);
              lastVoiceDetectionRef.current = now;
            }
            
            // Reset debounce timer
            if (voiceDetectionTimeoutRef.current) {
              clearTimeout(voiceDetectionTimeoutRef.current);
            }
            
            voiceDetectionTimeoutRef.current = window.setTimeout(() => {
              onVoiceActivityChange?.(false);
              voiceDetectionTimeoutRef.current = 0;
            }, DEBOUNCE_TIME) as unknown as number;
          }

          // Continue processing while mounted
          if (mounted) {
            requestAnimationFrame(processAudio);
          }
        };

        processAudio();
      } catch (error) {
        console.error('Error initializing audio:', error);
      }
    };

    if (isActive) {
      initializeAudio();
    }

    return () => {
      mounted = false;
      cleanup();
    };
  }, [isActive, onVoiceActivityChange]);

  return null;
}
