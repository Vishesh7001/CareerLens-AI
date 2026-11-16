const { test, describe, before, after, it } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const User = require('../models/User');
const Resume = require('../models/Resume');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const JobDescription = require('../models/JobDescription');
const JobMatch = require('../models/JobMatch');
const LearningRoadmap = require('../models/LearningRoadmap');
const InterviewSession = require('../models/InterviewSession');
const Notification = require('../models/Notification');
const { generateToken } = require('../services/tokenService');

describe('CareerLens AI - Phase 6 Dashboard & Career Intelligence Suite', () => {
  let mongoServer;
  let server;
  let baseUrl;
  let user1;
  let user2;
  let token1;
  let token2;

  before(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test_jwt_secret_key_at_least_32_characters_long';
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    server = http.createServer(app);
    await new Promise((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        const address = server.address();
        baseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });

    // Create 2 test users
    user1 = await User.create({
      fullName: 'Alice Candidate',
      email: 'alice.dash@example.com',
      password: 'Password123!',
    });
    token1 = generateToken(user1._id);

    user2 = await User.create({
      fullName: 'Bob Competitor',
      email: 'bob.dash@example.com',
      password: 'Password123!',
    });
    token2 = generateToken(user2._id);
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  // 1. Authentication Protection across all Phase 6 Endpoints
  it('1. Rejects unauthenticated requests across all dashboard and notification endpoints with 401', async () => {
    const endpoints = [
      { method: 'GET', path: '/api/dashboard/overview' },
      { method: 'GET', path: '/api/dashboard/career-readiness' },
      { method: 'GET', path: '/api/dashboard/skill-intelligence' },
      { method: 'GET', path: '/api/dashboard/analytics' },
      { method: 'GET', path: '/api/dashboard/recommendations' },
      { method: 'GET', path: '/api/dashboard/activities' },
      { method: 'GET', path: '/api/notifications' },
      { method: 'PATCH', path: '/api/notifications/read-all' },
    ];

    for (const ep of endpoints) {
      const res = await fetch(`${baseUrl}${ep.path}`, {
        method: ep.method,
      });
      assert.strictEqual(
        res.status,
        401,
        `Expected 401 for unauthenticated ${ep.method} ${ep.path}`
      );
    }
  });

  // 2. Empty State & Missing Data Handling (No Zero Fallacy)
  it('2. Handled missing career data gracefully without treating missing categories as 0% (renormalization rule)', async () => {
    // User 2 has zero resumes, zero job matches, zero interviews, zero roadmaps
    const res = await fetch(`${baseUrl}/api/dashboard/career-readiness`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token2}` },
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);

    const cr = data.careerReadiness;
    assert.strictEqual(cr.overallScore, null, 'Empty profile overall score must be null, not 0%');
    assert.strictEqual(cr.classification, 'Getting Started');
    assert.strictEqual(cr.availableCategoriesCount, 0);
    assert.strictEqual(cr.missingCategories.length, 5);
    assert.ok(cr.calculationExplanation.includes('Complete more career activities'));
  });

  // 3. Complete Dashboard Overview for Populated User Profile
  it('3. Generates complete dashboard overview with real KPIs, career readiness, and recommendations', async () => {
    // Seed Phase 2 Resume for User 1
    const resume1 = await Resume.create({
      user: user1._id,
      originalFileName: 'Alice_Resume.pdf',
      storedFileName: 'stored_alice.pdf',
      filePath: './uploads/resumes/alice.pdf',
      fileSize: 1048576,
      mimeType: 'application/pdf',
      rawText: 'React, Node.js, MongoDB, Express, JavaScript, Docker, AWS',
      parsedData: {
        personalInfo: { fullName: 'Alice Candidate', email: 'alice.dash@example.com' },
        skills: {
          programmingLanguages: ['JavaScript', 'Python'],
          frameworks: ['React', 'Node.js', 'Express'],
          databases: ['MongoDB'],
          tools: ['Docker', 'Git'],
          other: ['RESTful APIs'],
        },
      },
    });

    // Seed Phase 3 Resume Analysis (overall score 80)
    const analysis1 = await ResumeAnalysis.create({
      user: user1._id,
      resume: resume1._id,
      targetRole: 'Full Stack Developer',
      overallScore: 80,
      categoryScores: {
        technicalSkills: { score: 24, maxScore: 30, feedback: 'Strong tech stack.' },
        projects: { score: 20, maxScore: 25, feedback: 'Good project descriptions.' },
        experience: { score: 12, maxScore: 20, feedback: 'Solid entry level.' },
        education: { score: 14, maxScore: 15, feedback: 'Relevant degree.' },
        certifications: { score: 5, maxScore: 5, feedback: 'AWS certified.' },
        completeness: { score: 5, maxScore: 5, feedback: 'Complete structure.' },
      },
      strengths: ['Strong full stack coverage'],
      weaknesses: ['Add TypeScript'],
      missingSkills: [
        { skill: 'TypeScript', priority: 'High', reason: 'Commonly required in modern web roles' },
      ],
    });

    // Seed Phase 4 Job Description & Job Match (overall score 85)
    const job1 = await JobDescription.create({
      user: user1._id,
      companyName: 'Acme Cloud',
      jobTitle: 'Full Stack Engineer',
      jobDescription: 'Looking for a full stack engineer skilled in React, Node, and TypeScript.',
      extractedRequirements: {
        requiredSkills: ['React', 'Node.js', 'TypeScript'],
        preferredSkills: ['Docker'],
      },
    });

    const match1 = await JobMatch.create({
      user: user1._id,
      resume: resume1._id,
      job: job1._id,
      companyName: 'Acme Cloud',
      jobTitle: 'Full Stack Engineer',
      overallScore: 85,
      matchClassification: 'Strong Match',
      categoryScores: {
        technicalSkills: { score: 85, weightedScore: 30, weightPercentage: 35 },
        projectsRelevance: { score: 80, weightedScore: 20, weightPercentage: 25 },
        educationCompatibility: { score: 90, weightedScore: 13.5, weightPercentage: 15 },
        experienceInternships: { score: 80, weightedScore: 12, weightPercentage: 15 },
        preferredSkills: { score: 100, weightedScore: 10, weightPercentage: 10 },
      },
      matchedSkills: [
        { skill: 'React', matchType: 'exact' },
        { skill: 'Node.js', matchType: 'exact' },
      ],
      missingRequiredSkills: [
        {
          skill: 'TypeScript',
          priority: 'High',
          isRequired: true,
          reason: 'Listed as core requirement',
          suggestedLearningDirection: 'Learn TypeScript generics and interfaces',
        },
      ],
    });

    // Seed Phase 4 Learning Roadmap (50% progress)
    const roadmap1 = await LearningRoadmap.create({
      user: user1._id,
      resume: resume1._id,
      job: job1._id,
      title: 'Full Stack 4-Week Mastery',
      targetRole: 'Full Stack Engineer',
      totalWeeks: 4,
      progressPercentage: 50,
      items: [
        { weekNumber: 1, title: 'TypeScript Foundations', learningObjective: 'Master TypeScript basics', skillToLearn: 'TypeScript', completed: true, completedAt: new Date() },
        { weekNumber: 2, title: 'Advanced React with TS', learningObjective: 'Apply TS to React', skillToLearn: 'React Hooks', completed: true, completedAt: new Date() },
        { weekNumber: 3, title: 'Backend NestJS / Node', learningObjective: 'Build backend APIs with TS', skillToLearn: 'NestJS', completed: false },
        { weekNumber: 4, title: 'Cloud Deployment Docker', learningObjective: 'Containerize full stack app', skillToLearn: 'Docker', completed: false },
      ],
    });

    // Seed Phase 5 Completed Mock Interview (overall score 90)
    const interview1 = await InterviewSession.create({
      user: user1._id,
      role: 'Full Stack Developer',
      interviewType: 'Technical Interview',
      difficulty: 'Intermediate',
      totalQuestions: 5,
      status: 'completed',
      overallScore: 90,
      performanceLabel: 'Excellent',
      completionPercentage: 100,
      completedAt: new Date(),
      questions: [
        {
          questionId: 'q1',
          questionText: 'Explain the event loop in Node.js.',
          category: 'technical',
          difficulty: 'intermediate',
          order: 1,
          status: 'answered',
          answer: 'The event loop coordinates asynchronous I/O with libuv phases.',
          evaluation: {
            overallScore: 90,
            performanceLabel: 'Excellent',
            criterionScores: { technicalAccuracy: 95, relevance: 90, completeness: 85, clarity: 90 },
            strengths: ['Clear libuv discussion.'],
            weaknesses: [],
          },
        },
      ],
      performanceBreakdown: {
        technicalAccuracy: 95,
        relevance: 90,
        completeness: 85,
        clarity: 90,
      },
    });

    // Fetch Dashboard Overview for User 1
    const overviewRes = await fetch(`${baseUrl}/api/dashboard/overview`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token1}` },
    });

    assert.strictEqual(overviewRes.status, 200);
    const overviewData = await overviewRes.json();
    assert.strictEqual(overviewData.success, true);

    // Verify statistics match actual records
    const stats = overviewData.stats;
    assert.strictEqual(stats.totalResumes, 1);
    assert.strictEqual(stats.hasResume, true);
    assert.strictEqual(stats.resumeFileName, 'Alice_Resume.pdf');
    assert.strictEqual(stats.totalJobMatches, 1);
    assert.strictEqual(stats.totalInterviews, 1);
    assert.strictEqual(stats.completedInterviews, 1);
    assert.strictEqual(stats.averageInterviewScore, 90);
    assert.strictEqual(stats.roadmapProgress, 50);
    assert.strictEqual(stats.latestResumeScore, 80);

    // Verify Career Readiness calculation across all 5 active pillars
    const cr = overviewData.careerReadiness;
    assert.ok(cr.overallScore >= 75 && cr.overallScore <= 95, `Expected score between 75 and 95, got ${cr.overallScore}`);
    assert.strictEqual(cr.availableCategoriesCount, 5);
    assert.strictEqual(cr.missingCategories.length, 0);
    assert.strictEqual(cr.isFullyEvaluated, true);

    // Verify Recommendations exist
    assert.ok(overviewData.recommendations.length > 0);
    // Should prioritize missing TypeScript or completing remaining roadmap items
    const hasTypeScriptOrRoadmap = overviewData.recommendations.some(
      (r) => r.title.includes('TypeScript') || r.title.includes('Week') || r.type === 'Learning Roadmap'
    );
    assert.strictEqual(hasTypeScriptOrRoadmap, true);

    // Verify Recent Activities
    assert.ok(overviewData.recentActivities.length >= 3);
  });

  // 4. Unified Skill Intelligence Aggregation & Deduplication
  it('4. Gathers skills across resume, analysis, job matches, and interviews with evidence and deduplication', async () => {
    const res = await fetch(`${baseUrl}/api/dashboard/skill-intelligence`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token1}` },
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);

    const skills = data.skills;
    assert.ok(skills.strongSkills.length > 0);
    assert.ok(skills.missingRequiredSkills.length > 0);

    // TypeScript must appear in missing required skills
    const tsMissing = skills.missingRequiredSkills.find(
      (s) => s.skillName.toLowerCase() === 'typescript'
    );
    assert.ok(tsMissing, 'TypeScript must be flagged in missing required skills');
    assert.strictEqual(tsMissing.currentStatus, 'Required for Target Job');

    // React and Node must be in strong skills with evidence
    const reactStrong = skills.strongSkills.find(
      (s) => s.skillName.toLowerCase() === 'react'
    );
    assert.ok(reactStrong, 'React must be in strong skills');
  });

  // 5. Time-Series Analytics History
  it('5. Retrieves historical time-series analytics for charts with real timestamps and scores', async () => {
    const res = await fetch(`${baseUrl}/api/dashboard/analytics`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token1}` },
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);

    const { analytics } = data;
    assert.strictEqual(analytics.resumeHistory.length, 1);
    assert.strictEqual(analytics.resumeHistory[0].score, 80);

    assert.strictEqual(analytics.jobMatchHistory.length, 1);
    assert.strictEqual(analytics.jobMatchHistory[0].score, 85);
    assert.strictEqual(analytics.jobMatchHistory[0].company, 'Acme Cloud');

    assert.strictEqual(analytics.interviewHistory.length, 1);
    assert.strictEqual(analytics.interviewHistory[0].score, 90);

    assert.strictEqual(analytics.learningProgress.progressPercentage, 50);
    assert.strictEqual(analytics.learningProgress.totalModules, 4);
    assert.strictEqual(analytics.learningProgress.completedModules, 2);
  });

  // 6. Chronological Activity Feed
  it('6. Returns chronological activity feed sorted strictly in descending timestamp order', async () => {
    const res = await fetch(`${baseUrl}/api/dashboard/activities`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token1}` },
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.activities.length >= 3);

    // Verify descending timestamp order
    for (let i = 0; i < data.activities.length - 1; i++) {
      const current = new Date(data.activities[i].timestamp).getTime();
      const next = new Date(data.activities[i + 1].timestamp).getTime();
      assert.ok(current >= next, 'Activities must be ordered by timestamp descending');
    }
  });

  // 7. In-App Notifications Complete Workflow
  it('7. Handles notifications: listing, unread badge count, mark as read, mark all read, and delete', async () => {
    // Seed 2 notifications for User 1
    const n1 = await Notification.create({
      user: user1._id,
      type: 'resume_upload',
      title: 'Resume Processed',
      message: 'Your resume has been parsed successfully.',
      link: '/dashboard#resume-section',
    });

    const n2 = await Notification.create({
      user: user1._id,
      type: 'job_match',
      title: 'New Job Match Ready',
      message: 'Match generated for Acme Cloud.',
      link: '/job-matching',
    });

    // 7a. Get notifications
    const listRes = await fetch(`${baseUrl}/api/notifications`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token1}` },
    });
    assert.strictEqual(listRes.status, 200);
    const listData = await listRes.json();
    assert.strictEqual(listData.success, true);
    assert.ok(listData.unreadCount >= 2);
    assert.ok(listData.notifications.length >= 2);

    // 7b. Mark single notification as read
    const readRes = await fetch(`${baseUrl}/api/notifications/${n1._id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token1}` },
    });
    assert.strictEqual(readRes.status, 200);
    const readData = await readRes.json();
    assert.strictEqual(readData.notification.isRead, true);

    // 7c. Mark all as read
    const readAllRes = await fetch(`${baseUrl}/api/notifications/read-all`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token1}` },
    });
    assert.strictEqual(readAllRes.status, 200);
    const readAllData = await readAllRes.json();
    assert.strictEqual(readAllData.unreadCount, 0);

    // 7d. Delete notification
    const delRes = await fetch(`${baseUrl}/api/notifications/${n2._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token1}` },
    });
    assert.strictEqual(delRes.status, 200);

    // Confirm n2 is gone
    const checkDeleted = await Notification.findById(n2._id);
    assert.strictEqual(checkDeleted, null);
  });

  // 8. Cross-User Isolation for Dashboard & Notifications
  it('8. Enforces strict user isolation: User B cannot access, read, or delete User A notifications or data', async () => {
    // Notification belonging to User 1
    const user1Notification = await Notification.create({
      user: user1._id,
      type: 'system',
      title: 'Private Alert for User 1',
      message: 'Confidential career readiness update.',
    });

    // User 2 attempts to mark User 1 notification as read -> must return 404
    const markRes = await fetch(`${baseUrl}/api/notifications/${user1Notification._id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token2}` },
    });
    assert.strictEqual(markRes.status, 404);

    // User 2 attempts to delete User 1 notification -> must return 404
    const delRes = await fetch(`${baseUrl}/api/notifications/${user1Notification._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token2}` },
    });
    assert.strictEqual(delRes.status, 404);

    // User 2 fetching overview receives only User 2's own data
    const u2OverviewRes = await fetch(`${baseUrl}/api/dashboard/overview`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token2}` },
    });
    assert.strictEqual(u2OverviewRes.status, 200);
    const u2Data = await u2OverviewRes.json();
    assert.strictEqual(u2Data.user.email, 'bob.dash@example.com');
    assert.strictEqual(u2Data.stats.totalResumes, 0);
    assert.strictEqual(u2Data.stats.totalJobMatches, 0);
  });

  // 9. CORS Preflight & Error Response Headers
  it('9. Verifies CORS preflight OPTIONS and error responses retain CORS headers on dashboard endpoints', async () => {
    // 9a. Preflight OPTIONS
    const preflightRes = await fetch(`${baseUrl}/api/dashboard/overview`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://localhost:5173',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Authorization',
      },
    });
    assert.strictEqual(preflightRes.status, 204);
    assert.strictEqual(
      preflightRes.headers.get('access-control-allow-origin'),
      'http://localhost:5173'
    );
    assert.strictEqual(
      preflightRes.headers.get('access-control-allow-credentials'),
      'true'
    );

    // 9b. Unauthenticated request retains CORS headers
    const unauthRes = await fetch(`${baseUrl}/api/dashboard/overview`, {
      method: 'GET',
      headers: { Origin: 'http://localhost:5173' },
    });
    assert.strictEqual(unauthRes.status, 401);
    assert.strictEqual(
      unauthRes.headers.get('access-control-allow-origin'),
      'http://localhost:5173'
    );
    assert.strictEqual(
      unauthRes.headers.get('access-control-allow-credentials'),
      'true'
    );
  });
});
