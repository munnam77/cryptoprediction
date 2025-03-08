import React, { useEffect, useRef } from 'react';
import { colors } from '../../styles/theme';

interface LiquidFlowProps {
  value: number;
  previousValue: number;
  duration?: number;
  color?: string;
  height?: number;
}

export const LiquidFlow: React.FC<LiquidFlowProps> = ({
  value,
  previousValue,
  duration = 1000,
  color = colors.primary[500],
  height = 100,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const points: { x: number; y: number }[] = [];
    const numPoints = 10;
    const tension = 0.3;
    const width = canvas.width;

    // Initialize points
    for (let i = 0; i <= numPoints; i++) {
      points.push({
        x: (width * i) / numPoints,
        y: height - (height * previousValue) / 100,
      });
    }

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = timestamp - startTimeRef.current;
      const percent = Math.min(progress / duration, 1);

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Update points
      for (let i = 0; i <= numPoints; i++) {
        const targetY = height - (height * value) / 100;
        const currentY = height - (height * previousValue) / 100;
        points[i].y = currentY + (targetY - currentY) * percent;

        // Add wave effect
        points[i].y += Math.sin(timestamp / 500 + i) * 2;
      }

      // Draw liquid
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(points[0].x, points[0].y);

      // Create smooth curve through points
      for (let i = 0; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }

      ctx.lineTo(width, height);
      ctx.closePath();

      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, `${color}80`); // 50% opacity
      gradient.addColorStop(1, `${color}20`); // 12.5% opacity

      ctx.fillStyle = gradient;
      ctx.fill();

      // Add shine effect
      ctx.beginPath();
      ctx.moveTo(0, 0);
      for (let i = 0; i <= numPoints; i++) {
        const x = (width * i) / numPoints;
        const y = points[i].y - 5;
        if (i === 0) ctx.moveTo(x, y);
        else {
          const xc = (x + points[i - 1].x) / 2;
          const yc = (y + points[i - 1].y) / 2;
          ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y - 5, xc, yc);
        }
      }
      ctx.strokeStyle = `${color}40`; // 25% opacity
      ctx.lineWidth = 1;
      ctx.stroke();

      if (progress < duration) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, previousValue, color, height, duration]);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={height}
      className="w-full h-full"
      style={{
        filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
      }}
    />
  );
};