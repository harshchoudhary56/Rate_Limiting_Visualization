import React from 'react';

interface Log {
  message: string;
  timestamp: Date;
  isAllowed: boolean;
}

interface LogPanelProps {
  logs: Log[];
}

export const LogPanel: React.FC<LogPanelProps> = ({ logs }) => {
  return (
    <div className="bg-black/30 p-4 rounded-xl h-48 overflow-y-auto font-mono text-sm">
      {logs.length === 0 ? (
        <div className="text-gray-400 italic">No logs yet...</div>
      ) : (
        logs.map((log, index) => (
          <div 
            key={index} 
            className={`mb-1 animate-fadeIn ${log.isAllowed ? 'text-green-300' : 'text-red-300'}`}
          >
            {log.timestamp.toLocaleTimeString()} - {log.message}
          </div>
        ))
      )}
    </div>
  );
};