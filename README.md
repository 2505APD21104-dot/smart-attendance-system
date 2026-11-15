# Smart Attendance Management System

A modern, responsive, full-stack **University Attendance Management System** built with **React**, **TypeScript**, **Tailwind CSS**, and **Node.js/Express**, demonstrating **Relational Databases (PostgreSQL/MySQL)**, **NoSQL Document Storage (MongoDB)**, **Graph Database concepts (Neo4j)**, **Redis Caching**, **ACID Transaction Management**, and **Role-Based Security**.

---

## 🏛️ System Overview

The **Apex University Smart Attendance System** provides educational institutions with a high-performance, database-centric platform for tracking student attendance, computing examination eligibility percentages, preventing duplicate submissions, and auditing academic records.

### Key Architectural Highlights:
1. **Relational Database Engine (PostgreSQL / MySQL / SQLite)**:
   - Full relational schema with Primary Keys, Foreign Keys, Referential Cascades/Restricts, Composite Unique Constraints, and Analytical Indexes.
   - Strict composite unique constraint: `uq_attendance_student_session (student_id, class_id, subject_id, date)` blocks duplicate attendance records.
   - Built-in ANSI SQL:2016 DDL exporter (`schema.sql`).

2. **NoSQL Document Store (MongoDB)**:
   - Wire-compatible document collections: `activity_logs`, `notifications`, and `attendance_events`.
   - Asynchronous audit streaming and unread notification tracking.

3. **Graph Database Subsystem (Neo4j & Cypher)**:
   - Node entities: `(:Department)`, `(:Faculty)`, `(:Student)`, `(:Course)`, `(:Class)`.
   - Directed relationships: `[:BELONGS_TO]`, `[:OFFERS]`, `[:TEACHES]`, `[:SCHEDULED_FOR]`, `[:ENROLLED_IN]`.
   - Built-in Cypher query simulator and node traversal degree analyzer.

4. **Redis In-Memory Caching**:
   - Sub-millisecond retrieval of dashboard telemetry, attendance statistics, and reports.
   - Real-time cache metrics: Hit/Miss counters, Hit Ratio %, and Memory key browser.
   - Automatic cache invalidation upon any attendance record creation or modification.

5. **ACID Transaction Management**:
   - Multi-row atomic attendance sessions using two-phase validation (`BEGIN TRANSACTION`, `COMMIT`, `ROLLBACK`).
   - Interactive Transaction Lab inside Admin settings to test atomic commit vs duplicate constraint rollback.

6. **Cloud Database Readiness**:
   - Decoupled storage adapter architecture ready for direct connection to AWS RDS / Neon Postgres, MongoDB Atlas, Upstash Redis, and Neo4j AuraDB.

---

## 👥 Pre-Configured Demo Credentials

The system includes pre-seeded demonstration data spanning 5 departments, 5 faculty instructors, 25+ students, 8 courses, 5 classes, and 650+ historical attendance records. One-click demo login buttons are provided on the login screen.

| Role | Name / Identifier | Email / Login | Password | Access & Responsibilities |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | Dr. Eleanor Vance | `admin@apex.edu` | `Admin@123` | Full system control, department/course/class CRUD, reports, multi-DB explorer, security audits |
| **Faculty** | Dr. Robert Chen | `robert.chen@apex.edu` | `Faculty@123` | Mark daily attendance, class reports, review attendance history, student debarment warnings |
| **Faculty** | Prof. Sarah Miller | `sarah.miller@apex.edu` | `Faculty@123` | Instructor for Data Structures and Web Architecture |
| **Student** | Alex Johnson | `alex.j@apex.edu` (Roll: `CS2024001`) | `Student@123` | View personal attendance (89%), subject breakdown, calendar view, export attendance report |
| **Student** | Priya Sharma | `priya.s@apex.edu` (Roll: `CS2024002`) | `Student@123` | CSE Semester 5 student with high attendance (95%) |
| **Student** | Rohan Verma | `rohan.v@apex.edu` (Roll: `CS2024007`) | `Student@123` | Low attendance student (~60%) demonstrating < 75% warning alerts and recovery calculator |

---

## 🚀 Quick Start & Setup Instructions

### Prerequisites:
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 1. Installation
Dependencies are already installed. If installing on a new machine:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Seed Database
To re-seed fresh demo data:
```bash
npm --prefix server run seed
```

### 3. Run the Application

#### Option A: Unified Full-Stack Server (Recommended)
The built client assets are served directly from the Express backend on port `5000`:
```bash
npm --prefix server start
```
Open **`http://localhost:5000`** in your browser.

#### Option B: Independent Vite Dev Mode
Run the backend and frontend in separate terminals:
```bash
# Terminal 1: Backend API (Port 5000)
npm --prefix server run dev

# Terminal 2: Vite React Frontend (Port 3000)
npm --prefix client run dev
```
Open **`http://localhost:3000`** in your browser (API requests automatically proxy to port 5000).

---

## 📊 Modules & Functional Walkthrough

### 1. Authentication System
- **Role-based Authentication**: Administrator, Faculty, and Student login with JWT token issuance.
- **Security Features**: Show/Hide password toggle, remember me session persistence, forgot password recovery workflow, and fast 1-click evaluation buttons.

### 2. Administrator Dashboard
- **Telemetry KPIs**: Total students, faculty, courses, classes, today's attendance turnout, and overall percentage.
- **Visual Analytics (Recharts)**:
  - Weekly attendance trends (Present vs Absent vs Late).
  - Department-wise attendance ranking with 75% threshold indicator.
  - Overall distribution donut chart.
  - Live activity feed powered by MongoDB document stream.
- **Entity Management**:
  - **Student Management**: Add, edit, remove, filter by department/semester, search by name/roll, and view individual attendance history transcripts.
  - **Faculty Management**: Add, edit, remove, assign subjects and classes.
  - **Department Management**: Add/edit academic units with student, faculty, and course counts.
  - **Course Management**: Manage course syllabus, credit units, and department links.
  - **Class Management**: Schedule classrooms, section cohorts, and instructor assignments.
- **Attendance Records**: Filterable records table with one-click **Attendance Correction** recording audit entries.
- **Reports Center**: Daily, weekly, monthly, student-wise, subject-wise, department-wise, and low-attendance reports (< 75%) with CSV download and print view.
- **Database & Architecture Center**:
  - Relational Schema explorer and ANSI SQL DDL export.
  - NoSQL document browser (`activity_logs`, `notifications`, `attendance_events`).
  - Interactive Neo4j graph explorer with Cypher query executor.
  - Redis cache statistics with live hit/miss tracking and flush button.
  - Transaction Simulation Lab (ACID commit vs Duplicate unique key rollback).
- **System Settings**: Configurable minimum attendance threshold (default: 75%), academic year, and university title.

### 3. Faculty Dashboard
- **Today's Class Schedule**: Real-time completion status badge (Completed vs Pending) for each scheduled class.
- **Mark Attendance Interface**:
  - Class & subject selector, date picker.
  - Quick bulk actions: **"Mark All Present"** and **"Mark All Absent"**.
  - Student status toggle pills: **Present (Green)**, **Absent (Red)**, **Late (Amber)**.
  - Real-time live counts counter.
  - Notes/remarks per student for leaves or transit delays.
  - Atomic database transaction commit preventing duplicate records.
- **Attendance History**: Past attendance sessions conducted with turnout rates.
- **Class-wise Attendance Reports**: Student compliance ranking with exam eligibility badges.

### 4. Student Dashboard
- **Personal Metrics**: Classes conducted, present, absent, and cumulative attendance percentage.
- **Low Attendance Warning (< 75%)**:
  - Prominent alert banner if attendance falls below 75%.
  - **Consecutive Recovery Calculator**: Dynamically calculates the exact number of consecutive classes required to restore exam eligibility (`x = ceil((0.75 * total - present) / 0.25)`).
- **Subject-wise Progress**: Individual visual progress bars per course with 75% target line.
- **Monthly Attendance Calendar**: Interactive calendar color-coding each day (Green = Present, Red = Absent, Amber = Late) with session popover inspector.
- **Personal Transcript Export**: Download complete attendance logs in standard CSV format.

---

## 🗄️ Database Architecture Details

```
+--------------------------------------------------------------------------+
|                  Apex University Multi-Model Database                     |
+--------------------------------------------------------------------------+
        |                     |                     |               |
        v                     v                     v               v
 [Relational Core]    [NoSQL Document]       [Graph Engine]    [Redis Cache]
 (PostgreSQL/MySQL)       (MongoDB)             (Neo4j)        (In-Memory)
  - users              - activity_logs       - (:Student)     - stats:dashboard
  - departments        - notifications       - (:Faculty)     - reports:*
  - faculty            - attendance_events   - (:Course)      - student:*
  - students                                 - (:Class)       (Auto TTL 60s)
  - courses                                  - (:Department)
  - classes                                  [:TEACHES]
  - class_enrollments                        [:ENROLLED_IN]
  - attendance_sessions                      [:OFFERS]
  - attendance_records                       [:BELONGS_TO]
  - system_settings                          [:SCHEDULED_FOR]
```

### Relational Schema Summary:
```sql
-- Composite unique key prevents duplicate attendance for the same student, class, subject, date
CONSTRAINT uq_attendance_student_session UNIQUE (student_id, class_id, subject_id, date)

-- Session unique key prevents multiple session creation for same class, subject, date
CONSTRAINT uq_session_class_sub_date UNIQUE (class_id, subject_id, date)
```

---

## 🧪 Testing and Verification

Run the built-in automated test suite:
```bash
cd server
node test_system.js
```
The test suite validates:
1. Relational schema integrity and foreign keys.
2. Two-phase ACID transaction commit and duplicate rollback behavior.
3. NoSQL document store inserts, queries, and sorting.
4. Neo4j graph nodes, edges, degree calculation, and Cypher queries.
5. Redis cache hit/miss metrics and eviction.
6. Production SQL DDL generator.

---

## 🔒 Security Summary
- **Password Hashing**: `bcryptjs` with 10 salt rounds.
- **Authentication**: JWT Bearer token verification with 24-hour expiration (or 30 days with "Remember me").
- **Authorization**: Role-based access control middleware (`admin`, `faculty`, `student`).
- **Data Protection**: Students are strictly scoped to their own attendance records.
- **Audit Trails**: Every attendance submission and status update logs an immutable entry to NoSQL `activity_logs`.
