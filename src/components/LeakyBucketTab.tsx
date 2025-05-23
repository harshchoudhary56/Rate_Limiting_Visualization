import React, { useState, useEffect, useRef } from 'react';
import { ControlPanel } from './ControlPanel';
import { InfoPanel } from './InfoPanel';
import { LogPanel } from './LogPanel';
import { LeakyBucket } from '../models/LeakyBucket';
import { LeakyBucketVisualization } from './LeakyBucketVisualization';

export const LeakyBucketTab: React.FC = () => {
  const [capacity, setCapacity] = useState(5);
  const [outflowRate, setOutflowRate] = useState(1);
  const [autoInterval, setAutoInterval] = useState(800);
  const [status, setStatus] = useState({ message: 'Ready', isAllowed: true });
  const [logs, setLogs] = useState<Array<{ message: string; timestamp: Date; isAllowed: boolean }>>([]);
  
  const bucketRef = useRef(new LeakyBucket(capacity, outflowRate));
  const leakTimerRef = useRef<number | null>(null);
  const autoTimerRef = useRef<number | null>(null);
  const [bucketStatus, setBucketStatus] = useState(bucketRef.current.getStatus());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setBucketStatus(bucketRef.current.getStatus());
    }, 100);
    
    return () => {
      window.clearInterval(interval);
      if (leakTimerRef.current) window.clearInterval(leakTimerRef.current);
      if (autoTimerRef.current) window.clearInterval(autoTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const bucket = bucketRef.current;
    bucket.capacity = capacity;
    bucket.outflowRate = outflowRate;
    setBucketStatus(bucket.getStatus());
  }, [capacity, outflowRate]);

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
    const result = bucketRef.current.addRequest();
    setBucketStatus(bucketRef.current.getStatus());
    
    let message = '';
    if (result.allowed) {
      message = 'Request processed';
    } else if (result.queued) {
      message = 'Request queued';
    } else {
      message = 'Request denied';
    }
    
    setStatus({ 
      message: result.allowed ? '✅ Request Processed' : 
               result.queued ? '⏳ Request Queued' : '❌ Request Denied',
      isAllowed: result.allowed || result.queued
    });
    
    addLog(message, result.allowed || result.queued);
  };

  const reset = () => {
    stopAutoRequests();
    bucketRef.current.reset();
    setBucketStatus(bucketRef.current.getStatus());
    setStatus({ message: 'Ready', isAllowed: true });
    setLogs([]);
  };

  const controls = [
    {
      label: 'Capacity',
      value: capacity,
      min: 1,
      max: 20,
      onChange: setCapacity,
    },
    {
      label: 'Outflow Rate (req/s)',
      value: outflowRate,
      min: 0.1,
      max: 10,
      onChange: setOutflowRate,
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
        <LeakyBucketVisualization
          currentLevel={bucketStatus.currentLevel}
          capacity={capacity}
          queueLength={bucketStatus.queueLength}
          status={status}
        />

        <InfoPanel
          title="System Status"
          items={[
            { label: 'Current Level', value: bucketStatus.currentLevel.toFixed(2) },
            { label: 'Capacity', value: capacity.toString() },
            { label: 'Queue Length', value: bucketStatus.queueLength.toString() },
            { label: 'Outflow Rate', value: `${outflowRate}/s` },
            { label: 'Last Leak', value: bucketStatus.lastLeak },
            { label: 'Total Requests', value: bucketStatus.totalRequests.toString() },
            { label: 'Allowed', value: bucketStatus.allowed.toString() },
            { label: 'Denied', value: bucketStatus.denied.toString() },
          ]}
        />
      </div>

      <LogPanel logs={logs} />

      <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl mt-6">
        <h3 className="text-xl text-yellow-300 font-bold mb-4">Leaky Bucket Rate Limiting</h3>
        <p>The leaky bucket algorithm models a bucket that constantly leaks at a fixed rate. Incoming requests fill the bucket, and if the bucket is full, new requests are either queued or rejected. This provides smooth rate limiting with the ability to handle short bursts of traffic through its queue.</p>
      </div>
    </div>
  );
};