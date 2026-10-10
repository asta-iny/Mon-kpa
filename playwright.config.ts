import { defineConfig, devices } from '@playwright/test';

function isPortFree(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    import net from 'node:net';
    const server = net.createServer();
    server.once('error', () => {
      server.close(() => resolve(false));
    });
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    server.listen(port, '127.0.0.1');
  });
}

async function findFreePort(startPort: number, maxAttempts = 20): Promise<number> {
  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i;
    if (await isPortFree(port)) {
      return port;
    }
  }
  return startPort;
}

async function getPreferredPort(envVar: string | undefined, defaultPort: number): Promise<number> {
  if (envVar) {
    const p = Number(envVar);
    if (Number.isInteger(p) && p > 0) {
      return p;
    }
  }
  if (await isPortFree(defaultPort)) {
    return defaultPort;
  }
  return findFreePort(defaultPort + 1);
}

const apiPort = await getPreferredPort(process.env.API_PORT, 3001);
const webPort = await getPreferredPort(process.env.WEB_PORT, 5173);

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${webPort}`,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: `npm run dev:api`,
      url: `http://127.0.0.1:${apiPort}/api/v1/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        ...process.env,
        APP_ENV: process.env.APP_ENV ?? 'test',
        NODE_ENV: process.env.NODE_ENV ?? 'test',
        PORT: String(apiPort),
      },
    },
    {
      command: `npm run dev:web`,
      url: `http://127.0.0.1:${webPort}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        ...process.env,
        VITE_PORT: String(webPort),
        PORT: String(webPort),
      },
    },
  ],
});
