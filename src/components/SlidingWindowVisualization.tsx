import React, { useRef, useEffect } from 'react';

interface SlidingWindowVisualizationProps {
  requestTimestamps: number[];
  maxRequests: number;
  windowLength: number;
  currentTime: number;
  status: {
    message: string;
    isAllowed: boolean;
  };
}

export const SlidingWindowVisualization: React.FC<SlidingWindowVisualizationProps> = ({ 
  requestTimestamps, 
  maxRequests, 
  windowLength,
  currentTime,
  status 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Draw the timeline visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Get canvas dimensions
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear the canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw timeline
    const timelineY = height / 2;
    const timelineWidth = width - 40;
    const startX = 20;
    const endX = startX + timelineWidth;
    
    // Draw timeline line
    ctx.beginPath();
    ctx.moveTo(startX, timelineY);
    ctx.lineTo(endX, timelineY);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw current time marker (right edge of sliding window)
    ctx.beginPath();
    ctx.moveTo(endX, timelineY - 15);
    ctx.lineTo(endX, timelineY + 15);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Draw "now" label
    ctx.font = '12px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('Now', endX, timelineY + 30);
    
    // Draw window start time marker (left edge of sliding window)
    const windowStartX = endX - timelineWidth * (windowLength / windowLength);
    ctx.beginPath();
    ctx.moveTo(windowStartX, timelineY - 10);
    ctx.lineTo(windowStartX, timelineY + 10);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw window start label
    ctx.fillText(`${windowLength/1000}s ago`, windowStartX, timelineY + 30);
    
    // Draw sliding window
    ctx.fillStyle = 'rgba(76, 175, 80, 0.2)';
    ctx.fillRect(windowStartX, timelineY - 25, endX - windowStartX, 50);
    
    // Draw request markers
    requestTimestamps.forEach((timestamp, index) => {
      // Calculate x position based on time
      const timeDiff = currentTime - timestamp;
      const ratio = Math.min(timeDiff / windowLength, 1);
      const x = endX - (ratio * timelineWidth);
      
      // Determine if the request is within the window
      const isWithinWindow = timeDiff <= windowLength;
      
      // Draw request circle
      ctx.beginPath();
      ctx.arc(x, timelineY, 10, 0, Math.PI * 2);
      ctx.fillStyle = isWithinWindow ? 'rgba(76, 175, 80, 0.8)' : 'rgba(244, 67, 54, 0.5)';
      ctx.fill();
      ctx.strokeStyle = isWithinWindow ? '#4CAF50' : '#f44336';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw request number
      ctx.font = '10px Arial';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((index + 1).toString(), x, timelineY);
    });
    
    // Draw max requests limit line
    ctx.beginPath();
    ctx.moveTo(startX, timelineY - 50);
    ctx.lineTo(endX, timelineY - 50);
    ctx.strokeStyle = 'rgba(244, 67, 54, 0.7)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 3]);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw max requests label
    ctx.font = '12px Arial';
    ctx.fillStyle = 'rgba(244, 67, 54, 0.9)';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Max Requests: ${maxRequests}`, endX, timelineY - 50);
    
  }, [requestTimestamps, maxRequests, windowLength, currentTime]);

  return (
    <div className="text-center">
      <h3 className="text-xl font-bold mb-4">Sliding Window</h3>
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 mb-4 max-w-md mx-auto">
        <canvas 
          ref={canvasRef} 
          width={500} 
          height={200} 
          className="w-full h-auto"
        ></canvas>
        
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {Array.from({ length: maxRequests }).map((_, i) => (
            <div 
              key={i}
              className={`w-10 h-10 flex items-center justify-center rounded-md text-xs font-bold transition-all duration-300 ${
                i < requestTimestamps.filter(t => (currentTime - t) <= windowLength).length 
                  ? 'bg-gradient-to-br from-green-400 to-green-600 border-green-400 text-white scale-110' 
                  : 'border-2 border-white/30'
              }`}
            >
              {i < requestTimestamps.filter(t => (currentTime - t) <= windowLength).length ? i + 1 : ''}
            </div>
          ))}
        </div>
      </div>
      
      <div className={`py-3 px-4 rounded-lg font-bold text-lg ${
        status.isAllowed ? 'bg-green-500/30 text-green-300' : 'bg-red-500/30 text-red-300'
      }`}>
        {status.message}
      </div>
    </div>
  );
};