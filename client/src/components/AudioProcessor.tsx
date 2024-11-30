import { useEffect, useRef, useState } from 'react';

interface AudioProcessorProps {
  isActive: boolean;
  onVoiceActivityChange?: (isActive: boolean) => void;
  onAudioData?: (data: Float32Array) => void;
}

export function AudioProcessor({ isActive, onVoiceActivityChange, onAudioData }: AudioProcessorProps) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isActive && !isProcessing) {
      const initializeAudio = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
          let voiceDetectionTimeout: number | null = null;

          const processAudio = () => {
            if (!analyser || !isActive) return;

            analyser.getFloatTimeDomainData(dataArray);
            onAudioData?.(dataArray);

            // Calculate RMS value to detect voice activity
            const rms = Math.sqrt(
              dataArray.reduce((acc, val) => acc + val * val, 0) / dataArray.length
            );

            // Lower threshold for better sensitivity
            const isVoiceActive = rms > 0.005;
            
            console.log('Audio processing:', { rms, isVoiceActive });
            
            // Pass audio data for visualization
            onAudioData?.(dataArray);

            if (isVoiceActive) {
              if (voiceDetectionTimeout) {
                clearTimeout(voiceDetectionTimeout);
              }
              console.log('Voice activity detected');
              onVoiceActivityChange?.(true);
              voiceDetectionTimeout = window.setTimeout(() => {
                console.log('Voice activity timeout');
                onVoiceActivityChange?.(false);
              }, 500) as unknown as number;
            }

            requestAnimationFrame(processAudio);
          };

          setIsProcessing(true);
          processAudio();
        } catch (error) {
          console.error('Error initializing audio:', error);
        }
      };

      initializeAudio();
    } else if (!isActive && isProcessing) {
      // Cleanup
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      setIsProcessing(false);
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isActive, isProcessing, onAudioData, onVoiceActivityChange]);

  return null;
}
