import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  root: fileURLToPath(new URL('./app', import.meta.url)),
  test: {
    environment: 'happy-dom',
    globals: true,
    clearMocks: true,
    include: ['utils/__tests__/openAiTracking.spec.ts', 'utils/__tests__/gtmTracking.spec.ts'],
  },
});
