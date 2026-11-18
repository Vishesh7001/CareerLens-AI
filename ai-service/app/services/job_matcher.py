import re
from typing import List, Dict, Any, Tuple, Optional
from app.schemas.job import (
    ExtractedRequirements,
    JobParseResponse,
    SkillMatchItem,
    MissingSkillDetail,
    JobMatchCategoryScore,
    JobMatchCategoryScores,
    ProjectEvaluation,
    EducationEvaluation,
    ExperienceEvaluation,
    JobMatchResponse,
    CareerPathItem,
    CareerRecommendationResponse,
    RoadmapItem,
    RoadmapResponse,
)

# -------------------------------------------------------------
# Skill Equivalence & Canonical Normalization Map
# -------------------------------------------------------------
SKILL_SYNONYMS = {
    # JavaScript ecosystem
    "js": "javascript",
    "javascript": "javascript",
    "ecmascript": "javascript",
    "es6": "javascript",
    "es6+": "javascript",
    "ts": "typescript",
    "typescript": "typescript",
    "node": "node.js",
    "nodejs": "node.js",
    "node.js": "node.js",
    "node js": "node.js",
    "express": "express.js",
    "expressjs": "express.js",
    "express.js": "express.js",
    "express js": "express.js",
    "react": "react",
    "reactjs": "react",
    "react.js": "react",
    "react js": "react",
    "react native": "react native",
    "next": "next.js",
    "nextjs": "next.js",
    "next.js": "next.js",
    "next js": "next.js",
    "vue": "vue.js",
    "vuejs": "vue.js",
    "vue.js": "vue.js",
    "angular": "angular",
    "angularjs": "angular",
    "redux": "redux",
    "redux toolkit": "redux",

    # Python ecosystem
    "py": "python",
    "python": "python",
    "python3": "python",
    "fastapi": "fastapi",
    "django": "django",
    "flask": "flask",
    "pandas": "pandas",
    "numpy": "numpy",
    "scipy": "scipy",
    "scikit-learn": "scikit-learn",
    "sklearn": "scikit-learn",
    "tensorflow": "tensorflow",
    "tf": "tensorflow",
    "pytorch": "pytorch",
    "torch": "pytorch",
    "keras": "keras",
    "matplotlib": "matplotlib",
    "seaborn": "seaborn",
    "nlp": "natural language processing",
    "natural language processing": "natural language processing",
    "cv": "computer vision",
    "computer vision": "computer vision",

    # Java ecosystem
    "java": "java",
    "spring": "spring boot",
    "springboot": "spring boot",
    "spring boot": "spring boot",
    "hibernate": "hibernate",

    # Databases
    "mongo": "mongodb",
    "mongodb": "mongodb",
    "mongo db": "mongodb",
    "postgres": "postgresql",
    "postgresql": "postgresql",
    "psql": "postgresql",
    "postgres db": "postgresql",
    "postgresql db": "postgresql",
    "mysql": "mysql",
    "sqlite": "sqlite",
    "sqlite3": "sqlite",
    "redis": "redis",
    "oracle": "oracle db",
    "cassandra": "cassandra",
    "sql": "sql",
    "nosql": "nosql",

    # Cloud & DevOps
    "docker": "docker",
    "k8s": "kubernetes",
    "kubernetes": "kubernetes",
    "aws": "aws",
    "amazon web services": "aws",
    "gcp": "google cloud platform",
    "google cloud": "google cloud platform",
    "azure": "microsoft azure",
    "microsoft azure": "microsoft azure",
    "ci/cd": "ci/cd",
    "cicd": "ci/cd",
    "jenkins": "jenkins",
    "github actions": "github actions",
    "terraform": "terraform",
    "ansible": "ansible",
    "linux": "linux",
    "bash": "bash/shell",
    "shell": "bash/shell",

    # Web & API
    "html": "html5",
    "html5": "html5",
    "html 5": "html5",
    "css": "css3",
    "css3": "css3",
    "css 3": "css3",
    "tailwind": "tailwind css",
    "tailwindcss": "tailwind css",
    "bootstrap": "bootstrap",
    "bootstrap 5": "bootstrap",
    "sass": "sass",
    "scss": "sass",
    "rest": "restful apis",
    "rest api": "restful apis",
    "rest apis": "restful apis",
    "restful": "restful apis",
    "restful api": "restful apis",
    "restful apis": "restful apis",
    "rest-api": "restful apis",
    "rest-apis": "restful apis",
    "restful-api": "restful apis",
    "restful-apis": "restful apis",
    "rest api's": "restful apis",
    "graphql": "graphql",
    "grpc": "grpc",
    "websockets": "websockets",
    "microservices": "microservices",

    # Version Control & Tools
    "git": "git",
    "git version control": "git",
    "git version control system": "git",
    "git-version-control": "git",
    "version control": "git",
    "version control (git)": "git",
    "version control using git": "git",
    "git/github": "git",
    "git / github": "git",
    "git & github": "git",
    "git and github": "git",
    "github": "git",
    "gitlab": "git",
    "postman": "postman",
    "jira": "jira",

    # Testing
    "jest": "jest",
    "pytest": "pytest",
    "mocha": "mocha",
    "selenium": "selenium",
    "cypress": "cypress",
    "unit testing": "unit testing",

    # Other Languages
    "c": "c",
    "c++": "c++",
    "cpp": "c++",
    "c#": "c#",
    "csharp": "c#",
    ".net": ".net",
    "dotnet": ".net",
    "go": "go",
    "golang": "go",
    "rust": "rust",
    "php": "php",
    "ruby": "ruby",
    "kotlin": "kotlin",
    "swift": "swift",
}

# Catalog of known technical skills for extraction
TECH_SKILLS_CATALOG = sorted(list(set(SKILL_SYNONYMS.keys())), key=lambda x: -len(x))

# -------------------------------------------------------------
# 12 Standard Entry-Level Career Roles Knowledge Base
# -------------------------------------------------------------
CAREER_ROLES_CATALOG = {
    "Software Developer": {
        "core_skills": ["python", "java", "c++", "c#", "javascript", "data structures", "algorithms", "git", "sql"],
        "description": "General software engineering involving core programming, algorithms, OOP, and system design fundamentals.",
        "project_ideas": ["CLI Tool or Task Manager", "Algorithm Visualizer", "Database-backed CRUD application"],
    },
    "Frontend Developer": {
        "core_skills": ["javascript", "typescript", "react", "html5", "css3", "tailwind css", "redux", "next.js", "restful apis"],
        "description": "Building interactive, responsive, and performant web interfaces and single-page applications.",
        "project_ideas": ["Interactive Dashboard with Analytics", "E-Commerce Storefront with Cart Checkout", "Collaborative Kanban Board"],
    },
    "Backend Developer": {
        "core_skills": ["node.js", "express.js", "python", "fastapi", "django", "postgresql", "mongodb", "restful apis", "docker"],
        "description": "Designing robust server-side APIs, database schemas, authentication systems, and cloud backend services.",
        "project_ideas": ["Role-Based Access Control REST API", "High-throughput URL Shortener with Redis", "Event-driven notification microservice"],
    },
    "Full Stack Developer": {
        "core_skills": ["javascript", "typescript", "react", "node.js", "express.js", "mongodb", "postgresql", "restful apis", "docker", "git"],
        "description": "End-to-end web engineering covering both modern frontend UI and resilient backend APIs/databases.",
        "project_ideas": ["Full Stack E-Commerce Platform with Stripe", "Social Community App with Live Messaging", "Project Management SaaS Tool"],
    },
    "Data Analyst": {
        "core_skills": ["python", "sql", "pandas", "numpy", "power bi", "tableau", "excel", "data visualization"],
        "description": "Extracting, cleaning, transforming, and interpreting data to drive actionable business insights.",
        "project_ideas": ["Sales & Revenue Analytics Dashboard", "Customer Churn Analysis Report", "Exploratory Data Analysis on Public Datasets"],
    },
    "Data Scientist": {
        "core_skills": ["python", "pandas", "numpy", "scikit-learn", "sql", "machine learning", "statistics", "data visualization"],
        "description": "Applying statistical models, predictive analytics, and machine learning to solve complex data challenges.",
        "project_ideas": ["Predictive House Price Regression Model", "Customer Segmentation Clustering", "Time Series Forecasting App"],
    },
    "Machine Learning Engineer": {
        "core_skills": ["python", "pytorch", "tensorflow", "scikit-learn", "numpy", "pandas", "docker", "fastapi", "mlops"],
        "description": "Building, optimizing, and deploying production machine learning models and pipelines.",
        "project_ideas": ["Image Classification API with PyTorch", "End-to-end ML Pipeline with FastAPI & Docker", "Text Sentiment Analysis Microservice"],
    },
    "AI Engineer": {
        "core_skills": ["python", "langchain", "pytorch", "fastapi", "openai", "transformers", "natural language processing", "vector databases"],
        "description": "Designing generative AI applications, LLM agent workflows, RAG pipelines, and intelligent automation systems.",
        "project_ideas": ["Retrieval-Augmented Generation (RAG) Document Q&A", "AI Agent for Task Automation", "Fine-tuned Domain Chatbot"],
    },
    "DevOps Engineer": {
        "core_skills": ["docker", "kubernetes", "linux", "ci/cd", "aws", "terraform", "bash/shell", "git", "python"],
        "description": "Automating continuous integration, containerization, cloud deployment, and system reliability.",
        "project_ideas": ["Automated CI/CD Pipeline with GitHub Actions & Docker", "Kubernetes Multi-Service Deployment", "Infrastructure as Code with Terraform on AWS"],
    },
    "Cybersecurity Analyst": {
        "core_skills": ["linux", "networking", "python", "wireshark", "cryptography", "bash/shell", "security auditing"],
        "description": "Monitoring network security, vulnerability assessments, penetration testing, and security protocol enforcement.",
        "project_ideas": ["Network Packet Sniffer & Analyzer in Python", "Vulnerability Scanner Automation Tool", "Secure Cryptographic File Vault"],
    },
    "QA Engineer": {
        "core_skills": ["python", "javascript", "selenium", "cypress", "jest", "pytest", "unit testing", "api testing", "postman", "git"],
        "description": "Ensuring software quality through test automation, regression testing, integration testing, and bug tracking.",
        "project_ideas": ["End-to-End Automated Test Suite with Cypress", "REST API Automated Test Framework with Postman & Newman", "Performance Benchmark Runner"],
    },
    "Cloud Engineer": {
        "core_skills": ["aws", "microsoft azure", "google cloud platform", "docker", "linux", "terraform", "python", "networking"],
        "description": "Architecting, configuring, and scaling cloud-native infrastructure and serverless solutions.",
        "project_ideas": ["Serverless REST API with AWS Lambda & DynamoDB", "Secure Multi-Tier Cloud VPC Architecture", "Automated Cloud Backup & Monitoring Solution"],
    },
}


CANONICAL_DISPLAY_NAMES = {
    "javascript": "JavaScript",
    "typescript": "TypeScript",
    "node.js": "Node.js",
    "express.js": "Express.js",
    "react": "React",
    "react native": "React Native",
    "next.js": "Next.js",
    "vue.js": "Vue.js",
    "angular": "Angular",
    "redux": "Redux",
    "python": "Python",
    "fastapi": "FastAPI",
    "django": "Django",
    "flask": "Flask",
    "pandas": "Pandas",
    "numpy": "NumPy",
    "scipy": "SciPy",
    "scikit-learn": "Scikit-Learn",
    "tensorflow": "TensorFlow",
    "pytorch": "PyTorch",
    "keras": "Keras",
    "matplotlib": "Matplotlib",
    "seaborn": "Seaborn",
    "natural language processing": "NLP",
    "computer vision": "Computer Vision",
    "java": "Java",
    "spring boot": "Spring Boot",
    "hibernate": "Hibernate",
    "mongodb": "MongoDB",
    "postgresql": "PostgreSQL",
    "sqlite": "SQLite",
    "mysql": "MySQL",
    "redis": "Redis",
    "sql": "SQL",
    "nosql": "NoSQL",
    "docker": "Docker",
    "kubernetes": "Kubernetes",
    "aws": "AWS",
    "google cloud platform": "GCP",
    "microsoft azure": "Azure",
    "ci/cd": "CI/CD",
    "jenkins": "Jenkins",
    "github actions": "GitHub Actions",
    "terraform": "Terraform",
    "ansible": "Ansible",
    "linux": "Linux",
    "bash/shell": "Bash / Shell",
    "html5": "HTML5",
    "css3": "CSS3",
    "tailwind css": "Tailwind CSS",
    "bootstrap": "Bootstrap",
    "sass": "Sass",
    "restful apis": "RESTful APIs",
    "graphql": "GraphQL",
    "grpc": "gRPC",
    "websockets": "WebSockets",
    "microservices": "Microservices",
    "git": "Git",
    "postman": "Postman",
    "jira": "Jira",
    "jest": "Jest",
    "pytest": "PyTest",
    "mocha": "Mocha",
    "selenium": "Selenium",
    "cypress": "Cypress",
    "unit testing": "Unit Testing",
    "c": "C",
    "c++": "C++",
    "c#": "C#",
    ".net": ".NET",
    "go": "Go",
    "rust": "Rust",
    "php": "PHP",
    "ruby": "Ruby",
    "kotlin": "Kotlin",
    "swift": "Swift",
}


def format_display_skill(original: str, canonical: str) -> str:
    """Format a skill name for display cleanly and faithfully."""
    if canonical in CANONICAL_DISPLAY_NAMES:
        return CANONICAL_DISPLAY_NAMES[canonical]
    if original and (original.isupper() or any(c.isupper() for c in original[1:])):
        return original.strip()
    return original.strip().title() if original else canonical.title()


def normalize_skill(skill: str) -> str:
    """Normalize a skill string into its canonical form."""
    if not skill or not isinstance(skill, str):
        return ""
    cleaned = skill.strip().lower()
    cleaned = re.sub(r"\s+", " ", cleaned)
    cleaned = re.sub(r"^[\s,;:()[\]{}'\"`*~-]+|[\s,;:()[\]{}'\"`*~-]+$", "", cleaned)
    
    if cleaned in SKILL_SYNONYMS:
        return SKILL_SYNONYMS[cleaned]

    if cleaned.endswith(".") and cleaned != ".net":
        without_dot = cleaned[:-1].strip()
        if without_dot in SKILL_SYNONYMS:
            return SKILL_SYNONYMS[without_dot]

    hyphen_spaced = re.sub(r"[-/]", " ", cleaned)
    if hyphen_spaced in SKILL_SYNONYMS:
        return SKILL_SYNONYMS[hyphen_spaced]

    return SKILL_SYNONYMS.get(cleaned, cleaned)


def extract_skills_from_text(text: str) -> List[str]:
    """Scan text for technical skills using word boundaries and aliases."""
    if not text:
        return []
    
    found_skills = set()
    lowered = text.lower()

    for alias, canonical in SKILL_SYNONYMS.items():
        escaped = re.escape(alias)
        pattern = rf"(?<![a-zA-Z0-9_#+]){escaped}(?![a-zA-Z0-9_#+])"
        if re.search(pattern, lowered):
            found_skills.add(canonical)

    return sorted(list(found_skills))


def extract_skills_from_resume(resume_data: Dict[str, Any]) -> List[str]:
    """Extract all technical skills listed across the resume structured sections."""
    skills_set = set()
    if not resume_data or not isinstance(resume_data, dict):
        return []

    # Check top-level skills or nested inside parsedData
    skills_obj = resume_data.get("skills")
    if not skills_obj and isinstance(resume_data.get("parsedData"), dict):
        skills_obj = resume_data["parsedData"].get("skills")
    if not skills_obj:
        skills_obj = {}

    if isinstance(skills_obj, dict):
        for cat in ["programmingLanguages", "frameworks", "databases", "tools", "other"]:
            cat_list = skills_obj.get(cat, [])
            if isinstance(cat_list, list):
                for s in cat_list:
                    if isinstance(s, str) and s.strip():
                        skills_set.add(normalize_skill(s))

    # 2. From projects
    projects = resume_data.get("projects")
    if projects is None and isinstance(resume_data.get("parsedData"), dict):
        projects = resume_data["parsedData"].get("projects")
    if isinstance(projects, list):
        for proj in projects:
            if isinstance(proj, dict):
                technologies = proj.get("technologies", [])
                if isinstance(technologies, list):
                    for tech in technologies:
                        if isinstance(tech, str) and tech.strip():
                            skills_set.add(normalize_skill(tech))
                desc = proj.get("description", "")
                if desc:
                    for s in extract_skills_from_text(desc):
                        skills_set.add(s)

    # 3. From experience
    experience = resume_data.get("experience")
    if experience is None and isinstance(resume_data.get("parsedData"), dict):
        experience = resume_data["parsedData"].get("experience")
    if isinstance(experience, list):
        for exp in experience:
            if isinstance(exp, dict):
                desc = exp.get("description", "")
                if desc:
                    for s in extract_skills_from_text(desc):
                        skills_set.add(s)

    # 4. From rawText if available
    raw_text = resume_data.get("rawText", "")
    if not raw_text and isinstance(resume_data.get("parsedData"), dict):
        raw_text = resume_data["parsedData"].get("rawText", "")
    if raw_text:
        for s in extract_skills_from_text(raw_text):
            skills_set.add(s)

    return sorted(list(skills_set))


# -------------------------------------------------------------
# Phase 4.1 & 4.2: Job Parsing Service
# -------------------------------------------------------------
def parse_job_description(job_description: str, job_title: str = None, company_name: str = None) -> ExtractedRequirements:
    """
    Parse a raw job description and extract requirements, distinguishing
    required from preferred skills, experience, and responsibilities.
    """
    text = job_description or ""
    lines = [line.strip() for line in text.split("\n") if line.strip()]

    required_section = []
    preferred_section = []
    responsibilities_section = []
    general_section = []

    current_mode = "general"

    # Identify section keywords
    req_headers = re.compile(r"(required|minimum qualifications?|must have|requirements?|what you('ll)? need|what we are looking for|key qualifications?)", re.I)
    pref_headers = re.compile(r"(preferred|nice to have|bonus|good to have|desired|optional|plus)", re.I)
    resp_headers = re.compile(r"(responsibilities|duties|what you will do|role overview|day to day|you will)", re.I)

    for line in lines:
        if req_headers.search(line) and len(line) < 60:
            current_mode = "required"
            continue
        elif pref_headers.search(line) and len(line) < 60:
            current_mode = "preferred"
            continue
        elif resp_headers.search(line) and len(line) < 60:
            current_mode = "responsibilities"
            continue

        if current_mode == "required":
            required_section.append(line)
        elif current_mode == "preferred":
            preferred_section.append(line)
        elif current_mode == "responsibilities":
            responsibilities_section.append(line)
        else:
            general_section.append(line)

    # If no explicit sections were found, partition roughly or extract from general
    req_text = " ".join(required_section)
    pref_text = " ".join(preferred_section)
    all_text = text

    req_skills = extract_skills_from_text(req_text)
    pref_skills = extract_skills_from_text(pref_text)
    all_extracted_skills = extract_skills_from_text(all_text)

    # If required section had no specific skills, treat the top skills in all_text as required
    if not req_skills and all_extracted_skills:
        req_skills = all_extracted_skills[:max(3, len(all_extracted_skills) * 3 // 4)]
        pref_skills = all_extracted_skills[len(req_skills):]
    else:
        # Avoid duplicate overlap between required and preferred
        pref_skills = [s for s in pref_skills if s not in req_skills]

    # Qualifications extraction
    quals = []
    degree_matches = re.findall(r"(bachelor['s]?|master['s]?|b\.?tech|b\.?e\.?|bca|mca|degree in computer science|equivalent)", all_text, re.I)
    if degree_matches:
        quals.append("Bachelor's or Master's degree in Computer Science, IT, or equivalent engineering discipline")
    else:
        quals.append("Relevant technical background or demonstrable programming capability")

    # Experience range extraction
    exp_match = re.search(r"(\d+[\s–-]+(?:\d+)?\s*(?:years?|yrs?))", all_text, re.I)
    if exp_match:
        exp_req = f"{exp_match.group(1)} of experience (or equivalent academic project experience)"
    else:
        exp_req = "Fresher / Entry-Level friendly (0-2 years, academic projects valued)"

    # Soft skills
    soft_skills_catalog = ["communication", "problem solving", "teamwork", "adaptability", "critical thinking", "collaboration", "leadership"]
    found_soft = [s.capitalize() for s in soft_skills_catalog if s in all_text.lower()]

    # Responsibilities samples
    extracted_resps = []
    if responsibilities_section:
        for r in responsibilities_section[:5]:
            if len(r) > 15:
                extracted_resps.append(r.lstrip("-•* "))
    if not extracted_resps:
        extracted_resps = [
            f"Develop, test, and maintain features aligned with the {job_title or 'engineering'} role",
            "Collaborate with cross-functional team members on system design and code reviews",
            "Produce clean, readable, and well-documented technical implementations",
        ]

    # Project requirements
    project_reqs = []
    if "full stack" in all_text.lower() or "web" in all_text.lower():
        project_reqs.append("Demonstrated web applications with frontend UI and backend API integration")
    if "api" in all_text.lower() or "backend" in all_text.lower():
        project_reqs.append("CRUD API or database-backed server application")
    if "data" in all_text.lower() or "analysis" in all_text.lower():
        project_reqs.append("Data processing or visualization project with clean dataset handling")
    if not project_reqs:
        project_reqs.append("Personal, academic, or open-source projects demonstrating hands-on coding")

    return ExtractedRequirements(
        required_skills=req_skills,
        preferred_skills=pref_skills,
        required_qualifications=quals,
        experience_requirements=exp_req,
        project_requirements=project_reqs,
        responsibilities=extracted_resps,
        soft_skills=found_soft if found_soft else ["Problem Solving", "Teamwork", "Effective Communication"],
    )


# -------------------------------------------------------------
# Phase 4.2 & 4.3 & 4.4: Job Matcher & Compatibility Scorer
# -------------------------------------------------------------
def match_resume_to_job(
    resume_data: Dict[str, Any],
    job_description: str,
    job_title: str = "Software Engineer",
    company_name: str = "Company",
    extracted_requirements: Optional[Dict[str, Any]] = None,
) -> JobMatchResponse:
    """
    Compares candidate resume with job description, generating:
    - Compatibility Score (0-100) using 35/25/15/15/10 weighted formula
    - Skill gap analysis (matched, missing required, missing preferred)
    - Detailed category evaluations
    """
    if extracted_requirements is not None:
        if isinstance(extracted_requirements, ExtractedRequirements):
            reqs = extracted_requirements
        else:
            reqs = ExtractedRequirements(**extracted_requirements)
    else:
        reqs = parse_job_description(job_description, job_title, company_name)

    resume_skills = extract_skills_from_resume(resume_data)
    resume_skills_canonical = {s: s for s in resume_skills}

    # Match skills against requirements
    matched_skills: List[SkillMatchItem] = []
    missing_required: List[MissingSkillDetail] = []
    missing_preferred: List[MissingSkillDetail] = []

    # 1. Match Required Skills
    req_matched_count = 0
    for req_skill in reqs.required_skills:
        canonical_req = normalize_skill(req_skill)
        formatted_name = format_display_skill(req_skill, canonical_req)
        if canonical_req in resume_skills_canonical:
            matched_skills.append(
                SkillMatchItem(
                    skill=formatted_name,
                    match_type="exact" if req_skill.strip().lower() == canonical_req else "equivalent",
                    matched_with=canonical_req,
                    is_required=True,
                )
            )
            req_matched_count += 1
        else:
            missing_required.append(
                MissingSkillDetail(
                    skill=formatted_name,
                    priority="High",
                    is_required=True,
                    reason=f"Identified as a core mandatory qualification in {company_name}'s {job_title} job description.",
                    suggested_learning_direction=f"Build a focused practical mini-project implementing {formatted_name} and add it to your resume.",
                )
            )

    # 2. Match Preferred Skills
    pref_matched_count = 0
    for pref_skill in reqs.preferred_skills:
        canonical_pref = normalize_skill(pref_skill)
        formatted_name = format_display_skill(pref_skill, canonical_pref)
        if canonical_pref in resume_skills_canonical:
            matched_skills.append(
                SkillMatchItem(
                    skill=formatted_name,
                    match_type="exact" if pref_skill.strip().lower() == canonical_pref else "equivalent",
                    matched_with=canonical_pref,
                    is_required=False,
                )
            )
            pref_matched_count += 1
        else:
            missing_preferred.append(
                MissingSkillDetail(
                    skill=formatted_name,
                    priority="Medium" if len(missing_required) < 2 else "Low",
                    is_required=False,
                    reason=f"Listed as preferred/nice-to-have by {company_name}; distinguishes top applicants.",
                    suggested_learning_direction=f"Explore {formatted_name} fundamentals and integrate into secondary project features.",
                )
            )

    # ---------------------------------------------------------
    # Weighted Compatibility Scoring (Prompt Section 5 Model)
    # 1. Technical Skills: 35%
    # 2. Projects Relevance: 25%
    # 3. Education Compatibility: 15%
    # 4. Experience / Internships: 15%
    # 5. Preferred Skills: 10%
    # Total: 100%
    # ---------------------------------------------------------

    # 1. Technical Skills (35% weight)
    total_req = len(reqs.required_skills)
    if total_req > 0:
        tech_ratio = req_matched_count / total_req
        breadth_bonus = min(20.0, len(resume_skills) * 2.0) if req_matched_count > 0 else 0.0
        raw_tech_score = min(100.0, round((tech_ratio * 80.0) + breadth_bonus, 1))
        weighted_tech = round(raw_tech_score * 0.35, 2)
        tech_feedback = (
            f"Matched {req_matched_count} of {total_req} core required technical skills. "
            f"{'Solid technical alignment with job specifications.' if tech_ratio >= 0.7 else 'Key role-specific technologies need to be evidenced.'}"
        )
    else:
        raw_tech_score = 0.0
        weighted_tech = 0.0
        tech_feedback = "No mandatory technical skills specified in job requirements."

    # 2. Projects Relevance (25% weight)
    projects = resume_data.get("projects")
    if projects is None and isinstance(resume_data.get("parsedData"), dict):
        projects = resume_data["parsedData"].get("projects")
    raw_proj_score = 0.0
    if projects and isinstance(projects, list):
        proj_count = len(projects)
        proj_tech_matches = 0
        has_links = 0
        for p in projects:
            p_techs = [normalize_skill(t) for t in p.get("technologies", [])]
            for rt in reqs.required_skills:
                if normalize_skill(rt) in p_techs:
                    proj_tech_matches += 1
            if p.get("link") and len(str(p.get("link")).strip()) > 5:
                has_links += 1

        base_pts = min(40, proj_count * 20)
        match_pts = min(40, proj_tech_matches * 15)
        link_pts = min(20, has_links * 10)
        raw_proj_score = min(100.0, float(base_pts + match_pts + link_pts))
        proj_feedback = (
            f"Found {proj_count} project(s) on your resume. "
            f"{'Projects demonstrate practical alignment with the required stack.' if proj_tech_matches > 0 else 'Consider tailoring projects to showcase tools explicitly mentioned in this job description.'}"
        )
    else:
        raw_proj_score = 15.0  # minimal baseline
        proj_feedback = "No projects section detected. Adding 2-3 role-aligned projects will dramatically raise compatibility."

    weighted_proj = round(raw_proj_score * 0.25, 2)
    proj_suggestions = (
        "Add measurable impact (e.g. latency, user metrics), public GitHub repositories, and live demo links."
    )

    # 3. Education Compatibility (15% weight)
    education = resume_data.get("education")
    if education is None and isinstance(resume_data.get("parsedData"), dict):
        education = resume_data["parsedData"].get("education")
    raw_edu_score = 30.0
    edu_feedback = "Education section found."
    if education and isinstance(education, list) and len(education) > 0:
        first_edu = education[0]
        deg = str(first_edu.get("degree", "")).lower()
        spec = str(first_edu.get("specialization", "")).lower()
        if any(term in deg or term in spec for term in ["computer", "technology", "software", "information", "cs", "it"]):
            raw_edu_score = 95.0
            edu_feedback = "Degree and technical specialization strongly match job qualifications."
        elif deg:
            raw_edu_score = 75.0
            edu_feedback = "Degree background is valid; focus on highlighting technical coursework or projects."
    else:
        raw_edu_score = 20.0
        edu_feedback = "Education details not clearly parsed. Add institution, degree, and graduation year."

    weighted_edu = round(raw_edu_score * 0.15, 2)

    # 4. Experience / Internships (15% weight)
    experience = resume_data.get("experience")
    if experience is None and isinstance(resume_data.get("parsedData"), dict):
        experience = resume_data["parsedData"].get("experience")
    raw_exp_score = 0.0
    exp_feedback = ""
    student_perspective = ""

    if experience and isinstance(experience, list) and len(experience) > 0:
        exp_count = len(experience)
        has_internship = any("intern" in str(e.get("position", "")).lower() for e in experience)
        if has_internship or exp_count >= 1:
            raw_exp_score = min(100.0, 70.0 + (exp_count * 15))
            exp_feedback = f"Demonstrated practical track record with {exp_count} experience or internship entry/entries."
            student_perspective = "Your internship and practical experience gives you a strong competitive edge over other freshers."
        else:
            raw_exp_score = 65.0
            exp_feedback = "Experience listed; emphasize concrete engineering contributions and deliverables."
            student_perspective = "Highlight responsibilities that mirror day-to-day requirements of the role."
    else:
        # Student friendly scoring: evaluate academic projects as substitute for freshers
        if raw_proj_score >= 60:
            raw_exp_score = 50.0  # Compensated by projects
            exp_feedback = "No commercial employment listed, but strong academic/personal projects demonstrate practical capability."
            student_perspective = "For student freshers, impactful portfolio projects and open-source contributions substitute well for formal employment."
        else:
            raw_exp_score = 25.0
            exp_feedback = "Limited work or internship experience detected."
            student_perspective = "Prioritize securing an internship, contributing to open-source, or completing team-based hackathons."

    weighted_exp = round(raw_exp_score * 0.15, 2)

    # 5. Preferred Skills (10% weight)
    total_pref = len(reqs.preferred_skills)
    if total_pref > 0:
        pref_ratio = pref_matched_count / total_pref
        raw_pref_score = round(pref_ratio * 100.0, 1)
        pref_feedback = f"Matched {pref_matched_count} of {total_pref} preferred/bonus skills."
    else:
        raw_pref_score = 0.0
        pref_feedback = "No preferred skills specified in job requirements."

    weighted_pref = round(raw_pref_score * 0.10, 2)

    # Enforce maximum weights caps
    weighted_tech = min(35.0, max(0.0, weighted_tech))
    weighted_proj = min(25.0, max(0.0, weighted_proj))
    weighted_edu = min(15.0, max(0.0, weighted_edu))
    weighted_exp = min(15.0, max(0.0, weighted_exp))
    weighted_pref = min(10.0, max(0.0, weighted_pref))

    # Overall compatibility calculation strictly equals sum of weighted category scores
    sum_category = round(weighted_tech + weighted_proj + weighted_edu + weighted_exp + weighted_pref, 2)
    overall_score = round(min(100.0, max(0.0, sum_category)), 1)

    # Match classification according to Prompt Section 5
    if overall_score >= 85:
        match_classification = "Excellent Match"
    elif overall_score >= 70:
        match_classification = "Strong Match"
    elif overall_score >= 50:
        match_classification = "Moderate Match"
    else:
        match_classification = "Low Match"

    # Overall explanation & observations
    req_mention = f"You demonstrate {req_matched_count} of {total_req} core required technical skills. " if total_req > 0 else "No mandatory technical requirements were specified. "
    explanation = (
        f"You scored {overall_score}/100 ({match_classification}) for the {job_title} position at {company_name}. "
        f"{req_mention}"
        f"{'Focus on filling the remaining critical skill gaps to maximize interview conversion.' if missing_required else 'Your technical foundation closely mirrors this role.'}"
    )

    observations = [
        f"Core technical skill compatibility is at {raw_tech_score}% ({weighted_tech}/35 pts).",
        f"Projects relevance scored {raw_proj_score}% ({weighted_proj}/25 pts).",
        f"Education alignment scored {raw_edu_score}% ({weighted_edu}/15 pts).",
        f"Experience / Practical track record scored {raw_exp_score}% ({weighted_exp}/15 pts).",
        f"Preferred/Bonus skills scored {raw_pref_score}% ({weighted_pref}/10 pts).",
    ]

    return JobMatchResponse(
        overall_score=overall_score,
        match_classification=match_classification,
        category_scores=JobMatchCategoryScores(
            technical_skills=JobMatchCategoryScore(
                score=raw_tech_score,
                weighted_score=weighted_tech,
                weight_percentage=35.0,
                feedback=tech_feedback,
            ),
            projects_relevance=JobMatchCategoryScore(
                score=raw_proj_score,
                weighted_score=weighted_proj,
                weight_percentage=25.0,
                feedback=proj_feedback,
            ),
            education_compatibility=JobMatchCategoryScore(
                score=raw_edu_score,
                weighted_score=weighted_edu,
                weight_percentage=15.0,
                feedback=edu_feedback,
            ),
            experience_internships=JobMatchCategoryScore(
                score=raw_exp_score,
                weighted_score=weighted_exp,
                weight_percentage=15.0,
                feedback=exp_feedback,
            ),
            preferred_skills=JobMatchCategoryScore(
                score=raw_pref_score,
                weighted_score=weighted_pref,
                weight_percentage=10.0,
                feedback=pref_feedback,
            ),
        ),
        matched_skills=matched_skills,
        missing_required_skills=missing_required,
        missing_preferred_skills=missing_preferred,
        project_evaluation=ProjectEvaluation(
            relevance_score=raw_proj_score,
            feedback=proj_feedback,
            suggestions=proj_suggestions,
        ),
        education_evaluation=EducationEvaluation(
            compatibility_score=raw_edu_score,
            feedback=edu_feedback,
        ),
        experience_evaluation=ExperienceEvaluation(
            compatibility_score=raw_exp_score,
            feedback=exp_feedback,
            student_perspective=student_perspective,
        ),
        matching_explanation=explanation,
        key_observations=observations,
        analysis_provider="fastapi-nlp-engine",
    )


# -------------------------------------------------------------
# Phase 4.5: Career Path Recommendations Engine
# -------------------------------------------------------------
def generate_career_recommendations(
    resume_data: Dict[str, Any],
    job_description: Optional[str] = None,
    target_role: Optional[str] = None,
) -> CareerRecommendationResponse:
    """
    Evaluates candidate's background across 12 standard entry-level career paths,
    generating primary and alternative paths tailored for students and freshers.
    """
    resume_skills = set(extract_skills_from_resume(resume_data))
    
    role_scores: List[Tuple[str, float, List[str], List[str], str, List[str]]] = []

    for role_name, role_info in CAREER_ROLES_CATALOG.items():
        core_skills = role_info["core_skills"]
        matched = [s for s in core_skills if s in resume_skills]
        missing = [s for s in core_skills if s not in resume_skills]
        
        match_ratio = len(matched) / max(1, len(core_skills))
        score = round(match_ratio * 100, 1)

        # Boost slightly if target_role matches or job description mentions role
        if target_role and role_name.lower() in target_role.lower():
            score = min(100.0, score + 15)
        if job_description and role_name.lower() in job_description.lower():
            score = min(100.0, score + 10)

        why_rec = (
            f"You already demonstrate {len(matched)} of {len(core_skills)} foundational skills for {role_name} "
            f"({', '.join([s.capitalize() for s in matched[:4]])})."
            if matched else f"Entry-level path accessible through dedicated learning of {', '.join([s.capitalize() for s in core_skills[:3]])}."
        )

        role_scores.append((role_name, score, matched, missing, why_rec, role_info["project_ideas"]))

    # Sort descending by score
    role_scores.sort(key=lambda x: x[1], reverse=True)

    primary_items = []
    for item in role_scores[:3]:
        name, score, matched, missing, why, projects = item
        primary_items.append(
            CareerPathItem(
                role=name,
                recommendation_score=score,
                why_recommended=why,
                relevant_existing_skills=[s.capitalize() for s in matched],
                missing_skills=[s.capitalize() for s in missing[:4]],
                suggested_projects=projects,
                preparation_priorities=[
                    f"Master core requirement: {missing[0].capitalize()}" if missing else "Build a production-grade showcase project",
                    "Add GitHub repository links with structured README documentation",
                    "Prepare for role-specific technical and problem-solving interview rounds",
                ],
                is_primary=True,
            )
        )

    alternative_items = []
    for item in role_scores[3:6]:
        name, score, matched, missing, why, projects = item
        alternative_items.append(
            CareerPathItem(
                role=name,
                recommendation_score=score,
                why_recommended=why,
                relevant_existing_skills=[s.capitalize() for s in matched],
                missing_skills=[s.capitalize() for s in missing[:4]],
                suggested_projects=projects,
                preparation_priorities=[
                    f"Bridge skill gap by learning {missing[0].capitalize()}" if missing else "Explore cross-domain integration",
                    "Create 1 targeted project demonstrating domain fundamentals",
                ],
                is_primary=False,
            )
        )

    student_advice = (
        "As a student or fresher, focus on demonstrating depth in 1 primary career path while keeping 1 complementary "
        "secondary path open. Recruiters value well-documented portfolio projects and a clear understanding of core "
        "concepts over superficial exposure to dozens of unrelated technologies."
    )

    return CareerRecommendationResponse(
        primary_recommendations=primary_items,
        alternative_recommendations=alternative_items,
        student_advice=student_advice,
        analysis_provider="fastapi-nlp-engine",
    )


# -------------------------------------------------------------
# Phase 4.6: Personalized Learning Roadmap Generator
# -------------------------------------------------------------
def get_beginner_friendly_weekly_module(skill_name: str, week_num: int, total_weeks: int, job_title: str, target_skills: List[str]) -> Dict[str, Any]:
    norm = (skill_name or "").lower().strip()
    is_final_week = week_num == total_weeks and total_weeks >= 3

    if is_final_week:
        focus_roles = ", ".join(target_skills[:3]) if target_skills else "core technical tools"
        return {
            "title": f"Week {week_num}: Build Your {job_title} Showcase Project",
            "learning_objective": f"Combine everything you learned into one complete project you can proudly put on your resume and show to employers.",
            "skill_to_learn": f"{job_title} Portfolio Project",
            "priority": "High",
            "estimated_duration": "1 Week (6-8 flexible hours)",
            "learning_sequence": [
                f"Plan a practical application that solves an everyday problem using {focus_roles}",
                "Connect your user interface, backend logic, and data storage into one working system",
                "Write a clear, friendly README file with project screenshots, features, and setup steps",
                "Practice explaining your project in simple, natural words for upcoming interviews",
            ],
            "practical_exercises": [
                "Test all buttons, forms, and pages to make sure there are no broken links or errors",
                "Deploy your project to a free hosting service so anyone can test it with a live link",
                'Practice answering: "What does this project do and what was the most interesting part you built?"',
            ],
            "suggested_mini_projects": [
                f"Complete {job_title} showcase project with a live web link and public GitHub repository",
            ],
            "expected_outcome": "You will have an impressive, working portfolio project that demonstrates your hands-on skills to recruiters.",
        }

    # 1. APIs / RESTful APIs
    if "api" in norm or "rest" in norm or "endpoint" in norm:
        return {
            "title": f"Week {week_num}: Learn API Basics and Connect Services",
            "learning_objective": "Understand how applications talk to each other and learn how to fetch, send, and display data using web APIs.",
            "skill_to_learn": "RESTful APIs",
            "priority": "High",
            "estimated_duration": "1 Week (6-8 flexible hours)",
            "learning_sequence": [
                "Understand what an API is and why modern websites and mobile apps use them",
                "Learn how common requests work: GET (view data), POST (create data), PUT (update), and DELETE (remove)",
                "Learn how to read and write JSON data, the universal language of web applications",
                "Use beginner-friendly tools like Postman to test sending and receiving API requests",
            ],
            "practical_exercises": [
                "Send your first GET request to a free public API (such as weather or quote data) using Postman",
                "Build a simple API endpoint that receives user data and responds with a friendly JSON message",
                "Test what happens when requested data is missing, returning a standard 404 error code",
            ],
            "suggested_mini_projects": [
                "Build a simple application that fetches live data from an API and displays it on screen",
            ],
            "expected_outcome": "You will understand how web APIs work and be able to connect your application to external services with confidence.",
        }

    # 2. Docker / Containers
    if "docker" in norm or "container" in norm:
        return {
            "title": f"Week {week_num}: Learn Docker Basics and Run Apps in Containers",
            "learning_objective": "Understand what Docker does and learn how to run your application inside an isolated, reliable container.",
            "skill_to_learn": "Docker & Containers",
            "priority": "High" if week_num <= 2 else "Medium",
            "estimated_duration": "1 Week (6-8 flexible hours)",
            "learning_sequence": [
                'Learn what containers are and why developers use Docker to make sure apps run the same way everywhere',
                "Install Docker Desktop on your computer and learn essential starter commands",
                "Understand what a Dockerfile is and how it tells Docker how to package your code and tools",
                "Learn how Docker Compose launches both your web app and a database together with one command",
            ],
            "practical_exercises": [
                "Write a simple 5-line Dockerfile for a sample project on your machine",
                "Build a Docker image and run it locally in your browser",
                "Practice viewing running containers and stopping them from the terminal or Docker Desktop",
            ],
            "suggested_mini_projects": [
                "Package a small web application inside Docker so anyone can run it on their computer with one command",
            ],
            "expected_outcome": "You will understand how Docker works and be able to run and share containerized apps with ease.",
        }

    # 3. React / Frontend UI
    if "react" in norm or "frontend" in norm or "ui" in norm:
        return {
            "title": f"Week {week_num}: Build Interactive User Interfaces with React",
            "learning_objective": "Learn the fundamental building blocks of React and create interactive, modern web pages with reusable components.",
            "skill_to_learn": "React",
            "priority": "High",
            "estimated_duration": "1 Week (6-8 flexible hours)",
            "learning_sequence": [
                "Understand how React breaks web pages into reusable pieces called components (like buttons, navbars, and cards)",
                "Learn JSX syntax, which allows writing HTML-like code directly inside your JavaScript files",
                "Learn how useState holds dynamic information that changes when users click, type, or interact",
                "Learn how props allow parent components to pass data and instructions down to child components",
            ],
            "practical_exercises": [
                "Build a small interactive counter with plus and minus buttons to practice useState",
                "Create a reusable ProductCard component that displays an image, title, price, and buy button",
                "Render a list of items dynamically on the screen using JavaScript's map function in React",
            ],
            "suggested_mini_projects": [
                "Build an interactive To-Do List or Recipe App with add, mark as complete, and delete actions",
            ],
            "expected_outcome": "You will be able to build dynamic, responsive web interfaces using modern React components.",
        }

    # 4. Node.js / Express / Backend
    if "node" in norm or "express" in norm or "backend" in norm or "server" in norm:
        return {
            "title": f"Week {week_num}: Build Your First Backend Server with Node.js and Express",
            "learning_objective": "Learn how backend servers work and build your own web server that handles user requests and URLs.",
            "skill_to_learn": "Node.js & Express",
            "priority": "High",
            "estimated_duration": "1 Week (6-8 flexible hours)",
            "learning_sequence": [
                "Understand the role of backend servers in processing business logic and protecting sensitive data",
                "Set up a Node.js project using npm init and install the Express library",
                "Learn how Express routes handle visits to different pages and URLs like /users or /products",
                "Understand how request and response objects send HTML or JSON back to the browser",
            ],
            "practical_exercises": [
                "Create a basic Express server that listens on port 5000 and responds to visit requests",
                "Create a GET /api/items endpoint that returns a list of items as JSON",
                "Create a POST /api/items endpoint that accepts new items sent from a form or API client",
            ],
            "suggested_mini_projects": [
                "Build a Notes or Task Manager API that lets users view, create, and delete notes",
            ],
            "expected_outcome": "You will know how to create backend servers and build REST API endpoints from scratch.",
        }

    # 5. Databases / MongoDB / SQL / PostgreSQL
    if "mongo" in norm or "sql" in norm or "database" in norm or "postgres" in norm:
        return {
            "title": f"Week {week_num}: Store and Manage Application Data with Databases",
            "learning_objective": "Learn how databases store information permanently and how to connect your backend application to a database.",
            "skill_to_learn": skill_name,
            "priority": "High",
            "estimated_duration": "1 Week (6-8 flexible hours)",
            "learning_sequence": [
                "Understand why applications need persistent databases instead of storing data in temporary variables",
                "Learn the four core database operations (CRUD): Create, Read, Update, and Delete",
                "Set up a free cloud database (like MongoDB Atlas or Supabase PostgreSQL)",
                "Learn how to connect your backend code to the database using an easy library (Mongoose or Prisma)",
            ],
            "practical_exercises": [
                "Connect your backend server to your database and test saving your first document",
                "Write queries to find specific records (such as finding all users created today)",
                "Update an existing record and verify the change in your database dashboard",
            ],
            "suggested_mini_projects": [
                "Build a Contact Book API that stores, updates, and searches contact cards in a real database",
            ],
            "expected_outcome": "You will be able to connect any application to a real database and perform all essential data operations.",
        }

    # 6. Testing / QA / Unit Testing
    if "test" in norm or "qa" in norm or "jest" in norm:
        return {
            "title": f"Week {week_num}: Test Your Code to Prevent Bugs and Errors",
            "learning_objective": "Learn how to write simple automated tests so you can be confident your code works properly before deploying.",
            "skill_to_learn": "Automated Testing",
            "priority": "Medium",
            "estimated_duration": "1 Week (6-8 flexible hours)",
            "learning_sequence": [
                "Understand why testing saves time and prevents embarrassing bugs in production",
                "Learn what a unit test is: a small script that tests one specific function or feature",
                "Explore common testing tools and learn how to write test cases with assert or expect",
                "Learn how to test both normal inputs (happy path) and edge cases (like empty inputs or invalid numbers)",
            ],
            "practical_exercises": [
                "Write 3 unit tests for a simple calculator or string-formatting function",
                "Test an API endpoint to verify it returns a 200 success status when given valid data",
                "Test that an API endpoint properly rejects missing inputs with a helpful 400 error message",
            ],
            "suggested_mini_projects": [
                "Add automated test coverage to an existing project and verify all tests pass with one command",
            ],
            "expected_outcome": "You will be able to write automated tests that catch bugs early and prove your code is reliable.",
        }

    # 7. Git / GitHub
    if "git" in norm or "version control" in norm:
        return {
            "title": f"Week {week_num}: Track Code Changes and Collaborate with Git & GitHub",
            "learning_objective": "Master version control basics so you never lose your work and can showcase your code on GitHub.",
            "skill_to_learn": "Git & GitHub",
            "priority": "High",
            "estimated_duration": "1 Week (6-8 flexible hours)",
            "learning_sequence": [
                "Understand what version control is and why every software developer uses Git daily",
                "Learn the primary Git commands: git init, git add, git commit, and git push",
                "Create a GitHub account and push your first local repository to the cloud",
                "Learn how Git branches let you experiment on new features without breaking your main code",
            ],
            "practical_exercises": [
                "Initialize a Git repository, make 3 meaningful commits with clear messages, and push to GitHub",
                "Create a new branch, add a feature, commit it, and merge it back into main",
                "Write a clean README.md file explaining what your project does with screenshots",
            ],
            "suggested_mini_projects": [
                "Publish a polished project repository on GitHub with clean commit history and setup instructions",
            ],
            "expected_outcome": "You will be able to comfortably save, track, and showcase all your code on GitHub like a professional.",
        }

    # 8. Cloud / Deployment
    if "cloud" in norm or "aws" in norm or "deploy" in norm or "ci/cd" in norm or "devops" in norm:
        return {
            "title": f"Week {week_num}: Deploy Your Application to the Live Internet",
            "learning_objective": "Learn how to host your application on the web so anyone with a link can use it from anywhere.",
            "skill_to_learn": "Cloud Deployment",
            "priority": "Medium",
            "estimated_duration": "1 Week (6-8 flexible hours)",
            "learning_sequence": [
                "Understand the difference between running an app on your local machine vs. hosting it in the cloud",
                "Explore beginner-friendly hosting platforms (like Vercel, Render, or Netlify)",
                "Learn how environment variables keep secret passwords and database keys safe in production",
                "Connect your GitHub repository to a hosting platform for automatic deployments on push",
            ],
            "practical_exercises": [
                "Deploy a frontend web app on Vercel or Netlify and get a public live URL",
                "Deploy a backend API server on Render and test it using a public link",
                "Configure environment variables on your hosting dashboard so your live app connects to your database",
            ],
            "suggested_mini_projects": [
                "Deploy a complete full-stack web application with a live URL to share on your resume and LinkedIn",
            ],
            "expected_outcome": "You will know how to take any web project from your computer and deploy it live to the internet.",
        }

    # 9. Python
    if "python" in norm:
        return {
            "title": f"Week {week_num}: Python Fundamentals and Helpful Automation Scripts",
            "learning_objective": "Learn Python syntax, essential data structures, and how to write scripts that automate everyday tasks.",
            "skill_to_learn": "Python",
            "priority": "High",
            "estimated_duration": "1 Week (6-8 flexible hours)",
            "learning_sequence": [
                "Learn Python syntax: variables, conditionals (if/else), loops, and functions",
                "Master Python's built-in data collections: lists, dictionaries, and sets",
                "Learn how to read and write files (text, CSV, JSON) on your computer using Python",
                "Install useful third-party packages using pip (Python's package installer)",
            ],
            "practical_exercises": [
                "Write a script that counts word frequencies in a text document",
                "Write a function that reads a CSV file and calculates the average value of a column",
                "Create a simple interactive quiz program that asks users questions and calculates their score",
            ],
            "suggested_mini_projects": [
                "Build an automated file organizer that sorts files on your computer into folders by extension",
            ],
            "expected_outcome": "You will have a strong grasp of Python programming and be able to automate everyday file and data tasks.",
        }

    # 10. Data Analysis / Pandas
    if "pandas" in norm or "data analysis" in norm or "numpy" in norm:
        return {
            "title": f"Week {week_num}: Explore and Clean Real-World Data with Pandas",
            "learning_objective": "Learn how to load, filter, clean, and analyze spreadsheets and datasets using Python and Pandas.",
            "skill_to_learn": "Data Analysis with Pandas",
            "priority": "High",
            "estimated_duration": "1 Week (6-8 flexible hours)",
            "learning_sequence": [
                "Understand what Pandas is and how its DataFrames represent tables of data",
                "Learn how to load CSV, Excel, and JSON data files into Pandas with one line of code",
                "Learn how to inspect datasets: check column types, summary statistics, and missing values",
                "Learn how to filter rows and select columns based on conditions (like sales > 1000)",
            ],
            "practical_exercises": [
                "Load a real dataset (like student test scores or movie ratings) and find the top 5 highest values",
                "Clean missing or null data by filling values or removing empty rows",
                "Group data by category (using groupby) and compute totals and averages",
            ],
            "suggested_mini_projects": [
                "Build an Exploratory Data Analysis report answering 5 interesting questions about a real dataset",
            ],
            "expected_outcome": "You will be able to take messy spreadsheets and datasets, clean them up, and extract useful insights.",
        }

    # 11. JavaScript / TypeScript
    if "javascript" in norm or "typescript" in norm or "js" in norm or "ts" in norm:
        return {
            "title": f"Week {week_num}: JavaScript Essentials and Modern Syntax",
            "learning_objective": "Master core JavaScript concepts that power modern web and frontend development.",
            "skill_to_learn": "JavaScript Essentials",
            "priority": "High",
            "estimated_duration": "1 Week (6-8 flexible hours)",
            "learning_sequence": [
                "Learn modern JavaScript syntax: const/let, arrow functions, template strings, and destructuring",
                "Understand how asynchronous code works: Promises, async/await, and fetching web data",
                "Learn how JavaScript interacts with web pages: listening for button clicks and updating HTML",
                "Understand how to avoid common beginner bugs using console.log and basic browser developer tools",
            ],
            "practical_exercises": [
                "Write an async function that fetches data from an API and logs the result",
                "Filter and transform an array of student objects using map and filter",
                "Build a simple form validation function that checks if an email contains an @ symbol",
            ],
            "suggested_mini_projects": [
                "Build an interactive currency converter or tip calculator in the browser",
            ],
            "expected_outcome": "You will have a solid foundation in modern JavaScript and be ready to learn web frameworks like React or Node.js.",
        }

    # 12. Dynamic Beginner-Friendly Fallback for Any Other Custom Role / Skill
    if week_num == 1:
        return {
            "title": f"Week 1: Learn {skill_name} Basics and Set Up Your Environment",
            "learning_objective": f"Understand what {skill_name} is, why developers use it, and set up your workspace to write your first code.",
            "skill_to_learn": skill_name,
            "priority": "High",
            "estimated_duration": "1 Week (6-8 flexible hours)",
            "learning_sequence": [
                f"Learn the basic concepts of {skill_name} and how it fits into modern software development",
                "Install the necessary software, code editor plugins, and tools on your computer",
                "Read simple examples and understand common patterns used by developers",
                "Learn how to look up documentation and troubleshoot error messages when you get stuck",
            ],
            "practical_exercises": [
                f"Write a simple beginner exercise exploring the basic features of {skill_name}",
                "Test making small changes to see how the output changes",
                "Practice fixing a deliberate typo or error to get comfortable with debugging",
            ],
            "suggested_mini_projects": [
                f"Build a small starter project demonstrating the fundamental features of {skill_name}",
            ],
            "expected_outcome": f"You will feel comfortable with the core ideas of {skill_name} and be ready to build more complex features.",
        }

    if week_num == 2:
        return {
            "title": f"Week 2: Build Useful Features with {skill_name}",
            "learning_objective": f"Take your knowledge of {skill_name} further by connecting it with data storage and handling user requests.",
            "skill_to_learn": skill_name,
            "priority": "High",
            "estimated_duration": "1 Week (6-8 flexible hours)",
            "learning_sequence": [
                f"Learn how {skill_name} works together with databases and web services",
                "Understand how to keep user data secure and organize your code into clean folders",
                "Learn common design patterns that make your code easy to read and maintain",
            ],
            "practical_exercises": [
                f"Build a feature that saves and retrieves data using {skill_name}",
                "Test how your code handles invalid inputs or slow internet connections",
            ],
            "suggested_mini_projects": [
                f"Build a practical mini-application powered by {skill_name} that solves an everyday task",
            ],
            "expected_outcome": f"You will be able to build functional, well-organized features using {skill_name}.",
        }

    return {
        "title": f"Week {week_num}: Test, Improve, and Package Your {skill_name} Project",
        "learning_objective": f"Make your project reliable, fix errors, and learn how developers prepare code for real users.",
        "skill_to_learn": skill_name,
        "priority": "Medium",
        "estimated_duration": "1 Week (6-8 flexible hours)",
        "learning_sequence": [
            "Learn how to test your code automatically so you don't have to check everything by hand",
            "Understand how to package your application so it runs easily on any computer",
            "Learn simple ways to speed up your code and organize your files neatly",
        ],
        "practical_exercises": [
            "Write 3 simple tests to verify your project works under different conditions",
            "Clean up your code, add helpful comments, and test running it in a clean environment",
        ],
        "suggested_mini_projects": [
            f"Package and document your {skill_name} application with clear instructions so anyone can run it",
        ],
        "expected_outcome": "You will know how to write reliable, well-tested code and prepare applications for deployment.",
    }


def generate_learning_roadmap(
    resume_data: Dict[str, Any],
    job_description: str,
    job_title: str = "Software Engineer",
    company_name: str = None,
    missing_skills: Optional[List[Dict[str, Any]]] = None,
    duration_weeks: int = 4,
) -> RoadmapResponse:
    """
    Generates a structured, beginner-friendly week-by-week learning roadmap
    specifically addressing the skills missing for the target job.
    """
    # 1. Determine key missing skills to address
    target_skills = []
    if missing_skills and isinstance(missing_skills, list):
        for ms in missing_skills:
            if isinstance(ms, dict) and ms.get("skill"):
                target_skills.append(ms["skill"])
    
    if not target_skills:
        # Extract from job description
        reqs = parse_job_description(job_description, job_title, company_name)
        resume_skills = set(extract_skills_from_resume(resume_data))
        for s in reqs.required_skills + reqs.preferred_skills:
            canonical = normalize_skill(s)
            if canonical not in resume_skills:
                target_skills.append(s.capitalize())

    # Default fallback skills if none were missing
    if not target_skills:
        target_skills = ["RESTful APIs", "Docker & Containerization", "Automated Testing", "Cloud Deployment"]

    # Limit to weeks requested
    num_weeks = max(2, min(duration_weeks, 8))
    items: List[RoadmapItem] = []

    for i in range(num_weeks):
        skill_name = target_skills[i % len(target_skills)]
        week_num = i + 1
        module_data = get_beginner_friendly_weekly_module(skill_name, week_num, num_weeks, job_title, target_skills)

        items.append(
            RoadmapItem(
                week_number=week_num,
                title=module_data["title"],
                learning_objective=module_data["learning_objective"],
                skill_to_learn=module_data.get("skill_to_learn", skill_name),
                priority=module_data.get("priority", "High" if week_num <= 2 else "Medium"),
                estimated_duration=module_data.get("estimated_duration", "1 Week (6-8 flexible hours)"),
                learning_sequence=module_data["learning_sequence"],
                practical_exercises=module_data["practical_exercises"],
                suggested_mini_projects=module_data["suggested_mini_projects"],
                expected_outcome=module_data["expected_outcome"],
            )
        )

    summary = (
        f"A friendly, step-by-step {num_weeks}-week learning guide designed to help you master core skills for "
        f"{job_title} at your own pace, with hands-on practice every week."
    )

    return RoadmapResponse(
        title=f"Personalized Learning Roadmap for {job_title}",
        target_role=job_title,
        company_name=company_name,
        summary=summary,
        total_weeks=num_weeks,
        items=items,
        analysis_provider="fastapi-nlp-engine",
    )
