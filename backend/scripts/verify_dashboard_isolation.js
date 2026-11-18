/**
 * End-to-End Verification Script: Dashboard User Data Isolation
 * Verifies that CareerLens AI dashboard statistics are strictly personalized and isolated.
 */

const { createSimplePdf } = require('../tests/helpers/pdfHelper');

const BASE_URL = 'http://localhost:5000';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = options.headers || {};
  let body = options.body;

  if (body && typeof body === 'object' && !(body instanceof FormData) && !(body instanceof Buffer)) {
    body = JSON.stringify(body);
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body,
  });

  const contentType = res.headers.get('content-type') || '';
  let data = null;
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  return { status: res.status, headers: res.headers, data };
}

async function runIsolationAudit() {
  console.log('================================================================');
  console.log('CareerLens AI – Dashboard Personalization & Isolation Audit');
  console.log('================================================================\n');

  const ts = Date.now();
  const userAEmail = `audit_alice_${ts}@test.com`;
  const userBEmail = `audit_bob_${ts}@test.com`;
  const password = 'Password123!';

  // Step 1: Register User A (Alice)
  console.log('1. Registering User A (Alice Candidate)...');
  const regARes = await request('/api/auth/register', {
    method: 'POST',
    body: { fullName: 'Alice Candidate', email: userAEmail, password, confirmPassword: password },
  });
  if (regARes.status !== 201) throw new Error(`User A registration failed: ${JSON.stringify(regARes.data)}`);
  const tokenA = regARes.data.token;
  console.log(`   ✓ User A registered (Token: ${tokenA.slice(0, 15)}...)`);

  // Step 2: Register User B (Bob - Newcomer with zero activity)
  console.log('2. Registering User B (Bob Newcomer - Clean Account)...');
  const regBRes = await request('/api/auth/register', {
    method: 'POST',
    body: { fullName: 'Bob Newcomer', email: userBEmail, password, confirmPassword: password },
  });
  if (regBRes.status !== 201) throw new Error(`User B registration failed: ${JSON.stringify(regBRes.data)}`);
  const tokenB = regBRes.data.token;
  console.log(`   ✓ User B registered (Token: ${tokenB.slice(0, 15)}...)\n`);

  // Step 3: Populate User A with real data
  console.log('3. Populating User A with distinct career records:');

  // 3a. Resume Upload for User A
  console.log('   a. Uploading PDF Resume for User A...');
  const pdfBuffer = createSimplePdf([
    'Alice Candidate',
    'alice@example.com',
    '+91 98765 43210',
    'SKILLS',
    'JavaScript, Node.js, Express, React, Docker, PostgreSQL, RESTful APIs',
    'EXPERIENCE',
    'Backend Developer at TechCorp',
    'EDUCATION',
    'B.Tech in Computer Science',
  ]);
  const fdA = new FormData();
  fdA.append('resume', new Blob([pdfBuffer], { type: 'application/pdf' }), 'Alice_Resume.pdf');

  const uploadARes = await request('/api/resumes/upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}` },
    body: fdA,
  });
  if (uploadARes.status !== 201) throw new Error(`Resume upload failed: ${JSON.stringify(uploadARes.data)}`);
  const resumeAId = uploadARes.data.resume._id;
  console.log(`      ✓ Resume uploaded: "Alice_Resume.pdf" (ID: ${resumeAId})`);

  // 3b. AI Resume Analysis for User A
  console.log('   b. Running AI Resume Analysis for User A...');
  const analysisARes = await request(`/api/analysis/${resumeAId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}` },
    body: { targetRole: 'Backend Developer' },
  });
  if (analysisARes.status !== 200 && analysisARes.status !== 201) throw new Error(`Resume analysis failed: ${JSON.stringify(analysisARes.data)}`);
  const resumeScoreA = analysisARes.data.analysis.overallScore;
  console.log(`      ✓ Resume Analyzed. Overall Score: ${resumeScoreA}/100`);

  // 3c. Target Job Description for User A
  console.log('   c. Creating Target Job Description for User A...');
  const jobARes = await request('/api/jobs', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}` },
    body: {
      companyName: 'Stripe Global',
      jobTitle: 'Backend Engineer',
      jobDescription: 'Seeking backend engineer proficient in Node.js, Express, Docker, and PostgreSQL.',
    },
  });
  if (jobARes.status !== 201) throw new Error(`Job creation failed: ${JSON.stringify(jobARes.data)}`);
  const jobAId = jobARes.data.job._id;
  console.log(`      ✓ Job created: "Backend Engineer @ Stripe Global" (ID: ${jobAId})`);

  // 3d. Job Compatibility Match for User A
  console.log('   d. Running Job Compatibility Match for User A...');
  const matchARes = await request(`/api/jobs/${jobAId}/match`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  if (matchARes.status !== 200 && matchARes.status !== 201) throw new Error(`Job match failed: ${JSON.stringify(matchARes.data)}`);
  const matchScoreA = matchARes.data.match.overallScore;
  console.log(`      ✓ Job matched. Score: ${matchScoreA}% (${matchARes.data.match.matchClassification})`);

  // 3e. Learning Roadmap for User A
  console.log('   e. Generating Learning Roadmap for User A...');
  const roadmapARes = await request('/api/roadmaps', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}` },
    body: { jobId: jobAId, targetRole: 'Backend Engineer', durationWeeks: 4, missingSkills: ['Docker', 'PostgreSQL'] },
  });
  if (roadmapARes.status !== 201) throw new Error(`Roadmap creation failed: ${JSON.stringify(roadmapARes.data)}`);
  const roadmapAId = roadmapARes.data.roadmap._id;
  console.log(`      ✓ Roadmap generated: "${roadmapARes.data.roadmap.title}" (ID: ${roadmapAId})`);

  // 3f. Toggle Week 1 of User A's Roadmap to completed
  console.log('   f. Checking off Week 1 on User A Roadmap...');
  const toggleRes = await request(`/api/roadmaps/${roadmapAId}/progress`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${tokenA}` },
    body: { weekNumber: 1, completed: true },
  });
  if (toggleRes.status !== 200) throw new Error(`Roadmap toggle failed: ${JSON.stringify(toggleRes.data)}`);
  console.log(`      ✓ Week 1 marked complete (Progress: ${toggleRes.data.roadmap.progressPercentage}%)`);

  // 3g. Mock Interview for User A
  console.log('   g. Starting Mock Interview Session for User A...');
  const interviewARes = await request('/api/interviews', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}` },
    body: { role: 'Backend Developer', difficulty: 'Intermediate', interviewType: 'Technical Interview', totalQuestions: 5 },
  });
  if (interviewARes.status !== 201) throw new Error(`Interview start failed: ${JSON.stringify(interviewARes.data)}`);
  const interviewAId = interviewARes.data.interview?._id || interviewARes.data.session?._id;
  console.log(`      ✓ Interview started (ID: ${interviewAId})`);

  // Submit answer for Question 1
  console.log('   h. Submitting answer for Question 1...');
  const submitRes = await request(`/api/interviews/${interviewAId}/answer`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}` },
    body: { questionIndex: 0, answer: 'RESTful APIs use stateless HTTP methods GET, POST, PUT, DELETE to communicate via standard JSON payloads and status codes.' },
  });
  if (submitRes.status !== 200) throw new Error(`Answer submit failed: ${JSON.stringify(submitRes.data)}`);

  // Complete interview session
  console.log('   i. Completing Mock Interview for User A...');
  const completeRes = await request(`/api/interviews/${interviewAId}/complete`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  if (completeRes.status !== 200) throw new Error(`Interview complete failed: ${JSON.stringify(completeRes.data)}`);
  const interviewScoreA = completeRes.data.report?.overallScore || completeRes.data.session?.overallScore || 0;
  console.log(`      ✓ Interview completed with Score: ${interviewScoreA}/100\n`);

  // Step 4: Verify User A Dashboard Overview
  console.log('4. Verifying User A Dashboard Overview (Populated Account):');
  const dashARes = await request('/api/dashboard/overview', {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  if (dashARes.status !== 200) throw new Error(`User A dashboard failed: ${JSON.stringify(dashARes.data)}`);
  const dataA = dashARes.data;

  console.log(`   - User A Name & Email: ${dataA.user.fullName} <${dataA.user.email}>`);
  console.log(`   - Resume Status: ${dataA.stats.hasResume ? 'Active' : 'Missing'} ("${dataA.stats.resumeFileName}")`);
  console.log(`   - Latest Resume Score: ${dataA.stats.latestResumeScore}/100 (Target: ${dataA.stats.latestResumeTargetRole})`);
  console.log(`   - Saved Jobs Count: ${dataA.stats.totalSavedJobs}`);
  console.log(`   - Job Matches Count: ${dataA.stats.totalJobMatches}`);
  console.log(`   - Completed Interviews: ${dataA.stats.completedInterviews}`);
  console.log(`   - Average Interview Score: ${dataA.stats.averageInterviewScore}/100`);
  console.log(`   - Roadmap Progress: ${dataA.stats.roadmapProgress}% (${dataA.stats.completedRoadmapModules}/${dataA.stats.totalRoadmapModules} modules done)`);
  console.log(`   - Career Readiness Score: ${dataA.careerReadiness.overallScore}/100 ("${dataA.careerReadiness.classification}")`);
  console.log(`   - Active Categories: ${dataA.careerReadiness.availableCategoriesCount}/5 active`);

  if (!dataA.stats.hasResume) throw new Error('User A hasResume should be true');
  if (dataA.stats.totalResumes !== 1) throw new Error('User A totalResumes should be 1');
  if (dataA.stats.latestResumeScore !== resumeScoreA) throw new Error('User A latestResumeScore mismatch');
  if (dataA.stats.totalSavedJobs < 1) throw new Error('User A totalSavedJobs should be >= 1');
  if (dataA.stats.totalJobMatches < 1) throw new Error('User A totalJobMatches should be >= 1');
  if (dataA.stats.completedInterviews < 1) throw new Error('User A completedInterviews should be >= 1');
  if (dataA.stats.averageInterviewScore !== interviewScoreA) throw new Error('User A averageInterviewScore mismatch');
  if (dataA.stats.roadmapProgress !== 25) throw new Error('User A roadmapProgress should be 25');
  if (typeof dataA.careerReadiness.overallScore !== 'number') throw new Error('User A readiness score should be a number');
  console.log('   ✓ User A statistics strictly reflect User A own database records.\n');

  // Step 5: Verify User B Dashboard (Complete Isolation & Empty State Verification)
  console.log('5. Verifying User B Dashboard (Brand-New Account with ZERO Activity):');
  const dashBRes = await request('/api/dashboard/overview', {
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  if (dashBRes.status !== 200) throw new Error(`User B dashboard failed: ${JSON.stringify(dashBRes.data)}`);
  const dataB = dashBRes.data;

  console.log(`   - User B Name & Email: ${dataB.user.fullName} <${dataB.user.email}>`);
  console.log(`   - hasResume: ${dataB.stats.hasResume} (Expected: false)`);
  console.log(`   - totalResumes: ${dataB.stats.totalResumes} (Expected: 0)`);
  console.log(`   - resumeFileName: ${dataB.stats.resumeFileName} (Expected: null)`);
  console.log(`   - latestResumeScore: ${dataB.stats.latestResumeScore} (Expected: null -> UI shows "Not Analyzed")`);
  console.log(`   - totalSavedJobs: ${dataB.stats.totalSavedJobs} (Expected: 0)`);
  console.log(`   - totalJobMatches: ${dataB.stats.totalJobMatches} (Expected: 0)`);
  console.log(`   - totalInterviews: ${dataB.stats.totalInterviews} (Expected: 0)`);
  console.log(`   - completedInterviews: ${dataB.stats.completedInterviews} (Expected: 0)`);
  console.log(`   - averageInterviewScore: ${dataB.stats.averageInterviewScore} (Expected: null -> UI shows "No Data")`);
  console.log(`   - roadmapProgress: ${dataB.stats.roadmapProgress}% (Expected: 0%)`);
  console.log(`   - Career Readiness Score: ${dataB.careerReadiness.overallScore} (Expected: null -> UI shows "Pending")`);
  console.log(`   - Readiness Classification: "${dataB.careerReadiness.classification}" (Expected: "Getting Started")`);
  console.log(`   - Active Categories Count: ${dataB.careerReadiness.availableCategoriesCount} (Expected: 0 of 5)`);

  // Assertions for User B isolation
  if (dataB.stats.hasResume !== false) throw new Error('User B hasResume must be false');
  if (dataB.stats.totalResumes !== 0) throw new Error('User B totalResumes must be 0');
  if (dataB.stats.resumeFileName !== null) throw new Error('User B resumeFileName must be null');
  if (dataB.stats.latestResumeScore !== null) throw new Error('User B latestResumeScore must be null');
  if (dataB.stats.totalSavedJobs !== 0) throw new Error('User B totalSavedJobs must be 0');
  if (dataB.stats.totalJobMatches !== 0) throw new Error('User B totalJobMatches must be 0');
  if (dataB.stats.totalInterviews !== 0) throw new Error('User B totalInterviews must be 0');
  if (dataB.stats.completedInterviews !== 0) throw new Error('User B completedInterviews must be 0');
  if (dataB.stats.averageInterviewScore !== null) throw new Error('User B averageInterviewScore must be null');
  if (dataB.stats.roadmapProgress !== 0) throw new Error('User B roadmapProgress must be 0');
  if (dataB.careerReadiness.overallScore !== null) throw new Error('User B readiness score must be null (no hardcoded fake number)');
  if (dataB.careerReadiness.availableCategoriesCount !== 0) throw new Error('User B active categories should be 0');
  console.log('   ✓ User B displays a strictly personalized empty state with NO demo data or leaked User A stats.\n');

  // Step 6: Verify User B Career Readiness Category Breakdown
  console.log('6. Verifying User B Career Readiness Category Breakdown:');
  const catScoresB = dataB.careerReadiness.categoryScores;
  const categories = ['resumeQuality', 'jobCompatibility', 'technicalSkills', 'learningProgress', 'interviewPerformance'];
  for (const cat of categories) {
    const c = catScoresB[cat];
    console.log(`   - ${cat}: available=${c.available}, score=${c.score}`);
    if (c.available !== false) throw new Error(`Category ${cat} should not be available for User B`);
    if (c.score !== null) throw new Error(`Category ${cat} score should be null for User B`);
  }
  console.log('   ✓ All 5 readiness categories correctly flagged as available: false with score: null.\n');

  // Step 7: Verify Skill Intelligence Isolation
  console.log('7. Verifying Skill Intelligence Isolation:');
  const skillsARes = await request('/api/dashboard/skill-intelligence', { headers: { Authorization: `Bearer ${tokenA}` } });
  const skillsBRes = await request('/api/dashboard/skill-intelligence', { headers: { Authorization: `Bearer ${tokenB}` } });

  const skillsA = skillsARes.data.skills;
  const skillsB = skillsBRes.data.skills;

  console.log(`   - User A Strong Skills: ${skillsA.strongSkills.length} skills (Includes: ${skillsA.strongSkills.slice(0, 3).map(s => s.skillName).join(', ')})`);
  console.log(`   - User B Strong Skills: ${skillsB.strongSkills.length} skills`);
  console.log(`   - User B Skills to Improve: ${skillsB.skillsToImprove.length} skills`);
  console.log(`   - User B Missing Required Skills: ${skillsB.missingRequiredSkills.length} skills`);
  console.log(`   - User B Recently Improved: ${skillsB.recentlyImprovedSkills.length} skills`);

  if (skillsA.strongSkills.length === 0) throw new Error('User A should have strong skills from resume/job match');
  if (skillsB.strongSkills.length !== 0) throw new Error('User B strongSkills must be 0');
  if (skillsB.skillsToImprove.length !== 0) throw new Error('User B skillsToImprove must be 0');
  if (skillsB.missingRequiredSkills.length !== 0) throw new Error('User B missingRequiredSkills must be 0');
  if (skillsB.recentlyImprovedSkills.length !== 0) throw new Error('User B recentlyImprovedSkills must be 0');
  console.log('   ✓ Skill Intelligence is strictly isolated between User A and User B.\n');

  // Step 8: Verify Recommendations Isolation
  console.log('8. Verifying Personalized Recommendations Isolation:');
  const recsB = dataB.recommendations;
  console.log(`   - User B Recommendations Count: ${recsB.length}`);
  recsB.forEach((r, idx) => console.log(`     ${idx + 1}. [${r.type}] ${r.title} (Priority: ${r.priority})`));

  // User B should receive onboarding recommendations: Upload Resume, Start Mock Interview, Evaluate Job Compatibility
  const hasUploadRec = recsB.some(r => r.id === 'rec_upload_resume');
  const hasInterviewRec = recsB.some(r => r.id === 'rec_take_first_interview');
  const hasJobMatchRec = recsB.some(r => r.id === 'rec_run_job_match');

  if (!hasUploadRec) throw new Error('User B should be recommended to upload a resume');
  if (!hasInterviewRec) throw new Error('User B should be recommended to take their first interview');
  if (!hasJobMatchRec) throw new Error('User B should be recommended to evaluate job compatibility');
  console.log('   ✓ User B recommendations are uniquely tailored to their clean profile state.\n');

  // Step 9: Verify Cross-User Endpoint Access Boundaries
  console.log('9. Verifying Cross-User Resource Access Authorization:');

  // User B tries to view User A's uploaded resume -> must return 404
  const breachResumeRes = await request(`/api/resumes`, { headers: { Authorization: `Bearer ${tokenB}` } });
  console.log(`   - User B GET /api/resumes -> resume: ${breachResumeRes.data.resume} (Expected: null)`);
  if (breachResumeRes.data.resume !== null) throw new Error('User B leaked User A resume');

  // User B tries to download User A's resume -> must return 404
  const breachDownloadRes = await request(`/api/resumes/download`, { headers: { Authorization: `Bearer ${tokenB}` } });
  console.log(`   - User B GET /api/resumes/download -> Status: ${breachDownloadRes.status} (Expected: 404)`);
  if (breachDownloadRes.status !== 404) throw new Error('User B downloaded User A resume');

  // User B tries to view User A's target job -> must return 404
  const breachJobRes = await request(`/api/jobs/${jobAId}`, { headers: { Authorization: `Bearer ${tokenB}` } });
  console.log(`   - User B GET /api/jobs/${jobAId} -> Status: ${breachJobRes.status} (Expected: 404)`);
  if (breachJobRes.status !== 404) throw new Error(`Expected 404, got ${breachJobRes.status}`);

  // User B tries to view User A's mock interview -> must return 404
  const breachInterviewRes = await request(`/api/interviews/${interviewAId}`, { headers: { Authorization: `Bearer ${tokenB}` } });
  console.log(`   - User B GET /api/interviews/${interviewAId} -> Status: ${breachInterviewRes.status} (Expected: 404)`);
  if (breachInterviewRes.status !== 404) throw new Error(`Expected 404, got ${breachInterviewRes.status}`);

  // User B tries to view or toggle User A's roadmap -> must return 404
  const breachRoadmapGet = await request(`/api/roadmaps/${roadmapAId}`, { headers: { Authorization: `Bearer ${tokenB}` } });
  console.log(`   - User B GET /api/roadmaps/${roadmapAId} -> Status: ${breachRoadmapGet.status} (Expected: 404)`);
  if (breachRoadmapGet.status !== 404) throw new Error(`Expected 404, got ${breachRoadmapGet.status}`);

  const breachRoadmapPatch = await request(`/api/roadmaps/${roadmapAId}/progress`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${tokenB}` },
    body: { weekNumber: 2, completed: true },
  });
  console.log(`   - User B PATCH /api/roadmaps/${roadmapAId}/progress -> Status: ${breachRoadmapPatch.status} (Expected: 404)`);
  if (breachRoadmapPatch.status !== 404) throw new Error(`Expected 404, got ${breachRoadmapPatch.status}`);

  console.log('   ✓ All cross-user resource access strictly blocked with HTTP 404.\n');

  console.log('================================================================');
  console.log('🎉 VERIFICATION COMPLETE: ALL 8 REQUIREMENTS FULLY SATISFIED');
  console.log('================================================================');
}

runIsolationAudit().catch((err) => {
  console.error('\n❌ AUDIT FAILED:', err.message);
  process.exit(1);
});
