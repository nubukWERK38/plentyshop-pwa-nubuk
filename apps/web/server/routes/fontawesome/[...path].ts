import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { createError, eventHandler, getRouterParam, setHeader } from 'h3';

const packagePath = '@fortawesome/fontawesome-free';
const contentTypes: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.svg': 'image/svg+xml',
};

const getFontawesomeBasePath = () => {
  const candidates = [
    resolve(process.cwd(), 'node_modules', packagePath),
    resolve(process.cwd(), '..', '..', 'node_modules', packagePath),
  ];
  return candidates.find((candidate) => existsSync(candidate));
};

export default eventHandler(async (event) => {
  const requestedPath = getRouterParam(event, 'path') || '';
  const normalizedPath = requestedPath.replace(/\\/g, '/');

  if (!normalizedPath || normalizedPath.split('/').includes('..')) {
    throw createError({ statusCode: 404 });
  }

  const basePath = getFontawesomeBasePath();
  if (!basePath) {
    throw createError({ statusCode: 404 });
  }

  const filePath = resolve(basePath, normalizedPath);
  if (!filePath.startsWith(basePath)) {
    throw createError({ statusCode: 404 });
  }

  const extension = extname(filePath).toLowerCase();
  setHeader(event, 'content-type', contentTypes[extension] || 'application/octet-stream');
  setHeader(event, 'cache-control', 'public, max-age=31536000, immutable');

  try {
    return await readFile(filePath);
  } catch {
    throw createError({ statusCode: 404 });
  }
});
