const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const User = require('../models/User');
const Resume = require('../models/Resume');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const { generateToken } = require('../services/tokenService');

describe('CareerLens AI - Phase 3 Resume Analysis Suite', () => {
  let mongoServer;
  let server;
  let baseUrl;
  let user1;
  let token1;
  let user2;
  let token2;
  let resume1;

  before(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test_secret_key_minimum_32_characters_for_security';
    process.env.JWT_EXPIRES_IN = '1d';
    // Direct backend to use fallback or local mock if AI service is offline
    process.env.AI_SERVICE_URL = 'http://127.0.0.1:59999';

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
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Resume.deleteMany({});
    await ResumeAnalysis.deleteMany({});

    // User 1
    user1 = await User.create({
      fullName: 'Alice Developer',
      email: 'alice.dev@example.com',
      password: 'Password123!',
    });
    token1 = generateToken(user1._id);

    // User 2 (for isolation testing)
    user2 = await User.create({
      fullName: 'Bob Developer',
      email: 'bob.dev@example.com',
      password: 'Password123!',
    });
    token2 = generateToken(user2._id);

    // Create a parsed resume for User 1
    resume1 = await Resume.create({
      user: user1._id,
      originalFileName: 'Alice_Resume.pdf',
      storedFileName: 'test_alice_resume.pdf',
      filePath: 'C:/fake/path/test_alice_resume.pdf',
      fileSize: 45000,
      mimeType: 'application/pdf',
      rawText: 'Alice Developer. Skills: React, Node.js, Express, MongoDB, JavaScript, Git. Experience: Software Engineer Intern at TechCorp. Projects: E-Commerce Web App with React and Node.js. Education: B.Tech in Computer Science from State University.',
      parsedData: {
        personalInfo: {
          fullName: 'Alice Developer',
          email: 'alice.dev@example.com',
          phone: '+91 98765 43210',
          location: 'Bangalore, India',
          linkedin: 'https://linkedin.com/in/alicedev',
          github: 'https://github.com/alicedev',
          portfolio: 'https://alice.dev',
        },
        skills: {
          programmingLanguages: ['JavaScript', 'TypeScript', 'Python'],
          frameworks: ['React', 'Node.js', 'Express.js', 'Tailwind CSS'],
          databases: ['MongoDB', 'PostgreSQL'],
          tools: ['Git', 'Docker', 'Postman'],
          other: ['RESTful APIs', 'Agile Methodology'],
        },
        education: [
          {
            institution: 'State University',
            degree: 'Bachelor of Technology',
            specialization: 'Computer Science and Engineering',
            graduationYear: '2024',
            grade: '8.8 CGPA',
          },
        ],
        experience: [
          {
            company: 'TechCorp Solutions',
            position: 'Full Stack Developer Intern',
            duration: 'Jan 2024 - Jun 2024',
            description: 'Developed responsive user interfaces with React and built REST APIs with Node.js and Express.',
          },
        ],
        projects: [
          {
            title: 'E-Commerce Platform',
            technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
            description: 'Built a full-featured e-commerce web platform with authentication, cart checkout, and payment processing.',
            link: 'https://github.com/alicedev/ecommerce',
          },
          {
            title: 'Task Management App',
            technologies: ['React', 'Firebase', 'Tailwind CSS'],
            description: 'Collaborative task planner with real-time sync and drag-and-drop workflow kanban boards.',
            link: 'https://github.com/alicedev/taskflow',
          },
        ],
        certifications: [
          {
            name: 'AWS Certified Cloud Practitioner',
            issuer: 'Amazon Web Services',
            date: '2023',
          },
        ],
      },
      parsingStatus: 'completed',
    });
  });

  // 1. Authentication checks
  it('1. Rejects unauthenticated POST /api/analysis/:resumeId with 401', async () => {
    const res = await fetch(`${baseUrl}/api/analysis/${resume1._id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetRole: 'Full Stack Developer' }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 401);
    assert.strictEqual(data.success, false);
  });

  it('2. Rejects unauthenticated GET /api/analysis/:resumeId with 401', async () => {
    const res = await fetch(`${baseUrl}/api/analysis/${resume1._id}`, {
      method: 'GET',
    });
    const data = await res.json();
    assert.strictEqual(res.status, 401);
    assert.strictEqual(data.success, false);
  });

  it('3. Rejects unauthenticated DELETE /api/analysis/:resumeId with 401', async () => {
    const res = await fetch(`${baseUrl}/api/analysis/${resume1._id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    assert.strictEqual(res.status, 401);
    assert.strictEqual(data.success, false);
  });

  // 2. Input validation checks
  it('4. Rejects invalid resumeId ObjectId format with 400', async () => {
    const res = await fetch(`${baseUrl}/api/analysis/invalid-object-id`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token1}`,
      },
      body: JSON.stringify({ targetRole: 'Frontend Developer' }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(data.success, false);
    assert.match(data.message, /invalid resume identifier/i);
  });

  it('5. Rejects missing targetRole with 400', async () => {
    const res = await fetch(`${baseUrl}/api/analysis/${resume1._id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token1}`,
      },
      body: JSON.stringify({}),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(data.success, false);
    assert.match(data.message, /target career role/i);
  });

  it('6. Returns 404 when resume does not exist', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const res = await fetch(`${baseUrl}/api/analysis/${nonExistentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token1}`,
      },
      body: JSON.stringify({ targetRole: 'Backend Developer' }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 404);
    assert.strictEqual(data.success, false);
  });

  // 3. User isolation
  it('7. Prevents User B from analyzing User A\'s resume (returns 404)', async () => {
    const res = await fetch(`${baseUrl}/api/analysis/${resume1._id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token2}`, // Bob's token for Alice's resume
      },
      body: JSON.stringify({ targetRole: 'Full Stack Developer' }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 404);
    assert.strictEqual(data.success, false);
  });

  // 4. Successful analysis creation (Predefined role)
  it('8. Successfully runs analysis for Full Stack Developer role using fallback analyzer', async () => {
    const res = await fetch(`${baseUrl}/api/analysis/${resume1._id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token1}`,
      },
      body: JSON.stringify({
        targetRole: 'Full Stack Developer',
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.success, true);
    assert.ok(data.analysis);

    const { analysis } = data;
    assert.strictEqual(analysis.targetRole, 'Full Stack Developer');
    assert.strictEqual(typeof analysis.overallScore, 'number');
    assert.ok(analysis.overallScore >= 0 && analysis.overallScore <= 100);

    // Verify rubric categories
    const { categoryScores } = analysis;
    assert.ok(categoryScores);
    assert.strictEqual(categoryScores.technicalSkills.maxScore, 25);
    assert.strictEqual(categoryScores.projects.maxScore, 20);
    assert.strictEqual(categoryScores.experience.maxScore, 20);
    assert.strictEqual(categoryScores.education.maxScore, 10);
    assert.strictEqual(categoryScores.certifications.maxScore, 10);
    assert.strictEqual(categoryScores.completeness.maxScore, 15);

    // Verify sections
    assert.ok(Array.isArray(analysis.strengths));
    assert.ok(analysis.strengths.length > 0);
    assert.ok(Array.isArray(analysis.weaknesses));
    assert.ok(Array.isArray(analysis.improvementSuggestions));
    assert.ok(analysis.improvementSuggestions.length > 0);

    // Missing skills
    assert.ok(Array.isArray(analysis.missingSkills));
    if (analysis.missingSkills.length > 0) {
      const firstMissing = analysis.missingSkills[0];
      assert.ok(['High', 'Medium', 'Low', 'high', 'medium', 'low'].includes(firstMissing.priority));
      assert.ok(firstMissing.reason && firstMissing.reason.length > 0);
    }

    // AI Feedback
    assert.ok(analysis.aiFeedback);
    assert.ok(analysis.aiFeedback.summary);
    assert.ok(analysis.aiFeedback.roleSuitability);
    assert.ok(analysis.aiFeedback.nextSteps);

    // Provider check (since port 59999 is closed, it transparently uses fallback)
    assert.strictEqual(analysis.analysisProvider, 'rule-based-fallback');
  });

  // 5. Custom role and job description
  it('9. Successfully runs analysis with a Custom Role and Job Description', async () => {
    const res = await fetch(`${baseUrl}/api/analysis/${resume1._id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token1}`,
      },
      body: JSON.stringify({
        targetRole: 'Custom Role: Mobile App Engineer',
        jobDescription: 'Looking for a React Native engineer with TypeScript, Redux, and mobile deployment skills.',
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.analysis.targetRole, 'Custom Role: Mobile App Engineer');
    assert.strictEqual(data.analysis.jobDescription, 'Looking for a React Native engineer with TypeScript, Redux, and mobile deployment skills.');
    assert.ok(data.analysis.overallScore >= 0 && data.analysis.overallScore <= 100);
  });

  // 6. Retrieval via GET /api/analysis/:resumeId
  it('10. Retrieves previously saved analysis via GET /api/analysis/:resumeId', async () => {
    // First generate analysis
    await fetch(`${baseUrl}/api/analysis/${resume1._id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token1}`,
      },
      body: JSON.stringify({ targetRole: 'Backend Developer' }),
    });

    // Retrieve it
    const res = await fetch(`${baseUrl}/api/analysis/${resume1._id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token1}`,
      },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.analysis.targetRole, 'Backend Developer');
  });

  it('11. User B cannot retrieve User A\'s analysis (returns 404)', async () => {
    // Generate analysis for User A
    await fetch(`${baseUrl}/api/analysis/${resume1._id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token1}`,
      },
      body: JSON.stringify({ targetRole: 'Data Analyst' }),
    });

    // User B tries to retrieve
    const res = await fetch(`${baseUrl}/api/analysis/${resume1._id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token2}`,
      },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 404);
    assert.strictEqual(data.success, false);
  });

  // 7. Deletion via DELETE /api/analysis/:resumeId
  it('12. Deletes analysis successfully and returns 404 on subsequent queries', async () => {
    // Create analysis
    await fetch(`${baseUrl}/api/analysis/${resume1._id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token1}`,
      },
      body: JSON.stringify({ targetRole: 'Frontend Developer' }),
    });

    // Delete it
    const deleteRes = await fetch(`${baseUrl}/api/analysis/${resume1._id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token1}`,
      },
    });
    const deleteData = await deleteRes.json();
    assert.strictEqual(deleteRes.status, 200);
    assert.strictEqual(deleteData.success, true);

    // Verify subsequent GET returns 404
    const getRes = await fetch(`${baseUrl}/api/analysis/${resume1._id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token1}`,
      },
    });
    const getData = await getRes.json();
    assert.strictEqual(getRes.status, 404);
    assert.strictEqual(getData.success, false);

    // Verify subsequent DELETE returns 404
    const deleteAgainRes = await fetch(`${baseUrl}/api/analysis/${resume1._id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token1}`,
      },
    });
    assert.strictEqual(deleteAgainRes.status, 404);
  });
});
