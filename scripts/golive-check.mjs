#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { once } from 'node:events';

import {
  buildUrl,
  defaultBaseUrl,
  fetchWithTiming,
  getEnvBoolean,
  getEnvNumber,
  getEnvString,
} from './golive-utils.mjs';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const baseUrl = getEnvString('GOLIVE_BASE_URL', defaultBaseUrl);
const timeoutMs = getEnvNumber('GOLIVE_TIMEOUT_MS', 10_000);
const serverTimeoutMs = getEnvNumber('GOLIVE_SERVER_TIMEOUT_MS', 90_000);
const runCypress = getEnvBoolean('GOLIVE_CYPRESS', false);
const runLighthouse = getEnvBoolean('GOLIVE_LIGHTHOUSE', false);

let serverProcess;

const runCommand = async (label, command, args, options = {}) => {
  console.log('');
  console.log(`== ${label}`);

  const child = spawn(command, args, {
    cwd: process.cwd(),
    env: process.env,
    shell: false,
    stdio: 'inherit',
    ...options,
  });

  const [code] = await once(child, 'exit');

  if (code !== 0) {
    throw new Error(`${label} failed with exit code ${code}`);
  }
};

const waitForServer = async () => {
  const healthUrl = buildUrl(baseUrl, '/healthz');
  const deadline = Date.now() + serverTimeoutMs;

  while (Date.now() < deadline) {
    const result = await fetchWithTiming(healthUrl, timeoutMs);
    if (result.ok && result.status < 500) return;
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }

  throw new Error(`Server did not become ready at ${healthUrl}`);
};

const startServer = async () => {
  console.log('');
  console.log('== Start production server');

  serverProcess = spawn(npmCommand, ['run', 'start'], {
    cwd: process.cwd(),
    env: process.env,
    shell: false,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  serverProcess.stdout.on('data', (chunk) => process.stdout.write(`[server] ${chunk}`));
  serverProcess.stderr.on('data', (chunk) => process.stderr.write(`[server] ${chunk}`));

  serverProcess.once('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`Production server exited with code ${code}`);
    }
  });

  await waitForServer();
};

const stopServer = async () => {
  if (!serverProcess || serverProcess.killed) return;

  if (process.platform === 'win32') {
    spawn('taskkill', ['/pid', String(serverProcess.pid), '/t', '/f'], {
      stdio: 'ignore',
    });
  }

  serverProcess.kill();
  await Promise.race([once(serverProcess, 'exit'), new Promise((resolve) => setTimeout(resolve, 5_000))]);
};

try {
  await runCommand('Build', npmCommand, ['run', 'build']);
  await runCommand('Typecheck', npmCommand, ['run', 'typecheck']);
  await runCommand('Lint', npmCommand, ['run', 'lint']);
  await runCommand('Unit tests', npmCommand, ['test']);
  await startServer();
  await runCommand('Smoke test', 'node', ['./scripts/golive-smoke.mjs']);

  if (runCypress) {
    await runCommand('Cypress smoke', npmCommand, ['--prefix', 'apps/web', 'run', 'test:cypress']);
  }

  if (runLighthouse) {
    await runCommand('Lighthouse desktop', npmCommand, ['run', 'lhci:desktop']);
    await runCommand('Lighthouse mobile', npmCommand, ['run', 'lhci:mobile']);
  }

  console.log('');
  console.log('GoLive check passed.');
} catch (error) {
  console.error('');
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  await stopServer();
}
