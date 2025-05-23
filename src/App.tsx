import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { TokenBucketTab } from './components/TokenBucketTab';
import { FixedWindowTab } from './components/FixedWindowTab';
import { SlidingWindowTab } from './components/SlidingWindowTab';
import { LeakyBucketTab } from './components/LeakyBucketTab';

function App() {
  const [activeTab, setActiveTab] = useState('interval');

  const tabs = [
    { id: 'interval', label: 'Interval Refiller' },
    { id: 'greedy', label: 'Greedy Refiller' },
    { id: 'fixed', label: 'Fixed Window' },
    { id: 'sliding', label: 'Sliding Window' },
    { id: 'leaky', label: 'Leaky Bucket' }
  ];

  return (
    <Layout 
      title="🪣 Rate Limiter Visualization"
      subtitle="Interactive Visualization of Rate Limiting Algorithms"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {activeTab === 'interval' && <TokenBucketTab type="interval" />}
      {activeTab === 'greedy' && <TokenBucketTab type="greedy" />}
      {activeTab === 'fixed' && <FixedWindowTab />}
      {activeTab === 'sliding' && <SlidingWindowTab />}
      {activeTab === 'leaky' && <LeakyBucketTab />}
    </Layout>
  );
}

export default App;