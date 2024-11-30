import { useEffect, useRef } from 'react';

interface AudioProcessorProps {
  isActive: boolean;
  isSpeaking?: boolean;
  onVoiceActivityChange?: (isActive: boolean) => void;
  onAudioData?: (data: Float32Array) => void;
}

export function AudioProcessor({ isActive, isSpeaking, onVoiceActivityChange, onAudioData }: AudioProcessorProps) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
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
          onAudioData?.(dataArray);
          
          // Calculate RMS with increased sensitivity
          const rms = Math.sqrt(
            dataArray.reduce((acc, val) => acc + val * val, 0) / dataArray.length
          );

          // Lower threshold for better voice detection
          const isVoiceActive = rms > 0.001;
          
          if (isVoiceActive) {
            if (voiceDetectionTimeout) {
              clearTimeout(voiceDetectionTimeout);
            }
            onVoiceActivityChange?.(true);
            voiceDetectionTimeout = window.setTimeout(() => {
              onVoiceActivityChange?.(false);
            }, 500) as unknown as number;
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

    initializeAudio();

    return () => {
      mounted = false;
      cleanup();
    };
  }, [onAudioData, onVoiceActivityChange]);

  return null;
}