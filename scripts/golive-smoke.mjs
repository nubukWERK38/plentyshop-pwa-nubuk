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
} from './golive-utils.mjs';

const baseUrl = getEnvString('GOLIVE_BASE_URL', defaultBaseUrl);
const paths = parseList(process.env.GOLIVE_PATHS, defaultPaths);
const timeoutMs = getEnvNumber('GOLIVE_TIMEOUT_MS', 10_000);
const maxStatus = getEnvNumber('GOLIVE_MAX_STATUS', 399);

const results = [];

console.log(`Smoke test: ${baseUrl}`);
console.log(`Paths: ${paths.join(', ')}`);

for (const path of paths) {
  const url = buildUrl(baseUrl, path);
  const result = await fetchWithTiming(url, timeoutMs);
  const isStatusFailure = !result.ok || result.status > maxStatus || result.status >= 500;
  const marker = isStatusFailure ? 'FAIL' : 'OK';

  results.push({
    ...result,
    path,
    url,
    failed: isStatusFailure,
  });

  console.log(`${marker} ${result.status || 'ERR'} ${formatMs(result.durationMs)} ${path}`);
  if (result.error) console.log(`  ${result.error}`);
}

const failed = results.filter((result) => result.failed);

if (failed.length > 0) {
  console.error(`Smoke test failed: ${failed.length}/${results.length} request(s) failed.`);
  process.exit(1);
}

console.log(`Smoke test passed: ${results.length}/${results.length} request(s) OK.`);
