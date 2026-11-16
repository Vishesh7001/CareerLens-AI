import re
import os
from typing import Dict, Any, List, Optional, Tuple
from app.schemas.analysis import (
    AnalysisResponse,
    CategoryScores,
    CategoryScoreItem,
    MissingSkillItem,
    ProjectAnalysisItem,
    ExperienceAnalysis,
    TechnicalSkillsAnalysis,
    CategorizedSkills,
    AIFeedback,
)

# Comprehensive Role Skill Profiles & Explanations
ROLE_PROFILES: Dict[str, Dict[str, Any]] = {
    "Software Developer": {
        "core": ["Data Structures", "Algorithms", "Git", "OOP", "System Design"],
        "languages": ["Java", "Python", "C++", "C#", "Go"],
        "frameworks": ["Spring Boot", "Django", "Node.js", ".NET"],
        "databases": ["SQL", "PostgreSQL", "MySQL", "MongoDB"],
        "tools": ["Git", "Docker", "Linux", "CI/CD", "REST API"],
        "high_priority": ["Data Structures", "Algorithms", "Git", "SQL"],
        "medium_priority": ["Docker", "Linux", "System Design"],
        "low_priority": ["CI/CD", "Cloud Fundamentals (AWS/Azure)"],
        "reasons": {
            "Data Structures": "Fundamental for writing efficient, scalable software and clearing technical interviews.",
            "Algorithms": "Essential for problem-solving, computational optimization, and code efficiency.",
            "Git": "Standard version control required in every collaborative software engineering team.",
            "SQL": "Critical for relational data persistence, querying, and backend data manipulation.",
            "Docker": "Key for containerizing applications and maintaining consistent runtime environments.",
            "Linux": "Underpins modern development, server administration, and production deployments.",
            "System Design": "Crucial for architecting decoupled, maintainable software architectures.",
            "CI/CD": "Automates testing, linting, and continuous delivery pipelines.",
            "Cloud Fundamentals (AWS/Azure)": "Industry expectation for cloud-native deployment and infrastructure.",
        },
    },
    "Frontend Developer": {
        "core": ["HTML5", "CSS3", "JavaScript", "React", "TypeScript"],
        "languages": ["JavaScript", "TypeScript", "HTML5", "CSS3"],
        "frameworks": ["React", "Next.js", "Vue.js", "Angular", "Tailwind CSS"],
        "databases": ["REST API", "GraphQL"],
        "tools": ["Git", "Webpack", "Vite", "Figma", "Jest"],
        "high_priority": ["JavaScript", "React", "TypeScript", "HTML5", "CSS3"],
        "medium_priority": ["Next.js", "Tailwind CSS", "REST API"],
        "low_priority": ["Testing (Jest/Cypress)", "Vite/Webpack", "GraphQL"],
        "reasons": {
            "JavaScript": "The foundational programming language powering modern dynamic web user interfaces.",
            "React": "The most widely demanded frontend component library in modern web engineering.",
            "TypeScript": "Ensures compile-time type safety, scalable codebases, and reduces runtime bugs.",
            "HTML5": "Provides semantic document structuring and web accessibility foundation.",
            "CSS3": "Required for responsive layouts, styling, flexbox/grid systems, and UI polish.",
            "Next.js": "Industry-standard for server-side rendering, SEO optimization, and production React apps.",
            "Tailwind CSS": "Accelerates UI development with atomic, highly customizable styling.",
            "REST API": "Essential for integrating frontend client state with backend services.",
            "Testing (Jest/Cypress)": "Guarantees UI reliability, component contracts, and end-to-end user flows.",
            "Vite/Webpack": "Modern bundlers crucial for asset optimization and build pipelines.",
            "GraphQL": "Enables flexible, client-driven data fetching without over-fetching.",
        },
    },
    "Backend Developer": {
        "core": ["Node.js", "Express.js", "SQL", "MongoDB", "REST API", "Database Design"],
        "languages": ["JavaScript", "TypeScript", "Python", "Java", "Go"],
        "frameworks": ["Express.js", "Node.js", "FastAPI", "Django", "Spring Boot", "NestJS"],
        "databases": ["PostgreSQL", "MySQL", "MongoDB", "Redis"],
        "tools": ["Docker", "Git", "Postman", "Linux", "JWT", "CI/CD"],
        "high_priority": ["Node.js", "Express.js", "PostgreSQL", "REST API"],
        "medium_priority": ["Redis", "Docker", "MongoDB", "Authentication (JWT/OAuth)"],
        "low_priority": ["Message Queues (Kafka/RabbitMQ)", "Microservices", "CI/CD"],
        "reasons": {
            "Node.js": "High-throughput asynchronous runtime essential for scalable server-side applications.",
            "Express.js": "Core lightweight HTTP framework powering modern RESTful microservices.",
            "PostgreSQL": "Robust relational database engine crucial for ACID compliance and complex queries.",
            "REST API": "The industry standard contract for client-server communication.",
            "Redis": "Vital for sub-millisecond in-memory caching, rate limiting, and session stores.",
            "Docker": "Enables containerized microservices and reproducible backend deployments.",
            "MongoDB": "Flexible document storage useful for rapidly evolving data schemas.",
            "Authentication (JWT/OAuth)": "Critical for securing API endpoints and managing user sessions safely.",
            "Message Queues (Kafka/RabbitMQ)": "Powers event-driven architectures and asynchronous background processing.",
            "Microservices": "Architectural standard for independently scalable and deployable systems.",
            "CI/CD": "Automates server deployment pipelines, linting, and regression testing.",
        },
    },
    "Full Stack Developer": {
        "core": ["JavaScript", "TypeScript", "React", "Node.js", "Express.js", "SQL", "MongoDB"],
        "languages": ["JavaScript", "TypeScript", "Python", "HTML5", "CSS3"],
        "frameworks": ["React", "Next.js", "Express.js", "Node.js", "Tailwind CSS"],
        "databases": ["PostgreSQL", "MongoDB", "Redis"],
        "tools": ["Git", "Docker", "REST API", "Postman", "CI/CD"],
        "high_priority": ["JavaScript", "React", "Node.js", "SQL"],
        "medium_priority": ["TypeScript", "MongoDB", "Docker", "REST API"],
        "low_priority": ["Next.js", "Redis", "Cloud Hosting (AWS/Vercel)"],
        "reasons": {
            "JavaScript": "Core full-stack language enabling end-to-end client and server development.",
            "React": "Essential for creating reactive, responsive, component-driven client user interfaces.",
            "Node.js": "Standard runtime for executing JavaScript backends and microservices.",
            "SQL": "Fundamental for relational database modeling, transactions, and data integrity.",
            "TypeScript": "Bridges frontend and backend with shared type definitions and safer refactoring.",
            "MongoDB": "Popular NoSQL database paired frequently in full-stack JavaScript architectures.",
            "Docker": "Standardizes dev environments and unifies multi-container full-stack applications.",
            "REST API": "Foundational protocol for connecting frontend user interactions with server logic.",
            "Next.js": "Modern full-stack framework integrating API routes with server-rendered UI.",
            "Redis": "Improves full-stack app responsiveness through caching and session storage.",
            "Cloud Hosting (AWS/Vercel)": "Crucial for taking full-stack projects from local machines to production.",
        },
    },
    "Data Analyst": {
        "core": ["SQL", "Python", "Excel", "Data Visualization", "Tableau", "Power BI"],
        "languages": ["Python", "SQL", "R"],
        "frameworks": ["Pandas", "NumPy", "Matplotlib", "Seaborn"],
        "databases": ["PostgreSQL", "MySQL", "Snowflake", "BigQuery"],
        "tools": ["Tableau", "Power BI", "Excel", "Jupyter", "Git"],
        "high_priority": ["SQL", "Excel", "Python", "Tableau / Power BI"],
        "medium_priority": ["Pandas", "Data Visualization", "Statistics"],
        "low_priority": ["Snowflake/BigQuery", "A/B Testing", "Git"],
        "reasons": {
            "SQL": "The absolute core tool for querying, transforming, and extracting business insights from databases.",
            "Excel": "Ubiquitous for business modeling, ad-hoc pivot analysis, and executive communication.",
            "Python": "Automates analytical workflows, data wrangling, and statistical transformations.",
            "Tableau / Power BI": "Industry standard BI tools for building interactive stakeholder dashboards.",
            "Pandas": "Core Python library for data manipulation, aggregation, and timeseries cleanup.",
            "Data Visualization": "Translates complex datasets into clear, actionable business narratives.",
            "Statistics": "Ensures sound analytical conclusions, hypothesis testing, and variance analysis.",
            "Snowflake/BigQuery": "Modern cloud data warehouses powering enterprise-scale analytical queries.",
            "A/B Testing": "Guides product decisions with statistically significant user experiment metrics.",
            "Git": "Maintains version control and reproducibility for analytical scripts and reports.",
        },
    },
    "Data Scientist": {
        "core": ["Python", "Machine Learning", "Statistics", "SQL", "Pandas", "Scikit-Learn"],
        "languages": ["Python", "R", "SQL"],
        "frameworks": ["Pandas", "NumPy", "Scikit-Learn", "TensorFlow", "PyTorch"],
        "databases": ["PostgreSQL", "MongoDB", "BigQuery"],
        "tools": ["Jupyter", "Git", "MLflow", "Docker"],
        "high_priority": ["Python", "SQL", "Machine Learning", "Statistics"],
        "medium_priority": ["Pandas", "Scikit-Learn", "Data Preprocessing"],
        "low_priority": ["Deep Learning (PyTorch/TensorFlow)", "Feature Engineering", "MLflow"],
        "reasons": {
            "Python": "The predominant programming language for scientific computing and statistical modeling.",
            "SQL": "Required for querying large-scale raw data stores before predictive modeling.",
            "Machine Learning": "Core capability to develop supervised and unsupervised predictive algorithms.",
            "Statistics": "Foundation for probability distributions, regression models, and hypothesis testing.",
            "Pandas": "Essential for exploratory data analysis, data cleaning, and feature manipulation.",
            "Scikit-Learn": "Standard library implementing classification, regression, and clustering algorithms.",
            "Data Preprocessing": "Critical step where 80% of data science effort is spent ensuring model input quality.",
            "Deep Learning (PyTorch/TensorFlow)": "Required for computer vision, natural language processing, and neural nets.",
            "Feature Engineering": "Directly determines predictive power and model generalization performance.",
            "MLflow": "Tracks model parameters, artifacts, and lifecycle experiments.",
        },
    },
    "Machine Learning Engineer": {
        "core": ["Python", "PyTorch", "TensorFlow", "Scikit-Learn", "MLOps", "Docker"],
        "languages": ["Python", "C++", "SQL"],
        "frameworks": ["PyTorch", "TensorFlow", "Scikit-Learn", "FastAPI", "Keras"],
        "databases": ["PostgreSQL", "Redis", "Vector DB (Pinecone/Milvus)"],
        "tools": ["Docker", "Kubernetes", "Git", "MLflow", "Linux", "Weights & Biases"],
        "high_priority": ["Python", "PyTorch / TensorFlow", "Scikit-Learn", "Model Deployment"],
        "medium_priority": ["Docker", "MLOps (MLflow/Kubeflow)", "FastAPI"],
        "low_priority": ["Kubernetes", "Vector Databases", "GPU Acceleration (CUDA)"],
        "reasons": {
            "Python": "Primary language for model development, data manipulation, and pipeline engineering.",
            "PyTorch / TensorFlow": "Core deep learning frameworks for building and fine-tuning neural architectures.",
            "Scikit-Learn": "Foundation for classical machine learning and baseline model comparisons.",
            "Model Deployment": "Bridges the gap between research prototypes and high-throughput production APIs.",
            "Docker": "Ensures environment consistency when packaging ML models with complex C/CUDA dependencies.",
            "MLOps (MLflow/Kubeflow)": "Automates training pipelines, model versioning, and continuous evaluation.",
            "FastAPI": "Standard high-performance ASGI framework for serving real-time model inference endpoints.",
            "Kubernetes": "Orchestrates scalable distributed model training and inference clusters.",
            "Vector Databases": "Enables semantic search, embeddings retrieval, and RAG architectures.",
            "GPU Acceleration (CUDA)": "Optimizes tensor math operations and distributed training speed.",
        },
    },
    "AI Engineer": {
        "core": ["Python", "LLMs", "RAG", "Prompt Engineering", "LangChain", "Vector DB"],
        "languages": ["Python", "TypeScript", "SQL"],
        "frameworks": ["FastAPI", "LangChain", "LlamaIndex", "Hugging Face", "PyTorch"],
        "databases": ["Pinecone", "ChromaDB", "Qdrant", "PostgreSQL"],
        "tools": ["Git", "Docker", "OpenAI API", "Ollama", "Weights & Biases"],
        "high_priority": ["Python", "LLM Integration", "RAG Architecture", "Prompt Engineering"],
        "medium_priority": ["LangChain / LlamaIndex", "Vector Databases (Pinecone/Chroma)", "FastAPI"],
        "low_priority": ["Fine-tuning (LoRA/PEFT)", "Docker", "Model Evaluation Frameworks"],
        "reasons": {
            "Python": "De-facto ecosystem for generative AI, transformers, and model orchestration.",
            "LLM Integration": "Core skill for utilizing modern frontier models and embedding endpoints.",
            "RAG Architecture": "Critical for grounding generative models with proprietary, real-time knowledge bases.",
            "Prompt Engineering": "Optimizes context formatting, few-shot prompting, and deterministic reasoning.",
            "LangChain / LlamaIndex": "Frameworks for building agentic workflows, memory chains, and retrieval graphs.",
            "Vector Databases (Pinecone/Chroma)": "Provides low-latency similarity search for semantic document chunks.",
            "FastAPI": "Enables building streaming, low-latency microservices for AI applications.",
            "Fine-tuning (LoRA/PEFT)": "Adapts open-weight foundation models to domain-specific syntax and tasks.",
            "Docker": "Standardizes deployment across cloud providers and local inference setups.",
            "Model Evaluation Frameworks": "Measures hallucination rates, retrieval recall, and answer relevancy.",
        },
    },
    "DevOps Engineer": {
        "core": ["Linux", "Docker", "Kubernetes", "CI/CD", "Terraform", "AWS"],
        "languages": ["Bash", "Python", "Go", "YAML"],
        "frameworks": ["Ansible", "Terraform", "Helm"],
        "databases": ["PostgreSQL", "Redis", "Elasticsearch"],
        "tools": ["Git", "Docker", "Kubernetes", "GitHub Actions", "Jenkins", "Prometheus", "Grafana", "Linux"],
        "high_priority": ["Linux", "Docker", "CI/CD", "Kubernetes"],
        "medium_priority": ["Terraform (IaC)", "Cloud Platform (AWS/GCP/Azure)", "Monitoring (Prometheus/Grafana)"],
        "low_priority": ["Ansible", "Helm", "Security / DevSecOps"],
        "reasons": {
            "Linux": "Fundamental OS knowledge required for container hosts, system administration, and networking.",
            "Docker": "Foundational containerization technology for isolating runtime services and dependencies.",
            "CI/CD": "Automates linting, testing, image building, and automated deployment pipelines.",
            "Kubernetes": "The gold standard for production container orchestration, auto-scaling, and failover.",
            "Terraform (IaC)": "Enables declarative, reproducible infrastructure provisioning as code.",
            "Cloud Platform (AWS/GCP/Azure)": "Enterprise environment for managing compute, VPCs, IAM, and storage.",
            "Monitoring (Prometheus/Grafana)": "Provides real-time visibility into cluster health, latency, and resource metrics.",
            "Ansible": "Simplifies configuration management and multi-node server bootstrapping.",
            "Helm": "Standard package manager for templating and deploying complex Kubernetes manifests.",
            "Security / DevSecOps": "Integrates secret management, vulnerability scanning, and compliance into pipelines.",
        },
    },
    "Cybersecurity Analyst": {
        "core": ["Network Security", "Linux", "SIEM", "Vulnerability Assessment", "Firewalls"],
        "languages": ["Python", "Bash", "PowerShell", "SQL"],
        "frameworks": ["MITRE ATT&CK", "OWASP Top 10", "NIST"],
        "databases": ["Elasticsearch", "SQL"],
        "tools": ["Wireshark", "Nmap", "Metasploit", "Splunk", "Burp Suite", "Linux"],
        "high_priority": ["Network Security", "Linux", "SIEM (Splunk/ELK)", "Vulnerability Scanning"],
        "medium_priority": ["Incident Response", "Firewalls / IDS / IPS", "OWASP Top 10"],
        "low_priority": ["Penetration Testing (Nmap/Wireshark)", "Scripting (Python/Bash)", "Compliance (SOC2/ISO)"],
        "reasons": {
            "Network Security": "Fundamental comprehension of OSI layers, TCP/IP, DNS, and traffic analysis.",
            "Linux": "Essential for forensic analysis, security tooling, log inspection, and server auditing.",
            "SIEM (Splunk/ELK)": "Centralized system for aggregating, correlating, and detecting anomalous security events.",
            "Vulnerability Scanning": "Identifies system CVEs, misconfigurations, and outdated software versions.",
            "Incident Response": "Standard methodology for triaging, containing, and remediating security breaches.",
            "Firewalls / IDS / IPS": "Perimeter defense systems filtering malicious packet streams and intrusions.",
            "OWASP Top 10": "Crucial knowledge of common application vulnerabilities (XSS, SQLi, CSRF).",
            "Penetration Testing (Nmap/Wireshark)": "Validates defensive posture by actively simulating attack vectors.",
            "Scripting (Python/Bash)": "Automates threat hunting, log parsing, and security report generation.",
            "Compliance (SOC2/ISO)": "Aligns technical security policies with legal and enterprise regulatory standards.",
        },
    },
}

DEFAULT_FALLBACK_PROFILE = {
    "core": ["Git", "Problem Solving", "Communication", "Data Structures", "Documentation"],
    "languages": ["Programming Fundamentals"],
    "frameworks": ["Framework Knowledge"],
    "databases": ["Database Management"],
    "tools": ["Git", "Version Control", "Issue Tracking"],
    "high_priority": ["Core Technical Skills", "Git", "Problem Solving"],
    "medium_priority": ["Database Management", "System Architecture"],
    "low_priority": ["Testing", "Deployment Automation"],
    "reasons": {
        "Core Technical Skills": "Directly impacts competency in fulfilling daily responsibilities.",
        "Git": "Standard collaboration mechanism for modern technical teams.",
        "Problem Solving": "Enables analyzing requirements and producing reliable solutions.",
        "Database Management": "Essential for interacting with persistent state and data workflows.",
        "System Architecture": "Ensures maintainable and scalable solution design.",
        "Testing": "Validates software correctness and guards against regressions.",
        "Deployment Automation": "Standardizes releases and reduces human error during rollouts.",
    },
}


def get_role_profile(role_name: str) -> Dict[str, Any]:
    """Retrieve matching role profile or synthesize a profile for custom roles."""
    if role_name in ROLE_PROFILES:
        return ROLE_PROFILES[role_name]
    
    # Check case-insensitive match
    for existing_role, profile in ROLE_PROFILES.items():
        if existing_role.lower() == role_name.lower():
            return profile
            
    # Custom role fallback
    custom_profile = dict(DEFAULT_FALLBACK_PROFILE)
    # Infer potential domain from role name keywords
    role_lower = role_name.lower()
    if "data" in role_lower or "analytics" in role_lower:
        return ROLE_PROFILES["Data Analyst"]
    elif "front" in role_lower or "ui" in role_lower or "web" in role_lower:
        return ROLE_PROFILES["Frontend Developer"]
    elif "back" in role_lower or "api" in role_lower or "server" in role_lower:
        return ROLE_PROFILES["Backend Developer"]
    elif "cloud" in role_lower or "ops" in role_lower or "infra" in role_lower:
        return ROLE_PROFILES["DevOps Engineer"]
    elif "security" in role_lower or "cyber" in role_lower:
        return ROLE_PROFILES["Cybersecurity Analyst"]
    elif "ai" in role_lower or "ml" in role_lower or "learning" in role_lower:
        return ROLE_PROFILES["AI Engineer"]
    elif "software" in role_lower or "engineer" in role_lower or "developer" in role_lower:
        return ROLE_PROFILES["Software Developer"]
        
    return custom_profile


def extract_skills_from_resume_data(resume_data: Dict[str, Any]) -> Tuple[List[str], CategorizedSkills]:
    """Extract and normalize all skills categorized from the parsed resume data."""
    skills_obj = resume_data.get("skills", {})
    if not isinstance(skills_obj, dict):
        skills_obj = {}

    prog_langs = [s.strip() for s in skills_obj.get("programmingLanguages", []) if s and isinstance(s, str)]
    frameworks = [s.strip() for s in skills_obj.get("frameworks", []) if s and isinstance(s, str)]
    databases = [s.strip() for s in skills_obj.get("databases", []) if s and isinstance(s, str)]
    tools = [s.strip() for s in skills_obj.get("tools", []) if s and isinstance(s, str)]
    other = [s.strip() for s in skills_obj.get("other", []) if s and isinstance(s, str)]

    categorized = CategorizedSkills(
        programming_languages=prog_langs,
        frameworks=frameworks,
        databases=databases,
        tools=tools,
        other=other,
    )

    all_skills = []
    seen = set()
    for s in prog_langs + frameworks + databases + tools + other:
        clean = s.strip()
        lower = clean.lower()
        if lower not in seen:
            seen.add(lower)
            all_skills.append(clean)

    return all_skills, categorized


def evaluate_technical_skills(
    all_skills: List[str],
    categorized: CategorizedSkills,
    role_profile: Dict[str, Any],
    job_description: Optional[str] = None,
) -> Tuple[CategoryScoreItem, TechnicalSkillsAnalysis, List[MissingSkillItem]]:
    """
    Score technical skills out of 25 points.
    Identifies present and missing skills based on role profile and optional JD.
    """
    skills_lower = {s.lower() for s in all_skills}
    
    # Extract any explicit skills mentioned in the job description
    jd_skills = []
    if job_description:
        words = re.findall(r"\b[A-Za-z0-9+#.-]{2,20}\b", job_description)
        # Check against common tech keywords
        common_tech = [
            "React", "Node.js", "Express", "Python", "Java", "TypeScript", "JavaScript",
            "SQL", "PostgreSQL", "MongoDB", "Docker", "AWS", "Kubernetes", "Git",
            "Next.js", "Vue", "Angular", "FastAPI", "Django", "Redis", "Linux",
            "CI/CD", "GraphQL", "Tailwind", "PyTorch", "TensorFlow", "Pandas",
            "Scikit-Learn", "Tableau", "Power BI", "Kafka", "REST API", "Microservices"
        ]
        jd_lower_text = job_description.lower()
        for tech in common_tech:
            if tech.lower() in jd_lower_text:
                jd_skills.append(tech)

    # Missing skills identification
    missing_items: List[MissingSkillItem] = []
    
    # 1. High Priority missing skills
    for skill in role_profile.get("high_priority", []):
        if skill.lower() not in skills_lower:
            reason = role_profile.get("reasons", {}).get(
                skill, f"Essential core competency expected for this career track."
            )
            missing_items.append(MissingSkillItem(skill=skill, priority="High", reason=reason))

    # Check JD skills as high priority if not present
    for jd_skill in jd_skills:
        if jd_skill.lower() not in skills_lower and not any(m.skill.lower() == jd_skill.lower() for m in missing_items):
            missing_items.append(
                MissingSkillItem(
                    skill=jd_skill,
                    priority="High",
                    reason=f"Explicitly requested in the target job description."
                )
            )

    # 2. Medium Priority missing skills
    for skill in role_profile.get("medium_priority", []):
        if skill.lower() not in skills_lower and not any(m.skill.lower() == skill.lower() for m in missing_items):
            reason = role_profile.get("reasons", {}).get(
                skill, f"Important modern tool widely utilized in role-relevant workflows."
            )
            missing_items.append(MissingSkillItem(skill=skill, priority="Medium", reason=reason))

    # 3. Low Priority missing skills
    for skill in role_profile.get("low_priority", []):
        if skill.lower() not in skills_lower and not any(m.skill.lower() == skill.lower() for m in missing_items):
            reason = role_profile.get("reasons", {}).get(
                skill, f"Valuable supplementary technology that increases candidate versatility."
            )
            missing_items.append(MissingSkillItem(skill=skill, priority="Low", reason=reason))

    # Calculate Relevance Score (0-100%)
    total_role_skills = (
        len(role_profile.get("high_priority", [])) * 3 +
        len(role_profile.get("medium_priority", [])) * 2 +
        len(role_profile.get("low_priority", [])) * 1
    )
    if total_role_skills == 0:
        total_role_skills = 10

    matched_points = 0
    for s in role_profile.get("high_priority", []):
        if s.lower() in skills_lower:
            matched_points += 3
    for s in role_profile.get("medium_priority", []):
        if s.lower() in skills_lower:
            matched_points += 2
    for s in role_profile.get("low_priority", []):
        if s.lower() in skills_lower:
            matched_points += 1

    relevance_pct = min(100.0, round((matched_points / total_role_skills) * 100, 1))

    # Calculate Category Score (max 25)
    # Basis: Breadth of skills (up to 10 pts) + Role Relevance (up to 15 pts)
    breadth_score = min(10.0, len(all_skills) * 1.2)
    role_match_score = (relevance_pct / 100.0) * 15.0
    tech_score = round(min(25.0, max(2.0, breadth_score + role_match_score)), 1)

    if tech_score >= 21:
        tech_feedback = f"Outstanding technical stack ({len(all_skills)} verified skills) with {relevance_pct}% target role alignment."
    elif tech_score >= 16:
        tech_feedback = f"Solid technical foundation with {len(all_skills)} skills identified. Expanding high-priority stack will accelerate job readiness."
    elif tech_score >= 10:
        tech_feedback = f"Moderate technical skills detected ({len(all_skills)} skills). Noticeable gaps in core role expectations."
    else:
        tech_feedback = f"Limited technical skills cataloged ({len(all_skills)} skills). Critical core competencies are currently unlisted."

    summary = (
        f"Identified {len(all_skills)} technical competencies spanning {len(categorized.programming_languages)} languages, "
        f"{len(categorized.frameworks)} frameworks, {len(categorized.databases)} databases, and {len(categorized.tools)} developer tools. "
        f"Role relevance stands at {relevance_pct}%."
    )

    tech_category = CategoryScoreItem(score=tech_score, max_score=25.0, feedback=tech_feedback)
    tech_analysis = TechnicalSkillsAnalysis(
        existing_skills=all_skills,
        categorized=categorized,
        role_relevance_score=relevance_pct,
        summary=summary,
    )

    return tech_category, tech_analysis, missing_items


def evaluate_projects(
    projects: List[Dict[str, Any]],
    role_profile: Dict[str, Any],
) -> Tuple[CategoryScoreItem, List[ProjectAnalysisItem]]:
    """
    Score projects out of 20 points.
    Analyzes project relevance, technologies, descriptions, and measurable impact.
    """
    if not projects:
        feedback = "No academic or practical projects detected. Adding at least 2 structured technical projects is vital."
        return CategoryScoreItem(score=2.0, max_score=20.0, feedback=feedback), []

    analyzed_projects: List[ProjectAnalysisItem] = []
    total_project_score = 0.0

    core_keywords = [s.lower() for s in role_profile.get("high_priority", []) + role_profile.get("medium_priority", [])]

    for proj in projects:
        title = proj.get("title") or "Technical Project"
        description = proj.get("description") or ""
        technologies = proj.get("technologies") or []
        link = proj.get("link")

        # Check tech relevance
        tech_lower = [t.lower() for t in technologies]
        matched_role_tech = [t for t in tech_lower if any(kw in t for kw in core_keywords)]

        # Check description metrics
        has_metrics = bool(re.search(r"\b\d+%(?: reduction| increase| boost)?|\b\d+\s*(?:ms|users|requests|qps|records|stars)\b", description, re.I))
        has_action_verbs = bool(re.search(r"\b(architected|engineered|developed|implemented|optimized|designed|deployed|built)\b", description, re.I))

        # Relevance label
        if len(matched_role_tech) >= 2:
            relevance = "High"
            item_score = 8.0
        elif len(matched_role_tech) >= 1 or len(technologies) >= 2:
            relevance = "Medium"
            item_score = 6.0
        else:
            relevance = "Low"
            item_score = 4.0

        if has_metrics:
            item_score += 2.0
        if has_action_verbs:
            item_score += 1.0
        if link:
            item_score += 1.0

        suggestions_list = []
        if not has_metrics:
            suggestions_list.append("Quantify the impact with measurable metrics (e.g., 'reduced query time by 35%', 'handled 5k daily requests').")
        if not link:
            suggestions_list.append("Provide a verifiable GitHub repository or live deployment link.")
        if len(technologies) < 3:
            suggestions_list.append("Explicitly enumerate all architectural components (database, state management, containerization).")

        item_suggestion = " ".join(suggestions_list) if suggestions_list else "Strong project presentation with clear technical ownership."
        item_feedback = f"{relevance} relevance for the target role. Technologies utilized: {', '.join(technologies) if technologies else 'Not specified'}."

        analyzed_projects.append(
            ProjectAnalysisItem(
                title=title,
                technologies=technologies,
                relevance=relevance,
                feedback=item_feedback,
                suggestions=item_suggestion,
            )
        )
        total_project_score += item_score

    # Normalize to max 20 points
    # Having 2+ solid projects reaches 15-20
    count_multiplier = min(1.0, len(projects) / 2.0)
    normalized_score = min(20.0, max(4.0, (total_project_score / max(1, len(projects))) * 1.5 * count_multiplier))
    final_score = round(normalized_score, 1)

    if final_score >= 17:
        proj_feedback = f"Excellent project portfolio ({len(projects)} projects). Strong demonstration of practical technical implementation."
    elif final_score >= 12:
        proj_feedback = f"Solid project foundation ({len(projects)} projects). Adding quantified performance metrics and cloud deployment links will boost score."
    else:
        proj_feedback = f"Developing project showcase ({len(projects)} projects). Needs deeper architectural complexity and role-specific tech alignment."

    return CategoryScoreItem(score=final_score, max_score=20.0, feedback=proj_feedback), analyzed_projects


def evaluate_experience(
    experience: List[Dict[str, Any]],
    role_profile: Dict[str, Any],
) -> Tuple[CategoryScoreItem, ExperienceAnalysis]:
    """
    Score experience / internships out of 20 points.
    Handles students/freshers gracefully with academic and practical contribution paths.
    """
    has_exp = bool(experience and len(experience) > 0)

    if not has_exp:
        # Student / Entry-level scenario
        exp_score = 8.0
        summary = "No formal corporate work experience or internships currently listed on the resume."
        feedback = "As an emerging talent or recent graduate, your practical capability must be anchored through hands-on projects, open-source work, and academic research."
        suggestions = (
            "Pursue targeted virtual internships (e.g., Forage, GitHub open-source contributions), "
            "participate in technical hackathons, and showcase capstone projects to offset formal industry tenure."
        )
        analysis = ExperienceAnalysis(
            has_experience=False,
            level="Academic / Student",
            summary=summary,
            feedback=feedback,
            suggestions=suggestions,
        )
        return CategoryScoreItem(score=exp_score, max_score=20.0, feedback=feedback), analysis

    # Candidate has experience entries
    num_roles = len(experience)
    all_desc = " ".join([e.get("description", "") for e in experience]).lower()
    all_titles = " ".join([e.get("position", "") for e in experience]).lower()

    is_internship = "intern" in all_titles or "internship" in all_titles or "apprentice" in all_titles
    has_quantified = bool(re.search(r"\b\d+%(?: increase| reduction| growth)?|\b\d+\s*(?:team members|clients|projects|sprints)\b", all_desc))

    if num_roles >= 3 and not is_internship:
        level = "Mid to Senior"
        base_score = 17.0
    elif num_roles >= 2 or not is_internship:
        level = "Junior to Mid"
        base_score = 14.5
    else:
        level = "Intern / Entry-level"
        base_score = 12.0

    if has_quantified:
        base_score += 2.5

    final_score = round(min(20.0, max(5.0, base_score)), 1)
    summary = f"Recorded {num_roles} professional work experience / internship engagement(s) at {level} level."
    feedback = f"Professional history demonstrates real-world application. Position titles: {', '.join([e.get('position', 'Role') for e in experience])}."
    suggestions = (
        "Ensure every bullet point follows the Google X-Y-Z formula: 'Accomplished [X] as measured by [Y], by doing [Z]'. "
        "Highlight collaborative tooling (Agile/Scrum, Git, Jira) and technical trade-offs made."
    )

    analysis = ExperienceAnalysis(
        has_experience=True,
        level=level,
        summary=summary,
        feedback=feedback,
        suggestions=suggestions,
    )
    return CategoryScoreItem(score=final_score, max_score=20.0, feedback=feedback), analysis


def evaluate_education(education: List[Dict[str, Any]]) -> CategoryScoreItem:
    """Score education out of 10 points."""
    if not education:
        return CategoryScoreItem(
            score=3.0,
            max_score=10.0,
            feedback="No formal degree or educational background detected. Academic qualifications should be clearly stated.",
        )

    score = 7.0
    details = []
    for edu in education:
        deg = (edu.get("degree") or "").lower()
        inst = edu.get("institution") or ""
        year = edu.get("graduationYear") or ""
        grade = edu.get("grade")

        # Tech degrees bonus
        if any(term in deg for term in ["computer", "technology", "engineering", "science", "information", "software", "data", "b.tech", "b.e", "bca", "mca", "b.s", "m.s"]):
            score += 2.0
        if grade:
            score += 1.0

        details.append(f"{edu.get('degree') or 'Degree'} from {inst} ({year})")

    final_score = round(min(10.0, max(4.0, score)), 1)
    feedback = f"Verified educational background: {'; '.join(details)}."
    return CategoryScoreItem(score=final_score, max_score=10.0, feedback=feedback)


def evaluate_certifications(certifications: List[Dict[str, Any]]) -> CategoryScoreItem:
    """Score certifications out of 10 points."""
    if not certifications:
        return CategoryScoreItem(
            score=3.0,
            max_score=10.0,
            feedback="No industry certifications listed. Earning recognized credentials (AWS, Azure, GCP, CompTIA, Meta) will validate skills.",
        )

    score = 6.0 + min(4.0, len(certifications) * 2.0)
    final_score = round(min(10.0, score), 1)
    names = [c.get("name") or "Certification" for c in certifications]
    feedback = f"Cataloged {len(certifications)} credential(s): {', '.join(names)}. Demonstrates active continuous learning."
    return CategoryScoreItem(score=final_score, max_score=10.0, feedback=feedback)


def evaluate_completeness(
    personal_info: Dict[str, Any],
    skills: List[str],
    projects: List[Any],
    experience: List[Any],
    education: List[Any],
    raw_text: str,
) -> CategoryScoreItem:
    """Score resume structure and completeness out of 15 points."""
    score = 0.0

    # Contact Info (up to 4 pts)
    if personal_info.get("email"):
        score += 1.0
    if personal_info.get("phone"):
        score += 1.0
    if personal_info.get("location"):
        score += 1.0
    if personal_info.get("linkedin") or personal_info.get("github") or personal_info.get("portfolio"):
        score += 1.0

    # Section Breadth (up to 7 pts)
    if skills and len(skills) >= 4:
        score += 2.5
    if projects and len(projects) >= 1:
        score += 2.0
    if education and len(education) >= 1:
        score += 1.5
    if experience and len(experience) >= 1:
        score += 1.0

    # Length & Text volume heuristic (up to 4 pts)
    word_count = len(raw_text.split()) if raw_text else 0
    if 250 <= word_count <= 900:
        score += 4.0
    elif 150 <= word_count < 250:
        score += 2.5
    elif word_count > 900:
        score += 2.0
    else:
        score += 1.0

    final_score = round(min(15.0, max(3.0, score)), 1)
    if final_score >= 13:
        feedback = "Comprehensive resume structure with clear contact information, technical taxonomy, and balanced section spacing."
    elif final_score >= 9:
        feedback = "Adequate structure with essential sections present. Consider expanding portfolio links and ensuring consistent whitespace."
    else:
        feedback = "Incomplete structure. Crucial contact details or major section headings are missing or sparse."

    return CategoryScoreItem(score=final_score, max_score=15.0, feedback=feedback)


def synthesize_strengths_and_weaknesses(
    tech_score: float,
    proj_score: float,
    exp_score: float,
    edu_score: float,
    cert_score: float,
    comp_score: float,
    all_skills: List[str],
    projects: List[Dict[str, Any]],
    experience: List[Dict[str, Any]],
    missing_items: List[MissingSkillItem],
    target_role: str,
) -> Tuple[List[str], List[str]]:
    """Synthesize concrete, evidence-based strengths and weaknesses."""
    strengths = []
    weaknesses = []

    # Strengths
    if tech_score >= 16:
        strengths.append(f"Strong repertoire of {len(all_skills)} technical competencies aligned with modern software stacks.")
    if any(p.relevance == "High" for p in projects if hasattr(p, "relevance")):
        strengths.append(f"Featured projects demonstrate high technical relevance to {target_role} expectations.")
    elif len(projects) >= 2:
        strengths.append(f"Practical portfolio containing {len(projects)} technical projects showcasing implementation initiative.")

    if exp_score >= 14:
        strengths.append("Verifiable corporate or internship experience demonstrating team collaboration and software development lifecycle exposure.")
    elif not experience and len(projects) >= 2:
        strengths.append("Proactive project portfolio that effectively helps compensate for early-career lack of formal industry tenure.")

    if cert_score >= 7:
        strengths.append("Holds industry-recognized credentials demonstrating commitment to continuous technical specialization.")
    if comp_score >= 12:
        strengths.append("Well-structured document layout with professional contact details and clear section delineations.")

    if len(strengths) < 2:
        strengths.append(f"Clear foundational intent towards pursuing a career as a {target_role}.")
        strengths.append("Foundational technical keywords detected and cataloged in profile.")

    # Weaknesses
    high_missing = [m.skill for m in missing_items if m.priority == "High"]
    if high_missing:
        weaknesses.append(f"Missing critical core competencies for {target_role}: {', '.join(high_missing[:3])}.")

    if not experience:
        weaknesses.append("Absence of commercial work experience or formal engineering internships.")

    # Project depth
    if not projects:
        weaknesses.append("Lack of dedicated technical projects demonstrating hands-on architectural capability.")
    else:
        has_metrics = False
        for p in projects:
            desc = getattr(p, "feedback", "") or ""
            if "metric" in desc.lower():
                has_metrics = True
        if not has_metrics:
            weaknesses.append("Project descriptions lack quantified metrics, operational scale indicators, and verifiable business impact.")

    if cert_score < 5:
        weaknesses.append("No active cloud or professional industry certifications listed to corroborate self-taught skills.")

    if len(weaknesses) < 2:
        weaknesses.append("Opportunities remain to expand automated testing (CI/CD, unit testing) across portfolio entries.")

    return strengths[:5], weaknesses[:5]


def generate_actionable_suggestions(
    missing_items: List[MissingSkillItem],
    projects: List[Dict[str, Any]],
    has_experience: bool,
    target_role: str,
) -> List[str]:
    """Generate concise, actionable improvement recommendations."""
    suggestions = []

    # 1. High priority skill acquisition
    high_skills = [m.skill for m in missing_items if m.priority == "High"]
    if high_skills:
        suggestions.append(
            f"Prioritize learning and building with {', '.join(high_skills[:2])} to directly bridge your highest-priority skill gaps for {target_role}."
        )

    # 2. Project enhancement
    suggestions.append(
        "Quantify your project descriptions: Include numerical outcomes such as 'boosted page speed by 40%', 'processed 10k daily records', or 'reduced bundle size by 25%'."
    )

    # 3. Experience / Internship suggestion
    if not has_experience:
        suggestions.append(
            "Pursue open-source contributions on GitHub or virtual work simulations (e.g. Forage) to gain collaborative Git workflow experience."
        )
    else:
        suggestions.append(
            "Frame your professional experience around architectural ownership, problem-solving trade-offs, and cross-functional team impact."
        )

    # 4. Deployment and verification
    suggestions.append(
        "Provide live deployment URLs and clean GitHub README documentation for all highlighted projects so recruiters can immediately interact with your work."
    )

    # 5. Certification
    suggestions.append(
        f"Consider preparing for a recognized foundation certification (e.g. AWS Certified Cloud Practitioner or role-specific credential) to validate competency."
    )

    return suggestions[:5]


def generate_ai_feedback(
    overall_score: int,
    target_role: str,
    strengths: List[str],
    weaknesses: List[str],
    missing_skills: List[MissingSkillItem],
) -> AIFeedback:
    """Synthesize overall executive evaluation, role suitability, and next steps."""
    if overall_score >= 85:
        suitability = f"High Competitive Fit for {target_role} positions."
        summary = f"Your resume demonstrates strong technical depth and comprehensive structure. You present a compelling, industry-ready profile for {target_role} roles."
        main_imp = "Focus on leadership highlights, architectural system design, and high-impact business metrics."
        next_steps = f"Begin applying to target {target_role} listings while polishing live project demos and technical interview fundamentals."
    elif overall_score >= 70:
        suitability = f"Solid Contender for Entry to Mid-Level {target_role} positions."
        summary = f"You possess a credible foundation for {target_role} with strong core fundamentals. Bridging a few key stack gaps will significantly increase interview callbacks."
        main_imp = f"Incorporate missing core skills ({', '.join([m.skill for m in missing_skills[:2]])}) and add measurable outcomes to project entries."
        next_steps = "Build one end-to-end capstone project incorporating your target skills and update your GitHub with comprehensive documentation."
    elif overall_score >= 50:
        suitability = f"Developing Candidate for Junior {target_role} opportunities."
        summary = f"Your resume demonstrates foundational knowledge, but currently lacks the technical breadth and project proof expected for competitive {target_role} roles."
        main_imp = "Substantially expand hands-on technical projects and eliminate missing high-priority role requirements."
        next_steps = f"Follow a structured {target_role} roadmap to master core tools, deploy two full-fledged projects, and earn a recognized certification."
    else:
        suitability = f"Early-Stage Aspirant for {target_role}."
        summary = f"Your resume is in the initial development phase with substantial room for growth across technical skills, projects, and structural completeness."
        main_imp = "Build fundamental programming competencies, construct foundational projects, and provide comprehensive contact and educational details."
        next_steps = "Dedicate time to core computer science fundamentals, build beginner-to-intermediate projects, and restructure your resume to industry standards."

    return AIFeedback(
        summary=summary,
        role_suitability=suitability,
        main_improvements=main_imp,
        next_steps=next_steps,
    )


def run_resume_analysis(
    resume_data: Dict[str, Any],
    target_role: str,
    job_description: Optional[str] = None,
    raw_text: Optional[str] = None,
) -> AnalysisResponse:
    """
    Main orchestration routine for Phase 3 AI Resume Analysis.
    Evaluates parsed resume data, scores categories according to the 100-point rubric,
    and returns comprehensive structured analysis.
    """
    # 1. Resolve role profile
    role_profile = get_role_profile(target_role)

    # 2. Extract parsed sections
    parsed_info = resume_data.get("parsedData", {}) if "parsedData" in resume_data else resume_data
    personal_info = parsed_info.get("personalInfo", {})
    education = parsed_info.get("education", [])
    projects = parsed_info.get("projects", [])
    experience = parsed_info.get("experience", [])
    certifications = parsed_info.get("certifications", [])
    text_content = raw_text or resume_data.get("rawText", "")

    # 3. Technical Skills Evaluation (25 pts)
    all_skills, categorized_skills = extract_skills_from_resume_data(parsed_info)
    tech_category, tech_analysis, missing_skills = evaluate_technical_skills(
        all_skills, categorized_skills, role_profile, job_description
    )

    # 4. Projects Evaluation (20 pts)
    proj_category, project_analysis = evaluate_projects(projects, role_profile)

    # 5. Experience Evaluation (20 pts)
    exp_category, experience_analysis = evaluate_experience(experience, role_profile)

    # 6. Education Evaluation (10 pts)
    edu_category = evaluate_education(education)

    # 7. Certifications Evaluation (10 pts)
    cert_category = evaluate_certifications(certifications)

    # 8. Completeness & Resume Quality (15 pts)
    comp_category = evaluate_completeness(
        personal_info, all_skills, projects, experience, education, text_content
    )

    # 9. Compute Overall Score (0-100)
    total_score = (
        tech_category.score +
        proj_category.score +
        exp_category.score +
        edu_category.score +
        cert_category.score +
        comp_category.score
    )
    overall_score = int(round(min(100.0, max(0.0, total_score))))

    # 10. Synthesize Strengths, Weaknesses, Suggestions, and Feedback
    strengths, weaknesses = synthesize_strengths_and_weaknesses(
        tech_category.score,
        proj_category.score,
        exp_category.score,
        edu_category.score,
        cert_category.score,
        comp_category.score,
        all_skills,
        project_analysis,
        experience,
        missing_skills,
        target_role,
    )

    improvement_suggestions = generate_actionable_suggestions(
        missing_skills, projects, experience_analysis.has_experience, target_role
    )

    ai_feedback = generate_ai_feedback(
        overall_score, target_role, strengths, weaknesses, missing_skills
    )

    category_scores = CategoryScores(
        technical_skills=tech_category,
        projects=proj_category,
        experience=exp_category,
        education=edu_category,
        certifications=cert_category,
        completeness=comp_category,
    )

    provider = os.getenv("AI_PROVIDER", "fastapi-nlp-engine")

    return AnalysisResponse(
        target_role=target_role,
        job_description=job_description,
        overall_score=overall_score,
        category_scores=category_scores,
        strengths=strengths,
        weaknesses=weaknesses,
        technical_skills_analysis=tech_analysis,
        missing_skills=missing_skills,
        project_analysis=project_analysis,
        experience_analysis=experience_analysis,
        improvement_suggestions=improvement_suggestions,
        ai_feedback=ai_feedback,
        analysis_provider=provider,
    )
