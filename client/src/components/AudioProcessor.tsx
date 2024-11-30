import { useEffect, useRef } from 'react';

interface AudioProcessorProps {
  isActive: boolean;
  isSpeaking?: boolean;
  onVoiceActivityChange?: (isActive: boolean) => void;
}

const MIN_VOICE_DURATION = 100; // ms

export function AudioProcessor({ isActive, isSpeaking, onVoiceActivityChange }: AudioProcessorProps) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastVoiceDetectionRef = useRef<number>(0);
  let voiceDetectionTimeout: number;

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
          
          // Calculate RMS with adjusted sensitivity
          const rms = Math.sqrt(
            dataArray.reduce((acc, val) => acc + val * val, 0) / dataArray.length
          );

          // Higher threshold for reduced sensitivity
          const isVoiceActive = rms > 0.01;
          
          const now = Date.now();
          if (isVoiceActive) {
            if (now - lastVoiceDetectionRef.current > MIN_VOICE_DURATION) {
              onVoiceActivityChange?.(true);
              lastVoiceDetectionRef.current = now;
            }
            if (voiceDetectionTimeout) {
              clearTimeout(voiceDetectionTimeout);
            }
            voiceDetectionTimeout = window.setTimeout(() => {
              onVoiceActivityChange?.(false);
            }, 300) as unknown as number;
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
