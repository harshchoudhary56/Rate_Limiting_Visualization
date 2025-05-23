export class SlidingWindow {
  maxCount: number;
  windowLengthMillis: number;
  requestTimestamps: number[];
  totalRequests: number;
  allowedRequests: number;
  deniedRequests: number;

  constructor(maxCount: number, windowLengthMillis: number) {
    this.maxCount = maxCount;
    this.windowLengthMillis = windowLengthMillis;
    this.requestTimestamps = [];
    this.totalRequests = 0;
    this.allowedRequests = 0;
    this.deniedRequests = 0;
  }

  allowed(): { allowed: boolean } {
    const now = Date.now();
    
    // Remove timestamps outside the current sliding window
    this.requestTimestamps = this.requestTimestamps.filter(
      timestamp => now - timestamp <= this.windowLengthMillis
    );
    
    this.totalRequests++;
    
    // Check if the rate limit is exceeded
    if (this.requestTimestamps.length >= this.maxCount) {
      this.deniedRequests++;
      return { allowed: false };
    } else {
      // Add the current timestamp and allow the request
      this.requestTimestamps.push(now);
      this.allowedRequests++;
      return { allowed: true };
    }
  }

  getStatus() {
    const now = Date.now();
    
    // Remove timestamps outside the current sliding window
    this.requestTimestamps = this.requestTimestamps.filter(
      timestamp => now - timestamp <= this.windowLengthMillis
    );
    
    const timestamps = [...this.requestTimestamps].sort((a, b) => a - b);
    
    return {
      requestTimestamps: timestamps,
      requestCount: timestamps.length,
      maxCount: this.maxCount,
      windowLength: this.windowLengthMillis,
      currentTime: now,
      oldestRequest: timestamps.length > 0 ? new Date(timestamps[0]).toLocaleTimeString() : null,
      newestRequest: timestamps.length > 0 ? new Date(timestamps[timestamps.length - 1]).toLocaleTimeString() : null,
      totalRequests: this.totalRequests,
      allowed: this.allowedRequests,
      denied: this.deniedRequests
    };
  }

  reset() {
    this.requestTimestamps = [];
    this.totalRequests = 0;
    this.allowedRequests = 0;
    this.deniedRequests = 0;
  }
}