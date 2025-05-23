import React, { useState, useEffect, useRef } from 'react';
import { ControlPanel } from './ControlPanel';
import { InfoPanel } from './InfoPanel';
import { LogPanel } from './LogPanel';
import { TokenBucket } from '../models/TokenBucket';
import { BucketVisualization } from './BucketVisualization';

interface TokenBucketTabProps {
  type: 'interval' | 'greedy';
}

export const TokenBucketTab: React.FC<TokenBucketTabProps> = ({ type }) => {
  const [capacity, setCapacity] = useState(5);
  const [period, setPeriod] = useState(1000);
  const [tokensPerPeriod, setTokensPerPeriod] = useState(1);
  const [status, setStatus] = useState({ message: 'Ready', isAllowed: true });
  const [logs, setLogs] = useState<Array<{ message: string; timestamp: Date; isAllowed: boolean }>>([]);
  
  const bucketRef = useRef(new TokenBucket(capacity, period, tokensPerPeriod, type));
  const timerRef = useRef<number | null>(null);
  const [bucketStatus, setBucketStatus] = useState(bucketRef.current.getStatus());

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const bucket = bucketRef.current;
    bucket.capacity = capacity;
    bucket.period = period;
    bucket.tokensPerPeriod = tokensPerPeriod;
    setBucketStatus(bucket.getStatus());
  }, [capacity, period, tokensPerPeriod]);

  const addLog = (message: string, isAllowed: boolean = true) => {
    setLogs((prevLogs) => [
      { message, timestamp: new Date(), isAllowed },
      ...prevLogs.slice(0, 99)
    ]);
  };

  const startAutoRefill = () => {
    if (timerRef.current) return;
    
    const refillMethod = type === 'interval' ? 
      () => bucketRef.current.intervalBasedRefill() : 
      () => bucketRef.current.greedyRefill();
    
    const interval = type === 'interval' ? period : 100;
    
    timerRef.current = window.setInterval(() => {
      const tokensAdded = refillMethod();
      setBucketStatus(bucketRef.current.getStatus());
      
      if (tokensAdded > 0) {
        addLog(`${tokensAdded} tokens added (${type} refill)`);
      }
    }, interval);
    
    addLog(`Started auto refill (${type} mode)`);
  };

  const stopAutoRefill = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
      addLog('Stopped auto refill');
    }
  };

  const consumeToken = () => {
    const result = bucketRef.current.consume();
    setBucketStatus(bucketRef.current.getStatus());
    
    const message = result.allowed ? 'Token consumed' : 'No tokens available';
    setStatus({ 
      message: result.allowed ? '✅ Request Allowed' : '❌ Request Denied', 
      isAllowed: result.allowed 
    });
    
    addLog(message, result.allowed);
  };

  const reset = () => {
    stopAutoRefill();
    bucketRef.current = new TokenBucket(capacity, period, tokensPerPeriod, type);
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
      label: 'Refill Period (ms)',
      value: period,
      min: 100,
      max: 5000,
      onChange: setPeriod,
    },
    {
      label: 'Tokens per Period',
      value: tokensPerPeriod,
      min: 1,
      max: 10,
      onChange: setTokensPerPeriod,
    }
  ];

  const actions = [
    { label: 'Start Auto Refill', onClick: startAutoRefill, primary: true },
    { label: 'Stop', onClick: stopAutoRefill, primary: false },
    { label: 'Consume Token', onClick: consumeToken, primary: true },
    { label: 'Reset', onClick: reset, primary: false },
  ];

  const explanation = type === 'interval' ? 
    'This strategy refills tokens at fixed intervals. When the refill period elapses, it adds all accumulated tokens at once. This creates a "bursty" behavior where tokens become available in batches rather than continuously.' : 
    'This strategy refills tokens continuously based on elapsed time. It provides smoother token availability by calculating exactly how many tokens should be available at any given moment, leading to more consistent rate limiting behavior.';

  return (
    <div>
      <ControlPanel
        controls={controls}
        actions={actions}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <BucketVisualization
          tokens={bucketStatus.currentTokens}
          capacity={capacity}
          status={status}
        />

        <InfoPanel
          title="System Status"
          items={[
            { label: 'Current Tokens', value: bucketStatus.currentTokens.toString() },
            { label: 'Capacity', value: capacity.toString() },
            { label: 'Last Refill', value: bucketStatus.lastRefill },
            { label: type === 'interval' ? 'Next Refill' : 'Refill Rate', value: type === 'interval' ? `${period / 1000}s` : `${tokensPerPeriod}/${period / 1000}s` },
            { label: 'Total Requests', value: bucketStatus.totalRequests.toString() },
            { label: 'Allowed', value: bucketStatus.allowed.toString() },
            { label: 'Denied', value: bucketStatus.denied.toString() },
          ]}
        />
      </div>

      <LogPanel logs={logs} />

      <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl mt-6">
        <h3 className="text-xl text-yellow-300 font-bold mb-4">
          {type === 'interval' ? 'Interval-Based Refill Strategy' : 'Greedy Refill Strategy'}
        </h3>
        <p>{explanation}</p>
      </div>
    </div>
  );
};