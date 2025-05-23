import React from 'react';

interface FixedWindowVisualizationProps {
  currentRequests: number;
  maxRequests: number;
  timeRemaining: number;
  windowLength: number;
  status: {
    message: string;
    isAllowed: boolean;
  };
}

export const FixedWindowVisualization: React.FC<FixedWindowVisualizationProps> = ({ 
  currentRequests, 
  maxRequests, 
  timeRemaining,
  windowLength,
  status 
}) => {
  const progressPercentage = (currentRequests / maxRequests) * 100;
  const timeRemainingPercentage = (timeRemaining / windowLength) * 100;

  return (
    <div className="text-center">
      <h3 className="text-xl font-bold mb-4">Fixed Window</h3>
      <div className="max-w-md mx-auto mb-4">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 mb-4">
          <div className="relative h-10 bg-white/20 rounded-full mb-5 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-green-300 rounded-full transition-all duration-100 relative"
              style={{ width: `${timeRemainingPercentage}%` }}
            >
              <div className="absolute top-0 right-0 w-1 h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white text-shadow">
              Current Window
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-2">
            {Array.from({ length: maxRequests }).map((_, i) => (
              <div 
                key={i}
                className={`w-10 h-10 flex items-center justify-center rounded-md text-xs font-bold transition-all duration-300 ${
                  i < currentRequests 
                    ? 'bg-gradient-to-br from-green-400 to-green-600 border-green-400 text-white scale-110' 
                    : 'border-2 border-white/30'
                }`}
              >
                {i < currentRequests ? i + 1 : ''}
              </div>
            ))}
          </div>
        </div>
        
        <div className="text-center">
          {timeRemaining > 0 ? (
            <div className="text-sm font-medium">
              {(timeRemaining / 1000).toFixed(1)}s remaining
            </div>
          ) : '-'}
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