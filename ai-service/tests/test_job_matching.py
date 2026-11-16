import unittest
from app.services.job_matcher import (
    normalize_skill,
    extract_skills_from_text,
    extract_skills_from_resume,
    parse_job_description,
    match_resume_to_job,
    generate_career_recommendations,
    generate_learning_roadmap,
)
from app.schemas.job import (
    JobParseRequest,
    JobMatchRequest,
    CareerRecommendationRequest,
    RoadmapRequest,
)


class TestJobMatchingService(unittest.TestCase):
    def setUp(self):
        self.sample_resume = {
            "personalInfo": {
                "fullName": "Priya Sharma",
                "email": "priya.sharma@example.com",
            },
            "skills": {
                "programmingLanguages": ["JavaScript", "TypeScript", "Python"],
                "frameworks": ["React", "Node.js", "Express.js", "Tailwind CSS"],
                "databases": ["MongoDB", "PostgreSQL"],
                "tools": ["Git", "Docker", "Postman"],
                "other": ["RESTful APIs"],
            },
            "education": [
                {
                    "institution": "National Institute of Technology",
                    "degree": "B.Tech",
                    "specialization": "Computer Science and Engineering",
                    "graduationYear": "2024",
                }
            ],
            "projects": [
                {
                    "title": "E-Commerce Web Portal",
                    "technologies": ["React", "Node.js", "MongoDB", "Tailwind CSS"],
                    "description": "Full stack e-commerce web platform with authentication, cart checkout, and REST APIs.",
                    "link": "https://github.com/priya/ecommerce",
                },
                {
                    "title": "Task Manager",
                    "technologies": ["React", "Express.js", "PostgreSQL"],
                    "description": "Kanban collaborative task dashboard with automated unit tests.",
                    "link": "https://github.com/priya/taskmanager",
                },
            ],
            "experience": [
                {
                    "company": "Tech Innovators Pvt Ltd",
                    "position": "Frontend Developer Intern",
                    "duration": "6 months",
                    "description": "Built responsive React components and consumed RESTful APIs.",
                }
            ],
        }

        self.sample_job_description = """
        Job Title: Full Stack Software Engineer
        Company: CloudScale Systems
        Location: Remote / Bangalore
        
        About the Role:
        We are seeking an enthusiastic Full Stack Engineer to join our core product engineering squad.
        
        Requirements / Minimum Qualifications:
        - Strong proficiency in JavaScript, TypeScript, React, and Node.js
        - Experience building RESTful APIs with Express or FastAPI
        - Working knowledge of MongoDB or PostgreSQL
        - Hands-on version control using Git
        - Bachelor's degree in Computer Science, IT, or related engineering discipline
        
        Preferred Qualifications / Nice to Have:
        - Experience with Docker containerization
        - Familiarity with AWS or cloud deployments
        - Understanding of GraphQL or Redis caching
        
        Responsibilities:
        - Design and develop scalable full-stack web applications
        - Collaborate with product designers and backend engineers
        - Write unit and integration tests to ensure software reliability
        """

    def test_skill_normalization_and_equivalence(self):
        """Verify aliases normalize to canonical representations without conflating unrelated skills."""
        self.assertEqual(normalize_skill("JS"), "javascript")
        self.assertEqual(normalize_skill("Node"), "node.js")
        self.assertEqual(normalize_skill("Mongo"), "mongodb")
        self.assertEqual(normalize_skill("Postgres"), "postgresql")
        self.assertEqual(normalize_skill("REST API"), "restful apis")
        self.assertEqual(normalize_skill("ReactJS"), "react")
        self.assertEqual(normalize_skill("K8s"), "kubernetes")
        # Ensure unrelated skills are distinct
        self.assertNotEqual(normalize_skill("Java"), normalize_skill("JavaScript"))
        self.assertNotEqual(normalize_skill("C++"), normalize_skill("C#"))

    def test_job_description_parsing(self):
        """Verify extraction partitions required vs preferred skills and captures qualifications."""
        reqs = parse_job_description(
            self.sample_job_description,
            job_title="Full Stack Software Engineer",
            company_name="CloudScale Systems",
        )
        self.assertIn("javascript", [s.lower() for s in reqs.required_skills])
        self.assertIn("node.js", [s.lower() for s in reqs.required_skills])
        self.assertIn("docker", [s.lower() for s in reqs.preferred_skills])
        self.assertTrue(len(reqs.responsibilities) > 0)
        self.assertTrue(len(reqs.required_qualifications) > 0)

    def test_resume_to_job_matching_and_scoring(self):
        """Verify 35/25/15/15/10 weighted compatibility scoring and skill classifications."""
        match_result = match_resume_to_job(
            resume_data=self.sample_resume,
            job_description=self.sample_job_description,
            job_title="Full Stack Software Engineer",
            company_name="CloudScale Systems",
        )

        self.assertGreaterEqual(match_result.overall_score, 70.0)
        self.assertIn(match_result.match_classification, ["Strong Match", "Excellent Match"])

        # Check category weights
        cat = match_result.category_scores
        self.assertEqual(cat.technical_skills.weight_percentage, 35.0)
        self.assertEqual(cat.projects_relevance.weight_percentage, 25.0)
        self.assertEqual(cat.education_compatibility.weight_percentage, 15.0)
        self.assertEqual(cat.experience_internships.weight_percentage, 15.0)
        self.assertEqual(cat.preferred_skills.weight_percentage, 10.0)

        # Matched skills
        matched_names = [m.skill.lower() for m in match_result.matched_skills]
        self.assertIn("javascript", matched_names)
        self.assertIn("react", matched_names)
        self.assertIn("node.js", matched_names)

        # Missing preferred skills should catch AWS or GraphQL/Redis
        missing_pref_names = [m.skill.lower() for m in match_result.missing_preferred_skills]
        self.assertTrue(any(s in missing_pref_names for s in ["aws", "graphql", "redis"]))

    def test_empty_resume_handling(self):
        """Verify engine gracefully processes an empty or minimal resume without crashing."""
        empty_resume = {"skills": {}, "projects": [], "experience": [], "education": []}
        match_result = match_resume_to_job(
            resume_data=empty_resume,
            job_description=self.sample_job_description,
            job_title="Junior Developer",
            company_name="TestCorp",
        )
        self.assertIsInstance(match_result.overall_score, float)
        self.assertLessEqual(match_result.overall_score, 50.0)
        self.assertEqual(match_result.match_classification, "Low Match")
        self.assertTrue(len(match_result.missing_required_skills) > 0)

    def test_career_recommendations_for_students(self):
        """Verify career recommendation engine ranks suitable paths across 12 roles."""
        recs = generate_career_recommendations(
            resume_data=self.sample_resume,
            job_description=self.sample_job_description,
            target_role="Full Stack Developer",
        )
        self.assertEqual(len(recs.primary_recommendations), 3)
        self.assertEqual(len(recs.alternative_recommendations), 3)
        top_role = recs.primary_recommendations[0].role
        self.assertIn(top_role, ["Full Stack Developer", "Frontend Developer", "Backend Developer"])
        self.assertTrue(len(recs.primary_recommendations[0].suggested_projects) > 0)
        self.assertTrue(len(recs.student_advice) > 10)

    def test_personalized_learning_roadmap(self):
        """Verify 4-week structured learning roadmap generation with weekly exercises and outcomes."""
        roadmap = generate_learning_roadmap(
            resume_data=self.sample_resume,
            job_description=self.sample_job_description,
            job_title="Full Stack Software Engineer",
            company_name="CloudScale Systems",
            duration_weeks=4,
        )
        self.assertEqual(roadmap.total_weeks, 4)
        self.assertEqual(len(roadmap.items), 4)
        week1 = roadmap.items[0]
        self.assertEqual(week1.week_number, 1)
        self.assertTrue(len(week1.learning_sequence) > 0)
        self.assertTrue(len(week1.practical_exercises) > 0)
        self.assertTrue(len(week1.suggested_mini_projects) > 0)
        self.assertTrue(len(week1.expected_outcome) > 0)


    def test_1_javascript_matches_javascript(self):
        """Test 1: JavaScript matches JavaScript."""
        resume = {"skills": {"programmingLanguages": ["JavaScript"]}}
        result = match_resume_to_job(
            resume_data=resume,
            job_description="We need JavaScript developers.",
            extracted_requirements={"required_skills": ["JavaScript"], "preferred_skills": []}
        )
        matched = [m.skill.lower() for m in result.matched_skills]
        self.assertIn("javascript", matched)
        self.assertEqual(len(result.missing_required_skills), 0)

    def test_2_react_matches_react_js(self):
        """Test 2: React matches React.js."""
        resume = {"skills": {"frameworks": ["React"]}}
        result = match_resume_to_job(
            resume_data=resume,
            job_description="Requires React.js frontend experience.",
            extracted_requirements={"required_skills": ["React.js"], "preferred_skills": []}
        )
        matched = [m.matched_with for m in result.matched_skills]
        self.assertIn("react", matched)
        self.assertEqual(len(result.missing_required_skills), 0)

    def test_3_node_js_matches_node(self):
        """Test 3: Node.js matches Node."""
        resume = {"skills": {"frameworks": ["Node.js"]}}
        result = match_resume_to_job(
            resume_data=resume,
            job_description="Seeking Node backend engineer.",
            extracted_requirements={"required_skills": ["Node"], "preferred_skills": []}
        )
        matched = [m.matched_with for m in result.matched_skills]
        self.assertIn("node.js", matched)
        self.assertEqual(len(result.missing_required_skills), 0)

    def test_4_express_js_matches_express(self):
        """Test 4: Express.js matches Express."""
        resume = {"skills": {"frameworks": ["Express.js"]}}
        result = match_resume_to_job(
            resume_data=resume,
            job_description="Building APIs with Express.",
            extracted_requirements={"required_skills": ["Express"], "preferred_skills": []}
        )
        matched = [m.matched_with for m in result.matched_skills]
        self.assertIn("express.js", matched)
        self.assertEqual(len(result.missing_required_skills), 0)

    def test_5_mongodb_matches_mongo(self):
        """Test 5: MongoDB matches Mongo."""
        resume = {"skills": {"databases": ["MongoDB"]}}
        result = match_resume_to_job(
            resume_data=resume,
            job_description="Database persistence with Mongo.",
            extracted_requirements={"required_skills": ["Mongo"], "preferred_skills": []}
        )
        matched = [m.matched_with for m in result.matched_skills]
        self.assertIn("mongodb", matched)
        self.assertEqual(len(result.missing_required_skills), 0)

    def test_6_git_matches_git_version_control(self):
        """Test 6: Git matches Git version control."""
        resume = {"skills": {"tools": ["Git"]}}
        result = match_resume_to_job(
            resume_data=resume,
            job_description="Requires Git version control proficiency.",
            extracted_requirements={"required_skills": ["Git version control"], "preferred_skills": []}
        )
        matched = [m.matched_with for m in result.matched_skills]
        self.assertIn("git", matched)
        self.assertEqual(len(result.missing_required_skills), 0)

    def test_7_missing_required_skill_appears_in_missing_required(self):
        """Test 7: A genuinely missing required skill appears in Missing Required Skills."""
        resume = {"skills": {"programmingLanguages": ["Python"]}}
        result = match_resume_to_job(
            resume_data=resume,
            job_description="Must know Kubernetes and Go.",
            extracted_requirements={"required_skills": ["Kubernetes", "Go"], "preferred_skills": []}
        )
        missing_names = [m.skill.lower() for m in result.missing_required_skills]
        self.assertIn("kubernetes", missing_names)
        self.assertIn("go", missing_names)
        for m in result.missing_required_skills:
            self.assertTrue(m.is_required)
            self.assertEqual(m.priority, "High")

    def test_8_missing_preferred_skill_appears_in_missing_preferred(self):
        """Test 8: A genuinely missing preferred skill appears in Missing Preferred Skills."""
        resume = {"skills": {"programmingLanguages": ["JavaScript"]}}
        result = match_resume_to_job(
            resume_data=resume,
            job_description="Preferred: AWS and Docker.",
            extracted_requirements={"required_skills": ["JavaScript"], "preferred_skills": ["AWS", "Docker"]}
        )
        missing_pref_names = [m.skill.lower() for m in result.missing_preferred_skills]
        self.assertIn("aws", missing_pref_names)
        self.assertIn("docker", missing_pref_names)
        for m in result.missing_preferred_skills:
            self.assertFalse(m.is_required)

    def test_9_case_differences_do_not_prevent_matching(self):
        """Test 9: Case differences do not prevent matching."""
        resume = {"skills": {"programmingLanguages": ["JAVASCRIPT", "python"], "frameworks": ["REACT.JS"]}}
        result = match_resume_to_job(
            resume_data=resume,
            job_description="Looking for javascript, Python, and React.",
            extracted_requirements={"required_skills": ["javascript", "PYTHON", "React"], "preferred_skills": []}
        )
        self.assertEqual(len(result.matched_skills), 3)
        self.assertEqual(len(result.missing_required_skills), 0)

    def test_10_empty_requirements_do_not_produce_contradictory_scores_or_counts(self):
        """Test 10: Empty requirements do not produce contradictory scores or counts."""
        resume = {"skills": {"programmingLanguages": ["Python", "JavaScript"]}}
        result = match_resume_to_job(
            resume_data=resume,
            job_description="General open position.",
            extracted_requirements={"required_skills": [], "preferred_skills": []}
        )
        self.assertEqual(len(result.matched_skills), 0)
        self.assertEqual(len(result.missing_required_skills), 0)
        self.assertEqual(len(result.missing_preferred_skills), 0)
        self.assertEqual(result.category_scores.technical_skills.score, 0.0)
        self.assertEqual(result.category_scores.technical_skills.weighted_score, 0.0)
        self.assertNotIn("0 of 1", result.category_scores.technical_skills.feedback)
        self.assertNotIn("0 of 1", result.matching_explanation)

    def test_11_all_score_categories_respect_maximum_weights(self):
        """Test 11: All score categories respect their maximum weights."""
        result = match_resume_to_job(
            resume_data=self.sample_resume,
            job_description=self.sample_job_description,
        )
        cats = result.category_scores
        self.assertLessEqual(cats.technical_skills.weighted_score, 35.0)
        self.assertLessEqual(cats.projects_relevance.weighted_score, 25.0)
        self.assertLessEqual(cats.education_compatibility.weighted_score, 15.0)
        self.assertLessEqual(cats.experience_internships.weighted_score, 15.0)
        self.assertLessEqual(cats.preferred_skills.weighted_score, 10.0)

    def test_12_total_weighted_score_equals_sum_of_category_scores(self):
        """Test 12: The total weighted score equals the sum of category scores."""
        result = match_resume_to_job(
            resume_data=self.sample_resume,
            job_description=self.sample_job_description,
        )
        cats = result.category_scores
        sum_scores = round(
            cats.technical_skills.weighted_score
            + cats.projects_relevance.weighted_score
            + cats.education_compatibility.weighted_score
            + cats.experience_internships.weighted_score
            + cats.preferred_skills.weighted_score,
            1
        )
        self.assertEqual(result.overall_score, sum_scores)


if __name__ == "__main__":
    unittest.main()
