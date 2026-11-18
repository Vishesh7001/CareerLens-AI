const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const User = require('../models/User');
const Resume = require('../models/Resume');
const JobDescription = require('../models/JobDescription');
const JobMatch = require('../models/JobMatch');
const CareerRecommendation = require('../models/CareerRecommendation');
const LearningRoadmap = require('../models/LearningRoadmap');
const { generateToken } = require('../services/tokenService');
const { runFallbackJobMatch, normalizeSkill } = require('../services/fallbackJobMatcher');

describe('CareerLens AI - Phase 4 Job Matching & Career Intelligence Suite', () => {
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
    // Ensure offline AI service testing triggers transparent fallback
    process.env.AI_SERVICE_URL = 'http://127.0.0.1:59998';

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
    await JobMatch.deleteMany({});
    await CareerRecommendation.deleteMany({});
    await LearningRoadmap.deleteMany({});

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
      originalFileName: 'Aarav_Patel_Resume.pdf',
      storedFileName: 'test_aarav_resume.pdf',
      filePath: 'C:/fake/path/test_aarav_resume.pdf',
      fileSize: 48000,
      mimeType: 'application/pdf',
      rawText: 'Aarav Patel. Skills: React, Node.js, Express, MongoDB, JavaScript, TypeScript, Git, Docker, RESTful APIs. Experience: Software Engineer Intern at InnovateTech. Projects: Full-Stack E-Commerce Platform with React and Node.js. Education: B.Tech Computer Science.',
      parsedData: {
        personalInfo: {
          fullName: 'Aarav Patel',
          email: 'aarav.patel@example.com',
          phone: '+91 98765 43210',
          location: 'Pune, India',
        },
        skills: {
          programmingLanguages: ['JavaScript', 'TypeScript', 'Python'],
          frameworks: ['React', 'Node.js', 'Express.js', 'Tailwind CSS'],
          databases: ['MongoDB', 'PostgreSQL'],
          tools: ['Git', 'Docker', 'Postman'],
          other: ['RESTful APIs'],
        },
        education: [
          {
            institution: 'Pune Institute of Computer Technology',
            degree: 'B.Tech',
            specialization: 'Computer Engineering',
            graduationYear: '2024',
          },
        ],
        experience: [
          {
            company: 'InnovateTech Solutions',
            position: 'Full Stack Developer Intern',
            duration: 'Jan 2024 - Jun 2024',
            description: 'Developed React web applications and built REST APIs with Node.js and Express.',
          },
        ],
        projects: [
          {
            title: 'E-Commerce Platform',
            technologies: ['React', 'Node.js', 'MongoDB'],
            description: 'Full-featured online store with product catalog, cart, and authentication.',
            link: 'https://github.com/aarav/ecommerce',
          },
        ],
      },
      parsingStatus: 'completed',
    });
  });

  // 1. Authentication & Security
  it('1. Rejects unauthenticated requests across Phase 4 endpoints with 401', async () => {
    const endpoints = [
      { method: 'POST', url: `${baseUrl}/api/jobs` },
      { method: 'GET', url: `${baseUrl}/api/jobs` },
      { method: 'POST', url: `${baseUrl}/api/jobs/fake-id/match` },
      { method: 'POST', url: `${baseUrl}/api/career/recommendations` },
      { method: 'POST', url: `${baseUrl}/api/roadmaps` },
    ];

    for (const ep of endpoints) {
      const res = await fetch(ep.url, { method: ep.method });
      assert.strictEqual(res.status, 401, `Expected 401 for ${ep.method} ${ep.url}`);
    }
  });

  // 2. Input Validation
  it('2. Rejects invalid job creation inputs with 400', async () => {
    // Missing title
    const res1 = await fetch(`${baseUrl}/api/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({ companyName: 'Google', jobDescription: 'Valid job description here' }),
    });
    assert.strictEqual(res1.status, 400);

    // Missing company name
    const res2 = await fetch(`${baseUrl}/api/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({ jobTitle: 'Developer', jobDescription: 'Valid job description here' }),
    });
    assert.strictEqual(res2.status, 400);

    // Too short job description
    const res3 = await fetch(`${baseUrl}/api/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({ companyName: 'Google', jobTitle: 'Developer', jobDescription: 'Short' }),
    });
    assert.strictEqual(res3.status, 400);
  });

  // 3. Job Description CRUD
  it('3. Successfully creates, retrieves, updates, and deletes a job description', async () => {
    // Create Job
    const createRes = await fetch(`${baseUrl}/api/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({
        companyName: 'Razorpay',
        jobTitle: 'Junior Full Stack Engineer',
        jobDescription: 'Seeking a Full Stack Engineer with proficiency in React, Node.js, Express, and MongoDB. Preferred: Docker, AWS.',
        jobType: 'Full-time',
        location: 'Bangalore, India',
      }),
    });
    const createData = await createRes.json();
    assert.strictEqual(createRes.status, 201);
    assert.strictEqual(createData.success, true);
    assert.ok(createData.job._id);
    const jobId = createData.job._id;

    // Verify extracted requirements exist
    assert.ok(createData.job.extractedRequirements);
    assert.ok(Array.isArray(createData.job.extractedRequirements.requiredSkills));

    // Get all jobs
    const listRes = await fetch(`${baseUrl}/api/jobs`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token1}` },
    });
    const listData = await listRes.json();
    assert.strictEqual(listRes.status, 200);
    assert.strictEqual(listData.count, 1);

    // Get single job by ID
    const getRes = await fetch(`${baseUrl}/api/jobs/${jobId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token1}` },
    });
    const getData = await getRes.json();
    assert.strictEqual(getRes.status, 200);
    assert.strictEqual(getData.job.companyName, 'Razorpay');

    // Update job
    const updateRes = await fetch(`${baseUrl}/api/jobs/${jobId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({
        jobTitle: 'Senior Full Stack Engineer',
        location: 'Remote, India',
      }),
    });
    const updateData = await updateRes.json();
    assert.strictEqual(updateRes.status, 200);
    assert.strictEqual(updateData.job.jobTitle, 'Senior Full Stack Engineer');
    assert.strictEqual(updateData.job.location, 'Remote, India');

    // Delete job
    const delRes = await fetch(`${baseUrl}/api/jobs/${jobId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token1}` },
    });
    assert.strictEqual(delRes.status, 200);

    // Subsequent get should 404
    const getAgainRes = await fetch(`${baseUrl}/api/jobs/${jobId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token1}` },
    });
    assert.strictEqual(getAgainRes.status, 404);
  });

  // 4. Cross-User Isolation on Jobs
  it('4. User B cannot view, update, or delete User A\'s job description (returns 404)', async () => {
    // Create job as User 1
    const createRes = await fetch(`${baseUrl}/api/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({
        companyName: 'PrivateCorp',
        jobTitle: 'Security Specialist',
        jobDescription: 'Confidential role for internal security audits.',
      }),
    });
    const { job } = await createRes.json();

    // User 2 tries to GET
    const getRes = await fetch(`${baseUrl}/api/jobs/${job._id}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token2}` },
    });
    assert.strictEqual(getRes.status, 404);

    // User 2 tries to PUT
    const putRes = await fetch(`${baseUrl}/api/jobs/${job._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token2}` },
      body: JSON.stringify({ jobTitle: 'Hacked Title' }),
    });
    assert.strictEqual(putRes.status, 404);

    // User 2 tries to DELETE
    const delRes = await fetch(`${baseUrl}/api/jobs/${job._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token2}` },
    });
    assert.strictEqual(delRes.status, 404);
  });

  // 5. Intelligent Job Matching
  it('5. Successfully runs job matching using 35/25/15/15/10 rubric and skill gap analysis', async () => {
    // Create Job
    const createRes = await fetch(`${baseUrl}/api/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({
        companyName: 'TechNext Systems',
        jobTitle: 'Full Stack Software Engineer',
        jobDescription: 'Requirements: JavaScript, React, Node.js, Express, MongoDB. Preferred: Docker, AWS, GraphQL. Experience: Fresher / 0-2 years.',
      }),
    });
    const { job } = await createRes.json();

    // Match with resume
    const matchRes = await fetch(`${baseUrl}/api/jobs/${job._id}/match`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token1}` },
    });
    const matchData = await matchRes.json();
    assert.strictEqual(matchRes.status, 200);
    assert.strictEqual(matchData.success, true);
    assert.ok(matchData.match);

    const { match } = matchData;
    assert.strictEqual(typeof match.overallScore, 'number');
    assert.ok(match.overallScore >= 0 && match.overallScore <= 100);
    assert.ok(['Excellent Match', 'Strong Match', 'Moderate Match', 'Low Match'].includes(match.matchClassification));

    // Verify category score weights strictly adhere to prompt Section 5
    const { categoryScores } = match;
    assert.strictEqual(categoryScores.technicalSkills.weightPercentage, 35);
    assert.strictEqual(categoryScores.projectsRelevance.weightPercentage, 25);
    assert.strictEqual(categoryScores.educationCompatibility.weightPercentage, 15);
    assert.strictEqual(categoryScores.experienceInternships.weightPercentage, 15);
    assert.strictEqual(categoryScores.preferredSkills.weightPercentage, 10);

    // Verify skill gap analysis sections
    assert.ok(Array.isArray(match.matchedSkills));
    assert.ok(match.matchedSkills.length > 0);
    assert.ok(Array.isArray(match.missingRequiredSkills));
    assert.ok(Array.isArray(match.missingPreferredSkills));

    // Transparent provider check (since port 59998 is offline, fallback is transparently used)
    assert.strictEqual(match.analysisProvider, 'rule-based-fallback');
  });

  // 6. User without resume gets 400 on matching
  it('6. Rejects job matching with 400 if authenticated user has not uploaded a resume', async () => {
    // User 2 has no resume
    const createRes = await fetch(`${baseUrl}/api/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token2}` },
      body: JSON.stringify({
        companyName: 'CompanyX',
        jobTitle: 'Developer',
        jobDescription: 'Developer position needing skills.',
      }),
    });
    const { job } = await createRes.json();

    const matchRes = await fetch(`${baseUrl}/api/jobs/${job._id}/match`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token2}` },
    });
    const matchData = await matchRes.json();
    assert.strictEqual(matchRes.status, 400);
    assert.match(matchData.message, /upload a resume first/i);
  });

  // 7. Career Recommendations Engine
  it('7. Generates primary and alternative career path recommendations for students', async () => {
    const res = await fetch(`${baseUrl}/api/career/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({ targetRole: 'Full Stack Developer' }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.recommendations);

    const { recommendations } = data;
    assert.strictEqual(recommendations.primaryRecommendations.length, 3);
    assert.strictEqual(recommendations.alternativeRecommendations.length, 3);
    assert.ok(recommendations.studentAdvice.length > 0);

    const firstPrimary = recommendations.primaryRecommendations[0];
    assert.ok(firstPrimary.role);
    assert.ok(firstPrimary.whyRecommended);
    assert.ok(Array.isArray(firstPrimary.suggestedProjects));
  });

  // 8. Personalized Learning Roadmap & Progress Tracking
  it('8. Creates learning roadmap, updates weekly completion, and tracks progress percentage', async () => {
    // Create Job first
    const createRes = await fetch(`${baseUrl}/api/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({
        companyName: 'DevCorp',
        jobTitle: 'Junior Backend Engineer',
        jobDescription: 'Backend engineer role requiring Node.js, Docker, Kubernetes, AWS, and Microservices.',
      }),
    });
    const { job } = await createRes.json();

    // Generate Roadmap
    const roadmapRes = await fetch(`${baseUrl}/api/roadmaps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({
        jobId: job._id,
        durationWeeks: 4,
      }),
    });
    const roadmapData = await roadmapRes.json();
    assert.strictEqual(roadmapRes.status, 201);
    assert.strictEqual(roadmapData.success, true);
    assert.ok(roadmapData.roadmap);

    const roadmapId = roadmapData.roadmap._id;
    assert.strictEqual(roadmapData.roadmap.totalWeeks, 4);
    assert.strictEqual(roadmapData.roadmap.items.length, 4);
    assert.strictEqual(roadmapData.roadmap.progressPercentage, 0);

    // Update progress: Complete Week 1 (1/4 = 25%)
    const progressRes1 = await fetch(`${baseUrl}/api/roadmaps/${roadmapId}/progress`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({
        weekNumber: 1,
        completed: true,
      }),
    });
    const progressData1 = await progressRes1.json();
    assert.strictEqual(progressRes1.status, 200);
    assert.strictEqual(progressData1.roadmap.items[0].completed, true);
    assert.strictEqual(progressData1.roadmap.progressPercentage, 25);

    // Complete Week 2 (2/4 = 50%)
    const progressRes2 = await fetch(`${baseUrl}/api/roadmaps/${roadmapId}/progress`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({ weekNumber: 2, completed: true }),
    });
    const progressData2 = await progressRes2.json();
    assert.strictEqual(progressRes2.status, 200);
    assert.strictEqual(progressData2.roadmap.items[1].completed, true);
    assert.strictEqual(progressData2.roadmap.progressPercentage, 50);

    // Complete Week 3 (3/4 = 75%)
    const progressRes3 = await fetch(`${baseUrl}/api/roadmaps/${roadmapId}/progress`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({ weekNumber: 3, completed: true }),
    });
    const progressData3 = await progressRes3.json();
    assert.strictEqual(progressRes3.status, 200);
    assert.strictEqual(progressData3.roadmap.items[2].completed, true);
    assert.strictEqual(progressData3.roadmap.progressPercentage, 75);

    // Complete Week 4 (4/4 = 100%)
    const progressRes4 = await fetch(`${baseUrl}/api/roadmaps/${roadmapId}/progress`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({ weekNumber: 4, completed: true }),
    });
    const progressData4 = await progressRes4.json();
    assert.strictEqual(progressRes4.status, 200);
    assert.strictEqual(progressData4.roadmap.items[3].completed, true);
    assert.strictEqual(progressData4.roadmap.progressPercentage, 100);

    // Uncheck Week 2 (marking incomplete decreases progress to 3/4 = 75%)
    const uncheckRes2 = await fetch(`${baseUrl}/api/roadmaps/${roadmapId}/progress`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({ weekNumber: 2, completed: false }),
    });
    const uncheckData2 = await uncheckRes2.json();
    assert.strictEqual(uncheckRes2.status, 200);
    assert.strictEqual(uncheckData2.roadmap.items[1].completed, false);
    assert.strictEqual(uncheckData2.roadmap.items[1].completedAt, null);
    assert.strictEqual(uncheckData2.roadmap.progressPercentage, 75);

    // Uncheck Week 4 (decreases to 2/4 = 50%)
    const uncheckRes4 = await fetch(`${baseUrl}/api/roadmaps/${roadmapId}/progress`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({ weekNumber: 4, completed: false }),
    });
    const uncheckData4 = await uncheckRes4.json();
    assert.strictEqual(uncheckRes4.status, 200);
    assert.strictEqual(uncheckData4.roadmap.progressPercentage, 50);

    // Verify MongoDB Persistence across direct database fetch
    const persistedRoadmap = await LearningRoadmap.findById(roadmapId);
    assert.strictEqual(persistedRoadmap.progressPercentage, 50);
    assert.strictEqual(persistedRoadmap.items[0].completed, true);
    assert.strictEqual(persistedRoadmap.items[1].completed, false);
    assert.strictEqual(persistedRoadmap.items[2].completed, true);
    assert.strictEqual(persistedRoadmap.items[3].completed, false);

    // Verify GET /api/roadmaps returns user roadmaps with saved progress
    const listRoadmapsRes = await fetch(`${baseUrl}/api/roadmaps`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token1}` },
    });
    const listRoadmapsData = await listRoadmapsRes.json();
    assert.strictEqual(listRoadmapsRes.status, 200);
    assert.strictEqual(listRoadmapsData.count, 1);
    assert.strictEqual(listRoadmapsData.roadmap.progressPercentage, 50);

    // Verify GET /api/roadmaps/:roadmapId
    const getRoadmapRes = await fetch(`${baseUrl}/api/roadmaps/${roadmapId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token1}` },
    });
    const getRoadmapData = await getRoadmapRes.json();
    assert.strictEqual(getRoadmapRes.status, 200);
    assert.strictEqual(getRoadmapData.roadmap.progressPercentage, 50);

    // Input Validation: non-numeric weekNumber returns 400
    const invalidWeekRes = await fetch(`${baseUrl}/api/roadmaps/${roadmapId}/progress`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({ weekNumber: 'not-a-number', completed: true }),
    });
    assert.strictEqual(invalidWeekRes.status, 400);

    // Input Validation: non-existent week returns 404
    const notFoundWeekRes = await fetch(`${baseUrl}/api/roadmaps/${roadmapId}/progress`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({ weekNumber: 99, completed: true }),
    });
    assert.strictEqual(notFoundWeekRes.status, 404);

    // User B cannot update User A's roadmap (isolation check)
    const user2ProgressRes = await fetch(`${baseUrl}/api/roadmaps/${roadmapId}/progress`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token2}` },
      body: JSON.stringify({ weekNumber: 2, completed: true }),
    });
    assert.strictEqual(user2ProgressRes.status, 404);
  });

  // 9. Test 13: Fallback matcher uses identical normalized matching semantics
  it('9. Test 13: Fallback matcher uses identical normalized matching semantics (JS, React, Node, Express, Mongo, Git)', () => {
    // Normalization verification
    assert.strictEqual(normalizeSkill('JS'), 'javascript');
    assert.strictEqual(normalizeSkill('React.js'), 'react');
    assert.strictEqual(normalizeSkill('Node'), 'node.js');
    assert.strictEqual(normalizeSkill('Express'), 'express.js');
    assert.strictEqual(normalizeSkill('Mongo'), 'mongodb');
    assert.strictEqual(normalizeSkill('Git version control'), 'git');

    // Matching verification
    const sampleResume = {
      skills: {
        programmingLanguages: ['JavaScript', 'TypeScript', 'Python', 'HTML5', 'CSS3'],
        frameworks: ['React', 'Node.js', 'Express.js'],
        databases: ['MongoDB', 'PostgreSQL'],
        tools: ['Git', 'Docker'],
      },
    };

    const fallbackResult = runFallbackJobMatch(
      sampleResume,
      'Seeking a full stack developer with JS, React.js, Node, Express, Mongo, Git version control. Preferred: AWS.',
      'Software Developer',
      'TestCorp',
      {
        requiredSkills: ['JavaScript', 'React.js', 'Node', 'Express', 'Mongo', 'Git version control'],
        preferredSkills: ['AWS'],
      }
    );

    assert.strictEqual(fallbackResult.matchedSkills.length, 6);
    assert.strictEqual(fallbackResult.missingRequiredSkills.length, 0);
    assert.strictEqual(fallbackResult.missingPreferredSkills.length, 1);
    assert.strictEqual(fallbackResult.missingPreferredSkills[0].skill, 'AWS');
    assert.strictEqual(fallbackResult.categoryScores.technicalSkills.weightPercentage, 35);
    assert.strictEqual(fallbackResult.categoryScores.technicalSkills.score, 100);
    assert.strictEqual(fallbackResult.categoryScores.technicalSkills.weightedScore, 35);
  });

  // 10. Test 14: User isolation prevents unauthorized access to match results and matching execution
  it('10. Test 14: Existing user isolation and authorization remain intact across match endpoints', async () => {
    // User 1 creates job
    const createRes = await fetch(`${baseUrl}/api/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({
        companyName: 'PrivateJobCorp',
        jobTitle: 'Secret Developer',
        jobDescription: 'High security role requiring JavaScript and Git.',
      }),
    });
    const { job } = await createRes.json();

    // User 1 runs matching successfully
    const matchRes1 = await fetch(`${baseUrl}/api/jobs/${job._id}/match`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token1}` },
    });
    assert.strictEqual(matchRes1.status, 200);

    // User 2 tries to trigger matching on User 1's job -> 404
    const matchRes2 = await fetch(`${baseUrl}/api/jobs/${job._id}/match`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token2}` },
    });
    assert.strictEqual(matchRes2.status, 404);

    // User 2 tries to get matches for User 1's job -> count 0 (filtered by user)
    const getMatchesRes2 = await fetch(`${baseUrl}/api/jobs/${job._id}/matches`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token2}` },
    });
    const getMatchesData2 = await getMatchesRes2.json();
    assert.strictEqual(getMatchesRes2.status, 200);
    assert.strictEqual(getMatchesData2.count, 0);
  });

  // 11. CORS Preflight & PATCH Progress Requests with Origin, Credentials, and Error Responses
  it('11. Verifies CORS preflight OPTIONS and actual PATCH requests for roadmap progress, credentials, and error headers', async () => {
    // 1. Create Job and Roadmap for User 1
    const createRes = await fetch(`${baseUrl}/api/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({
        jobTitle: 'Cloud DevOps Engineer',
        companyName: 'Cloud Corp',
        jobDescription: 'Seeking DevOps engineer with Docker, Kubernetes, AWS, CI/CD pipelines.',
      }),
    });
    assert.strictEqual(createRes.status, 201);
    const { job } = await createRes.json();

    const roadmapRes = await fetch(`${baseUrl}/api/roadmaps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({
        jobId: job._id,
        durationWeeks: 4,
      }),
    });
    assert.strictEqual(roadmapRes.status, 201);
    const roadmapData = await roadmapRes.json();
    const roadmapId = roadmapData.roadmap._id;

    // 2. Preflight OPTIONS request from http://localhost:5173
    const preflightRes = await fetch(`${baseUrl}/api/roadmaps/${roadmapId}/progress`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://localhost:5173',
        'Access-Control-Request-Method': 'PATCH',
        'Access-Control-Request-Headers': 'Content-Type,Authorization',
      },
    });

    assert.strictEqual(preflightRes.status, 204, 'Preflight OPTIONS should return 204');
    assert.strictEqual(preflightRes.headers.get('access-control-allow-origin'), 'http://localhost:5173');
    assert.strictEqual(preflightRes.headers.get('access-control-allow-credentials'), 'true');
    const allowMethods = preflightRes.headers.get('access-control-allow-methods') || '';
    assert.ok(allowMethods.includes('PATCH'), `Allowed methods must include PATCH: ${allowMethods}`);
    assert.ok(allowMethods.includes('GET'), `Allowed methods must include GET: ${allowMethods}`);
    assert.ok(allowMethods.includes('POST'), `Allowed methods must include POST: ${allowMethods}`);
    const allowHeaders = preflightRes.headers.get('access-control-allow-headers') || '';
    assert.ok(
      allowHeaders.toLowerCase().includes('content-type'),
      `Allowed headers must include Content-Type: ${allowHeaders}`
    );

    // 3. Actual PATCH request with Bearer token from http://localhost:5173
    const patchRes1 = await fetch(`${baseUrl}/api/roadmaps/${roadmapId}/progress`, {
      method: 'PATCH',
      headers: {
        Origin: 'http://localhost:5173',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token1}`,
      },
      body: JSON.stringify({ weekNumber: 1, completed: true }),
    });

    assert.strictEqual(patchRes1.status, 200);
    assert.strictEqual(patchRes1.headers.get('access-control-allow-origin'), 'http://localhost:5173');
    assert.strictEqual(patchRes1.headers.get('access-control-allow-credentials'), 'true');
    const patchData1 = await patchRes1.json();
    assert.strictEqual(patchData1.success, true);
    assert.strictEqual(patchData1.roadmap.items[0].completed, true);
    assert.strictEqual(patchData1.roadmap.progressPercentage, 25);

    // 4. Actual PATCH request using HTTP-only cookie credentials
    const patchResCookie = await fetch(`${baseUrl}/api/roadmaps/${roadmapId}/progress`, {
      method: 'PATCH',
      headers: {
        Origin: 'http://localhost:5173',
        'Content-Type': 'application/json',
        Cookie: `token=${token1}`,
      },
      body: JSON.stringify({ weekNumber: 2, completed: true }),
    });

    assert.strictEqual(patchResCookie.status, 200);
    assert.strictEqual(patchResCookie.headers.get('access-control-allow-origin'), 'http://localhost:5173');
    assert.strictEqual(patchResCookie.headers.get('access-control-allow-credentials'), 'true');
    const patchDataCookie = await patchResCookie.json();
    assert.strictEqual(patchDataCookie.success, true);
    assert.strictEqual(patchDataCookie.roadmap.items[1].completed, true);
    assert.strictEqual(patchDataCookie.roadmap.progressPercentage, 50);

    // 5. Unauthenticated PATCH returns 401 WITH proper CORS headers
    const unauthPatchRes = await fetch(`${baseUrl}/api/roadmaps/${roadmapId}/progress`, {
      method: 'PATCH',
      headers: {
        Origin: 'http://localhost:5173',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ weekNumber: 3, completed: true }),
    });

    assert.strictEqual(unauthPatchRes.status, 401);
    assert.strictEqual(
      unauthPatchRes.headers.get('access-control-allow-origin'),
      'http://localhost:5173',
      '401 Auth error response must include CORS allow-origin header'
    );
    assert.strictEqual(
      unauthPatchRes.headers.get('access-control-allow-credentials'),
      'true',
      '401 Auth error response must include CORS allow-credentials header'
    );

    // 6. Preflight OPTIONS from http://127.0.0.1:5173
    const preflight127Res = await fetch(`${baseUrl}/api/roadmaps/${roadmapId}/progress`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://127.0.0.1:5173',
        'Access-Control-Request-Method': 'PATCH',
      },
    });

    assert.strictEqual(preflight127Res.status, 204);
    assert.strictEqual(preflight127Res.headers.get('access-control-allow-origin'), 'http://127.0.0.1:5173');
    assert.strictEqual(preflight127Res.headers.get('access-control-allow-credentials'), 'true');

    // 7. Request from unauthorized origin is denied
    const unauthorizedOriginRes = await fetch(`${baseUrl}/api/roadmaps/${roadmapId}/progress`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://malicious-site.example.com',
        'Access-Control-Request-Method': 'PATCH',
      },
    });
    assert.notStrictEqual(
      unauthorizedOriginRes.headers.get('access-control-allow-origin'),
      'http://malicious-site.example.com',
      'Unauthorized origin must not receive allow-origin header'
    );
  });

  // 12. Role-Specific Learning Roadmaps: Generation, Isolation & Independent Progress
  it('12. Generates role-specific roadmaps for Full Stack, Backend, and Software Developer, verifies separate retrieval and progress isolation', async () => {
    // 1. Generate Full Stack Developer roadmap
    const fsRes = await fetch(`${baseUrl}/api/roadmaps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({
        targetRole: 'Full Stack Developer',
        durationWeeks: 4,
      }),
    });
    assert.strictEqual(fsRes.status, 201);
    const fsData = await fsRes.json();
    assert.strictEqual(fsData.success, true);
    assert.strictEqual(fsData.roadmap.targetRole, 'Full Stack Developer');
    const fsId = fsData.roadmap._id;

    // 2. Generate Backend Developer roadmap
    const beRes = await fetch(`${baseUrl}/api/roadmaps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({
        targetRole: 'Backend Developer',
        durationWeeks: 4,
      }),
    });
    assert.strictEqual(beRes.status, 201);
    const beData = await beRes.json();
    assert.strictEqual(beData.success, true);
    assert.strictEqual(beData.roadmap.targetRole, 'Backend Developer');
    const beId = beData.roadmap._id;

    // 3. Generate Software Developer roadmap
    const swRes = await fetch(`${baseUrl}/api/roadmaps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({
        targetRole: 'Software Developer',
        durationWeeks: 4,
      }),
    });
    assert.strictEqual(swRes.status, 201);
    const swData = await swRes.json();
    assert.strictEqual(swData.success, true);
    assert.strictEqual(swData.roadmap.targetRole, 'Software Developer');
    const swId = swData.roadmap._id;

    // 4. Verify all 3 have distinct IDs
    assert.notStrictEqual(fsId, beId, 'Full Stack and Backend IDs must differ');
    assert.notStrictEqual(beId, swId, 'Backend and Software Developer IDs must differ');
    assert.notStrictEqual(fsId, swId, 'Full Stack and Software Developer IDs must differ');

    // 5. Query specifically by role using GET /api/roadmaps?role=Backend%20Developer
    const queryBeRes = await fetch(`${baseUrl}/api/roadmaps?role=Backend%20Developer`, {
      headers: { Authorization: `Bearer ${token1}` },
    });
    assert.strictEqual(queryBeRes.status, 200);
    const queryBeData = await queryBeRes.json();
    assert.strictEqual(queryBeData.roadmap.targetRole, 'Backend Developer');
    assert.strictEqual(queryBeData.roadmap._id, beId);

    // 6. Query specifically by role using GET /api/roadmaps/role/:role
    const roleSwRes = await fetch(`${baseUrl}/api/roadmaps/role/Software%20Developer`, {
      headers: { Authorization: `Bearer ${token1}` },
    });
    assert.strictEqual(roleSwRes.status, 200);
    const roleSwData = await roleSwRes.json();
    assert.strictEqual(roleSwData.roadmap.targetRole, 'Software Developer');
    assert.strictEqual(roleSwData.roadmap._id, swId);

    // 7. Complete Week 1 in Backend Developer
    const patchBeRes = await fetch(`${baseUrl}/api/roadmaps/${beId}/progress`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({ weekNumber: 1, completed: true }),
    });
    assert.strictEqual(patchBeRes.status, 200);
    const patchBeData = await patchBeRes.json();
    assert.strictEqual(patchBeData.roadmap.progressPercentage, 25);
    assert.strictEqual(patchBeData.roadmap.items[0].completed, true);

    // 8. Verify Full Stack Developer and Software Developer roadmaps have NOT been modified (0%)
    const checkFsRes = await fetch(`${baseUrl}/api/roadmaps/role/Full%20Stack%20Developer`, {
      headers: { Authorization: `Bearer ${token1}` },
    });
    const checkFsData = await checkFsRes.json();
    assert.strictEqual(checkFsData.roadmap.progressPercentage, 0, 'Full Stack Developer progress must remain 0%');
    assert.strictEqual(checkFsData.roadmap.items[0].completed, false);

    const checkSwRes = await fetch(`${baseUrl}/api/roadmaps/role/Software%20Developer`, {
      headers: { Authorization: `Bearer ${token1}` },
    });
    const checkSwData = await checkSwRes.json();
    assert.strictEqual(checkSwData.roadmap.progressPercentage, 0, 'Software Developer progress must remain 0%');
    assert.strictEqual(checkSwData.roadmap.items[0].completed, false);

    // 9. Verify User B cannot access User A's role roadmap
    const user2RoleRes = await fetch(`${baseUrl}/api/roadmaps/role/Backend%20Developer`, {
      headers: { Authorization: `Bearer ${token2}` },
    });
    assert.strictEqual(user2RoleRes.status, 404, 'User B must not access User A role roadmap');
  });
});
