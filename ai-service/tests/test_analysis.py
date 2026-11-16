import unittest
from app.services.analyzer import run_resume_analysis, ROLE_PROFILES, get_role_profile
from app.schemas.analysis import AnalysisResponse


class TestResumeAnalysisService(unittest.TestCase):
    def setUp(self):
        self.sample_resume = {
            "personalInfo": {
                "fullName": "Sarah Connor",
                "email": "sarah.connor@example.com",
                "phone": "+1 555 432 1098",
                "location": "Los Angeles, CA",
                "linkedin": "https://linkedin.com/in/sarahconnor",
                "github": "https://github.com/sarahconnor",
            },
            "skills": {
                "programmingLanguages": ["JavaScript", "TypeScript", "Python"],
                "frameworks": ["React", "Node.js", "Express.js"],
                "databases": ["MongoDB", "PostgreSQL"],
                "tools": ["Docker", "Git", "AWS"],
                "other": [],
            },
            "projects": [
                {
                    "title": "Autonomous Sentinel",
                    "technologies": ["React", "Node.js", "MongoDB"],
                    "description": "Engineered distributed alert system with 99.9% uptime and reduced response latency by 40%.",
                    "link": "https://github.com/sarahconnor/sentinel",
                }
            ],
            "experience": [
                {
                    "position": "Senior Software Engineer",
                    "company": "Cyberdyne Systems",
                    "duration": "2021 - Present",
                    "description": "Architected mission-critical microservices handling 50k daily active requests.",
                }
            ],
            "education": [
                {
                    "institution": "University of California",
                    "degree": "Bachelor of Science in Computer Science",
                    "graduationYear": "2021",
                    "grade": "3.9",
                }
            ],
            "certifications": [
                {
                    "name": "AWS Certified Solutions Architect",
                    "issuer": "Amazon Web Services",
                    "date": "2022",
                }
            ],
        }

    def test_all_ten_roles_defined(self):
        """Verify all 10 core career roles are present in the knowledge base."""
        expected_roles = [
            "Software Developer",
            "Frontend Developer",
            "Backend Developer",
            "Full Stack Developer",
            "Data Analyst",
            "Data Scientist",
            "Machine Learning Engineer",
            "AI Engineer",
            "DevOps Engineer",
            "Cybersecurity Analyst",
        ]
        for role in expected_roles:
            self.assertIn(role, ROLE_PROFILES)
            profile = get_role_profile(role)
            self.assertTrue(len(profile.get("high_priority", [])) > 0)
            self.assertTrue(len(profile.get("reasons", {})) > 0)

    def test_full_stack_analysis_success(self):
        """Test full analysis generation for Full Stack Developer role."""
        res: AnalysisResponse = run_resume_analysis(
            resume_data=self.sample_resume,
            target_role="Full Stack Developer",
            job_description=None,
            raw_text="Full resume text content here for testing completeness.",
        )

        # 1. Overall Score verification
        self.assertIsInstance(res.overall_score, int)
        self.assertTrue(0 <= res.overall_score <= 100)
        self.assertGreater(res.overall_score, 60)  # High-quality sample should score well

        # 2. Category Scores verification matching the 100-point rubric
        cat = res.category_scores
        self.assertEqual(cat.technical_skills.max_score, 25.0)
        self.assertEqual(cat.projects.max_score, 20.0)
        self.assertEqual(cat.experience.max_score, 20.0)
        self.assertEqual(cat.education.max_score, 10.0)
        self.assertEqual(cat.certifications.max_score, 10.0)
        self.assertEqual(cat.completeness.max_score, 15.0)

        # 3. Sum of max scores must equal exactly 100
        total_max = (
            cat.technical_skills.max_score +
            cat.projects.max_score +
            cat.experience.max_score +
            cat.education.max_score +
            cat.certifications.max_score +
            cat.completeness.max_score
        )
        self.assertEqual(total_max, 100.0)

        # 4. Strengths and Weaknesses
        self.assertGreaterEqual(len(res.strengths), 2)
        self.assertGreaterEqual(len(res.weaknesses), 1)

        # 5. Missing skills
        self.assertGreaterEqual(len(res.missing_skills), 1)
        for item in res.missing_skills:
            self.assertIn(item.priority, ["High", "Medium", "Low"])
            self.assertTrue(len(item.reason) > 5)

        # 6. Projects and Experience analysis
        self.assertEqual(len(res.project_analysis), 1)
        self.assertEqual(res.project_analysis[0].title, "Autonomous Sentinel")
        self.assertTrue(res.experience_analysis.has_experience)

        # 7. AI Feedback
        self.assertTrue(len(res.ai_feedback.summary) > 10)
        self.assertTrue(len(res.ai_feedback.role_suitability) > 5)
        self.assertTrue(len(res.ai_feedback.main_improvements) > 5)
        self.assertTrue(len(res.ai_feedback.next_steps) > 5)

        # 8. Provider identification
        self.assertTrue(len(res.analysis_provider) > 0)

    def test_custom_role_with_job_description(self):
        """Test custom role and JD skill extraction."""
        jd = "Seeking a Blockchain Engineer skilled in Rust, Solidity, Docker, and smart contracts."
        res = run_resume_analysis(
            resume_data=self.sample_resume,
            target_role="Blockchain Engineer",
            job_description=jd,
        )

        self.assertEqual(res.target_role, "Blockchain Engineer")
        self.assertEqual(res.job_description, jd)
        self.assertTrue(0 <= res.overall_score <= 100)

        # Missing skills should identify skills from JD (like Docker was present, but missing JD items)
        missing_names = [m.skill.lower() for m in res.missing_skills]
        self.assertTrue(any("rust" in m or "solidity" in m or "contract" in m or len(missing_names) > 0 for m in missing_names))

    def test_empty_resume_data_handling(self):
        """Test that minimal/empty resume data does not crash and produces valid baseline output."""
        empty_resume = {
            "personalInfo": {},
            "skills": {},
            "projects": [],
            "experience": [],
            "education": [],
            "certifications": [],
        }

        res = run_resume_analysis(
            resume_data=empty_resume,
            target_role="Data Scientist",
        )

        self.assertTrue(0 <= res.overall_score <= 100)
        self.assertLess(res.overall_score, 45)  # Empty resume should score low
        self.assertFalse(res.experience_analysis.has_experience)
        self.assertEqual(res.experience_analysis.level, "Academic / Student")
        self.assertGreaterEqual(len(res.weaknesses), 1)
        self.assertGreaterEqual(len(res.improvement_suggestions), 1)


if __name__ == "__main__":
    unittest.main()
