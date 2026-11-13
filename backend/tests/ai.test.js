const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const app = require('../app');
const { checkAiServiceHealth } = require('../services/aiService');

let server;
let baseUrl;
let fastApiMockServer;
let fastApiMockUrl;

// Helper to make HTTP requests
const request = ({ method, path, headers = {} }) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Accept': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {
          json = data;
        }

        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: json,
        });
      });
    });

    req.on('error', reject);
    req.end();
  });
};

describe('CareerLens AI - Node.js to FastAPI Communication Layer', () => {
  before(async () => {
    // Start mock FastAPI server to test standard healthy communication
    fastApiMockServer = http.createServer((req, res) => {
      if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            status: 'healthy',
            service: 'CareerLens AI',
            message: 'AI service is running',
          })
        );
      } else {
        res.writeHead(404);
        res.end();
      }
    });
    await new Promise((resolve) => fastApiMockServer.listen(0, resolve));
    fastApiMockUrl = `http://127.0.0.1:${fastApiMockServer.address().port}`;

    // Start Express HTTP server on dynamic port
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  after(() => {
    if (server) server.close();
    if (fastApiMockServer) fastApiMockServer.close();
  });

  test('1. GET /api/ai/health returns 200 and healthy status when FastAPI is running', async () => {
    process.env.AI_SERVICE_URL = fastApiMockUrl;

    const res = await request({ method: 'GET', path: '/api/ai/health' });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.status, 'healthy');
    assert.ok(res.body.aiService);
    assert.equal(res.body.aiService.status, 'healthy');
    assert.equal(res.body.aiService.service, 'CareerLens AI');
    assert.equal(res.body.aiService.message, 'AI service is running');
  });

  test('2. GET /api/ai/health returns 503 when FastAPI service is unavailable', async () => {
    // Point AI_SERVICE_URL to an unused port to simulate unavailable service
    process.env.AI_SERVICE_URL = 'http://127.0.0.1:59998';

    const res = await request({ method: 'GET', path: '/api/ai/health' });

    assert.equal(res.statusCode, 503);
    assert.equal(res.body.success, false);
    assert.equal(res.body.status, 'unhealthy');
    assert.ok(res.body.message.includes('unavailable or unreachable'));

    // Restore standard mock URL
    process.env.AI_SERVICE_URL = fastApiMockUrl;
  });

  test('3. checkAiServiceHealth handles timeout via AbortController safely', async () => {
    // Start a mock hanging HTTP server that never responds
    const hangingServer = http.createServer((req, res) => {
      // Deliberately do nothing to trigger timeout
    });
    await new Promise((resolve) => hangingServer.listen(0, resolve));
    const hangingPort = hangingServer.address().port;

    const result = await checkAiServiceHealth({
      overrideUrl: `http://127.0.0.1:${hangingPort}`,
      timeoutMs: 150, // Short timeout for test
    });

    hangingServer.close();

    assert.equal(result.isHealthy, false);
    assert.equal(result.statusCode, 504);
    assert.ok(result.message.includes('timed out'));
  });

  test('4. checkAiServiceHealth handles upstream HTTP error (e.g. 500) safely', async () => {
    // Mock server returning HTTP 500
    const errorServer = http.createServer((req, res) => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ detail: 'Internal model error' }));
    });
    await new Promise((resolve) => errorServer.listen(0, resolve));
    const errorPort = errorServer.address().port;

    const result = await checkAiServiceHealth({
      overrideUrl: `http://127.0.0.1:${errorPort}`,
    });

    errorServer.close();

    assert.equal(result.isHealthy, false);
    assert.equal(result.statusCode, 502);
    assert.ok(result.message.includes('500'));
  });

  test('5. checkAiServiceHealth handles invalid JSON response safely', async () => {
    // Mock server returning malformed non-JSON
    const invalidJsonServer = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<html><body>Bad Gateway</body></html>');
    });
    await new Promise((resolve) => invalidJsonServer.listen(0, resolve));
    const invalidPort = invalidJsonServer.address().port;

    const result = await checkAiServiceHealth({
      overrideUrl: `http://127.0.0.1:${invalidPort}`,
    });

    invalidJsonServer.close();

    assert.equal(result.isHealthy, false);
    assert.equal(result.statusCode, 502);
    assert.ok(result.message.includes('Invalid JSON'));
  });
});
