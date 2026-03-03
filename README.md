# ProofSprint

Performance-based technical hiring platform.

ProofSprint is an early-stage SaaS platform designed to match candidates and companies through real performance signals instead of traditional CV filtering.

---

## 🚀 Tech Stack

### Frontend
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS

### Backend
- Supabase (Authentication + PostgreSQL)
- Row Level Security (RLS)
- Role-based access control

### Database
- PostgreSQL relational schema
- UUID primary keys
- Foreign key relationships
- SQL schema versioned in /db/schema.sql

---

## 🏗 Architecture

The project follows a structured separation of concerns:

- app/ → Frontend routes (Next.js App Router)
- lib/ → Supabase client configuration
- db/schema.sql → Production database schema (version controlled)
- Supabase → Authentication and database layer

---

## 📊 Core Entities

### profiles
Stores user information and role:
- id (UUID, linked to auth.users)
- email
- role (candidate | company)
- created_at

### jobs
Job listings created by companies:
- id (UUID)
- company_id (references profiles)
- title
- description
- created_at

### applications
Candidate applications to jobs:
- id (UUID)
- job_id (references jobs)
- candidate_id (references profiles)
- status
- created_at

---

## 🔐 Authentication & Authorization

- Email + Password authentication
- Role-based profile creation
- Supabase Row Level Security policies
- Users can only access their own data
- Protected dashboard route

Role enforcement ensures:
- Candidates and companies are logically separated
- Users can only read/write their own profile
- Foreign key relationships maintain integrity

---

## 🗄 Database Schema

The production database schema is version-controlled in:

db/schema.sql

The schema includes:
- UUID primary keys
- Foreign key constraints
- Role validation constraints
- Cascading deletes
- Relational structure between users, jobs, and applications

---

## 🧪 Running Locally

Install dependencies:

npm install

Start the development server:

npm run dev

Then open:

http://localhost:3000

---

## 📌 Current Status

- Authentication system complete
- Role-based user system implemented
- Protected dashboard
- Relational database schema designed
- SQL schema version controlled
- Supabase RLS policies configured

---

## 🎯 Next Milestones

- Company job posting functionality
- Candidate application submission
- Role-specific dashboard views
- Interview challenge system
- Admin moderation layer
- Production deployment

---

## 💡 Vision

ProofSprint aims to replace resume-based filtering with performance-based hiring signals. The platform is being developed as a scalable SaaS architecture with structured separation between frontend, backend services, and database schema.