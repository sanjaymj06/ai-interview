const { MongoClient } = require("mongodb");

const MONGODB_URL = process.env.MONGODB_URL || "mongodb://localhost:27017";
const DATABASE_NAME = process.env.DATABASE_NAME || "resume_analyzer";

const sampleUsers = [
  {
    email: "john.doe@example.com",
    password_hash: "$2b$12$LJ3m4ys3Gz8VxQ0k9y1bV.OqXx0Z5y1x2w3e4r5t6y7u8i9o0p",
    full_name: "John Doe",
    role: "user",
    avatar_url: null,
    created_at: new Date("2024-01-15"),
    updated_at: new Date("2024-06-01"),
    last_login: new Date("2024-06-15T10:30:00Z"),
    is_active: true,
  },
  {
    email: "jane.smith@example.com",
    password_hash: "$2b$12$LJ3m4ys3Gz8VxQ0k9y1bV.OqXx0Z5y1x2w3e4r5t6y7u8i9o1q",
    full_name: "Jane Smith",
    role: "user",
    avatar_url: null,
    created_at: new Date("2024-02-20"),
    updated_at: new Date("2024-05-10"),
    last_login: new Date("2024-06-14T14:20:00Z"),
    is_active: true,
  },
];

const sampleResumes = [
  {
    user_id_ref: "john.doe@example.com",
    file_name: "john_doe_resume.pdf",
    file_path: "/uploads/john_doe_resume.pdf",
    file_size: 245760,
    file_type: "pdf",
    upload_date: new Date("2024-06-01"),
    parsed_data: {
      full_name: "John Doe",
      email: "john.doe@example.com",
      phone: "(555) 123-4567",
      location: "San Francisco, CA",
      summary:
        "Full-stack software engineer with 5+ years of experience building scalable web applications. Proficient in React, Node.js, and Python. Passionate about clean code and user-centric design.",
      experience: [
        {
          title: "Senior Software Engineer",
          company: "TechCorp Inc.",
          location: "San Francisco, CA",
          start_date: "Jan 2022",
          end_date: "Present",
          description:
            "Led development of a microservices platform serving 2M+ users. Mentored junior developers and established coding standards across the team.",
          skills_used: ["React", "Node.js", "Docker", "Kubernetes", "PostgreSQL"],
        },
        {
          title: "Software Engineer",
          company: "StartupXYZ",
          location: "Remote",
          start_date: "Jun 2019",
          end_date: "Dec 2021",
          description:
            "Built RESTful APIs and React frontends for a B2B SaaS platform. Implemented CI/CD pipelines and improved test coverage from 40% to 85%.",
          skills_used: ["React", "Python", "FastAPI", "AWS", "GitHub Actions"],
        },
      ],
      education: [
        {
          degree: "Bachelor of Science in Computer Science",
          institution: "University of California, Berkeley",
          start_year: 2015,
          end_year: 2019,
          gpa: "3.7",
        },
      ],
      skills: [
        "JavaScript",
        "TypeScript",
        "Python",
        "React",
        "Node.js",
        "FastAPI",
        "PostgreSQL",
        "MongoDB",
        "Docker",
        "Kubernetes",
        "AWS",
        "Git",
        "CI/CD",
        "REST APIs",
        "GraphQL",
      ],
      certifications: ["AWS Solutions Architect Associate"],
      languages: ["English", "Spanish"],
      projects: [
        {
          name: "Open Source Task Manager",
          description:
            "A collaborative task management tool with real-time updates using WebSockets.",
          technologies: ["React", "Socket.io", "Node.js", "Redis"],
        },
      ],
    },
    raw_text:
      "John Doe\njohn.doe@example.com | (555) 123-4567 | San Francisco, CA\n\nSummary: Full-stack software engineer with 5+ years...",
    processing_status: "completed",
    error_message: null,
    version: 1,
  },
  {
    user_id_ref: "john.doe@example.com",
    file_name: "john_doe_resume_v2.pdf",
    file_path: "/uploads/john_doe_resume_v2.pdf",
    file_size: 268800,
    file_type: "pdf",
    upload_date: new Date("2024-06-10"),
    parsed_data: {
      full_name: "John Doe",
      email: "john.doe@example.com",
      phone: "(555) 123-4567",
      location: "San Francisco, CA",
      summary:
        "Senior full-stack engineer specializing in distributed systems and cloud-native architectures. 5+ years building high-availability services at scale.",
      experience: [
        {
          title: "Senior Software Engineer",
          company: "TechCorp Inc.",
          location: "San Francisco, CA",
          start_date: "Jan 2022",
          end_date: "Present",
          description:
            "Architected a microservices platform on Kubernetes handling 50K requests/second. Reduced infrastructure costs by 30% through optimization.",
          skills_used: ["React", "Node.js", "Docker", "Kubernetes", "PostgreSQL", "Terraform"],
        },
      ],
      education: [
        {
          degree: "Bachelor of Science in Computer Science",
          institution: "University of California, Berkeley",
          start_year: 2015,
          end_year: 2019,
          gpa: "3.7",
        },
      ],
      skills: [
        "JavaScript",
        "TypeScript",
        "Python",
        "Go",
        "React",
        "Node.js",
        "FastAPI",
        "PostgreSQL",
        "MongoDB",
        "Docker",
        "Kubernetes",
        "Terraform",
        "AWS",
        "GCP",
        "Git",
        "CI/CD",
        "REST APIs",
        "GraphQL",
        "gRPC",
        "Redis",
      ],
      certifications: [
        "AWS Solutions Architect Associate",
        "Google Cloud Professional Cloud Architect",
      ],
      languages: ["English", "Spanish"],
      projects: [],
    },
    raw_text: "John Doe\njohn.doe@example.com | (555) 123-4567 | San Francisco, CA\n\nSenior full-stack engineer...",
    processing_status: "completed",
    error_message: null,
    version: 2,
  },
  {
    user_id_ref: "jane.smith@example.com",
    file_name: "jane_smith_resume.pdf",
    file_path: "/uploads/jane_smith_resume.pdf",
    file_size: 198400,
    file_type: "pdf",
    upload_date: new Date("2024-05-20"),
    parsed_data: {
      full_name: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "(555) 987-6543",
      location: "New York, NY",
      summary:
        "Data scientist and machine learning engineer with 4 years of experience. Specialized in NLP, computer vision, and recommendation systems.",
      experience: [
        {
          title: "Machine Learning Engineer",
          company: "DataDriven Corp",
          location: "New York, NY",
          start_date: "Mar 2021",
          end_date: "Present",
          description:
            "Developed and deployed NLP models for sentiment analysis processing 1M+ documents daily. Built recommendation engine increasing user engagement by 35%.",
          skills_used: ["Python", "TensorFlow", "PyTorch", "BERT", "FastAPI", "AWS SageMaker"],
        },
        {
          title: "Data Scientist",
          company: "Analytics Pro",
          location: "Boston, MA",
          start_date: "Jul 2020",
          end_date: "Feb 2021",
          description:
            "Built predictive models for customer churn and lifetime value. Created dashboards and automated reporting pipelines.",
          skills_used: ["Python", "pandas", "scikit-learn", "Tableau", "SQL"],
        },
      ],
      education: [
        {
          degree: "Master of Science in Data Science",
          institution: "Columbia University",
          start_year: 2018,
          end_year: 2020,
          gpa: "3.9",
        },
        {
          degree: "Bachelor of Science in Mathematics",
          institution: "New York University",
          start_year: 2014,
          end_year: 2018,
          gpa: "3.8",
        },
      ],
      skills: [
        "Python",
        "R",
        "SQL",
        "TensorFlow",
        "PyTorch",
        "scikit-learn",
        "pandas",
        "NumPy",
        "NLP",
        "BERT",
        "GPT",
        "Computer Vision",
        "FastAPI",
        "Docker",
        "AWS",
        "MLflow",
        "Tableau",
      ],
      certifications: ["AWS Machine Learning Specialty", "TensorFlow Developer Certificate"],
      languages: ["English", "French"],
      projects: [
        {
          name: "News Article Classifier",
          description:
            "Multi-class text classifier for news articles using fine-tuned BERT achieving 94% accuracy.",
          technologies: ["Python", "BERT", "Hugging Face", "FastAPI", "Docker"],
        },
      ],
    },
    raw_text:
      "Jane Smith\njane.smith@example.com | (555) 987-6543 | New York, NY\n\nData scientist and ML engineer...",
    processing_status: "completed",
    error_message: null,
    version: 1,
  },
];

const sampleJobDescriptions = [
  {
    user_id_ref: "john.doe@example.com",
    title: "Senior Full-Stack Engineer",
    company: "InnovateTech",
    description:
      "We are looking for a Senior Full-Stack Engineer to join our growing engineering team. You will design and build scalable web applications using modern technologies, collaborate with cross-functional teams, and mentor junior developers. The ideal candidate has strong experience with React, Node.js, cloud infrastructure, and CI/CD pipelines.",
    requirements: {
      required_skills: [
        "React",
        "TypeScript",
        "Node.js",
        "PostgreSQL",
        "Docker",
        "Git",
        "REST APIs",
      ],
      preferred_skills: [
        "Kubernetes",
        "AWS",
        "GraphQL",
        "Redis",
        "Terraform",
      ],
      min_experience: 5,
      education_level: "bachelors",
    },
    salary_range: {
      min: 140000,
      max: 180000,
      currency: "USD",
    },
    location: "San Francisco, CA",
    remote: true,
    job_type: "full_time",
    url: "https://careers.innovatetech.com/senior-fullstack",
    created_at: new Date("2024-06-05"),
    updated_at: new Date("2024-06-05"),
  },
  {
    user_id_ref: "jane.smith@example.com",
    title: "Senior ML Engineer",
    company: "AILab Inc.",
    description:
      "AILab is seeking a Senior ML Engineer to design, train, and deploy production machine learning models at scale. You will work on NLP, recommendation systems, and computer vision projects. Strong Python skills and experience with deep learning frameworks are essential.",
    requirements: {
      required_skills: [
        "Python",
        "TensorFlow",
        "PyTorch",
        "NLP",
        "Docker",
        "SQL",
        "AWS",
      ],
      preferred_skills: [
        "Kubernetes",
        "MLflow",
        "BERT",
        "FastAPI",
        "Spark",
      ],
      min_experience: 4,
      education_level: "masters",
    },
    salary_range: {
      min: 155000,
      max: 200000,
      currency: "USD",
    },
    location: "New York, NY",
    remote: true,
    job_type: "full_time",
    url: "https://ailab.inc/careers/senior-ml-engineer",
    created_at: new Date("2024-06-08"),
    updated_at: new Date("2024-06-08"),
  },
];

const sampleAnalyses = [
  {
    user_id_ref: "john.doe@example.com",
    resume_version: 1,
    job_title: "Senior Full-Stack Engineer",
    created_at: new Date("2024-06-06T09:15:00Z"),
    scores: {
      overall: 82,
      skills_match: 78,
      experience_match: 90,
      education_match: 85,
      keyword_match: 75,
    },
    matched_skills: ["React", "Node.js", "PostgreSQL", "Docker", "Git", "REST APIs"],
    missing_skills: ["TypeScript", "Kubernetes", "AWS", "GraphQL", "Redis"],
    extra_skills: ["Python", "FastAPI", "MongoDB", "Kubernetes", "CI/CD", "GraphQL"],
    suggestions: [
      {
        category: "skills",
        priority: "high",
        title: "Add TypeScript proficiency",
        description:
          "The job requires TypeScript but it is not prominent in your resume. Add TypeScript projects or mention it in your skills section with experience details.",
        example: "Built type-safe REST APIs with TypeScript and Express.js, reducing runtime errors by 40%.",
      },
      {
        category: "keywords",
        priority: "high",
        title: "Include AWS experience",
        description:
          "AWS is listed as a preferred skill. Highlight your cloud infrastructure experience more prominently.",
        example: "Deployed and managed production workloads on AWS EC2, S3, and RDS.",
      },
      {
        category: "experience",
        priority: "medium",
        title: "Quantify impact with metrics",
        description:
          "Add more numerical results to your experience bullets to demonstrate business impact.",
        example: "Improved API response times by 60% through caching strategies and query optimization.",
      },
      {
        category: "skills",
        priority: "medium",
        title: "Highlight GraphQL experience",
        description:
          "GraphQL is a preferred skill. If you have experience, add it prominently.",
        example: null,
      },
      {
        category: "formatting",
        priority: "low",
        title: "Add a dedicated projects section",
        description:
          "Include a projects section showcasing open-source or side projects to demonstrate passion and breadth.",
        example: null,
      },
    ],
    ats_score: 71,
    ats_issues: [
      "Missing keywords: TypeScript, Kubernetes, AWS, GraphQL",
      "Skills section could be more detailed with experience levels",
    ],
    processing_time: 4520,
    model_version: "1.0.0",
  },
  {
    user_id_ref: "john.doe@example.com",
    resume_version: 2,
    job_title: "Senior Full-Stack Engineer",
    created_at: new Date("2024-06-11T11:45:00Z"),
    scores: {
      overall: 93,
      skills_match: 95,
      experience_match: 90,
      education_match: 85,
      keyword_match: 92,
    },
    matched_skills: [
      "React",
      "TypeScript",
      "Node.js",
      "PostgreSQL",
      "Docker",
      "Kubernetes",
      "AWS",
      "Git",
      "REST APIs",
      "GraphQL",
      "Redis",
    ],
    missing_skills: ["Terraform"],
    extra_skills: ["Python", "FastAPI", "MongoDB", "Go", "GCP", "gRPC"],
    suggestions: [
      {
        category: "skills",
        priority: "low",
        title: "Add Terraform experience",
        description:
          "Terraform is listed as a preferred skill. Consider adding infrastructure-as-code experience if available.",
        example: "Managed cloud infrastructure on AWS using Terraform, automating provisioning of 50+ resources.",
      },
      {
        category: "experience",
        priority: "low",
        title: "Expand on leadership responsibilities",
        description:
          "As a senior role, emphasize mentoring, code reviews, and technical decision-making experience.",
        example: null,
      },
    ],
    ats_score: 91,
    ats_issues: [],
    processing_time: 3890,
    model_version: "1.0.0",
  },
  {
    user_id_ref: "jane.smith@example.com",
    resume_version: 1,
    job_title: "Senior ML Engineer",
    created_at: new Date("2024-06-09T16:00:00Z"),
    scores: {
      overall: 89,
      skills_match: 92,
      experience_match: 85,
      education_match: 95,
      keyword_match: 88,
    },
    matched_skills: [
      "Python",
      "TensorFlow",
      "PyTorch",
      "NLP",
      "Docker",
      "SQL",
      "AWS",
      "FastAPI",
      "BERT",
      "MLflow",
    ],
    missing_skills: ["Kubernetes", "Spark"],
    extra_skills: [
      "R",
      "scikit-learn",
      "pandas",
      "NumPy",
      "Computer Vision",
      "GPT",
      "Tableau",
    ],
    suggestions: [
      {
        category: "skills",
        priority: "high",
        title: "Highlight Kubernetes experience",
        description:
          "Kubernetes is a preferred skill for deploying ML models. Add any container orchestration experience.",
        example: "Deployed ML inference pipelines on Kubernetes with auto-scaling for variable workload demands.",
      },
      {
        category: "experience",
        priority: "medium",
        title: "Add big data experience",
        description:
          "Mention experience with distributed computing frameworks like Spark if applicable.",
        example: null,
      },
      {
        category: "keywords",
        priority: "medium",
        title: "Emphasize production ML deployment",
        description:
          "This role emphasizes production ML. Strengthen descriptions of model deployment and monitoring experience.",
        example: "Deployed ML models to production serving 1M+ daily predictions with 99.9% uptime.",
      },
      {
        category: "formatting",
        priority: "low",
        title: "Include model performance metrics",
        description:
          "Add specific accuracy, latency, and throughput metrics to demonstrate model quality.",
        example: null,
      },
    ],
    ats_score: 87,
    ats_issues: [
      "Consider adding keywords: Kubernetes, distributed systems, MLOps",
    ],
    processing_time: 5100,
    model_version: "1.0.0",
  },
];

async function seed() {
  const client = new MongoClient(MONGODB_URL);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(DATABASE_NAME);

    const usersCol = db.collection("users");
    const resumesCol = db.collection("resumes");
    const jobsCol = db.collection("job_descriptions");
    const analysesCol = db.collection("analyses");

    await usersCol.deleteMany({});
    await resumesCol.deleteMany({});
    await jobsCol.deleteMany({});
    await analysesCol.deleteMany({});
    console.log("Cleared existing data");

    const userDocs = sampleUsers.map((u) => ({ ...u }));
    await usersCol.insertMany(userDocs);
    console.log(`Inserted ${userDocs.length} users`);

    const resumeDocs = sampleResumes.map((r) => {
      const { user_id_ref, ...rest } = r;
      return { user_id: user_id_ref, ...rest };
    });
    await resumesCol.insertMany(resumeDocs);
    console.log(`Inserted ${resumeDocs.length} resumes`);

    const jobDocs = sampleJobDescriptions.map((j) => {
      const { user_id_ref, ...rest } = j;
      return { user_id: user_id_ref, ...rest };
    });
    await jobsCol.insertMany(jobDocs);
    console.log(`Inserted ${jobDocs.length} job descriptions`);

    const analysisDocs = sampleAnalyses.map((a) => {
      const { user_id_ref, resume_version, job_title, ...rest } = a;
      return {
        user_id: user_id_ref,
        resume_version,
        job_title,
        ...rest,
      };
    });
    await analysesCol.insertMany(analysisDocs);
    console.log(`Inserted ${analysisDocs.length} analyses`);

    await usersCol.createIndex({ email: 1 }, { unique: true });
    await usersCol.createIndex({ created_at: -1 });
    await resumesCol.createIndex({ user_id: 1, upload_date: -1 });
    await resumesCol.createIndex({ processing_status: 1 });
    await jobsCol.createIndex({ user_id: 1, created_at: -1 });
    await jobsCol.createIndex({ "requirements.required_skills": 1 });
    await analysesCol.createIndex({ resume_id: 1, job_id: 1 });
    await analysesCol.createIndex({ user_id: 1, created_at: -1 });
    await analysesCol.createIndex({ "scores.overall": -1 });
    console.log("Created indexes");

    console.log("Seed completed successfully!");
  } finally {
    await client.close();
  }
}

seed().catch(console.error);
