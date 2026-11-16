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
def generate_learning_roadmap(
    resume_data: Dict[str, Any],
    job_description: str,
    job_title: str = "Software Engineer",
    company_name: str = None,
    missing_skills: Optional[List[Dict[str, Any]]] = None,
    duration_weeks: int = 4,
) -> RoadmapResponse:
    """
    Generates a structured, progressive week-by-week learning roadmap
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
        target_skills = ["RESTful APIs", "Docker & Containerization", "Unit Testing", "Cloud Deployment"]

    # Limit to weeks requested
    num_weeks = max(2, min(duration_weeks, 8))
    items: List[RoadmapItem] = []

    for i in range(num_weeks):
        skill_name = target_skills[i % len(target_skills)]
        week_num = i + 1

        if week_num == 1:
            title = f"Week 1: Core Fundamentals & Setup with {skill_name}"
            objective = f"Establish a rock-solid foundation in {skill_name} and environment setup."
            seq = [
                f"Study official {skill_name} core architecture, documentation, and syntax patterns",
                "Configure local development environment and run initial 'Hello World' experiments",
                "Implement basic modules and error-handling routines",
            ]
            exercises = [
                f"Build a standalone script or component exercising {skill_name} features",
                "Write 3 test cases validating happy and edge-case execution",
            ]
            mini_projects = [
                f"Interactive CLI or utility module leveraging {skill_name}"
            ]
            outcome = f"Confident command of {skill_name} syntax and configuration patterns."

        elif week_num == 2:
            title = f"Week 2: Advanced Patterns & Integration with {skill_name}"
            objective = f"Deep dive into production architectural patterns and data handling with {skill_name}."
            seq = [
                f"Integrate {skill_name} with persistent storage or backend services",
                "Implement secure input sanitization and structured logging",
                "Refactor codebase into clean, decoupled service layers",
            ]
            exercises = [
                "Implement a service class with error handling and retry logic",
                "Benchmark and optimize memory or response latency",
            ]
            mini_projects = [
                f"Service micro-app implementing {skill_name} with persistent database"
            ]
            outcome = f"Ability to write maintainable, production-ready code using {skill_name}."

        elif week_num == 3:
            title = f"Week 3: Testing, Containment & DevOps with {skill_name}"
            objective = "Containerize, write automated tests, and prepare for CI/CD deployment."
            seq = [
                f"Write unit and integration tests covering the {skill_name} implementation",
                "Create a multi-stage Dockerfile for lightweight, secure packaging",
                "Configure GitHub Actions to automatically run tests on git push",
            ]
            exercises = [
                "Achieve 80%+ test branch coverage on core logic",
                "Build and run containerized image locally with docker-compose",
            ]
            mini_projects = [
                "Containerized service with automated GitHub Actions CI workflow"
            ]
            outcome = "Enterprise-grade testing and containerization competence."

        else:
            title = f"Week {week_num}: Capstone Project & Interview Readiness"
            objective = "Synthesize all learned skills into a comprehensive portfolio project."
            seq = [
                f"Design end-to-end full application integrating {', '.join(target_skills[:3])}",
                "Write thorough technical README with architecture diagram, setup instructions, and API docs",
                "Record a 2-minute Loom or video walkthrough and deploy live URL",
            ]
            exercises = [
                "Perform self code-review and optimize database queries",
                "Practice explaining system design tradeoffs out loud for technical interviews",
            ]
            mini_projects = [
                f"Portfolio Capstone: Production {job_title} application featuring live demo and GitHub repo"
            ]
            outcome = "Job-ready capstone project ready to showcase to hiring managers."

        items.append(
            RoadmapItem(
                week_number=week_num,
                title=title,
                learning_objective=objective,
                skill_to_learn=skill_name,
                priority="High" if week_num <= 2 else "Medium",
                estimated_duration="1 Week (8-10 hours)",
                learning_sequence=seq,
                practical_exercises=exercises,
                suggested_mini_projects=mini_projects,
                expected_outcome=outcome,
            )
        )

    summary = (
        f"A targeted {num_weeks}-week curriculum engineered to eliminate key qualification gaps for the "
        f"{job_title} role at {company_name or 'your target employer'}."
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
