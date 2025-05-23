import React, { useState, useEffect, useRef } from 'react';
import { ControlPanel } from './ControlPanel';
import { InfoPanel } from './InfoPanel';
import { LogPanel } from './LogPanel';
import { FixedWindow } from '../models/FixedWindow';
import { FixedWindowVisualization } from './FixedWindowVisualization';

export const FixedWindowTab: React.FC = () => {
  const [maxRequests, setMaxRequests] = useState(4);
  const [windowLength, setWindowLength] = useState(5000);
  const [autoInterval, setAutoInterval] = useState(800);
  const [status, setStatus] = useState({ message: 'Ready', isAllowed: true });
  const [logs, setLogs] = useState<Array<{ message: string; timestamp: Date; isAllowed: boolean }>>([]);
  
  const windowRef = useRef(new FixedWindow(maxRequests, windowLength));
  const timerRef = useRef<number | null>(null);
  const autoTimerRef = useRef<number | null>(null);
  const [windowStatus, setWindowStatus] = useState(windowRef.current.getStatus());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setWindowStatus(windowRef.current.getStatus());
    }, 100);
    
    return () => {
      window.clearInterval(interval);
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (autoTimerRef.current) window.clearInterval(autoTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const window = windowRef.current;
    window.maxCount = maxRequests;
    window.windowLengthMillis = windowLength;
    setWindowStatus(window.getStatus());
  }, [maxRequests, windowLength]);

  const addLog = (message: string, isAllowed: boolean = true) => {
    setLogs((prevLogs) => [
      { message, timestamp: new Date(), isAllowed },
      ...prevLogs.slice(0, 99)
    ]);
  };

  const startAutoRequests = () => {
    if (autoTimerRef.current) return;
    
    autoTimerRef.current = window.setInterval(() => {
      makeRequest();
    }, autoInterval);
    
    addLog('Started auto requests');
  };

  const stopAutoRequests = () => {
    if (autoTimerRef.current) {
      window.clearInterval(autoTimerRef.current);
      autoTimerRef.current = null;
      addLog('Stopped auto requests');
    }
  };

  const makeRequest = () => {
    const result = windowRef.current.allowed();
    setWindowStatus(windowRef.current.getStatus());
    
    const message = result.allowed ? 'Request allowed' : 'Request denied';
    setStatus({ 
      message: result.allowed ? '✅ Request Allowed' : '❌ Request Denied', 
      isAllowed: result.allowed 
    });
    
    addLog(message, result.allowed);
  };

  const reset = () => {
    stopAutoRequests();
    windowRef.current.reset();
    setWindowStatus(windowRef.current.getStatus());
    setStatus({ message: 'Ready', isAllowed: true });
    setLogs([]);
  };

  const controls = [
    {
      label: 'Max Requests',
      value: maxRequests,
      min: 1,
      max: 20,
      onChange: setMaxRequests,
    },
    {
      label: 'Window Length (ms)',
      value: windowLength,
      min: 1000,
      max: 30000,
      onChange: setWindowLength,
    },
    {
      label: 'Auto Request Interval (ms)',
      value: autoInterval,
      min: 100,
      max: 5000,
      onChange: setAutoInterval,
    }
  ];

  const actions = [
    { label: 'Start Auto Requests', onClick: startAutoRequests, primary: true },
    { label: 'Stop', onClick: stopAutoRequests, primary: false },
    { label: 'Make Request', onClick: makeRequest, primary: true },
    { label: 'Reset', onClick: reset, primary: false },
  ];

  return (
    <div>
      <ControlPanel
        controls={controls}
        actions={actions}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <FixedWindowVisualization
          currentRequests={windowStatus.currentRequests}
          maxRequests={maxRequests}
          timeRemaining={windowStatus.timeRemaining}
          windowLength={windowLength}
          status={status}
        />

        <InfoPanel
          title="Window Status"
          items={[
            { label: 'Current Requests', value: windowStatus.currentRequests.toString() },
            { label: 'Max Requests', value: maxRequests.toString() },
            { label: 'Window Start', value: windowStatus.windowStart },
            { label: 'Window End', value: windowStatus.windowEnd },
            { label: 'Total Requests', value: windowStatus.totalRequests.toString() },
            { label: 'Allowed', value: windowStatus.allowed.toString() },
            { label: 'Denied', value: windowStatus.denied.toString() },
          ]}
        />
      </div>

      <LogPanel logs={logs} />

      <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl mt-6">
        <h3 className="text-xl text-yellow-300 font-bold mb-4">Fixed Window Rate Limiting</h3>
        <p>This strategy tracks requests within fixed time windows. Each window has a maximum number of allowed requests. When a window expires, a new window begins with a fresh request count. This can create "boundary burst" issues where users can make many requests at the end of one window and the beginning of the next.</p>
      </div>
    </div>
  );
};