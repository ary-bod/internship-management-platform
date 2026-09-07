# Internship Management Platform

A full-stack internship management platform built with:

- **Frontend:** Next.js, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Express.js, TypeScript
- **Database:** PostgreSQL
- **API:** REST
- **Validation:** Zod
- **Authentication:** JWT / session-based authentication

The project is designed as an internship engineering project and is divided into two phases:

- **MVP (Minimum Viable Product):** Core end-to-end workflow
- **MRV (Minimum Releasable Version):** Production-ready improvements around security, reliability, usability, and operations

---

## 1. Product Overview

The platform manages the complete internship lifecycle:

```text
Company
   ↓
Create Internship Position
   ↓
Intern discovers internship
   ↓
Intern applies
   ↓
Company reviews application
   ↓
Accept / Reject
   ↓
Internship Assignment
   ↓
Weekly Reports
   ↓
Supervisor Review
   ↓
Final Evaluation
   ↓
Internship Completed
```

### Main Roles

| Role | Description |
|---|---|
| `ADMIN` | Manages users, companies, internships, and platform data |
| `COMPANY` | Creates internship positions, reviews applicants, supervises interns |
| `INTERN` | Finds internships, applies, submits reports, and views evaluations |

---

# 2. MVP

The MVP focuses on the complete core workflow from authentication through internship evaluation.

## 2.1 Authentication

### Features

- Register
- Login
- Logout
- Get current user
- Role-based access control
- Password hashing

### API

```text
POST /auth/register
POST /auth/login
POST /auth/logout
GET  /auth/me
```

### Frontend

```text
/login
/register
```

---

# 3. Company Management

Companies can manage their organization profile and internship positions.

## 3.1 Company Profile

Company information:

```text
Company Name
Description
Industry
Website
Location
Logo
```

## 3.2 Internship Position

A company can create internship positions containing:

```text
Title
Description
Requirements
Location
Work Type
Start Date
End Date
Quota
Status
```

Example:

```text
Frontend Developer Intern

PT Example Indonesia

Location:
Jakarta

Work Type:
Hybrid

Duration:
3 Months

Quota:
2 Interns
```

### API

```text
GET    /companies/me

GET    /internships
POST   /internships
GET    /internships/:id
PATCH  /internships/:id
DELETE /internships/:id
```

---

# 4. Intern

Interns can browse available internship positions.

### Features

- Browse internships
- View internship details
- Apply for internship
- View application history
- View active internship
- Submit weekly reports
- View evaluation

### API

```text
GET /internships
GET /internships/:id
```

---

# 5. Application

Application is the process of an intern applying for an internship position.

## Application Status

```text
PENDING
   ↓
REVIEWING
   ↓
INTERVIEW
   ↓
ACCEPTED
   ↓
REJECTED
```

The backend must validate status transitions.

For example:

```text
ACCEPTED → PENDING
```

must not be allowed.

## Intern

```text
POST /internships/:id/apply
GET  /applications/me
GET  /applications/:id
```

## Company

```text
GET   /internships/:id/applications
GET   /applications/:id
PATCH /applications/:id/status
```

---

# 6. Internship Assignment

An accepted application becomes an internship assignment.

> Application and internship assignment are separate concepts.

An application represents the recruitment process.

An assignment represents an actual internship relationship.

Example:

```text
Intern:
Aryo

Company:
PT Example

Position:
Frontend Developer Intern

Supervisor:
Budi

Start:
01 Oct 2026

End:
31 Dec 2026
```

### API

```text
GET /assignments/me
GET /assignments/:id
```

---

# 7. Weekly Reports

Interns submit weekly progress reports.

Example:

```text
Week 1

What did you work on?
- Implemented login page
- Created API integration

Challenges:
- Authentication handling

Next week:
- Build dashboard
```

## Report Status

```text
DRAFT
SUBMITTED
REVIEWED
```

### API

```text
POST  /assignments/:id/reports
GET   /assignments/:id/reports
GET   /reports/:id
PATCH /reports/:id
POST  /reports/:id/review
```

Company/supervisor can:

- Review report
- Approve report
- Request revision
- Add feedback

---

# 8. Final Evaluation

At the end of the internship, the company evaluates the intern.

### Evaluation Criteria

```text
Technical Skill       1–5
Communication         1–5
Teamwork              1–5
Problem Solving       1–5
Discipline            1–5
Overall               1–5
Comments
```

### API

```text
POST  /assignments/:id/evaluation
GET   /assignments/:id/evaluation
PATCH /evaluations/:id
```

---

# 9. Admin

The Admin MVP should remain simple.

### Admin Features

```text
Users
Companies
Internships
Applications
```

Admin can:

- View users
- View companies
- Activate/deactivate companies
- View internships
- View applications

### Dashboard

```text
Total Interns       120
Companies            32
Open Positions       48
Active Internships   76
```

---

# 10. MVP Database

Recommended initial tables:

```text
users
companies
internships
applications
internship_assignments
weekly_reports
evaluations
notifications
```

Potential relationships:

```text
users
  │
  ├── company
  │
  └── intern

companies
  │
  └── internships
          │
          └── applications
                  │
                  └── internship_assignment
                          │
                          ├── weekly_reports
                          │
                          └── evaluation
```

---

# 11. MVP Frontend

## Public

```text
/
├── internships
├── internships/:id
├── login
└── register
```

## Intern

```text
/dashboard

/internships
/internships/:id

/my-applications

/my-internship
/my-internship/reports
/my-internship/evaluation
```

## Company

```text
/company/dashboard

/company/internships
/company/internships/new
/company/internships/:id
/company/internships/:id/applications

/company/interns
/company/interns/:id
```

## Admin

```text
/admin/dashboard
/admin/users
/admin/companies
/admin/internships
```

---

# 12. Backend Architecture

Use a layered architecture.

```text
Express
   │
   ├── Routes
   │
   ├── Controllers
   │
   ├── Services
   │
   ├── Repositories
   │
   ├── Validators
   │
   └── Middleware
          │
          ▼
      PostgreSQL
```

Recommended request flow:

```text
HTTP Request
     ↓
Route
     ↓
Authentication Middleware
     ↓
Authorization Middleware
     ↓
Validation
     ↓
Controller
     ↓
Service
     ↓
Repository
     ↓
PostgreSQL
     ↓
Response
```

Avoid putting business logic directly inside Express routes.

Bad:

```text
Route
 ↓
50+ lines of business logic
 ↓
SQL
 ↓
Response
```

Prefer:

```text
Route
 ↓
Controller
 ↓
Service
 ↓
Repository
 ↓
Database
```

---

# 13. MRV

MRV extends the MVP with production-oriented functionality.

The goal is:

> MVP + Security + Reliability + Usability + Operational Readiness

---

## 13.1 Advanced Authentication

Add:

```text
Access Token
Refresh Token
Password Reset
Email Verification
Session Management
```

### API

```text
POST /auth/refresh
POST /auth/forgot-password
POST /auth/reset-password
```

---

# 14. Proper RBAC and Resource Ownership

Authentication alone is not enough.

The system must verify:

```text
Authentication
      ↓
Authorization
      ↓
Resource Ownership
```

Example:

```text
Company A
```

must not be able to modify:

```text
Company B's internship
```

even if both users have the `COMPANY` role.

---

# 15. Advanced Application Workflow

MRV application lifecycle:

```text
PENDING
   ↓
REVIEWING
   ↓
INTERVIEW
   ↓
OFFERED
   ↓
ACCEPTED
   ↓
ONBOARDING
   ↓
ACTIVE
   ↓
COMPLETED
```

Invalid transitions must be rejected by the backend.

---

# 16. Notifications

Add in-app notifications.

### Intern

```text
Your application has been accepted.
```

### Company

```text
New application received.
```

### Supervisor

```text
Aryo submitted Week 3 report.
```

Optional:

```text
Email notifications
```

---

# 17. Search, Filter, Sorting, Pagination

Internship listing should support:

```text
Search
Location
Work Type
Status
Category
Sort
Pagination
```

Example:

```text
GET /internships?
    search=frontend
    location=jakarta
    work_type=hybrid
    status=open
    page=1
    limit=20
```

The frontend should expose these through a usable filter UI.

---

# 18. File Upload

Allow interns to upload:

```text
CV
Portfolio
Certificates
Weekly Report Attachments
```

The database should store metadata rather than binary files.

Example:

```text
file_url
file_name
file_size
mime_type
```

---

# 19. Audit Logs

Track important platform actions.

Example:

```text
User      Action                  Resource
------------------------------------------------
Aryo      APPLY                   internship:123
Budi      ACCEPT_APPLICATION      application:456
Budi      REVIEW_REPORT           report:789
```

Activity timeline example:

```text
Aryo applied for Frontend Developer Internship
2 minutes ago

Budi accepted Aryo's application
1 hour ago
```

---

# 20. Analytics Dashboard

## Company

```text
Applications              128
Accepted                   18
Active Interns             12
Completion Rate             91%
```

Possible charts:

```text
Applications Over Time
Applications by Internship
Application Status
Internship Completion Rate
```

## Admin

```text
Total Companies
Total Interns
Open Positions
Active Internships
Completed Internships
```

---

# 21. Production Quality

## Backend

Implement:

- Centralized error handling
- Request validation
- Rate limiting
- CORS configuration
- Helmet
- Structured logging
- Environment variable validation
- Database migrations
- Database transactions
- Consistent API response format

## Frontend

Implement:

- Loading states
- Empty states
- Error states
- Form validation
- Responsive design
- Accessible components
- Confirmation dialogs
- Toast notifications

---

# 22. Testing

MVP:

```text
Manual testing
```

MRV:

```text
Unit Tests
Integration Tests
API Tests
```

Minimum critical test cases:

### Authentication

```text
✓ User can register
✓ User can login
✓ Invalid credentials are rejected
✓ Protected endpoint requires authentication
```

### Application

```text
✓ Intern can apply
✓ Company cannot apply
✓ User cannot apply twice
✓ User cannot apply to closed internship
✓ User cannot apply after quota is reached
✓ Invalid status transitions are rejected
```

### Authorization

```text
✓ Company can only modify its own internship
✓ Intern can only access its own applications
✓ Company cannot access another company's applicants
✓ Admin can access administrative resources
```

---

# 23. MVP vs MRV

| Feature | MVP | MRV |
|---|:---:|:---:|
| Authentication | ✅ | Advanced |
| RBAC | ✅ | Ownership |
| Company | ✅ | ✅ |
| Internship | ✅ | Search/filter |
| Application | ✅ | Advanced workflow |
| Assignment | ✅ | ✅ |
| Weekly Report | ✅ | Attachments |
| Evaluation | ✅ | ✅ |
| Notifications | Basic | ✅ |
| File Upload | ❌ | ✅ |
| Search | Basic | ✅ |
| Pagination | Basic | ✅ |
| Dashboard | Basic | Analytics |
| Audit Log | ❌ | ✅ |
| Password Reset | ❌ | ✅ |
| Email Verification | ❌ | ✅ |
| Rate Limiting | ❌ | ✅ |
| Error Handling | Basic | Production |
| Testing | Basic | Automated |
| API Documentation | Basic | Complete |
| Deployment | Optional | ✅ |
| Logging/Monitoring | ❌ | ✅ |

---

# 24. Suggested Internship Phases

## Phase 1 — Foundation

Learn and implement:

```text
Git
TypeScript
Express
Next.js
PostgreSQL
Database Design
REST API
```

Deliverables:

```text
ERD
API Documentation
Project Structure
Database Migration
```

---

## Phase 2 — Authentication

Implement:

```text
Register
Login
Logout
Authentication
RBAC
```

---

## Phase 3 — Core CRUD

Implement:

```text
Users
Companies
Internships
Applications
```

Requirements:

```text
Validation
Pagination
Filtering
Error Handling
```

---

## Phase 4 — Business Logic

Implement:

```text
Application Workflow
Internship Assignment
Weekly Reports
Evaluation
```

Focus on backend business rules and state transitions.

---

## Phase 5 — Frontend

Build:

```text
Dashboard
Tables
Forms
Dialogs
Detail Pages
Loading States
Error States
Empty States
```

Use:

```text
Next.js
Tailwind CSS
shadcn/ui
React Hook Form
Zod
```

---

## Phase 6 — MRV Features

Implement:

```text
Notifications
File Upload
Search
Filtering
Pagination
Analytics
Audit Logs
```

---

## Phase 7 — Production

Implement:

```text
Testing
Docker
Environment Configuration
Database Migrations
Logging
Security
CI/CD
Deployment
```

---

# 25. Final Deliverables

The intern should finish with:

```text
Frontend Application
Backend REST API
PostgreSQL Database
ERD
API Documentation
Unit/Integration Tests
Docker Configuration
CI/CD Pipeline
README
Deployment URL
Demo Accounts
```

README should explain:

```text
Project Overview
Architecture
Tech Stack
Database Schema
Environment Variables
Local Development
API Documentation
Testing
Deployment
```

---

# 26. Success Criteria

The project is considered complete when:

```text
✓ Intern can register/login
✓ Company can create internship
✓ Intern can browse internships
✓ Intern can apply
✓ Company can review applications
✓ Company can accept/reject applicants
✓ Accepted applicant becomes an active internship
✓ Intern can submit weekly reports
✓ Supervisor can review reports
✓ Company can evaluate intern
✓ Admin can manage platform data
✓ Unauthorized resources are protected
✓ Core APIs are tested
✓ Application is deployed
✓ Documentation is complete
```

The most important principle is:

> **Build the MVP first. Do not start MRV features until the complete MVP workflow works end-to-end.**
