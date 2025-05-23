export class LeakyBucket {
  capacity: number;
  outflowRate: number; // requests per second
  currentLevel: number;
  lastLeakTime: number;
  queue: { timestamp: number; processed: boolean }[];
  totalRequests: number;
  allowedRequests: number;
  deniedRequests: number;

  constructor(capacity: number, outflowRate: number) {
    this.capacity = capacity;
    this.outflowRate = outflowRate;
    this.currentLevel = 0;
    this.lastLeakTime = Date.now();
    this.queue = [];
    this.totalRequests = 0;
    this.allowedRequests = 0;
    this.deniedRequests = 0;
  }

  leak() {
    const now = Date.now();
    const elapsedSeconds = (now - this.lastLeakTime) / 1000;
    const leakAmount = elapsedSeconds * this.outflowRate;
    
    if (leakAmount > 0) {
      this.currentLevel = Math.max(0, this.currentLevel - leakAmount);
      this.lastLeakTime = now;
      
      // Process queued requests if there's space
      while (this.queue.length > 0 && this.currentLevel < this.capacity) {
        const request = this.queue[0];
        if (!request.processed) {
          this.currentLevel++;
          request.processed = true;
          this.allowedRequests++;
        }
        this.queue.shift();
      }
    }
  }

  addRequest(): { allowed: boolean; queued: boolean } {
    this.leak();
    this.totalRequests++;

    if (this.currentLevel < this.capacity) {
      this.currentLevel++;
      this.allowedRequests++;
      return { allowed: true, queued: false };
    } else if (this.queue.length < this.capacity) {
      this.queue.push({ timestamp: Date.now(), processed: false });
      return { allowed: false, queued: true };
    } else {
      this.deniedRequests++;
      return { allowed: false, queued: false };
    }
  }

  getStatus() {
    this.leak();
    return {
      currentLevel: this.currentLevel,
      capacity: this.capacity,
      queueLength: this.queue.length,
      outflowRate: this.outflowRate,
      totalRequests: this.totalRequests,
      allowed: this.allowedRequests,
      denied: this.deniedRequests,
      lastLeak: new Date(this.lastLeakTime).toLocaleTimeString()
    };
  }

  reset() {
    this.currentLevel = 0;
    this.lastLeakTime = Date.now();
    this.queue = [];
    this.totalRequests = 0;
    this.allowedRequests = 0;
    this.deniedRequests = 0;
  }
}