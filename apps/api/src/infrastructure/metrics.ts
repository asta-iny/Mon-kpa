type HistBuckets = Record<string, number>;

const bucketsMs = [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000];

class MetricsRegistry {
  private requestCount = 0;
  private errorCount = 0;
  private readonly latency: HistBuckets = Object.fromEntries(bucketsMs.map((b) => [`le_${b}`, 0]));
  private latencySum = 0;
  private latencyCount = 0;

  observeRequest(statusCode: number, durationMs: number): void {
    this.requestCount += 1;
    if (statusCode >= 500) {
      this.errorCount += 1;
    }
    this.latencySum += durationMs;
    this.latencyCount += 1;
    for (const b of bucketsMs) {
      if (durationMs <= b) {
        this.latency[`le_${b}`] = (this.latency[`le_${b}`] ?? 0) + 1;
      }
    }
  }

  toPrometheus(): string {
    const lines = [
      '# HELP libfind_http_requests_total Total HTTP requests',
      '# TYPE libfind_http_requests_total counter',
      `libfind_http_requests_total ${this.requestCount}`,
      '# HELP libfind_http_errors_total Total HTTP 5xx responses',
      '# TYPE libfind_http_errors_total counter',
      `libfind_http_errors_total ${this.errorCount}`,
      '# HELP libfind_http_request_duration_ms Request duration histogram (ms)',
      '# TYPE libfind_http_request_duration_ms histogram',
    ];
    for (const b of bucketsMs) {
      lines.push(
        `libfind_http_request_duration_ms_bucket{le="${b}"} ${this.latency[`le_${b}`] ?? 0}`,
      );
    }
    lines.push(
      `libfind_http_request_duration_ms_bucket{le="+Inf"} ${this.latencyCount}`,
      `libfind_http_request_duration_ms_sum ${this.latencySum}`,
      `libfind_http_request_duration_ms_count ${this.latencyCount}`,
    );
    return `${lines.join('\n')}\n`;
  }
}

export const metrics = new MetricsRegistry();
