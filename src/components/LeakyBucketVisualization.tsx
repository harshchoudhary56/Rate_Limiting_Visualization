import React, { useEffect, useRef } from 'react';

interface LeakyBucketVisualizationProps {
  currentLevel: number;
  capacity: number;
  queueLength: number;
  status: {
    message: string;
    isAllowed: boolean;
  };
}

export const LeakyBucketVisualization: React.FC<LeakyBucketVisualizationProps> = ({
  currentLevel,
  capacity,
  queueLength,
  status
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw bucket
    const bucketWidth = 160;
    const bucketHeight = 240;
    const x = (canvas.width - bucketWidth) / 2;
    const y = 20;

    // Draw bucket outline
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + bucketWidth, y);
    ctx.lineTo(x + bucketWidth - 20, y + bucketHeight);
    ctx.lineTo(x + 20, y + bucketHeight);
    ctx.closePath();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Draw water level
    const waterHeight = (currentLevel / capacity) * bucketHeight;
    const gradient = ctx.createLinearGradient(
      x, y + bucketHeight - waterHeight,
      x, y + bucketHeight
    );
    gradient.addColorStop(0, '#4CAF50');
    gradient.addColorStop(1, '#81C784');

    ctx.beginPath();
    ctx.moveTo(x + 20, y + bucketHeight);
    ctx.lineTo(x + bucketWidth - 20, y + bucketHeight);
    ctx.lineTo(x + bucketWidth - 20 - (20 * waterHeight/bucketHeight),
               y + bucketHeight - waterHeight);
    ctx.lineTo(x + 20 + (20 * waterHeight/bucketHeight),
               y + bucketHeight - waterHeight);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw leak hole
    ctx.beginPath();
    ctx.arc(x + bucketWidth/2, y + bucketHeight, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fill();

    // Draw water drops if there's water in the bucket
    if (currentLevel > 0) {
      const now = Date.now();
      for (let i = 0; i < 3; i++) {
        const dropY = y + bucketHeight + 10 + (i * 15);
        const offsetX = Math.sin((now + i * 500) / 300) * 5;
        
        ctx.beginPath();
        ctx.arc(
          x + bucketWidth/2 + offsetX,
          dropY,
          3,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = '#4CAF50';
        ctx.fill();
      }
    }

    // Draw queue
    if (queueLength > 0) {
      const queueX = x + bucketWidth + 30;
      const queueY = y + 50;
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(queueX, queueY, 40, bucketHeight - 100);
      
      for (let i = 0; i < queueLength; i++) {
        ctx.beginPath();
        ctx.arc(
          queueX + 20,
          queueY + 20 + (i * 30),
          8,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = '#FFD700';
        ctx.fill();
      }
      
      // Queue label
      ctx.font = '14px Arial';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.fillText('Queue', queueX + 20, queueY - 10);
    }

  }, [currentLevel, capacity, queueLength]);

  return (
    <div className="text-center">
      <h3 className="text-xl font-bold mb-4">Leaky Bucket</h3>
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 mb-4">
        <canvas
          ref={canvasRef}
          width={400}
          height={300}
          className="mx-auto"
        />
      </div>
      
      <div className={`py-3 px-4 rounded-lg font-bold text-lg ${
        status.isAllowed ? 'bg-green-500/30 text-green-300' : 'bg-red-500/30 text-red-300'
      }`}>
        {status.message}
      </div>
    </div>
  );
};