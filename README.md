# ExpenseFlow — Expense Approval Workflow System

A full-stack, multi-role expense approval system with real-time notifications. Built with **React + Vite** on the frontend and **Spring Boot + MySQL** on the backend.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Roles and Workflow](#roles-and-workflow)
- [Notification System](#notification-system)
- [Screenshots](#screenshots)
- [Sample Workflow](#sample-workflow)

---

## Overview

ExpenseFlow lets employees submit expense requests that pass through a two-level approval chain — first the Manager, then the CEO. Every decision triggers an in-app notification to the submitting employee, giving full visibility at every step.

---

## Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | Vite, React 18, React Router v6, Axios          |
| Styling    | CSS Modules, DM Sans font, White + Green theme  |
| Backend    | Java 17, Spring Boot 3.2, Spring Security       |
| Auth       | JWT (JSON Web Tokens) via JJWT                  |
| Database   | MySQL 8 (auto-schema via Hibernate)             |
| Build tool | Maven                                           |

---

## Features

### Core
- **Role-based authentication** — separate login/signup for Employee, Manager, and CEO
- **JWT-secured APIs** — all routes protected by role-based Spring Security
- **Expense request creation** — employees submit requests with amount, country, department, and priority
- **Two-level approval chain** — Manager reviews first, CEO reviews manager-approved requests
- **Data isolation** — users see only their own requests; managers see all; CEO sees only manager-approved

### Approval Flow
- Manager can **Approve** (forwards to CEO) or **Reject** (closes request) with a comment
- CEO can **Approve** (marks as fully approved) or **Reject** with a comment
- Status transitions: `PENDING` → `CEO_REVIEW` → `APPROVED` or `REJECTED`

### Notifications
- In-app notification bell for employees (auto-polls every 15 seconds)
- Notification created automatically when manager or CEO takes action
- Unread badge count on the bell icon
- Mark individual or all notifications as read
- Notification types: `MANAGER_APPROVED`, `MANAGER_REJECTED`, `CEO_APPROVED`, `CEO_REJECTED`

### UI / UX
- Live 4-step approval progress tracker on the employee dashboard
- Filterable tables and card views per role
- Modal-based approve/reject with mandatory comment on rejection
- Responsive white and green design system

---

## Project Structure

```
expense-workflow/
│
├── frontend/                          # Vite + React
│   └── src/
│       ├── pages/
│       │   ├── auth/                  # LoginPage, SignupPage
│       │   ├── user/                  # UserDashboard
│       │   ├── manager/               # ManagerDashboard
│       │   └── ceo/                   # CeoDashboard
│       ├── components/
│       │   ├── Navbar.jsx             # Top bar with notification bell
│       │   ├── NotificationBell.jsx   # Bell + dropdown panel (USER only)
│       │   ├── StatusBadge.jsx        # Color-coded status pill
│       │   └── WorkflowSteps.jsx      # 4-step progress tracker
│       ├── services/
│       │   └── api.js                 # Axios instance + all API calls
│       └── context/
│           └── AuthContext.jsx        # JWT auth state
│
└── backend/                           # Spring Boot
    └── src/main/java/com/expenseflow/
        ├── model/
        │   ├── User.java              # USER / MANAGER / CEO roles
        │   ├── Workflow.java          # Expense workflow entity
        │   └── Notification.java      # Notification entity
        ├── repository/
        │   ├── UserRepository.java
        │   ├── WorkflowRepository.java
        │   └── NotificationRepository.java
        ├── service/
        │   ├── AuthService.java       # Register + login
        │   ├── WorkflowService.java   # Approval chain logic
        │   └── NotificationService.java # Notification creation + queries
        ├── controller/
        │   ├── AuthController.java
        │   ├── WorkflowController.java
        │   └── NotificationController.java
        ├── dto/                       # Request / Response DTOs
        ├── security/                  # JwtUtil, JwtAuthFilter
        └── config/                    # SecurityConfig, CORS
```

---

## Getting Started

### Prerequisites

| Tool     | Version  |
|----------|----------|
| Java     | 17+      |
| Maven    | 3.8+     |
| Node.js  | 18+      |
| MySQL    | 8+       |

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/expense-workflow.git
cd expense-workflow
```

---

### 2. Database Setup

Start MySQL and create the database (tables are auto-created by Hibernate on first run):

```sql
CREATE DATABASE expense_workflow;
```

---

### 3. Backend Setup

```bash
cd backend
```

Edit `src/main/resources/application.properties` to match your MySQL credentials:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/expense_workflow?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=your_password
```

Run the backend:

```bash
mvn spring-boot:run
```

The API will start at **http://localhost:8080**

---

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will start at **http://localhost:5173**

> The Vite dev server proxies `/api` requests to `http://localhost:8080` automatically.

---

## API Reference

### Authentication

| Method | Endpoint              | Body                                                     | Description     |
|--------|-----------------------|----------------------------------------------------------|-----------------|
| POST   | `/api/auth/register`  | `{ username, email, password, fullName, role }`         | Register user   |
| POST   | `/api/auth/login`     | `{ email, password }`                                   | Login           |

**Roles:** `USER`, `MANAGER`, `CEO`

---

### Workflows

| Method | Endpoint                              | Role    | Description                     |
|--------|---------------------------------------|---------|----------------------------------|
| POST   | `/api/workflows/create`               | USER    | Submit a new expense request    |
| GET    | `/api/workflows/my`                   | USER    | Get my submitted requests       |
| GET    | `/api/workflows/{id}`                 | Any     | Get workflow details            |
| GET    | `/api/workflows/manager/all`          | MANAGER | Get all workflows               |
| POST   | `/api/workflows/manager/{id}/action`  | MANAGER | Approve or reject               |
| GET    | `/api/workflows/ceo/all`              | CEO     | Get manager-approved workflows  |
| POST   | `/api/workflows/ceo/{id}/action`      | CEO     | Final approve or reject         |

**Action body:**
```json
{ "action": "APPROVE", "comment": "Looks good" }
{ "action": "REJECT",  "comment": "Over budget" }
```

---

### Notifications

| Method | Endpoint                             | Role | Description              |
|--------|--------------------------------------|------|--------------------------|
| GET    | `/api/notifications`                 | USER | Get all notifications    |
| GET    | `/api/notifications/unread-count`    | USER | Get unread count         |
| POST   | `/api/notifications/mark-all-read`   | USER | Mark all as read         |
| POST   | `/api/notifications/{id}/mark-read`  | USER | Mark one as read         |

---

## Roles and Workflow

```
Employee (USER)
  └── Submits expense request
         └── Status: PENDING
                │
                ▼
         Manager (MANAGER)
           ├── APPROVE  →  Status: CEO_REVIEW  →  Notification sent to employee
           └── REJECT   →  Status: REJECTED    →  Notification sent to employee
                                │
                                ▼ (if approved)
                         CEO (CEO)
                           ├── APPROVE  →  Status: APPROVED  →  Notification sent to employee
                           └── REJECT   →  Status: REJECTED  →  Notification sent to employee
```

### Permission Matrix

| Feature                         | USER | MANAGER | CEO |
|---------------------------------|------|---------|-----|
| Create expense request          | Yes  | No      | No  |
| View own requests + steps       | Yes  | No      | No  |
| Receive notifications           | Yes  | No      | No  |
| View all employee requests      | No   | Yes     | No  |
| Approve / Reject (level 1)      | No   | Yes     | No  |
| View manager-approved requests  | No   | No      | Yes |
| Approve / Reject (level 2)      | No   | No      | Yes |

---

## Notification System

Notifications are stored in the `notifications` table and are linked to both the recipient (workflow creator) and the workflow.

### How it works

1. Manager approves or rejects a workflow  
   → `NotificationService.notifyManagerAction()` is called  
   → Notification saved with type `MANAGER_APPROVED` or `MANAGER_REJECTED`

2. CEO approves or rejects a workflow  
   → `NotificationService.notifyCeoAction()` is called  
   → Notification saved with type `CEO_APPROVED` or `CEO_REJECTED`

3. Employee's bell icon polls `/api/notifications/unread-count` every 15 seconds  
   → Badge appears with unread count  
   → Clicking the bell fetches and displays all notifications  
   → Clicking a notification marks it as read

### Notification Entity

```
id            Long          Primary key
recipient     User          The employee who submitted the request
workflow      Workflow      The related workflow
title         String        Short title, e.g. "Manager Approved: Team Lunch"
message       String        Full description with comment if provided
type          Enum          MANAGER_APPROVED / MANAGER_REJECTED / CEO_APPROVED / CEO_REJECTED
isRead        Boolean       Default false
createdAt     LocalDateTime Auto-set on creation
```

---

## Sample Workflow

### Input

```json
{
  "name": "Team Offsite Expense",
  "amount": 2500,
  "country": "US",
  "department": "Engineering",
  "priority": "HIGH"
}
```

### Step-by-step

| Step | Actor   | Action  | Status        | Notification to Employee         |
|------|---------|---------|---------------|----------------------------------|
| 1    | User    | Submit  | PENDING       | —                                |
| 2    | Manager | Approve | CEO_REVIEW    | "Manager Approved: Team Offsite" |
| 3    | CEO     | Approve | APPROVED      | "CEO Approved: Team Offsite"     |

---

## Environment Variables

The following can be customized in `backend/src/main/resources/application.properties`:

```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/expense_workflow
spring.datasource.username=root
spring.datasource.password=root

# JWT
app.jwt.secret=your_jwt_secret_key
app.jwt.expiration=86400000   # 24 hours in ms

# Server
server.port=8080
```

---

## License

MIT License — free to use, modify, and distribute.
