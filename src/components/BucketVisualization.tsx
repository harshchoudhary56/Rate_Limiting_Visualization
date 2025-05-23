import React from 'react';

interface BucketVisualizationProps {
  tokens: number;
  capacity: number;
  status: {
    message: string;
    isAllowed: boolean;
  };
}

export const BucketVisualization: React.FC<BucketVisualizationProps> = ({ 
  tokens, 
  capacity, 
  status 
}) => {
  const fillPercentage = (tokens / capacity) * 100;

  return (
    <div className="text-center">
      <h3 className="text-xl font-bold mb-4">Token Bucket</h3>
      <div className="relative w-48 h-72 border-4 border-white rounded-b-xl mx-auto mb-4 overflow-hidden bg-white/10">
        <div 
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-500 to-green-300 transition-all duration-500"
          style={{ height: `${fillPercentage}%` }}
        ></div>
        
        {Array.from({ length: tokens }).map((_, i) => {
          // Position tokens in a grid pattern
          const row = Math.floor(i / 3);
          const col = i % 3;
          
          return (
            <div 
              key={i}
              className="absolute w-10 h-10 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center text-xs font-bold text-gray-800 shadow-lg animate-float"
              style={{ 
                left: `${20 + col * 35}px`, 
                bottom: `${15 + row * 35}px`,
                animationDelay: `${i * 0.1}s`
              }}
            >
              T
            </div>
          );
        })}
      </div>
      <div className={`py-3 px-4 rounded-lg font-bold text-lg ${
        status.isAllowed ? 'bg-green-500/30 text-green-300' : 'bg-red-500/30 text-red-300'
      }`}>
        {status.message}
      </div>
    </div>
  );
};