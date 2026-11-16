const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const User = require('../models/User');
const Resume = require('../models/Resume');
const JobDescription = require('../models/JobDescription');
const InterviewSession = require('../models/InterviewSession');
const { generateToken } = require('../services/tokenService');

describe('CareerLens AI - Phase 5 AI Mock Interview & Evaluation Suite', () => {
  let mongoServer;
  let server;
  let baseUrl;
  let user1;
  let token1;
  let user2;
  let token2;
  let resume1;
  let job1;

  before(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test_secret_key_minimum_32_characters_for_security';
    process.env.JWT_EXPIRES_IN = '1d';
    // Offline AI service to test deterministic rule-based fallback
    process.env.AI_SERVICE_URL = 'http://127.0.0.1:59997';

    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  after(async () => {
    await mongoose.connection.close();
    if (mongoServer) await mongoServer.stop();
    if (server) await new Promise((resolve) => server.close(resolve));
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Resume.deleteMany({});
    await JobDescription.deleteMany({});
    await InterviewSession.deleteMany({});

    user1 = await User.create({
      fullName: 'Aarav Patel',
      email: 'aarav.patel@example.com',
      password: 'Password123!',
    });
    token1 = generateToken(user1._id);

    user2 = await User.create({
      fullName: 'Neha Gupta',
      email: 'neha.gupta@example.com',
      password: 'Password123!',
    });
    token2 = generateToken(user2._id);

    resume1 = await Resume.create({
      user: user1._id,
      originalFileName: 'Aarav_Resume.pdf',
      storedFileName: 'test_aarav.pdf',
      filePath: 'C:/fake/path/test_aarav.pdf',
      fileSize: 45000,
      mimeType: 'application/pdf',
      rawText: 'Full Stack Engineer with React, Node.js, Express, MongoDB, Git, Docker.',
      parsedData: {
        personalInfo: { fullName: 'Aarav Patel', email: 'aarav.patel@example.com' },
        skills: {
          programmingLanguages: ['JavaScript', 'Python'],
          frameworks: ['React', 'Node.js', 'Express.js'],
          databases: ['MongoDB'],
          tools: ['Git', 'Docker'],
        },
      },
      parsingStatus: 'completed',
    });

    job1 = await JobDescription.create({
      user: user1._id,
      jobTitle: 'Full Stack Developer',
      companyName: 'Tech Innovations',
      jobDescription: 'Seeking a Full Stack Engineer with proficiency in React, Node.js, Express, and MongoDB.',
    });
  });

  // 1. Authentication Check
  it('1. Rejects unauthenticated requests across interview endpoints with 401', async () => {
    const endpoints = [
      { method: 'POST', url: `${baseUrl}/api/interviews` },
      { method: 'GET', url: `${baseUrl}/api/interviews` },
      { method: 'GET', url: `${baseUrl}/api/interviews/507f1f77bcf86cd799439011` },
      { method: 'DELETE', url: `${baseUrl}/api/interviews/507f1f77bcf86cd799439011` },
      { method: 'GET', url: `${baseUrl}/api/interviews/507f1f77bcf86cd799439011/current-question` },
      { method: 'PATCH', url: `${baseUrl}/api/interviews/507f1f77bcf86cd799439011/draft` },
      { method: 'POST', url: `${baseUrl}/api/interviews/507f1f77bcf86cd799439011/answer` },
      { method: 'POST', url: `${baseUrl}/api/interviews/507f1f77bcf86cd799439011/next` },
      { method: 'POST', url: `${baseUrl}/api/interviews/507f1f77bcf86cd799439011/complete` },
      { method: 'GET', url: `${baseUrl}/api/interviews/507f1f77bcf86cd799439011/report` },
    ];

    for (const ep of endpoints) {
      const res = await fetch(ep.url, { method: ep.method });
      assert.strictEqual(res.status, 401, `Expected 401 for ${ep.method} ${ep.url}`);
    }
  });

  // 2. Input Validation on Interview Creation
  it('2. Rejects invalid interview configuration inputs with 400', async () => {
    // 2a. Missing role
    const resNoRole = await fetch(`${baseUrl}/api/interviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({ difficulty: 'Beginner', totalQuestions: 5 }),
    });
    assert.strictEqual(resNoRole.status, 400);

    // 2b. Custom Role without customRole string
    const resCustomNoName = await fetch(`${baseUrl}/api/interviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({ role: 'Custom Role', customRole: '', difficulty: 'Beginner', totalQuestions: 5 }),
    });
    assert.strictEqual(resCustomNoName.status, 400);

    // 2c. Invalid difficulty
    const resBadDiff = await fetch(`${baseUrl}/api/interviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({ role: 'Frontend Developer', difficulty: 'Expert', totalQuestions: 5 }),
    });
    assert.strictEqual(resBadDiff.status, 400);

    // 2d. Invalid question count (e.g. 7)
    const resBadCount = await fetch(`${baseUrl}/api/interviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({ role: 'Frontend Developer', difficulty: 'Intermediate', totalQuestions: 7 }),
    });
    assert.strictEqual(resBadCount.status, 400);

    // 2e. Unowned resume ID returns 404
    const resBadResume = await fetch(`${baseUrl}/api/interviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token2}` },
      body: JSON.stringify({
        role: 'Full Stack Developer',
        difficulty: 'Intermediate',
        totalQuestions: 5,
        resumeId: resume1._id, // owned by user1
      }),
    });
    assert.strictEqual(resBadResume.status, 404);

    // 2f. Unowned job ID returns 404
    const resBadJob = await fetch(`${baseUrl}/api/interviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token2}` },
      body: JSON.stringify({
        role: 'Full Stack Developer',
        difficulty: 'Intermediate',
        totalQuestions: 5,
        jobId: job1._id, // owned by user1
      }),
    });
    assert.strictEqual(resBadJob.status, 404);
  });

  // 3. Successful Interview Creation & Secret Concept Sanitization
  it('3. Successfully creates interview session and strips expectedConcepts from pending questions', async () => {
    const res = await fetch(`${baseUrl}/api/interviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({
        role: 'Full Stack Developer',
        interviewType: 'Technical Interview',
        difficulty: 'Intermediate',
        totalQuestions: 5,
        resumeId: resume1._id,
        jobId: job1._id,
      }),
    });

    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.interview._id);
    assert.strictEqual(data.interview.role, 'Full Stack Developer');
    assert.strictEqual(data.interview.totalQuestions, 5);
    assert.strictEqual(data.interview.questions.length, 5);
    assert.strictEqual(data.interview.status, 'in-progress');

    // CRITICAL SECURITY CHECK: expectedConcepts & evaluationCriteria must NOT be in pending question response
    for (const q of data.interview.questions) {
      assert.strictEqual(q.status, 'pending');
      assert.strictEqual(q.expectedConcepts, undefined, 'expectedConcepts must be hidden on pending questions');
      assert.strictEqual(q.evaluationCriteria, undefined, 'evaluationCriteria must be hidden on pending questions');
      assert.strictEqual(q.sampleAnswer, undefined, 'sampleAnswer must be hidden on pending questions');
    }
  });

  // 4. Cross-User Isolation
  it('4. User B cannot access, answer, or delete User A interview session (returns 404)', async () => {
    // Create interview for User 1
    const createRes = await fetch(`${baseUrl}/api/interviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({
        role: 'Frontend Developer',
        interviewType: 'Technical Interview',
        difficulty: 'Beginner',
        totalQuestions: 5,
      }),
    });
    const { interview } = await createRes.json();
    const interviewId = interview._id;

    // User 2 tries to GET interview
    const getRes = await fetch(`${baseUrl}/api/interviews/${interviewId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token2}` },
    });
    assert.strictEqual(getRes.status, 404);

    // User 2 tries to get current question
    const qRes = await fetch(`${baseUrl}/api/interviews/${interviewId}/current-question`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token2}` },
    });
    assert.strictEqual(qRes.status, 404);

    // User 2 tries to submit answer
    const ansRes = await fetch(`${baseUrl}/api/interviews/${interviewId}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token2}` },
      body: JSON.stringify({ answer: 'Unauthorized attempt.' }),
    });
    assert.strictEqual(ansRes.status, 404);

    // User 2 tries to DELETE interview
    const delRes = await fetch(`${baseUrl}/api/interviews/${interviewId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token2}` },
    });
    assert.strictEqual(delRes.status, 404);

    // Verify session still exists for User 1
    const verifyRes = await fetch(`${baseUrl}/api/interviews/${interviewId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token1}` },
    });
    assert.strictEqual(verifyRes.status, 200);
  });

  // 5. Active Interview Workflow: Drafts, Answer Submission, and Next Question
  it('5. Successfully handles active interview flow: draft saving, answer submission, and question navigation', async () => {
    // Create interview for User 1
    const createRes = await fetch(`${baseUrl}/api/interviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({
        role: 'Full Stack Developer',
        interviewType: 'Mixed Interview',
        difficulty: 'Intermediate',
        totalQuestions: 5,
      }),
    });
    const { interview } = await createRes.json();
    const interviewId = interview._id;

    // 5a. Save draft answer
    const draftRes = await fetch(`${baseUrl}/api/interviews/${interviewId}/draft`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({ draftAnswer: 'My initial draft thoughts...' }),
    });
    assert.strictEqual(draftRes.status, 200);

    // Verify draft was saved
    const persistedSession = await InterviewSession.findById(interviewId);
    assert.strictEqual(persistedSession.questions[0].draftAnswer, 'My initial draft thoughts...');

    // 5b. Empty answer rejection
    const emptyRes = await fetch(`${baseUrl}/api/interviews/${interviewId}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({ answer: '   ' }),
    });
    assert.strictEqual(emptyRes.status, 400);

    // 5c. Submit valid answer and receive evaluation
    const answerText = 'JavaScript is an interpreted, dynamically typed language running in browsers and Node.js with native DOM manipulation and event-driven architecture, while Java is a statically typed compiled OOP language on the JVM.';
    const submitRes = await fetch(`${baseUrl}/api/interviews/${interviewId}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({ answer: answerText }),
    });

    assert.strictEqual(submitRes.status, 200);
    const submitData = await submitRes.json();
    assert.strictEqual(submitData.success, true);
    assert.ok(submitData.evaluation);
    assert.ok(submitData.evaluation.overallScore >= 50, 'Expected score >= 50');
    assert.ok(submitData.evaluation.improvedSampleAnswer);
    assert.strictEqual(submitData.question.status, 'answered');
    assert.strictEqual(submitData.question.answer, answerText);

    // 5d. Duplicate submission rejection
    const duplicateRes = await fetch(`${baseUrl}/api/interviews/${interviewId}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({ answer: 'Submitting again.' }),
    });
    assert.strictEqual(duplicateRes.status, 400);

    // 5e. Advance to next question
    const nextRes = await fetch(`${baseUrl}/api/interviews/${interviewId}/next`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token1}` },
    });
    assert.strictEqual(nextRes.status, 200);
    const nextData = await nextRes.json();
    assert.strictEqual(nextData.currentQuestionIndex, 1);
  });

  // 6. Complete Interview & Final Report Generation
  it('6. Completes interview session, generates performance report, and prevents modifications after completion', async () => {
    // Create interview
    const createRes = await fetch(`${baseUrl}/api/interviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({
        role: 'Software Developer',
        interviewType: 'Technical Interview',
        difficulty: 'Beginner',
        totalQuestions: 5,
      }),
    });
    const { interview } = await createRes.json();
    const interviewId = interview._id;

    // Answer Question 1
    await fetch(`${baseUrl}/api/interviews/${interviewId}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({
        answer: 'Encapsulation bundles data with methods. Abstraction hides complexity. Inheritance allows subclasses to reuse attributes. Polymorphism allows multiple classes to implement the same method.',
      }),
    });

    // Complete interview
    const completeRes = await fetch(`${baseUrl}/api/interviews/${interviewId}/complete`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token1}` },
    });

    assert.strictEqual(completeRes.status, 200);
    const completeData = await completeRes.json();
    assert.strictEqual(completeData.success, true);
    assert.strictEqual(completeData.report.status, 'completed');
    assert.ok(completeData.report.overallScore > 0);
    assert.ok(completeData.report.performanceLabel);
    assert.ok(completeData.report.summaryFeedback.readinessAssessment);

    // CRITICAL: Performance breakdown aggregation must be populated and persisted
    assert.ok(completeData.report.performanceBreakdown, 'Expected performanceBreakdown to exist');
    const pb = completeData.report.performanceBreakdown;
    const hasAccuracy = pb.technicalAccuracy !== undefined || pb.technical_accuracy !== undefined;
    assert.ok(hasAccuracy, 'Expected technical accuracy dimension in performanceBreakdown');
    assert.ok(pb.relevance !== undefined, 'Expected relevance in performanceBreakdown');
    assert.ok(pb.completeness !== undefined, 'Expected completeness in performanceBreakdown');
    assert.ok(pb.clarity !== undefined, 'Expected clarity in performanceBreakdown');

    // Verify persistence in MongoDB
    const persisted = await InterviewSession.findById(interviewId);
    assert.strictEqual(persisted.status, 'completed');
    const dbPb = persisted.performanceBreakdown instanceof Map
      ? Object.fromEntries(persisted.performanceBreakdown.entries())
      : persisted.performanceBreakdown;
    assert.ok(Object.keys(dbPb).length > 0, 'Database must persist non-empty performanceBreakdown');

    // After completion, attempting to submit an answer is rejected with 400
    const postCompleteAns = await fetch(`${baseUrl}/api/interviews/${interviewId}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({ answer: 'Cannot answer completed session.' }),
    });
    assert.strictEqual(postCompleteAns.status, 400);

    // Retrieve report via GET /api/interviews/:id/report
    const reportRes = await fetch(`${baseUrl}/api/interviews/${interviewId}/report`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token1}` },
    });
    assert.strictEqual(reportRes.status, 200);
    const reportData = await reportRes.json();
    assert.strictEqual(reportData.report.status, 'completed');
    assert.strictEqual(reportData.report.overallScore, completeData.report.overallScore);
    assert.ok(reportData.report.performanceBreakdown);
    assert.ok(Object.keys(reportData.report.performanceBreakdown).length > 0);
  });

  // 7. Interview History & Deletion
  it('7. Retrieves user interview list and deletes interview session cleanly', async () => {
    // Create an interview session first
    const createRes = await fetch(`${baseUrl}/api/interviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({
        role: 'Data Analyst',
        interviewType: 'Technical Interview',
        difficulty: 'Beginner',
        totalQuestions: 5,
      }),
    });
    assert.strictEqual(createRes.status, 201);
    const createData = await createRes.json();
    const createdId = createData.interview._id;

    // Verify list contains created session
    const listRes = await fetch(`${baseUrl}/api/interviews`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token1}` },
    });
    assert.strictEqual(listRes.status, 200);
    const listData = await listRes.json();
    assert.ok(listData.interviews.length >= 1);

    const targetSessionId = createdId;

    // Delete session
    const deleteRes = await fetch(`${baseUrl}/api/interviews/${targetSessionId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token1}` },
    });
    assert.strictEqual(deleteRes.status, 200);

    // Confirm session is gone
    const verifyRes = await fetch(`${baseUrl}/api/interviews/${targetSessionId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token1}` },
    });
    assert.strictEqual(verifyRes.status, 404);
  });

  // 8. CORS Preflight & Error Response Headers
  it('8. Verifies CORS preflight OPTIONS and error responses retain CORS headers on interview endpoints', async () => {
    // 8a. Preflight OPTIONS to /api/interviews
    const preflightRes = await fetch(`${baseUrl}/api/interviews`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://localhost:5173',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type,Authorization',
      },
    });
    assert.strictEqual(preflightRes.status, 204);
    assert.strictEqual(preflightRes.headers.get('access-control-allow-origin'), 'http://localhost:5173');
    assert.strictEqual(preflightRes.headers.get('access-control-allow-credentials'), 'true');
    const methods = preflightRes.headers.get('access-control-allow-methods') || '';
    assert.ok(methods.includes('POST'));
    assert.ok(methods.includes('PATCH'));

    // 8b. Unauthenticated request retains CORS headers
    const unauthRes = await fetch(`${baseUrl}/api/interviews`, {
      method: 'GET',
      headers: { Origin: 'http://localhost:5173' },
    });
    assert.strictEqual(unauthRes.status, 401);
    assert.strictEqual(unauthRes.headers.get('access-control-allow-origin'), 'http://localhost:5173');
    assert.strictEqual(unauthRes.headers.get('access-control-allow-credentials'), 'true');
  });

  // 9. Rubric Aggregation Precision & Missing Dimension Safety
  it('9. Accurately aggregates multi-question rubric scores across dimensions and handles missing dimensions safely', async () => {
    // Create session directly with tailored questions and evaluation criterion scores
    const session = await InterviewSession.create({
      user: user1._id,
      role: 'Full Stack Developer',
      interviewType: 'Mixed Interview',
      difficulty: 'Intermediate',
      totalQuestions: 5,
      status: 'in-progress',
      questions: [
        {
          questionId: 'q_1',
          questionText: 'Explain the event loop in Node.js.',
          category: 'technical',
          difficulty: 'intermediate',
          order: 1,
          status: 'answered',
          answer: 'The event loop handles asynchronous operations in Node.js via libuv phases.',
          evaluation: {
            overallScore: 83,
            performanceLabel: 'Good',
            criterionScores: {
              technicalAccuracy: 90,
              relevance: 80,
              completeness: 85,
              clarity: 75,
            },
            strengths: ['Accurate libuv mention.'],
            weaknesses: [],
          },
        },
        {
          questionId: 'q_2',
          questionText: 'Explain SQL indexing strategies.',
          category: 'technical',
          difficulty: 'intermediate',
          order: 2,
          status: 'answered',
          answer: 'B-tree indexes accelerate search queries at the expense of write overhead.',
          evaluation: {
            overallScore: 83,
            performanceLabel: 'Good',
            criterionScores: {
              technicalAccuracy: 80,
              relevance: 90,
              completeness: 75,
              clarity: 85,
            },
            strengths: ['Identified write penalty.'],
            weaknesses: [],
          },
        },
        {
          questionId: 'q_3',
          questionText: 'Tell me about a time you resolved a conflict.',
          category: 'hr',
          difficulty: 'intermediate',
          order: 3,
          status: 'answered',
          answer: 'In my final year capstone project, our team disagreed on tech stack...',
          evaluation: {
            overallScore: 88,
            performanceLabel: 'Excellent',
            criterionScores: {
              relevance: 100,
              clarity: 90,
              completeness: 80,
              structureAndCommunication: 90,
              examplesAndSpecificity: 80,
            },
            strengths: ['Used STAR framework.'],
            weaknesses: [],
          },
        },
      ],
    });

    const completeRes = await fetch(`${baseUrl}/api/interviews/${session._id}/complete`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token1}` },
    });
    assert.strictEqual(completeRes.status, 200);
    const completeData = await completeRes.json();
    assert.strictEqual(completeData.success, true);

    const pb = completeData.report.performanceBreakdown;
    assert.ok(pb, 'performanceBreakdown must exist');

    // Expected averages:
    // technicalAccuracy: (90 + 80) / 2 = 85 (Question 3 had no technicalAccuracy, so count is 2!)
    // relevance: (80 + 90 + 100) / 3 = 90
    // completeness: (85 + 75 + 80) / 3 = 80
    // clarity: (75 + 85 + 90) / 3 = 83.33 -> 83
    // structureAndCommunication: 90 / 1 = 90 (Only present in Question 3!)
    // examplesAndSpecificity: 80 / 1 = 80 (Only present in Question 3!)
    assert.strictEqual(pb.technicalAccuracy, 85);
    assert.strictEqual(pb.relevance, 90);
    assert.strictEqual(pb.completeness, 80);
    assert.strictEqual(pb.clarity, 83);
    assert.strictEqual(pb.structureAndCommunication, 90);
    assert.strictEqual(pb.examplesAndSpecificity, 80);

    // Verify GET /report returns exact same persisted breakdown
    const reportRes = await fetch(`${baseUrl}/api/interviews/${session._id}/report`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token1}` },
    });
    assert.strictEqual(reportRes.status, 200);
    const reportData = await reportRes.json();
    assert.deepStrictEqual(reportData.report.performanceBreakdown, pb);
  });
});
