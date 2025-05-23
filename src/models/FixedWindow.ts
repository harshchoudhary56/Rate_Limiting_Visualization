export class FixedWindow {
  maxCount: number;
  windowLengthMillis: number;
  currentWindow: { timestamp: number; count: number } | null;
  totalRequests: number;
  allowedRequests: number;
  deniedRequests: number;

  constructor(maxCount: number, windowLengthMillis: number) {
    this.maxCount = maxCount;
    this.windowLengthMillis = windowLengthMillis;
    this.currentWindow = null;
    this.totalRequests = 0;
    this.allowedRequests = 0;
    this.deniedRequests = 0;
  }

  allowed(): { allowed: boolean; windowReset: boolean } {
    const now = Date.now();
    let windowReset = false;
    
    // If there is no current window OR it's time to start a new window
    if (!this.currentWindow || 
        this.currentWindow.timestamp + this.windowLengthMillis < now) {
        this.currentWindow = {
            timestamp: now,
            count: 0
        };
        windowReset = true;
    }

    this.totalRequests++;

    // If requests in current window exceed the limit, deny
    if (this.currentWindow.count >= this.maxCount) {
        this.deniedRequests++;
        return { allowed: false, windowReset };
    } else {
        // Allow request and increment count
        this.currentWindow.count++;
        this.allowedRequests++;
        return { allowed: true, windowReset };
    }
  }

  getStatus() {
    const now = Date.now();
    let windowStart = '-';
    let windowEnd = '-';
    let currentRequests = 0;
    let timeRemaining = 0;

    if (this.currentWindow) {
        windowStart = new Date(this.currentWindow.timestamp).toLocaleTimeString();
        windowEnd = new Date(this.currentWindow.timestamp + this.windowLengthMillis).toLocaleTimeString();
        currentRequests = this.currentWindow.count;
        timeRemaining = Math.max(0, this.windowLengthMillis - (now - this.currentWindow.timestamp));
    }

    return {
        currentRequests,
        maxCount: this.maxCount,
        windowStart,
        windowEnd,
        timeRemaining,
        totalRequests: this.totalRequests,
        allowed: this.allowedRequests,
        denied: this.deniedRequests
    };
  }

  reset() {
    this.currentWindow = null;
    this.totalRequests = 0;
    this.allowedRequests = 0;
    this.deniedRequests = 0;
  }
}