const percentile = (values, p) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[index];
};

const createMetricsCollector = ({
  reportIntervalMs = 60_000,
  maxSamplesPerRoute = 500
} = {}) => {
  const routeStats = new Map();

  const middleware = (req, res, next) => {
    const start = process.hrtime.bigint();
    res.on('finish', () => {
      const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
      const routePath = req.route?.path || req.path || 'unknown';
      const key = `${req.method} ${routePath}`;

      const current = routeStats.get(key) || {
        count: 0,
        errors: 0,
        latencies: [],
        maxMs: 0
      };

      current.count += 1;
      if (res.statusCode >= 400) current.errors += 1;
      current.maxMs = Math.max(current.maxMs, durationMs);
      current.latencies.push(durationMs);
      if (current.latencies.length > maxSamplesPerRoute) {
        current.latencies.shift();
      }

      routeStats.set(key, current);
    });

    next();
  };

  const getSnapshot = () => {
    const routes = [];
    for (const [key, stat] of routeStats.entries()) {
      routes.push({
        route: key,
        count: stat.count,
        errors: stat.errors,
        p95Ms: Number(percentile(stat.latencies, 95).toFixed(2)),
        p99Ms: Number(percentile(stat.latencies, 99).toFixed(2)),
        maxMs: Number(stat.maxMs.toFixed(2))
      });
    }
    routes.sort((a, b) => a.route.localeCompare(b.route));
    return {
      generatedAt: new Date().toISOString(),
      routes
    };
  };

  const renderPrometheus = () => {
    const snapshot = getSnapshot();
    const sanitizeLabel = (value) => `${value}`.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    const lines = [
      '# HELP gateway_route_requests_total Total requests observed per route.',
      '# TYPE gateway_route_requests_total counter',
      '# HELP gateway_route_errors_total Total error responses (4xx/5xx) per route.',
      '# TYPE gateway_route_errors_total counter',
      '# HELP gateway_route_latency_p95_ms P95 latency in milliseconds per route.',
      '# TYPE gateway_route_latency_p95_ms gauge',
      '# HELP gateway_route_latency_p99_ms P99 latency in milliseconds per route.',
      '# TYPE gateway_route_latency_p99_ms gauge',
      '# HELP gateway_route_latency_max_ms Max latency in milliseconds per route.',
      '# TYPE gateway_route_latency_max_ms gauge'
    ];

    snapshot.routes.forEach((route) => {
      const label = sanitizeLabel(route.route);
      lines.push(`gateway_route_requests_total{route="${label}"} ${route.count}`);
      lines.push(`gateway_route_errors_total{route="${label}"} ${route.errors}`);
      lines.push(`gateway_route_latency_p95_ms{route="${label}"} ${route.p95Ms}`);
      lines.push(`gateway_route_latency_p99_ms{route="${label}"} ${route.p99Ms}`);
      lines.push(`gateway_route_latency_max_ms{route="${label}"} ${route.maxMs}`);
    });

    return `${lines.join('\n')}\n`;
  };

  const timer = setInterval(() => {
    if (!routeStats.size) return;
    const lines = getSnapshot().routes.map(
      (r) => `${r.route} count=${r.count} errors=${r.errors} p95=${r.p95Ms}ms p99=${r.p99Ms}ms max=${r.maxMs}ms`
    );
    console.log('[metrics] route-latency summary');
    lines.sort().forEach((line) => console.log(`[metrics] ${line}`));
  }, reportIntervalMs);

  if (typeof timer.unref === 'function') {
    timer.unref();
  }

  return {
    middleware,
    getSnapshot,
    renderPrometheus
  };
};

module.exports = {
  createMetricsCollector
};
