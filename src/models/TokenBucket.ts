export class TokenBucket {
  capacity: number;
  period: number;
  tokensPerPeriod: number;
  strategy: 'interval' | 'greedy';
  tokenCount: number;
  refillTimestamp: number;
  totalRequests: number;
  allowedRequests: number;
  deniedRequests: number;

  constructor(capacity: number, period: number, tokensPerPeriod: number, strategy: 'interval' | 'greedy') {
    this.capacity = capacity;
    this.period = period;
    this.tokensPerPeriod = tokensPerPeriod;
    this.strategy = strategy;
    this.tokenCount = capacity;
    this.refillTimestamp = Date.now();
    this.totalRequests = 0;
    this.allowedRequests = 0;
    this.deniedRequests = 0;
  }

  intervalBasedRefill(): number {
    const now = Date.now();
    const elapsedTime = now - this.refillTimestamp;
    const elapsedPeriods = Math.floor(elapsedTime / this.period);
    
    if (elapsedPeriods > 0) {
      const availableTokens = elapsedPeriods * this.tokensPerPeriod;
      const oldTokenCount = this.tokenCount;
      this.tokenCount = Math.min(this.tokenCount + availableTokens, this.capacity);
      this.refillTimestamp += elapsedPeriods * this.period;
      
      return this.tokenCount - oldTokenCount; // tokens added
    }
    return 0;
  }

  greedyRefill(): number {
    const now = Date.now();
    const elapsedTime = now - this.refillTimestamp;
    const availableTokens = Math.floor(elapsedTime * this.tokensPerPeriod / this.period);
    
    if (availableTokens > 0) {
      const oldTokenCount = this.tokenCount;
      this.tokenCount = Math.min(this.tokenCount + availableTokens, this.capacity);
      this.refillTimestamp += availableTokens * this.period / this.tokensPerPeriod;
      
      return this.tokenCount - oldTokenCount; // tokens added
    }
    return 0;
  }

  consume(): { allowed: boolean; tokensAdded: number } {
    // Refill based on strategy
    const tokensAdded = this.strategy === 'interval' ? 
      this.intervalBasedRefill() : this.greedyRefill();

    this.totalRequests++;
    
    if (this.tokenCount > 0) {
      this.tokenCount--;
      this.allowedRequests++;
      return { allowed: true, tokensAdded };
    } else {
      this.deniedRequests++;
      return { allowed: false, tokensAdded };
    }
  }

  getStatus() {
    return {
      currentTokens: this.tokenCount,
      capacity: this.capacity,
      totalRequests: this.totalRequests,
      allowed: this.allowedRequests,
      denied: this.deniedRequests,
      lastRefill: new Date(this.refillTimestamp).toLocaleTimeString()
    };
  }
}