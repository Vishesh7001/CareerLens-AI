const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const User = require('../models/User');
const Resume = require('../models/Resume');
const { generateToken } = require('../services/tokenService');
const { createSimplePdf, createBlankPdf } = require('./helpers/pdfHelper');
const { extractPhoneNumber, parseResumeText } = require('../services/resumeParserService');

describe('CareerLens AI - Phase 2 Resume Upload & Parsing Suite', () => {
  let mongoServer;
  let server;
  let baseUrl;
  let user1;
  let token1;
  let user2;
  let token2;
  const testStorageDir = path.join(__dirname, '../uploads/test-resumes');

  before(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test_secret_key_minimum_32_characters_for_security';
    process.env.JWT_EXPIRES_IN = '1d';
    process.env.RESUME_STORAGE_PATH = testStorageDir;

    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    // Start dynamic test HTTP server
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  after(async () => {
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    // Clean up test storage directory
    if (fs.existsSync(testStorageDir)) {
      fs.rmSync(testStorageDir, { recursive: true, force: true });
    }
  });

  beforeEach(async () => {
    // Clear collections
    await User.deleteMany({});
    await Resume.deleteMany({});

    // Create primary test user
    user1 = await User.create({
      fullName: 'Alex Candidate',
      email: 'alex.candidate@example.com',
      password: 'Password123!',
    });
    token1 = generateToken(user1._id);

    // Create second test user for cross-user isolation tests
    user2 = await User.create({
      fullName: 'Jordan Candidate',
      email: 'jordan.candidate@example.com',
      password: 'Password123!',
    });
    token2 = generateToken(user2._id);
  });

  // Scenario 1: Unauthenticated requests
  it('1. Rejects unauthenticated POST /api/resumes/upload with 401', async () => {
    const res = await fetch(`${baseUrl}/api/resumes/upload`, {
      method: 'POST',
    });
    const data = await res.json();
    assert.strictEqual(res.status, 401);
    assert.strictEqual(data.success, false);
  });

  it('2. Rejects unauthenticated GET /api/resumes with 401', async () => {
    const res = await fetch(`${baseUrl}/api/resumes`, {
      method: 'GET',
    });
    const data = await res.json();
    assert.strictEqual(res.status, 401);
    assert.strictEqual(data.success, false);
  });

  it('3. Rejects unauthenticated GET /api/resumes/download with 401', async () => {
    const res = await fetch(`${baseUrl}/api/resumes/download`, {
      method: 'GET',
    });
    const data = await res.json();
    assert.strictEqual(res.status, 401);
    assert.strictEqual(data.success, false);
  });

  it('4. Rejects unauthenticated DELETE /api/resumes with 401', async () => {
    const res = await fetch(`${baseUrl}/api/resumes`, {
      method: 'DELETE',
    });
    const data = await res.json();
    assert.strictEqual(res.status, 401);
    assert.strictEqual(data.success, false);
  });

  // Scenario 2: Validation of upload inputs
  it('5. Rejects upload when no file is attached with 400', async () => {
    const formData = new FormData();
    const res = await fetch(`${baseUrl}/api/resumes/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token1}`,
      },
      body: formData,
    });
    const data = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(data.success, false);
  });

  it('6. Rejects non-PDF files (.txt or text/plain) with 400', async () => {
    const formData = new FormData();
    formData.append(
      'resume',
      new Blob(['Plain text resume content here.'], { type: 'text/plain' }),
      'resume.txt'
    );

    const res = await fetch(`${baseUrl}/api/resumes/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token1}`,
      },
      body: formData,
    });
    const data = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(data.success, false);
    assert.match(data.message, /only pdf documents/i);
  });

  it('7. Rejects files with .pdf extension but invalid/corrupted magic bytes with 400', async () => {
    const fakePdfBytes = Buffer.from('FAKE-NON-PDF-DATA-HERE-NO-MAGIC-BYTES');
    const formData = new FormData();
    formData.append(
      'resume',
      new Blob([fakePdfBytes], { type: 'application/pdf' }),
      'fake.pdf'
    );

    const res = await fetch(`${baseUrl}/api/resumes/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token1}`,
      },
      body: formData,
    });
    const data = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(data.success, false);
    assert.match(data.message, /valid pdf signature|invalid file format/i);
  });

  it('8. Rejects PDF with no extractable text with 400', async () => {
    const blankPdf = createBlankPdf();
    const formData = new FormData();
    formData.append(
      'resume',
      new Blob([blankPdf], { type: 'application/pdf' }),
      'blank.pdf'
    );

    const res = await fetch(`${baseUrl}/api/resumes/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token1}`,
      },
      body: formData,
    });
    const data = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(data.success, false);
    assert.match(data.message, /no extractable text/i);
  });

  // Scenario 3: Successful upload, text extraction, and rule-based parsing
  it('9. Successfully uploads valid PDF, extracts text, and parses structured fields (201)', async () => {
    const pdfBuffer = createSimplePdf([
      'Sarah Connor',
      'sarah.connor@example.com | +1 555 432 1098 | Los Angeles, CA',
      'LinkedIn: https://linkedin.com/in/sarahconnor | GitHub: https://github.com/sarahconnor',
      'EDUCATION: University of California - Bachelor of Science in Computer Science - 2021 - GPA: 3.9',
      'SKILLS: JavaScript, TypeScript, React, Node.js, Express, MongoDB, PostgreSQL, Docker, AWS, Git',
      'EXPERIENCE: Senior Software Engineer at Cyberdyne (2021 - Present) - Developed mission critical apps',
      'PROJECTS: Autonomous Sentinel - React, Node.js, MongoDB - https://github.com/sarahconnor/sentinel',
      'CERTIFICATIONS: AWS Certified Solutions Architect - Amazon Web Services - 2022',
    ]);

    const formData = new FormData();
    formData.append(
      'resume',
      new Blob([pdfBuffer], { type: 'application/pdf' }),
      'Sarah_Connor_Resume.pdf'
    );

    const res = await fetch(`${baseUrl}/api/resumes/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token1}`,
      },
      body: formData,
    });

    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.success, true);
    assert.ok(data.resume);

    // Verify metadata
    assert.strictEqual(data.resume.user.toString(), user1._id.toString());
    assert.match(data.resume.originalFileName, /Sarah_Connor_Resume\.pdf/);
    assert.strictEqual(data.resume.mimeType, 'application/pdf');
    assert.strictEqual(data.resume.parsingStatus, 'completed');
    assert.strictEqual(data.resume.parsingError, null);

    // Verify parsed personal info
    const pi = data.resume.parsedData.personalInfo;
    assert.strictEqual(pi.fullName, 'Sarah Connor');
    assert.strictEqual(pi.email, 'sarah.connor@example.com');
    assert.strictEqual(pi.phone, '+1 555 432 1098');
    assert.strictEqual(pi.location, 'Los Angeles, CA');
    assert.strictEqual(pi.linkedin, 'https://linkedin.com/in/sarahconnor');
    assert.strictEqual(pi.github, 'https://github.com/sarahconnor');

    // Verify parsed skills
    const skills = data.resume.parsedData.skills;
    assert.ok(skills.programmingLanguages.includes('JavaScript'));
    assert.ok(skills.programmingLanguages.includes('TypeScript'));
    assert.ok(skills.frameworks.includes('React'));
    assert.ok(skills.frameworks.includes('Node.js'));
    assert.ok(skills.databases.includes('MongoDB'));
    assert.ok(skills.tools.includes('Docker'));
    assert.ok(skills.tools.includes('AWS'));

    // Verify parsed education
    const edu = data.resume.parsedData.education;
    assert.ok(edu.length > 0);
    assert.strictEqual(edu[0].institution, 'University of California');
    assert.strictEqual(edu[0].graduationYear, '2021');
    assert.strictEqual(edu[0].grade, '3.9');

    // Verify parsed experience
    const exp = data.resume.parsedData.experience;
    assert.ok(exp.length > 0);
    assert.strictEqual(exp[0].position, 'Senior Software Engineer');
    assert.strictEqual(exp[0].company, 'Cyberdyne');

    // Verify parsed projects
    const proj = data.resume.parsedData.projects;
    assert.ok(proj.length > 0);
    assert.strictEqual(proj[0].title, 'Autonomous Sentinel');
    assert.strictEqual(proj[0].link, 'https://github.com/sarahconnor/sentinel');

    // Verify parsed certifications
    const certs = data.resume.parsedData.certifications;
    assert.ok(certs.length > 0);
    assert.strictEqual(certs[0].issuer, 'AWS');
    assert.strictEqual(certs[0].date, '2022');
  });

  // Scenario 4: Get resume for authenticated user
  it('10. GET /api/resumes returns null when user has not uploaded a resume', async () => {
    const res = await fetch(`${baseUrl}/api/resumes`, {
      headers: {
        Authorization: `Bearer ${token1}`,
      },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.resume, null);
  });

  it('11. GET /api/resumes returns active resume details after upload', async () => {
    // First upload
    const pdfBuffer = createSimplePdf([
      'John Architect',
      'john.architect@example.com | +1 555 111 2222',
      'SKILLS: Python, FastAPI, Docker, Kubernetes',
    ]);
    const formData = new FormData();
    formData.append(
      'resume',
      new Blob([pdfBuffer], { type: 'application/pdf' }),
      'resume.pdf'
    );

    const uploadRes = await fetch(`${baseUrl}/api/resumes/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token1}` },
      body: formData,
    });
    assert.strictEqual(uploadRes.status, 201);

    // Now retrieve
    const res = await fetch(`${baseUrl}/api/resumes`, {
      headers: { Authorization: `Bearer ${token1}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.resume);
    assert.strictEqual(data.resume.parsedData.personalInfo.fullName, 'John Architect');
  });

  // Scenario 5: Secure PDF download
  it('12. GET /api/resumes/download returns original PDF binary with appropriate headers', async () => {
    const pdfBuffer = createSimplePdf([
      'Download Candidate',
      'download@example.com',
      'SKILLS: React, Node.js',
    ]);
    const formData = new FormData();
    formData.append(
      'resume',
      new Blob([pdfBuffer], { type: 'application/pdf' }),
      'my_custom_resume.pdf'
    );

    const uploadRes = await fetch(`${baseUrl}/api/resumes/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token1}` },
      body: formData,
    });
    assert.strictEqual(uploadRes.status, 201);

    const res = await fetch(`${baseUrl}/api/resumes/download`, {
      headers: { Authorization: `Bearer ${token1}` },
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers.get('content-type'), 'application/pdf');
    assert.match(
      res.headers.get('content-disposition') || '',
      /attachment; filename="my_custom_resume\.pdf"/
    );

    const downloadedBytes = Buffer.from(await res.arrayBuffer());
    assert.strictEqual(downloadedBytes.slice(0, 5).toString('ascii'), '%PDF-');
    assert.strictEqual(res.headers.get('x-content-type-options'), 'nosniff');
  });

  it('12a. Rejects download with 403 when filePath attempts directory traversal', async () => {
    // Upload a valid resume first
    const pdfBuffer = createSimplePdf(['Candidate', 'c@example.com']);
    const formData = new FormData();
    formData.append('resume', new Blob([pdfBuffer], { type: 'application/pdf' }), 'valid.pdf');

    await fetch(`${baseUrl}/api/resumes/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token1}` },
      body: formData,
    });

    // Simulate tampering of filePath in DB with path traversal
    await Resume.updateOne(
      { user: user1._id },
      { filePath: path.join(testStorageDir, '../../package.json') }
    );

    const res = await fetch(`${baseUrl}/api/resumes/download`, {
      headers: { Authorization: `Bearer ${token1}` },
    });
    const data = await res.json();

    assert.strictEqual(res.status, 403);
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.message, 'Access to the requested file path is forbidden.');
  });

  it('12b. Rejects download with 403 when filePath points to system file outside storage', async () => {
    // Create resume record pointing to outside system file
    await Resume.create({
      user: user1._id,
      originalFileName: 'system.pdf',
      storedFileName: 'system.pdf',
      filePath: path.resolve('/etc/passwd'),
      fileSize: 100,
      mimeType: 'application/pdf',
      rawText: 'sample text content',
    });

    const res = await fetch(`${baseUrl}/api/resumes/download`, {
      headers: { Authorization: `Bearer ${token1}` },
    });
    const data = await res.json();

    assert.strictEqual(res.status, 403);
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.message, 'Access to the requested file path is forbidden.');
  });

  it('12c. Returns 404 when resume record exists but file is missing from disk', async () => {
    // Upload a valid resume first
    const pdfBuffer = createSimplePdf(['Candidate', 'c@example.com']);
    const formData = new FormData();
    formData.append('resume', new Blob([pdfBuffer], { type: 'application/pdf' }), 'valid.pdf');

    await fetch(`${baseUrl}/api/resumes/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token1}` },
      body: formData,
    });

    // Point filePath to non-existent file inside valid storage directory (and clear storedFileName fallback)
    const missingFilePath = path.join(testStorageDir, 'missing_random_file.pdf');
    await Resume.updateOne(
      { user: user1._id },
      { filePath: missingFilePath, storedFileName: 'missing_random_file.pdf' }
    );

    const res = await fetch(`${baseUrl}/api/resumes/download`, {
      headers: { Authorization: `Bearer ${token1}` },
    });
    const data = await res.json();

    assert.strictEqual(res.status, 404);
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.message, 'Resume file is not found on the server storage.');
  });

  it('12d. Rejects download with 403 when target is a directory rather than a regular file', async () => {
    // Create record where filePath is the storage directory itself
    await Resume.create({
      user: user1._id,
      originalFileName: 'dir.pdf',
      storedFileName: 'dir.pdf',
      filePath: testStorageDir,
      fileSize: 100,
      mimeType: 'application/pdf',
      rawText: 'sample text content',
    });

    const res = await fetch(`${baseUrl}/api/resumes/download`, {
      headers: { Authorization: `Bearer ${token1}` },
    });
    const data = await res.json();

    assert.strictEqual(res.status, 403);
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.message, 'Access to the requested file path is forbidden.');
  });

  it('12e. Ignores frontend query parameters attempting path traversal or file hijacking', async () => {
    // Upload legitimate resume for user 1
    const pdfBuffer = createSimplePdf(['User One', 'user1@example.com']);
    const formData = new FormData();
    formData.append('resume', new Blob([pdfBuffer], { type: 'application/pdf' }), 'user1_legit.pdf');

    await fetch(`${baseUrl}/api/resumes/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token1}` },
      body: formData,
    });

    // Attacker sends malicious query params in GET request
    const res = await fetch(
      `${baseUrl}/api/resumes/download?filePath=../../package.json&file=/etc/passwd`,
      {
        headers: { Authorization: `Bearer ${token1}` },
      }
    );

    // Endpoint must ignore query params, use MongoDB record, and return user1's legitimate resume
    assert.strictEqual(res.status, 200);
    assert.match(
      res.headers.get('content-disposition') || '',
      /attachment; filename="user1_legit\.pdf"/
    );
    const downloadedBytes = Buffer.from(await res.arrayBuffer());
    assert.strictEqual(downloadedBytes.slice(0, 5).toString('ascii'), '%PDF-');
  });

  it('12f. Handles path case sensitivity and relative file path fallback gracefully', async () => {
    // Upload legitimate resume
    const pdfBuffer = createSimplePdf(['Casing Candidate', 'casing@example.com']);
    const formData = new FormData();
    formData.append('resume', new Blob([pdfBuffer], { type: 'application/pdf' }), 'casing_test.pdf');

    await fetch(`${baseUrl}/api/resumes/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token1}` },
      body: formData,
    });

    const resumeDoc = await Resume.findOne({ user: user1._id });
    // Simulate Windows case mutation in the stored filePath
    const mutatedFilePath = resumeDoc.filePath.replace('test-resumes', 'TEST-RESUMES');
    await Resume.updateOne(
      { user: user1._id },
      { filePath: mutatedFilePath }
    );

    const res = await fetch(`${baseUrl}/api/resumes/download`, {
      headers: { Authorization: `Bearer ${token1}` },
    });

    assert.strictEqual(res.status, 200);
    assert.match(
      res.headers.get('content-disposition') || '',
      /attachment; filename="casing_test\.pdf"/
    );
    const downloadedBytes = Buffer.from(await res.arrayBuffer());
    assert.strictEqual(downloadedBytes.slice(0, 5).toString('ascii'), '%PDF-');
  });

  // Scenario 6: Cross-user isolation
  it('13. User B cannot access or download User A resume (cross-user isolation)', async () => {
    // User 1 uploads resume
    const pdfBuffer = createSimplePdf([
      'Private Resume User 1',
      'user1@example.com',
      'SKILLS: React, Node.js',
    ]);
    const formData = new FormData();
    formData.append(
      'resume',
      new Blob([pdfBuffer], { type: 'application/pdf' }),
      'user1.pdf'
    );

    const uploadRes = await fetch(`${baseUrl}/api/resumes/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token1}` },
      body: formData,
    });
    assert.strictEqual(uploadRes.status, 201);

    // User 2 attempts to fetch resume
    const resGet = await fetch(`${baseUrl}/api/resumes`, {
      headers: { Authorization: `Bearer ${token2}` },
    });
    const dataGet = await resGet.json();
    assert.strictEqual(resGet.status, 200);
    assert.strictEqual(dataGet.resume, null); // User 2 has no resume

    // User 2 attempts to download resume
    const resDownload = await fetch(`${baseUrl}/api/resumes/download`, {
      headers: { Authorization: `Bearer ${token2}` },
    });
    const dataDownload = await resDownload.json();
    assert.strictEqual(resDownload.status, 404);
    assert.strictEqual(dataDownload.success, false);
  });

  // Scenario 7: Resume replacement
  it('14. Uploading a new resume replaces existing record and cleans up old file from disk', async () => {
    // First upload
    const pdf1 = createSimplePdf([
      'Initial Candidate',
      'initial@example.com',
      'SKILLS: Java, Spring Boot',
    ]);
    const fd1 = new FormData();
    fd1.append('resume', new Blob([pdf1], { type: 'application/pdf' }), 'v1.pdf');

    const res1 = await fetch(`${baseUrl}/api/resumes/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token1}` },
      body: fd1,
    });
    const data1 = await res1.json();
    assert.strictEqual(res1.status, 201);

    // Check file on disk
    const resumeDoc1 = await Resume.findOne({ user: user1._id });
    const oldFilePath = resumeDoc1.filePath;
    assert.ok(fs.existsSync(oldFilePath));

    // Second upload (Replacement)
    const pdf2 = createSimplePdf([
      'Updated Candidate',
      'updated@example.com',
      'SKILLS: Go, Rust, Docker',
    ]);
    const fd2 = new FormData();
    fd2.append('resume', new Blob([pdf2], { type: 'application/pdf' }), 'v2.pdf');

    const res2 = await fetch(`${baseUrl}/api/resumes/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token1}` },
      body: fd2,
    });
    const data2 = await res2.json();
    assert.strictEqual(res2.status, 200);
    assert.strictEqual(data2.message, 'Resume updated and parsed successfully.');

    // Verify only 1 record exists in DB for this user
    const totalDocs = await Resume.countDocuments({ user: user1._id });
    assert.strictEqual(totalDocs, 1);

    // Verify old file on disk was unlinked
    assert.strictEqual(fs.existsSync(oldFilePath), false);

    // Verify new file exists on disk
    const resumeDoc2 = await Resume.findOne({ user: user1._id });
    assert.ok(fs.existsSync(resumeDoc2.filePath));
    assert.notStrictEqual(resumeDoc1.filePath, resumeDoc2.filePath);
    assert.ok(resumeDoc2.parsedData.skills.programmingLanguages.includes('Go'));
  });

  // Scenario 8: Resume deletion
  it('15. DELETE /api/resumes removes database record and deletes file from disk', async () => {
    // Upload first
    const pdf = createSimplePdf([
      'Delete Candidate',
      'delete@example.com',
      'SKILLS: Python, FastAPI',
    ]);
    const fd = new FormData();
    fd.append('resume', new Blob([pdf], { type: 'application/pdf' }), 'to_delete.pdf');

    const uploadRes = await fetch(`${baseUrl}/api/resumes/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token1}` },
      body: fd,
    });
    assert.strictEqual(uploadRes.status, 201);

    const resumeDoc = await Resume.findOne({ user: user1._id });
    assert.ok(resumeDoc);
    assert.ok(fs.existsSync(resumeDoc.filePath));

    // Delete
    const delRes = await fetch(`${baseUrl}/api/resumes`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token1}` },
    });
    const delData = await delRes.json();
    assert.strictEqual(delRes.status, 200);
    assert.strictEqual(delData.success, true);

    // Verify file deleted from disk
    assert.strictEqual(fs.existsSync(resumeDoc.filePath), false);

    // Verify DB document deleted
    const count = await Resume.countDocuments({ user: user1._id });
    assert.strictEqual(count, 0);

    // Subsequent delete returns 404
    const delRes2 = await fetch(`${baseUrl}/api/resumes`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token1}` },
    });
    assert.strictEqual(delRes2.status, 404);
  });

  // Scenario 9: Graceful handling of minimal resume with missing optional sections
  it('16. Gracefully handles resume with missing optional sections without errors', async () => {
    const minimalPdf = createSimplePdf([
      'Minimal Candidate',
      'minimal@example.com',
      'SKILLS: Python, JavaScript',
    ]);
    const fd = new FormData();
    fd.append('resume', new Blob([minimalPdf], { type: 'application/pdf' }), 'minimal.pdf');

    const res = await fetch(`${baseUrl}/api/resumes/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token1}` },
      body: fd,
    });
    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.deepStrictEqual(data.resume.parsedData.education, []);
    assert.deepStrictEqual(data.resume.parsedData.experience, []);
    assert.deepStrictEqual(data.resume.parsedData.projects, []);
    assert.deepStrictEqual(data.resume.parsedData.certifications, []);
    assert.strictEqual(data.resume.parsedData.personalInfo.portfolio, null);
  });

  // Scenario 10: Phone Number Extraction & Validation
  it('17. Correctly extracts Indian phone number with spaces: +91 98765 43210 without dropping the last digit', async () => {
    const pdfBuffer = createSimplePdf([
      'Rahul Sharma',
      'rahul.sharma@example.com | +91 98765 43210 | Bangalore, Karnataka',
      'SKILLS: React, Node.js, Express, MongoDB',
      'EDUCATION: B.Tech Computer Science 2023 - GPA: 8.5',
    ]);
    const fd = new FormData();
    fd.append('resume', new Blob([pdfBuffer], { type: 'application/pdf' }), 'rahul_resume.pdf');

    const res = await fetch(`${baseUrl}/api/resumes/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token1}` },
      body: fd,
    });
    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.resume.parsedData.personalInfo.phone, '+91 98765 43210');
  });

  it('18. Correctly extracts 10-digit continuous Indian phone number: 9876543210', async () => {
    const pdfBuffer = createSimplePdf([
      'Amit Kumar',
      'amit.kumar@example.com | 9876543210 | New Delhi, India',
      'SKILLS: Python, Django, PostgreSQL',
      'EDUCATION: Bachelor of Engineering 2022',
    ]);
    const fd = new FormData();
    fd.append('resume', new Blob([pdfBuffer], { type: 'application/pdf' }), 'amit_resume.pdf');

    const res = await fetch(`${baseUrl}/api/resumes/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token1}` },
      body: fd,
    });
    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.resume.parsedData.personalInfo.phone, '9876543210');
  });

  it('19. Correctly extracts hyphenated Indian phone number: +91-98765-43210', async () => {
    const pdfBuffer = createSimplePdf([
      'Priya Patel',
      'priya.patel@example.com | +91-98765-43210 | Mumbai, Maharashtra',
      'SKILLS: Java, Spring Boot, MySQL',
    ]);
    const fd = new FormData();
    fd.append('resume', new Blob([pdfBuffer], { type: 'application/pdf' }), 'priya_resume.pdf');

    const res = await fetch(`${baseUrl}/api/resumes/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token1}` },
      body: fd,
    });
    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.resume.parsedData.personalInfo.phone, '+91-98765-43210');
  });

  it('20. Correctly handles missing phone number as null without false positives from years, CGPA, or PIN codes', async () => {
    const pdfBuffer = createSimplePdf([
      'Dev Candidate',
      'dev.candidate@example.com | Bangalore, India',
      'EDUCATION: University Institute of Technology - 2021 - GPA: 3.92',
      'PIN Code: 560034 - US Postal Code: 90210 - Date: 12/05/2021',
      'SKILLS: TypeScript, Vue.js, Docker',
    ]);
    const fd = new FormData();
    fd.append('resume', new Blob([pdfBuffer], { type: 'application/pdf' }), 'dev_resume.pdf');

    const res = await fetch(`${baseUrl}/api/resumes/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token1}` },
      body: fd,
    });
    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.resume.parsedData.personalInfo.phone, null);
  });

  it('21. Unit tests for extractPhoneNumber parser helper across various formats and negative cases', () => {
    // Required cases from specification
    assert.strictEqual(extractPhoneNumber('+91 98765 43210'), '+91 98765 43210');
    assert.strictEqual(extractPhoneNumber('9876543210'), '9876543210');
    assert.strictEqual(extractPhoneNumber('+91-98765-43210'), '+91-98765-43210');
    assert.strictEqual(extractPhoneNumber('No phone in this string'), null);

    // Additional common formats
    assert.strictEqual(extractPhoneNumber('+91 9876543210'), '+91 9876543210');
    assert.strictEqual(extractPhoneNumber('+91-9876543210'), '+91-9876543210');
    assert.strictEqual(extractPhoneNumber('98765 43210'), '98765 43210');
    assert.strictEqual(extractPhoneNumber('09876543210'), '09876543210');
    assert.strictEqual(extractPhoneNumber('Phone: +91 98765 43210'), '+91 98765 43210');
    assert.strictEqual(extractPhoneNumber('Mobile: 9876543210'), '9876543210');
    assert.strictEqual(extractPhoneNumber('+1 555 432 1098'), '+1 555 432 1098');
    assert.strictEqual(extractPhoneNumber('(555) 432-1098'), '(555) 432-1098');

    // Negative false positive protection
    assert.strictEqual(extractPhoneNumber('2021'), null);
    assert.strictEqual(extractPhoneNumber('2019 - 2023'), null);
    assert.strictEqual(extractPhoneNumber('GPA: 3.92'), null);
    assert.strictEqual(extractPhoneNumber('CGPA: 8.5 / 10'), null);
    assert.strictEqual(extractPhoneNumber('ZIP: 90210'), null);
    assert.strictEqual(extractPhoneNumber('PIN: 560034'), null);
    assert.strictEqual(extractPhoneNumber('12/05/2021'), null);
    assert.strictEqual(extractPhoneNumber(null), null);
    assert.strictEqual(extractPhoneNumber(''), null);
  });
});
