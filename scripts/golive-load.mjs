#!/usr/bin/env node

import {
  buildUrl,
  defaultBaseUrl,
  defaultPaths,
  fetchWithTiming,
  formatMs,
  getEnvNumber,
  getEnvString,
  parseList,
  percentile,
} from './golive-utils.mjs';

const baseUrl = getEnvString('GOLIVE_BASE_URL', defaultBaseUrl);
const paths = parseList(process.env.GOLIVE_PATHS, defaultPaths);
const durationSeconds = getEnvNumber('GOLIVE_DURATION_SECONDS', 60);
const concurrency = getEnvNumber('GOLIVE_CONCURRENCY', 10);
const timeoutMs = getEnvNumber('GOLIVE_TIMEOUT_MS', 10_000);
const maxErrorRate = getEnvNumber('GOLIVE_MAX_ERROR_RATE', 0.005);
const maxP95Ms = getEnvNumber('GOLIVE_MAX_P95_MS', 2_500);
const startedAt = Date.now();
const stopAt = startedAt + durationSeconds * 1000;
let nextPathIndex = 0;

const stats = {
  total: 0,
  status2xx3xx: 0,
  status4xx: 0,
  status5xx: 0,
  networkErrors: 0,
  durations: [],
  byPath: new Map(),
};

const nextPath = () => {
  const path = paths[nextPathIndex % paths.length];
  nextPathIndex += 1;
  return path;
};

const trackPath = (path, result) => {
  const current = stats.byPath.get(path) ?? {
    total: 0,
    status5xx: 0,
    networkErrors: 0,
  };

  current.total += 1;
  if (result.status >= 500) current.status5xx += 1;
  if (!result.ok) current.networkErrors += 1;

  stats.byPath.set(path, current);
};

const worker = async () => {
  while (Date.now() < stopAt) {
    const path = nextPath();
    const result = await fetchWithTiming(buildUrl(baseUrl, path), timeoutMs);

    stats.total += 1;
    stats.durations.push(result.durationMs);

    if (!result.ok) {
      stats.networkErrors += 1;
    } else if (result.status >= 500) {
      stats.status5xx += 1;
    } else if (result.status >= 400) {
      stats.status4xx += 1;
    } else {
      stats.status2xx3xx += 1;
    }

    trackPath(path, result);
  }
};

console.log(`Load test: ${baseUrl}`);
console.log(`Paths: ${paths.join(', ')}`);
console.log(`Concurrency: ${concurrency}, duration: ${durationSeconds}s, timeout: ${timeoutMs}ms`);

await Promise.all(Array.from({ length: concurrency }, () => worker()));

const elapsedSeconds = (Date.now() - startedAt) / 1000;
const p50 = percentile(stats.durations, 50);
const p95 = percentile(stats.durations, 95);
const p99 = percentile(stats.durations, 99);
const hardFailures = stats.status5xx + stats.networkErrors;
const errorRate = stats.total > 0 ? hardFailures / stats.total : 1;
const requestsPerSecond = stats.total / elapsedSeconds;

console.log('');
console.log(`Requests: ${stats.total} (${requestsPerSecond.toFixed(1)}/s)`);
console.log(`2xx/3xx: ${stats.status2xx3xx}`);
console.log(`4xx: ${stats.status4xx}`);
console.log(`5xx: ${stats.status5xx}`);
console.log(`Network errors: ${stats.networkErrors}`);
console.log(`Latency p50/p95/p99: ${formatMs(p50)} / ${formatMs(p95)} / ${formatMs(p99)}`);
console.log(`Hard error rate: ${(errorRate * 100).toFixed(2)}%`);
console.log('');
console.log('Per path:');

for (const [path, pathStats] of stats.byPath.entries()) {
  console.log(
    `${path}: ${pathStats.total} request(s), ${pathStats.status5xx}x 5xx, ${pathStats.networkErrors} network error(s)`,
  );
}

const failures = [];

if (hardFailures > 0) failures.push(`${hardFailures} hard failure(s)`);
if (errorRate > maxErrorRate)
  failures.push(`error rate ${(errorRate * 100).toFixed(2)}% > ${(maxErrorRate * 100).toFixed(2)}%`);
if (p95 > maxP95Ms) failures.push(`p95 ${formatMs(p95)} > ${formatMs(maxP95Ms)}`);

if (failures.length > 0) {
  console.error(`Load test failed: ${failures.join(', ')}.`);
  process.exit(1);
}

console.log('Load test passed.');
