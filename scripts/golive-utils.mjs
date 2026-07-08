import { performance } from 'node:perf_hooks';

export const defaultBaseUrl = 'http://localhost:3000';
export const defaultPaths = ['/', '/healthz', '/manifest.webmanifest', '/offline', '/cart', '/search'];

export const getEnvString = (name, fallback) => {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : fallback;
};

export const getEnvNumber = (name, fallback) => {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
};

export const getEnvBoolean = (name, fallback = false) => {
  const value = process.env[name];
  if (!value) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
};

export const parseList = (value, fallback) => {
  if (!value) return fallback;

  const items = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return items.length > 0 ? items : fallback;
};

export const buildUrl = (baseUrl, path) => {
  if (/^https?:\/\//i.test(path)) return path;

  const normalizedBase = baseUrl.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${normalizedBase}${normalizedPath}`;
};

export const fetchWithTiming = async (url, timeoutMs) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = performance.now();

  try {
    const response = await fetch(url, {
      headers: {
        'cache-control': 'no-cache',
        pragma: 'no-cache',
        'user-agent': 'plentyshop-golive-check/1.0',
      },
      redirect: 'follow',
      signal: controller.signal,
    });

    await response.arrayBuffer();

    return {
      ok: true,
      status: response.status,
      durationMs: performance.now() - startedAt,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      durationMs: performance.now() - startedAt,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timeout);
  }
};

export const percentile = (values, percentileValue) => {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentileValue / 100) * sorted.length) - 1;

  return sorted[Math.max(0, Math.min(sorted.length - 1, index))];
};

export const formatMs = (value) => `${Math.round(value)}ms`;
