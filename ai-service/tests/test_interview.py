import unittest
from app.services.interview_service import (
    generate_interview_questions,
    evaluate_answer,
    generate_interview_report,
)
from app.schemas.interview import (
    QuestionGenerateRequest,
    AnswerEvaluationRequest,
    ReportGenerateRequest,
)
from app.routes.interview import (
    generate_questions_endpoint,
    evaluate_answer_endpoint,
    generate_report_endpoint,
)


class TestInterviewService(unittest.TestCase):
    # 1. Question Generation: Technical
    def test_generate_technical_questions(self):
        res = generate_interview_questions(
            role="Full Stack Developer",
            interview_type="Technical Interview",
            difficulty="Intermediate",
            total_questions=5,
        )
        self.assertTrue(res.success)
        self.assertEqual(len(res.questions), 5)
        self.assertEqual(res.total_questions, 5)
        # All questions should be technical
        for q in res.questions:
            self.assertEqual(q.category, "technical")
            self.assertTrue(len(q.question_text) > 10)
            self.assertTrue(len(q.expected_concepts) > 0)
        # Verify no duplicate question texts
        texts = [q.question_text for q in res.questions]
        self.assertEqual(len(texts), len(set(texts)))

    # 2. Question Generation: HR Interview
    def test_generate_hr_questions(self):
        res = generate_interview_questions(
            role="Software Developer",
            interview_type="HR Interview",
            difficulty="Beginner",
            total_questions=5,
        )
        self.assertTrue(res.success)
        self.assertEqual(len(res.questions), 5)
        for q in res.questions:
            self.assertEqual(q.category, "hr")

    # 3. Question Generation: Mixed Interview
    def test_generate_mixed_questions(self):
        res = generate_interview_questions(
            role="Backend Developer",
            interview_type="Mixed Interview",
            difficulty="Intermediate",
            total_questions=5,
        )
        self.assertTrue(res.success)
        self.assertEqual(len(res.questions), 5)
        categories = {q.category for q in res.questions}
        self.assertIn("technical", categories)
        self.assertIn("hr", categories)

    # 4. Question Generation: Custom Role
    def test_generate_custom_role_questions(self):
        res = generate_interview_questions(
            role="Custom Role",
            custom_role="Cloud Security Architect",
            interview_type="Technical Interview",
            difficulty="Advanced",
            total_questions=5,
        )
        self.assertTrue(res.success)
        self.assertEqual(res.role, "Cloud Security Architect")
        self.assertEqual(len(res.questions), 5)

    # 5. Question Generation with Resume & Job Personalization
    def test_generate_questions_with_personalization(self):
        resume_data = {
            "skills": {
                "frameworks": ["React", "Express.js"],
                "databases": ["MongoDB"],
                "tools": ["Docker"]
            },
            "projects": [
                {"title": "E-Commerce System", "description": "Built with Node.js and MongoDB"}
            ]
        }
        res = generate_interview_questions(
            role="Full Stack Developer",
            interview_type="Technical Interview",
            difficulty="Intermediate",
            total_questions=5,
            resume_data=resume_data,
            job_description="Looking for Full Stack engineer proficient in Node.js, Express, MongoDB and Docker."
        )
        self.assertTrue(res.success)
        self.assertEqual(len(res.questions), 5)
        all_topics = " ".join([q.topic for q in res.questions]).lower()
        self.assertTrue("node" in all_topics or "express" in all_topics or "react" in all_topics or "database" in all_topics)

    # 6. Answer Evaluation: High Quality Technical Answer
    def test_evaluate_technical_answer_high_score(self):
        eval_res = evaluate_answer(
            question_id="q_1",
            question_text="Explain the Node.js event loop and how Node handles asynchronous I/O.",
            category="technical",
            difficulty="intermediate",
            topic="Node.js Architecture",
            expected_concepts=["call stack", "event loop", "libuv", "thread pool", "microtask queue"],
            evaluation_criteria=["Explains single-threaded execution", "Identifies libuv and worker threads"],
            sample_answer="Node.js uses a single-threaded event loop backed by libuv...",
            answer="Node.js runs on a single-threaded event loop for JavaScript execution, while delegating heavy I/O operations to libuv and its worker thread pool. When async operations complete, callbacks enter the microtask queue or callback queue. The event loop continuously pushes completed callbacks onto the call stack once it becomes empty.",
            role="Full Stack Developer"
        )
        self.assertTrue(eval_res.success)
        self.assertGreaterEqual(eval_res.overall_score, 80)
        self.assertIn(eval_res.performance_label, ["Good", "Excellent"])
        self.assertGreater(len(eval_res.strengths), 0)
        self.assertIn("technical_accuracy", eval_res.criterion_scores)
        self.assertIn("relevance", eval_res.criterion_scores)
        self.assertIn("completeness", eval_res.criterion_scores)
        self.assertIn("clarity", eval_res.criterion_scores)
        self.assertEqual(eval_res.provider, "fastapi-ai-engine")

    # 7. Answer Evaluation: Empty or Brief Answer
    def test_evaluate_empty_answer(self):
        eval_res = evaluate_answer(
            question_id="q_1",
            question_text="What is a RESTful API?",
            category="technical",
            difficulty="beginner",
            topic="RESTful APIs",
            expected_concepts=["stateless", "resources", "GET", "POST"],
            evaluation_criteria=["Defines REST principles"],
            sample_answer="A REST API is stateless...",
            answer="",
            role="Full Stack Developer"
        )
        self.assertTrue(eval_res.success)
        self.assertEqual(eval_res.overall_score, 0)
        self.assertEqual(eval_res.performance_label, "Needs Improvement")
        self.assertGreater(len(eval_res.weaknesses), 0)
        self.assertGreater(len(eval_res.improvement_suggestions), 0)

    # 8. Answer Evaluation: HR Answer with STAR Method
    def test_evaluate_hr_answer_with_star(self):
        eval_res = evaluate_answer(
            question_id="q_2",
            question_text="Describe a time when you had a disagreement with a team member. How did you resolve it?",
            category="hr",
            difficulty="intermediate",
            topic="Teamwork & Collaboration",
            expected_concepts=["Situation context", "Task objective", "Action taken", "Positive Result"],
            evaluation_criteria=["Follows STAR structure", "Demonstrates compromise"],
            sample_answer="Situation: During our capstone...",
            answer="Situation: During my final semester capstone project, our team had a disagreement regarding whether to use SQL or NoSQL. Task: We needed to decide quickly to stay on schedule. Action: I proposed we benchmark query response times for our specific document schema on small prototypes. After seeing the data, we agreed on a hybrid model. Result: We completed the project two weeks early and received an A grade.",
            role="Software Developer"
        )
        self.assertTrue(eval_res.success)
        self.assertGreaterEqual(eval_res.overall_score, 75)
        self.assertIn("structure_and_communication", eval_res.criterion_scores)
        self.assertIn("examples_and_specificity", eval_res.criterion_scores)
        self.assertGreaterEqual(eval_res.criterion_scores["structure_and_communication"], 80)

    # 9. Report Generation
    def test_generate_report(self):
        sample_questions = [
            {
                "status": "answered",
                "evaluation": {
                    "overall_score": 85,
                    "criterion_scores": {
                        "technical_accuracy": 90,
                        "relevance": 85,
                        "completeness": 80,
                        "clarity": 85,
                    },
                    "strengths": ["Clear understanding of event loop."],
                    "weaknesses": ["Could explain worker threads more."]
                }
            },
            {
                "status": "answered",
                "evaluation": {
                    "overall_score": 80,
                    "criterion_scores": {
                        "technical_accuracy": 80,
                        "relevance": 85,
                        "completeness": 75,
                        "clarity": 80,
                    },
                    "strengths": ["Good real-world example."],
                    "weaknesses": ["Mention HTTP status codes."]
                }
            },
            {
                "status": "pending",
                "evaluation": None
            }
        ]

        report = generate_interview_report(
            role="Full Stack Developer",
            interview_type="Technical Interview",
            difficulty="Intermediate",
            questions=sample_questions
        )
        self.assertTrue(report.success)
        self.assertEqual(report.total_questions, 3)
        self.assertEqual(report.answered_questions, 2)
        self.assertEqual(report.skipped_questions, 1)
        self.assertEqual(report.overall_score, 82)
        self.assertEqual(report.completion_percentage, 67)
        self.assertIn("technical_accuracy", report.performance_breakdown)
        self.assertEqual(report.performance_breakdown["technical_accuracy"], 85)
        self.assertEqual(report.performance_breakdown["relevance"], 85)
        self.assertGreater(len(report.strengths), 0)
        self.assertGreater(len(report.weaknesses), 0)
        self.assertGreater(len(report.recommendations), 0)
        self.assertTrue(len(report.readiness_assessment) > 20)

    def test_generate_report_performance_breakdown_aggregation(self):
        sample_questions = [
            {
                "status": "answered",
                "evaluation": {
                    "overall_score": 83,
                    "criterion_scores": {
                        "technical_accuracy": 90,
                        "relevance": 80,
                        "completeness": 85,
                        "clarity": 75,
                    },
                    "strengths": ["Strong technical terminology."],
                    "weaknesses": []
                }
            },
            {
                "status": "answered",
                "evaluation": {
                    "overall_score": 83,
                    "criterionScores": {
                        "technicalAccuracy": 80,
                        "relevance": 90,
                        "completeness": 75,
                        "clarity": 85,
                    },
                    "strengths": ["Well structured."],
                    "weaknesses": []
                }
            },
            {
                "status": "answered",
                "evaluation": {
                    "overall_score": 88,
                    "criterion_scores": {
                        "relevance": 100,
                        "clarity": 90,
                        "completeness": 80,
                        "structure_and_communication": 90,
                        "examples_and_specificity": 80,
                    },
                    "strengths": ["STAR method followed."],
                    "weaknesses": []
                }
            },
            {
                "status": "pending",
                "evaluation": None
            }
        ]

        report = generate_interview_report(
            role="Full Stack Developer",
            interview_type="Mixed Interview",
            difficulty="Intermediate",
            questions=sample_questions
        )
        self.assertTrue(report.success)
        self.assertEqual(report.answered_questions, 3)
        self.assertEqual(report.total_questions, 4)

        # Dimension-by-dimension verification
        pb = report.performance_breakdown
        self.assertEqual(pb["technical_accuracy"], 85)  # (90 + 80) / 2
        self.assertEqual(pb["relevance"], 90)           # (80 + 90 + 100) / 3
        self.assertEqual(pb["completeness"], 80)        # (85 + 75 + 80) / 3
        self.assertEqual(pb["clarity"], 83)             # round((75 + 85 + 90) / 3) = 83
        self.assertEqual(pb["structure_and_communication"], 90) # 90 / 1
        self.assertEqual(pb["examples_and_specificity"], 80)    # 80 / 1

    # 10. FastAPI Router Endpoint Functions
    def test_router_generate_questions_endpoint(self):
        req = QuestionGenerateRequest(
            role="Frontend Developer",
            interview_type="Technical Interview",
            difficulty="Beginner",
            total_questions=5
        )
        data = generate_questions_endpoint(req)
        self.assertTrue(data.success)
        self.assertEqual(len(data.questions), 5)
        self.assertEqual(data.questions[0].category, "technical")

    def test_router_evaluate_answer_endpoint(self):
        req = AnswerEvaluationRequest(
            question_id="q_1",
            question_text="What is semantic HTML?",
            category="technical",
            difficulty="beginner",
            topic="HTML & Semantic Web",
            expected_concepts=["header", "screen readers", "SEO"],
            evaluation_criteria=["Defines semantic tags"],
            sample_answer="Semantic HTML uses tags like <header>...",
            answer="Semantic HTML means using elements that clearly describe their meaning to the browser and developer, like <header>, <article>, and <footer>. It aids accessibility for screen readers and helps search engine crawlers with SEO.",
            role="Frontend Developer"
        )
        data = evaluate_answer_endpoint(req)
        self.assertTrue(data.success)
        self.assertGreaterEqual(data.overall_score, 70)
        self.assertIn("technical_accuracy", data.criterion_scores)

    def test_router_generate_report_endpoint(self):
        req = ReportGenerateRequest(
            role="Data Analyst",
            interview_type="Technical Interview",
            difficulty="Intermediate",
            questions=[
                {
                    "status": "answered",
                    "evaluation": {
                        "overall_score": 90,
                        "criterion_scores": {"technical_accuracy": 95, "relevance": 90, "completeness": 90, "clarity": 85},
                        "strengths": ["Strong SQL knowledge"],
                        "weaknesses": []
                    }
                }
            ]
        )
        data = generate_report_endpoint(req)
        self.assertTrue(data.success)
        self.assertEqual(data.overall_score, 90)
        self.assertEqual(data.performance_label, "Excellent")


if __name__ == "__main__":
    unittest.main()
