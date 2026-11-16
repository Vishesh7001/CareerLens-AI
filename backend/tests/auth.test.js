const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const User = require('../models/User');
const { authLimiter } = require('../middleware/rateLimitMiddleware');

let mongoServer;
let server;
let baseUrl;

// Helper to make HTTP requests
const request = ({ method, path, headers = {}, body = null }) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
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
          cookies: res.headers['set-cookie'] || [],
          body: json,
        });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

describe('CareerLens AI - Backend Authentication & Integration Suite', () => {
  before(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test_secret_key_minimum_32_characters_for_security';
    process.env.JWT_EXPIRES_IN = '1d';

    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    // Start HTTP server on dynamic port
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  after(async () => {
    await mongoose.connection.close();
    if (mongoServer) await mongoServer.stop();
    if (server) server.close();
  });

  test('1 & 4. Health Check Endpoint works', async () => {
    const res = await request({ method: 'GET', path: '/health' });
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.status, 'healthy');
    assert.equal(res.body.service, 'CareerLens AI Backend');

    const apiRes = await request({ method: 'GET', path: '/api/health' });
    assert.equal(apiRes.statusCode, 200);
    assert.equal(apiRes.body.status, 'healthy');
  });

  test('Validation: Invalid email format is rejected with 400', async () => {
    const res = await request({
      method: 'POST',
      path: '/api/auth/register',
      body: {
        fullName: 'Test User',
        email: 'invalid-email-format',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      },
    });

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.ok(res.body.message.includes('valid email'));
  });

  test('Validation: Short password is rejected with 400', async () => {
    const res = await request({
      method: 'POST',
      path: '/api/auth/register',
      body: {
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'short',
        confirmPassword: 'short',
      },
    });

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.ok(res.body.message.includes('at least 8 characters'));
  });

  test('Validation: Password mismatch is rejected with 400', async () => {
    const res = await request({
      method: 'POST',
      path: '/api/auth/register',
      body: {
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'MismatchPassword123!',
      },
    });

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.ok(res.body.message.includes('do not match'));
  });

  test('5 & 7. User can register successfully, receives cookie, password is encrypted', async () => {
    const res = await request({
      method: 'POST',
      path: '/api/auth/register',
      body: {
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      },
    });

    assert.equal(res.statusCode, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.user.fullName, 'Jane Doe');
    assert.equal(res.body.user.email, 'jane@example.com');
    assert.ok(res.body.token);

    // Verify HTTP-only cookie was set
    const setCookie = res.cookies;
    assert.ok(setCookie.some((c) => c.includes('token=') && c.includes('HttpOnly')));

    // Verify in database: password must NOT be plain text
    const dbUser = await User.findOne({ email: 'jane@example.com' }).select('+password');
    assert.ok(dbUser);
    assert.notEqual(dbUser.password, 'Password123!');
    assert.ok(dbUser.password.startsWith('$2')); // bcrypt hash signature
  });

  test('6. Duplicate email registration is rejected with 409 Conflict', async () => {
    const res = await request({
      method: 'POST',
      path: '/api/auth/register',
      body: {
        fullName: 'Jane Duplicate',
        email: 'jane@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      },
    });

    assert.equal(res.statusCode, 409);
    assert.equal(res.body.success, false);
    assert.ok(res.body.message.includes('already exists'));
  });

  test('8. User can log in successfully and receive auth cookie', async () => {
    const res = await request({
      method: 'POST',
      path: '/api/auth/login',
      body: {
        email: 'jane@example.com',
        password: 'Password123!',
        rememberMe: true,
      },
    });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.user.fullName, 'Jane Doe');
    assert.ok(res.body.token);

    // Verify cookie set
    assert.ok(res.cookies.some((c) => c.includes('token=') && c.includes('HttpOnly')));
  });

  test('9. Incorrect password is rejected with 401', async () => {
    const res = await request({
      method: 'POST',
      path: '/api/auth/login',
      body: {
        email: 'jane@example.com',
        password: 'WrongPassword!',
      },
    });

    assert.equal(res.statusCode, 401);
    assert.equal(res.body.success, false);
    assert.equal(res.body.message, 'Invalid email or password.');
  });

  test('10. Protected routes reject unauthenticated requests with 401', async () => {
    const res = await request({
      method: 'GET',
      path: '/api/auth/me',
    });

    assert.equal(res.statusCode, 401);
    assert.equal(res.body.success, false);
  });

  test('11, 12 & 15. Authenticated session check via cookie and Bearer header works', async () => {
    // 1. Log in to get cookie
    const loginRes = await request({
      method: 'POST',
      path: '/api/auth/login',
      body: {
        email: 'jane@example.com',
        password: 'Password123!',
      },
    });

    const cookieHeader = loginRes.cookies[0].split(';')[0]; // e.g. token=xyz

    // 2. Call GET /api/auth/me with Cookie header
    const meRes = await request({
      method: 'GET',
      path: '/api/auth/me',
      headers: {
        Cookie: cookieHeader,
      },
    });

    assert.equal(meRes.statusCode, 200);
    assert.equal(meRes.body.success, true);
    assert.equal(meRes.body.user.email, 'jane@example.com');
    assert.equal(meRes.body.user.fullName, 'Jane Doe');

    // 3. Call GET /api/users/profile with Bearer token
    const profileRes = await request({
      method: 'GET',
      path: '/api/users/profile',
      headers: {
        Authorization: `Bearer ${loginRes.body.token}`,
      },
    });

    assert.equal(profileRes.statusCode, 200);
    assert.equal(profileRes.body.success, true);
    assert.equal(profileRes.body.user.fullName, 'Jane Doe');
  });

  test('13. User can update their full name, but cannot change email', async () => {
    const loginRes = await request({
      method: 'POST',
      path: '/api/auth/login',
      body: {
        email: 'jane@example.com',
        password: 'Password123!',
      },
    });
    const cookieHeader = loginRes.cookies[0].split(';')[0];

    // Attempt to update name
    const updateRes = await request({
      method: 'PUT',
      path: '/api/users/profile',
      headers: {
        Cookie: cookieHeader,
      },
      body: {
        fullName: 'Jane Specialist Doe',
      },
    });

    assert.equal(updateRes.statusCode, 200);
    assert.equal(updateRes.body.success, true);
    assert.equal(updateRes.body.user.fullName, 'Jane Specialist Doe');

    // Attempt to change email address (must be rejected)
    const emailChangeRes = await request({
      method: 'PUT',
      path: '/api/users/profile',
      headers: {
        Cookie: cookieHeader,
      },
      body: {
        fullName: 'Jane Specialist Doe',
        email: 'newemail@example.com',
      },
    });

    assert.equal(emailChangeRes.statusCode, 400);
    assert.equal(emailChangeRes.body.success, false);
    assert.ok(emailChangeRes.body.message.includes('cannot be changed in this phase'));
  });

  test('14. Logout clears the HTTP-only cookie', async () => {
    const res = await request({
      method: 'POST',
      path: '/api/auth/logout',
    });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);

    // Verify clear cookie instruction
    const setCookie = res.cookies;
    assert.ok(
      setCookie.some(
        (c) =>
          c.includes('token=;') ||
          c.includes('token=') && (c.includes('Expires=Thu, 01 Jan 1970') || c.includes('Max-Age=0'))
      )
    );
  });

  test('16. Expired JWT sessions are handled gracefully with 401', async () => {
    // Generate an expired token
    const dbUser = await User.findOne({ email: 'jane@example.com' });
    const expiredToken = jwt.sign({ id: dbUser._id }, process.env.JWT_SECRET, { expiresIn: '0s' });

    const res = await request({
      method: 'GET',
      path: '/api/auth/me',
      headers: {
        Authorization: `Bearer ${expiredToken}`,
      },
    });

    assert.equal(res.statusCode, 401);
    assert.equal(res.body.success, false);
    assert.ok(res.body.message.toLowerCase().includes('expired'));
  });

  // =========================================================================
  // ADDITIONAL AUTOMATED TESTS FOR ENHANCED QA COVERAGE
  // =========================================================================

  test('Scenario 1: Invalid JWT token should return HTTP 401', async () => {
    // Test 1a: Malformed token string
    const malformedRes = await request({
      method: 'GET',
      path: '/api/auth/me',
      headers: {
        Authorization: 'Bearer invalid.malformed.token',
      },
    });
    assert.equal(malformedRes.statusCode, 401);
    assert.equal(malformedRes.body.success, false);
    assert.ok(malformedRes.body.message.toLowerCase().includes('invalid'));

    // Test 1b: Token signed with incorrect secret
    const dbUser = await User.findOne({ email: 'jane@example.com' });
    const wrongSecretToken = jwt.sign({ id: dbUser._id }, 'completely_wrong_secret_key_12345');
    const wrongSecretRes = await request({
      method: 'GET',
      path: '/api/users/profile',
      headers: {
        Authorization: `Bearer ${wrongSecretToken}`,
      },
    });
    assert.equal(wrongSecretRes.statusCode, 401);
    assert.equal(wrongSecretRes.body.success, false);
    assert.ok(wrongSecretRes.body.message.toLowerCase().includes('invalid'));

    // Test 1c: Malformed token sent via cookie
    const malformedCookieRes = await request({
      method: 'GET',
      path: '/api/auth/me',
      headers: {
        Cookie: 'token=tampered_invalid_cookie_value',
      },
    });
    assert.equal(malformedCookieRes.statusCode, 401);
    assert.equal(malformedCookieRes.body.success, false);
  });

  test('Scenario 2: Expired JWT token should continue returning HTTP 401 on profile endpoint', async () => {
    const dbUser = await User.findOne({ email: 'jane@example.com' });
    const expiredToken = jwt.sign({ id: dbUser._id }, process.env.JWT_SECRET, { expiresIn: '-1s' });

    // Verify expired token against GET /api/users/profile
    const resGet = await request({
      method: 'GET',
      path: '/api/users/profile',
      headers: {
        Authorization: `Bearer ${expiredToken}`,
      },
    });
    assert.equal(resGet.statusCode, 401);
    assert.equal(resGet.body.success, false);
    assert.ok(resGet.body.message.toLowerCase().includes('expired'));

    // Verify expired token against PUT /api/users/profile
    const resPut = await request({
      method: 'PUT',
      path: '/api/users/profile',
      headers: {
        Authorization: `Bearer ${expiredToken}`,
      },
      body: {
        fullName: 'New Name',
      },
    });
    assert.equal(resPut.statusCode, 401);
    assert.equal(resPut.body.success, false);
    assert.ok(resPut.body.message.toLowerCase().includes('expired'));
  });

  test('Scenario 3: Accessing /api/users/profile without authentication should return HTTP 401', async () => {
    // 3a. GET /api/users/profile with no token or cookie
    const getRes = await request({
      method: 'GET',
      path: '/api/users/profile',
    });
    assert.equal(getRes.statusCode, 401);
    assert.equal(getRes.body.success, false);
    assert.ok(getRes.body.message.toLowerCase().includes('not authorized'));

    // 3b. PUT /api/users/profile with no token or cookie
    const putRes = await request({
      method: 'PUT',
      path: '/api/users/profile',
      body: {
        fullName: 'Unauthorized Update',
      },
    });
    assert.equal(putRes.statusCode, 401);
    assert.equal(putRes.body.success, false);
    assert.ok(putRes.body.message.toLowerCase().includes('not authorized'));
  });

  test('Scenario 4: Accessing /api/auth/me with a token belonging to a non-existent user should return HTTP 401', async () => {
    // Generate validly signed JWT for an ObjectId that does not exist in the database
    const nonExistentUserId = new mongoose.Types.ObjectId();
    const token = jwt.sign({ id: nonExistentUserId }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const res = await request({
      method: 'GET',
      path: '/api/auth/me',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    assert.equal(res.statusCode, 401);
    assert.equal(res.body.success, false);
    assert.ok(res.body.message.includes('no longer exists'));
  });

  test('Scenario 5: API responses must never expose the user\'s hashed or plain-text password', async () => {
    const rawPassword = 'SecretP@ssw0rd999!';
    const userEmail = 'security_test@example.com';

    // 1. Registration endpoint response
    const regRes = await request({
      method: 'POST',
      path: '/api/auth/register',
      body: {
        fullName: 'Security Auditor',
        email: userEmail,
        password: rawPassword,
        confirmPassword: rawPassword,
      },
    });
    assert.equal(regRes.statusCode, 201);
    assert.equal(regRes.body.user.password, undefined);
    assert.equal('password' in regRes.body.user, false);
    assert.equal(JSON.stringify(regRes.body).includes(rawPassword), false);
    assert.equal(JSON.stringify(regRes.body).includes('$2'), false);

    // 2. Login endpoint response
    const loginRes = await request({
      method: 'POST',
      path: '/api/auth/login',
      body: {
        email: userEmail,
        password: rawPassword,
      },
    });
    assert.equal(loginRes.statusCode, 200);
    assert.equal(loginRes.body.user.password, undefined);
    assert.equal('password' in loginRes.body.user, false);
    assert.equal(JSON.stringify(loginRes.body).includes(rawPassword), false);
    assert.equal(JSON.stringify(loginRes.body).includes('$2'), false);

    const token = loginRes.body.token;

    // 3. /api/auth/me endpoint response
    const meRes = await request({
      method: 'GET',
      path: '/api/auth/me',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    assert.equal(meRes.statusCode, 200);
    assert.equal(meRes.body.user.password, undefined);
    assert.equal('password' in meRes.body.user, false);
    assert.equal(JSON.stringify(meRes.body).includes(rawPassword), false);
    assert.equal(JSON.stringify(meRes.body).includes('$2'), false);

    // 4. /api/users/profile GET response
    const getProfileRes = await request({
      method: 'GET',
      path: '/api/users/profile',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    assert.equal(getProfileRes.statusCode, 200);
    assert.equal(getProfileRes.body.user.password, undefined);
    assert.equal('password' in getProfileRes.body.user, false);
    assert.equal(JSON.stringify(getProfileRes.body).includes(rawPassword), false);
    assert.equal(JSON.stringify(getProfileRes.body).includes('$2'), false);

    // 5. /api/users/profile PUT response
    const putProfileRes = await request({
      method: 'PUT',
      path: '/api/users/profile',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        fullName: 'Security Auditor Updated',
      },
    });
    assert.equal(putProfileRes.statusCode, 200);
    assert.equal(putProfileRes.body.user.password, undefined);
    assert.equal('password' in putProfileRes.body.user, false);
    assert.equal(JSON.stringify(putProfileRes.body).includes(rawPassword), false);
    assert.equal(JSON.stringify(putProfileRes.body).includes('$2'), false);
  });

  test('Scenario 6: Profile update with invalid fullName types (number, object, null) should be rejected safely', async () => {
    // Authenticate user
    const loginRes = await request({
      method: 'POST',
      path: '/api/auth/login',
      body: {
        email: 'jane@example.com',
        password: 'Password123!',
      },
    });
    const token = loginRes.body.token;

    // Get original fullName before test
    const initialUser = await User.findOne({ email: 'jane@example.com' });
    const originalName = initialUser.fullName;

    // 6a. fullName as null
    const resNull = await request({
      method: 'PUT',
      path: '/api/users/profile',
      headers: { Authorization: `Bearer ${token}` },
      body: { fullName: null },
    });
    assert.equal(resNull.statusCode, 400);
    assert.equal(resNull.body.success, false);

    // 6b. fullName as number (12345)
    const resNum = await request({
      method: 'PUT',
      path: '/api/users/profile',
      headers: { Authorization: `Bearer ${token}` },
      body: { fullName: 12345 },
    });
    assert.ok(resNum.statusCode >= 400, 'Number fullName must be rejected with error status');
    assert.equal(resNum.body.success, false);

    // 6c. fullName as object ({ nested: 'name' })
    const resObj = await request({
      method: 'PUT',
      path: '/api/users/profile',
      headers: { Authorization: `Bearer ${token}` },
      body: { fullName: { nested: 'name' } },
    });
    assert.ok(resObj.statusCode >= 400, 'Object fullName must be rejected with error status');
    assert.equal(resObj.body.success, false);

    // Verify database record was never corrupted
    const finalUser = await User.findOne({ email: 'jane@example.com' });
    assert.equal(finalUser.fullName, originalName);

    // Verify server remains alive and handles healthy requests
    const healthyCheck = await request({ method: 'GET', path: '/health' });
    assert.equal(healthyCheck.statusCode, 200);
    assert.equal(healthyCheck.body.status, 'healthy');
  });

  test('Scenario 7: Verify that rate limiting works and returns HTTP 429 after configured limit is exceeded', async () => {
    try {
      // Temporarily switch NODE_ENV to development so authLimiter evaluates skip(req) -> false
      process.env.NODE_ENV = 'development';

      // Reset any previous hits for localhost IPs
      authLimiter.resetKey('127.0.0.1');
      authLimiter.resetKey('::1');
      authLimiter.resetKey('::ffff:127.0.0.1');

      let hit429Response = null;

      // The configured limit is 100 requests per 15 minutes.
      // Send 101 requests to exceed the limit.
      for (let i = 0; i < 101; i++) {
        const res = await request({
          method: 'POST',
          path: '/api/auth/login',
          body: {
            email: 'rate_test@example.com',
            password: 'InvalidPassword!',
          },
        });

        if (res.statusCode === 429) {
          hit429Response = res;
          break;
        }
      }

      assert.ok(hit429Response, 'Should have received an HTTP 429 response after exceeding rate limit');
      assert.equal(hit429Response.statusCode, 429);
      assert.equal(hit429Response.body.success, false);
      assert.ok(
        hit429Response.body.message.includes('Too many authentication attempts'),
        'Rate limit error message should match configured message'
      );
    } finally {
      // Clean up rate-limit state and restore test environment
      authLimiter.resetKey('127.0.0.1');
      authLimiter.resetKey('::1');
      authLimiter.resetKey('::ffff:127.0.0.1');
      process.env.NODE_ENV = 'test';
    }
  });

  test('Scenario 8: Verify that logout returns the correct cookie-clearing instructions', async () => {
    const res = await request({
      method: 'POST',
      path: '/api/auth/logout',
    });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.message, 'Logged out successfully.');

    // Verify Set-Cookie header explicitly instructs browser to clear token cookie
    const setCookieHeaders = res.cookies;
    assert.ok(setCookieHeaders && setCookieHeaders.length > 0, 'Set-Cookie header must be present');

    const tokenCookieHeader = setCookieHeaders.find((header) => header.startsWith('token='));
    assert.ok(tokenCookieHeader, 'Set-Cookie header for "token" must be returned');

    // Check HttpOnly flag
    assert.ok(
      tokenCookieHeader.includes('HttpOnly'),
      'Cookie-clearing instruction must retain HttpOnly flag'
    );

    // Check Path=/
    assert.ok(
      tokenCookieHeader.includes('Path=/'),
      'Cookie-clearing instruction must specify Path=/'
    );

    // Check that cookie value is cleared (empty) or expired in the past
    const isCleared =
      tokenCookieHeader.includes('token=;') ||
      tokenCookieHeader.includes('token= ;') ||
      tokenCookieHeader.includes('Expires=Thu, 01 Jan 1970 00:00:00 GMT') ||
      tokenCookieHeader.includes('Max-Age=0');

    assert.ok(isCleared, 'Cookie-clearing instruction must expire or clear the cookie value');
  });

  test('Scenario 9: CORS headers are properly returned for allowed origins and credentials on auth requests and errors', async () => {
    // 9a. Preflight OPTIONS to /api/auth/login
    const preflightRes = await request({
      method: 'OPTIONS',
      path: '/api/auth/login',
      headers: {
        Origin: 'http://localhost:5173',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type',
      },
    });
    assert.equal(preflightRes.statusCode, 204);
    assert.equal(preflightRes.headers['access-control-allow-origin'], 'http://localhost:5173');
    assert.equal(preflightRes.headers['access-control-allow-credentials'], 'true');
    assert.ok(preflightRes.headers['access-control-allow-methods'].includes('POST'));
    assert.ok(preflightRes.headers['access-control-allow-methods'].includes('PATCH'));

    // 9b. Auth error (401 unauthenticated /api/users/profile) retains CORS headers
    const unauthRes = await request({
      method: 'GET',
      path: '/api/users/profile',
      headers: {
        Origin: 'http://localhost:5173',
      },
    });
    assert.equal(unauthRes.statusCode, 401);
    assert.equal(unauthRes.headers['access-control-allow-origin'], 'http://localhost:5173');
    assert.equal(unauthRes.headers['access-control-allow-credentials'], 'true');

    // 9c. Disallowed origin does not receive allow-origin
    const badOriginRes = await request({
      method: 'OPTIONS',
      path: '/api/auth/login',
      headers: {
        Origin: 'http://evil-tracker.example.com',
        'Access-Control-Request-Method': 'POST',
      },
    });
    assert.notEqual(badOriginRes.headers['access-control-allow-origin'], 'http://evil-tracker.example.com');
  });
});
