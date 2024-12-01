import { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  audioData?: Float32Array;
  isAgentSpeaking?: boolean;
}

export function AudioVisualizer({ audioData, isAgentSpeaking }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (audioData && audioData.length > 0) {
        const bars = 50;
        const step = Math.floor(audioData.length / bars);
        const barWidth = canvas.width / bars;

        for (let i = 0; i < bars; i++) {
          // Get average value for this bar
          let sum = 0;
          const startIndex = i * step;
          
          // Ensure we don't access beyond array bounds
          for (let j = 0; j < step && (startIndex + j) < audioData.length; j++) {
            sum += Math.abs(audioData[startIndex + j]);
          }
          
          const average = sum / step;
          const height = average * canvas.height * 15;
          const x = i * barWidth;
          const y = canvas.height - height;
          
          ctx.fillStyle = '#4CAF50';
          ctx.fillRect(x, y, barWidth - 2, height);
        }
      } else {
        // Enhanced idle animation
        const time = Date.now() / 1000;
        const bars = 50;
        const barWidth = canvas.width / bars;
        
        for (let i = 0; i < bars; i++) {
          const x = i * barWidth;
          let height;

          if (isAgentSpeaking) {
            // More active visualization for agent speech
            height = Math.sin(time * 3 + i * 0.2) * 10 + 15;
          } else {
            // Gentle idle animation
            height = Math.sin(time + i * 0.1) * 5 + 10;
          }
          
          ctx.fillStyle = '#4CAF50';
          ctx.fillRect(x, canvas.height / 2 - height / 2, barWidth - 2, height);
        }
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioData, isAgentSpeaking]);

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={100}
      className="w-full h-[100px] rounded-md bg-gray-50"
    />
  );
}
