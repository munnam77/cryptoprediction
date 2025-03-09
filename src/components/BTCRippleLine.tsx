import React, { useEffect, useRef } from 'react';

interface BTCRippleLineProps {
  btcChangePercent: number;
  height?: number;
}

const BTCRippleLine: React.FC<BTCRippleLineProps> = ({
  btcChangePercent,
  height = 24
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const phaseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = 120;
    canvas.height = height;

    // Animation parameters
    const amplitude = Math.min(Math.abs(btcChangePercent) / 2, 8); // Max 8px amplitude
    const frequency = 0.05;
    const speed = 0.05;
    const baseY = height / 2;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Set line style
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = btcChangePercent >= 0 ? '#22c55e' : '#ef4444';
      
      // Draw wave
      ctx.beginPath();
      for (let x = 0; x < canvas.width; x++) {
        const y = baseY + amplitude * Math.sin(frequency * x + phaseRef.current);
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Add glow effect
      ctx.save();
      ctx.filter = `blur(${Math.abs(btcChangePercent) * 0.2}px)`;
      ctx.strokeStyle = btcChangePercent >= 0 ? '#22c55e33' : '#ef444433';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();

      // Update phase
      phaseRef.current += speed;
      if (phaseRef.current > Math.PI * 2) {
        phaseRef.current = 0;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [btcChangePercent, height]);

  return (
    <canvas
      ref={canvasRef}
      className="opacity-80"
      style={{
        width: '120px',
        height: `${height}px`
      }}
    />
  );
};

export default BTCRippleLine;
