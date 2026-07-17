/*
 * MongoDB Schema Documentation
 * AI Resume Analyzer - Database Schema
 *
 * Collections and their structure with indexes and validation rules.
 * This file serves as documentation. MongoDB is schema-less by design,
 * but application-level validation is enforced via Pydantic models.
 */

/**
 * Collection: users
 * Description: Stores user accounts and authentication data.
 *
 * Fields:
 *   _id              ObjectId   - Primary key (auto-generated)
 *   email            String     - Unique email address (indexed)
 *   password_hash    String     - Hashed password (bcrypt)
 *   full_name        String     - User's display name
 *   role             String     - "user" | "admin" (default: "user")
 *   avatar_url       String     - Optional profile image URL
 *   created_at       Date       - Account creation timestamp
 *   updated_at       Date       - Last profile update timestamp
 *   last_login       Date       - Most recent login timestamp
 *   is_active        Boolean    - Account enabled/disabled (default: true)
 *
 * Indexes:
 *   { email: 1 }           - Unique index for login lookups
 *   { created_at: -1 }     - For admin listing sorted by newest
 *
 * Validation:
 *   - email must match /^[^\s@]+@[^\s@]+\.[^\s@]+$/
 *   - password_hash required
 *   - full_name min length 2
 */

/**
 * Collection: resumes
 * Description: Stores uploaded resumes and their parsed/extracted data.
 *
 * Fields:
 *   _id              ObjectId   - Primary key
 *   user_id          ObjectId   - Reference to users collection (indexed)
 *   file_name        String     - Original uploaded filename
 *   file_path        String     - Storage path or cloud URL
 *   file_size        Number     - File size in bytes
 *   file_type        String     - "pdf" | "docx" | "txt"
 *   upload_date      Date       - Upload timestamp
 *
 *   // Parsed data from NLP processing
 *   parsed_data: {
 *     full_name      String     - Extracted name
 *     email          String     - Extracted email
 *     phone          String     - Extracted phone number
 *     location       String     - Extracted address/location
 *     summary        String     - Professional summary/objective
 *     experience: [{
 *       title        String     - Job title
 *       company      String     - Company name
 *       location     String     - Work location
 *       start_date   String     - Start date (raw text)
 *       end_date     String     - End date (raw text or "Present")
 *       description  String     - Job description/responsibilities
 *       skills_used  [String]   - Skills mentioned in this role
 *     }]
 *     education: [{
 *       degree       String     - Degree level and field
 *       institution  String     - School/university name
 *       start_year   Number     - Enrollment year
 *       end_year     Number     - Graduation year
 *       gpa          String     - GPA if present
 *     }]
 *     skills         [String]   - Extracted skill keywords
 *     certifications [String]   - Professional certifications
 *     languages      [String]   - Spoken/written languages
 *     projects: [{
 *       name         String     - Project name
 *       description  String     - Project description
 *       technologies [String]   - Tech stack used
 *     }]
 *   }
 *
 *   raw_text         String     - Full extracted text from document
 *   processing_status String    - "pending" | "processing" | "completed" | "failed"
 *   error_message    String     - Error details if processing failed
 *   version          Number     - Resume version number (default: 1)
 *
 * Indexes:
 *   { user_id: 1, upload_date: -1 }  - User's resumes sorted newest first
 *   { processing_status: 1 }         - For background job polling
 *   { user_id: 1, "parsed_data.skills": 1 }  - Skill-based search
 *
 * Validation:
 *   - file_type must be one of ["pdf", "docx", "txt"]
 *   - processing_status must be one of ["pending", "processing", "completed", "failed"]
 *   - file_size must be > 0 and <= 10MB
 */

/**
 * Collection: job_descriptions
 * Description: Stores job postings to compare resumes against.
 *
 * Fields:
 *   _id              ObjectId   - Primary key
 *   user_id          ObjectId   - Reference to users collection (indexed)
 *   title            String     - Job title
 *   company          String     - Company name
 *   description      String     - Full job description text
 *   requirements: {
 *     required_skills    [String]  - Must-have skills
 *     preferred_skills   [String]  - Nice-to-have skills
 *     min_experience     Number    - Minimum years of experience
 *     education_level    String    - "high_school" | "bachelors" | "masters" | "phd"
 *   }
 *   salary_range: {
 *     min              Number    - Minimum salary
 *     max              Number    - Maximum salary
 *     currency         String    - Currency code (default: "USD")
 *   }
 *   location         String     - Job location
 *   remote           Boolean    - Remote work available
 *   job_type         String     - "full_time" | "part_time" | "contract" | "internship"
 *   url              String     - Original posting URL
 *   created_at       Date       - When added
 *   updated_at       Date       - Last modification
 *
 * Indexes:
 *   { user_id: 1, created_at: -1 }              - User's jobs sorted newest first
 *   { "requirements.required_skills": 1 }        - Skill matching queries
 *   { company: 1, title: 1 }                    - Company/job search
 *   { "$**": "text" }                           - Full-text search on all string fields
 *
 * Validation:
 *   - title and description are required
 *   - min_experience >= 0
 *   - salary_range.max >= salary_range.min when both provided
 */

/**
 * Collection: analyses
 * Description: Stores resume-to-job matching analysis results.
 *
 * Fields:
 *   _id              ObjectId   - Primary key
 *   user_id          ObjectId   - Reference to users collection (indexed)
 *   resume_id        ObjectId   - Reference to resumes collection (indexed)
 *   job_id           ObjectId   - Reference to job_descriptions collection (indexed)
 *   created_at       Date       - Analysis timestamp
 *
 *   scores: {
 *     overall          Number    - Total match score 0-100
 *     skills_match     Number    - Skills alignment score 0-100
 *     experience_match Number    - Experience relevance score 0-100
 *     education_match  Number    - Education fit score 0-100
 *     keyword_match    Number    - ATS keyword match score 0-100
 *   }
 *
 *   matched_skills: [String]       - Skills found in both resume and job
 *   missing_skills: [String]       - Required skills missing from resume
 *   extra_skills: [String]         - Skills in resume not mentioned in job
 *
 *   suggestions: [{
 *     category       String     - "skills" | "experience" | "education" | "formatting" | "keywords"
 *     priority       String     - "high" | "medium" | "low"
 *     title          String     - Short suggestion title
 *     description    String     - Detailed improvement suggestion
 *     example        String     - Optional example text to add
 *   }]
 *
 *   ats_score        Number     - Applicant Tracking System compatibility 0-100
 *   ats_issues: [String]         - Detected ATS formatting problems
 *
 *   processing_time  Number     - Analysis duration in milliseconds
 *   model_version    String     - NLP model version used
 *
 * Indexes:
 *   { resume_id: 1, job_id: 1 }        - Prevent duplicate analyses
 *   { user_id: 1, created_at: -1 }     - User's analyses sorted newest first
 *   { "scores.overall": -1 }           - Top scores for leaderboard
 *   { resume_id: 1 }                   - All analyses for a resume
 *
 * Validation:
 *   - All score fields must be between 0 and 100
 *   - priority must be one of ["high", "medium", "low"]
 *   - category must be one of ["skills", "experience", "education", "formatting", "keywords"]
 */

/**
 * Collection: reports
 * Description: Generated PDF reports from analyses.
 *
 * Fields:
 *   _id              ObjectId   - Primary key
 *   user_id          ObjectId   - Reference to users collection (indexed)
 *   analysis_id      ObjectId   - Reference to analyses collection (indexed)
 *   resume_id        ObjectId   - Reference to resumes collection
 *   generated_at     Date       - Report generation timestamp
 *   file_path        String     - Storage path for the PDF
 *   file_size        Number     - PDF file size in bytes
 *   format           String     - "pdf" | "html" (default: "pdf")
 *   status           String     - "generating" | "completed" | "failed"
 *
 * Indexes:
 *   { analysis_id: 1 }         - Lookup report by analysis
 *   { user_id: 1, generated_at: -1 }  - User's reports sorted newest first
 *
 * Validation:
 *   - file_path is required when status is "completed"
 *   - file_size > 0 when status is "completed"
 */
