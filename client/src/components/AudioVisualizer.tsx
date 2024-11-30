import { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isActive: boolean;
  audioData?: Float32Array;
}

export function AudioVisualizer({ isActive, audioData }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (isActive && audioData) {
        console.log('Visualizing audio data:', { 
          dataLength: audioData.length,
          maxValue: Math.max(...Array.from(audioData.map(Math.abs)))
        });
        
        const bars = 50;
        const step = Math.floor(audioData.length / bars);
        const barWidth = canvas.width / bars;

        for (let i = 0; i < bars; i++) {
          // Get average value for this bar
          let sum = 0;
          for (let j = 0; j < step; j++) {
            sum += Math.abs(audioData[i * step + j] || 0);
          }
          const average = sum / step;
          
          // Increased scaling for better visualization
          const height = average * canvas.height * 10;
          const x = i * barWidth;
          const y = canvas.height - height;
          
          ctx.fillStyle = '#4CAF50';
          ctx.fillRect(x, y, barWidth - 2, height);
        }
      } else {
        // Draw flat line when inactive
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, audioData]);

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={100}
      className="w-full h-[100px] rounded-md bg-gray-50"
    />
  );
}
