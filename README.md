# Interview AI API — Documentation & Postman Testing Guide

Base URL: `http://localhost:3000`

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [Postman Setup Guide](#postman-setup-guide)
3. [All API Routes Summary](#all-api-routes-summary)
4. [Authentication Routes (`/api/auth`)](#authentication-routes-apiauth)
   - [1. Register User](#1-post-apiauthregister)
   - [2. Login User](#2-post-apiauthlogin)
   - [3. Get Profile](#3-get-apiauthprofile-)
   - [4. Logout](#4-get-apiauthlogout)
5. [Interview Routes (`/api/interview`)](#interview-routes-apiinterview)
   - [5. Generate Interview Report](#5-post-apiinterview-)
6. [Ready-to-Use Postman Test Payloads](#ready-to-use-postman-test-payloads)
7. [cURL Commands for Terminal Testing](#curl-commands-for-terminal-testing)
8. [Data Models Reference](#data-models-reference)

---

## Overview

This API powers an AI-driven interview preparation system:
- **Authentication**: JWT stored in HTTP-only cookies with token blacklisting on logout.
- **Resume Processing**: Uploads PDF or text resumes using `multer` memory storage and parses text with `pdf-parse`.
- **AI Report Generation**: Sends resume, job description, and candidate self-description to Google Gemini (`gemini-3.5-flash-lite`) to generate structured match scores, technical questions with answers, behavioural questions, skill gaps, and a day-by-day preparation plan.
- **Database**: All reports and users are stored in MongoDB via Mongoose.

---

## Postman Setup Guide

### 1. Automatic Cookie Handling
Postman automatically retains cookies returned in `Set-Cookie` responses:
1. Send a request to `POST /api/auth/login` or `POST /api/auth/register`.
2. Postman saves the `token` cookie in its Cookie Jar for `localhost`.
3. Subsequent requests to protected routes (`/api/auth/profile` and `POST /api/interview`) will automatically include the cookie.

> **Tip**: If cookies are not sent automatically, open **Cookies** (top-right under the Send button in Postman), verify `localhost` has a `token` cookie, or manually add a Header:  
> `Cookie`: `token=<YOUR_JWT_TOKEN>`

### 2. Postman Multipart Form-Data Setup (For Resume Upload)
For `POST /api/interview`:
1. Method: `POST`
2. URL: `http://localhost:3000/api/interview`
3. Go to **Body** tab -> select **form-data**.
4. Set the fields:
   - `resume` ➔ Hover over the Key field, change type from **Text** to **File**, and select a PDF file from your computer.
   - `jobDescription` ➔ Type: **Text**, enter the job requirements.
   - `selfDescription` ➔ Type: **Text**, enter candidate background.

---

## All API Routes Summary

| Method | Endpoint | Auth Required | Content-Type | Description |
| :--- | :--- | :---: | :--- | :--- |
| `POST` | `/api/auth/register` | ❌ | `application/json` | Register new user & set cookie |
| `POST` | `/api/auth/login` | ❌ | `application/json` | Login existing user & set cookie |
| `GET` | `/api/auth/profile` | ✅ | None | Get logged-in user profile |
| `GET` | `/api/auth/logout` | ❌ | None | Invalidate token & clear cookie |
| `POST` | `/api/interview` | ✅ | `multipart/form-data` | Upload resume + JD to generate report |

---

## Authentication Routes (`/api/auth`)

### 1. `POST /api/auth/register`
Creates a new user, hashes password with `bcryptjs`, issues JWT cookie.

- **URL**: `http://localhost:3000/api/auth/register`
- **Method**: `POST`
- **Headers**:
  - `Content-Type`: `application/json`
- **Body** (`raw` JSON):
```json
{
  "username": "alexdev",
  "email": "alex@example.com",
  "password": "Password123!"
}
```

- **Success Response (`201 Created`)**:
```json
{
  "message": "user registered successfully",
  "user": {
    "id": "665f91a2e8c2...",
    "username": "alexdev"
  }
}
```
*Sets `Set-Cookie: token=<jwt_token>; Path=/`*

- **Error Responses**:
  - `400 Bad Request`: `{ "message": "all fields are required" }`
  - `400 Bad Request`: `{ "message": "user already exists" }`

---

### 2. `POST /api/auth/login`
Authenticates user credentials and issues a fresh JWT cookie.

- **URL**: `http://localhost:3000/api/auth/login`
- **Method**: `POST`
- **Headers**:
  - `Content-Type`: `application/json`
- **Body** (`raw` JSON):
```json
{
  "username": "alexdev",
  "password": "Password123!"
}
```

- **Success Response (`201 Created`)**:
```json
{
  "message": "user logged in successfully",
  "user": {
    "id": "665f91a2e8c2...",
    "username": "alexdev"
  }
}
```

- **Error Responses**:
  - `400 Bad Request`: `{ "message": "all fields are required" }`
  - `400 Bad Request`: `{ "message": "user not found" }`
  - `400 Bad Request`: `{ "message": "invalid password" }`

---

### 3. `GET /api/auth/profile` 🔒
Retrieves current user details from JWT cookie.

- **URL**: `http://localhost:3000/api/auth/profile`
- **Method**: `GET`
- **Headers**:
  - Cookie: `token=<jwt_token>` (handled automatically if logged in)

- **Success Response (`200 OK`)**:
```json
{
  "user": {
    "id": "665f91a2e8c2...",
    "username": "alexdev",
    "email": "alex@example.com"
  }
}
```

- **Error Responses**:
  - `401 Unauthorized`: `{ "message": "token not provided" }`
  - `401 Unauthorized`: `{ "message": "token blacklisted" }`
  - `403 Forbidden`: `{ "message": "invalid token" }`

---

### 4. `GET /api/auth/logout`
Blacklists current JWT token in MongoDB and clears cookie.

- **URL**: `http://localhost:3000/api/auth/logout`
- **Method**: `GET`

- **Success Response (`200 OK`)**:
```json
{
  "message": "user logged out successfully"
}
```

---

## Interview Routes (`/api/interview`)

### 5. `POST /api/interview` 🔒
Parses the candidate's resume, invokes Gemini AI to analyze fit against the job description, and saves the structured report to MongoDB linked to the authenticated user.

- **URL**: `http://localhost:3000/api/interview`
- **Method**: `POST`
- **Auth**: Requires login cookie (`token`)
- **Body**: `form-data`

| Key | Type | Required | Description | Sample Value |
| :--- | :--- | :---: | :--- | :--- |
| `resume` | **File** | Yes | PDF or text resume file | Select `sample_resume.pdf` |
| `jobDescription` | **Text** | Yes | Target job role requirements | See sample below |
| `selfDescription` | **Text** | No | Candidate's personal summary | See sample below |

- **Success Response (`201 Created`)**:
```json
{
  "message": "report generated successfully",
  "data": {
    "_id": "6acf83f1188fdba92e527e8b",
    "user": "6acf83ee188fdba92e527e8a",
    "jobDescription": "Senior Backend Engineer: 4+ years in Node.js, Express, MongoDB, Docker, and Redis caching.",
    "selfDescription": "Full Stack Developer with 3 years experience building scalable backend architectures in Node.js.",
    "resume": "Extracted text content from candidate resume...",
    "matchScore": 75,
    "technicalQuestions": [
      {
        "question": "Can you explain how you implement caching strategies using Redis in a Node.js application?",
        "intention": "To assess the candidate's hands-on experience with Redis caching, which is explicitly required for the Senior Backend Engineer role.",
        "answer": "Discuss a scenario where you used Redis to cache frequently accessed database queries, cache invalidation strategies (TTL, write-through), and handling cache stamps."
      },
      {
        "question": "How do you handle unhandled promise rejections and asynchronous errors in an Express API?",
        "intention": "To test production readiness and robust error-handling practices in Node.js.",
        "answer": "Explain centralized error-handling middleware, process-level event listeners (unhandledRejection, uncaughtException), and async wrappers."
      }
    ],
    "behaviouralQuestions": [
      {
        "question": "Describe a time when you had to design a scalable backend architecture from scratch. What challenges did you face?",
        "intention": "To evaluate architectural decision-making, foresight, and problem-solving skills under constraints.",
        "answer": "Use the STAR method: Situation (high traffic requirements), Task (designing architecture), Action (modular monolith/microservices, indexing, caching), Result (handled X requests/sec with low latency)."
      }
    ],
    "skillGap": [
      {
        "skill": "1 year of missing experience (requires 4+, candidate has 3)",
        "severity": "medium"
      },
      {
        "skill": "Redis Caching explicit project evidence",
        "severity": "low"
      }
    ],
    "preparationPlan": [
      {
        "day": 1,
        "focus": "Redis Caching Patterns",
        "task": "Build a proof of concept caching layer using Redis for MongoDB query results."
      },
      {
        "day": 2,
        "focus": "Docker & Containerization",
        "task": "Create multi-stage Dockerfiles and docker-compose configurations for Node.js + Redis + Mongo."
      }
    ],
    "createdAt": "2026-10-14T13:28:49.000Z",
    "updatedAt": "2026-10-14T13:28:49.000Z"
  }
}
```

- **Error Responses**:
  - `400 Bad Request`: `{ "message": "Resume file is required" }`
  - `400 Bad Request`: `{ "message": "jobDescription is required" }`
  - `401 Unauthorized`: `{ "message": "token not provided" }`
  - `500 Internal Server Error`: `{ "message": "Internal server error while generating report", "error": "..." }`

---

## Ready-to-Use Postman Test Payloads

### Test Data 1: Senior Node.js Backend Engineer
- **`jobDescription`**:
  ```text
  Senior Backend Engineer with 4+ years experience. Must have strong skills in Node.js, Express, MongoDB, Redis caching, Docker containerization, REST API design, and microservices architecture. Experience with CI/CD and AWS is a plus.
  ```
- **`selfDescription`**:
  ```text
  I am a backend developer with 3 years of experience specializing in Node.js, Express, and MongoDB. I have built scalable REST APIs and worked with relational and NoSQL databases. Looking to expand my skills in Docker and Redis.
  ```

---

### Test Data 2: Full Stack MERN Developer
- **`jobDescription`**:
  ```text
  Full Stack Developer needed with expertise in React, Node.js, MongoDB, Express, and TailwindCSS. Responsibilities include building responsive UI, writing backend APIs, implementing authentication with JWT, and managing state with Redux or Zustand.
  ```
- **`selfDescription`**:
  ```text
  Frontend-leaning full stack developer with 2 years of experience building modern React web apps and Node.js backends. Strong proficiency in JavaScript, Tailwind, and React Hooks.
  ```

---

### Test Data 3: AI / Python Engineer
- **`jobDescription`**:
  ```text
  AI Application Engineer with proficiency in Python, LangChain, OpenAI / Gemini APIs, Vector Databases (Pinecone/Chroma), FastAPI, and prompt engineering. Experience building RAG pipelines required.
  ```
- **`selfDescription`**:
  ```text
  Software engineer with 2 years in Python and REST APIs. Built several hobby projects with LLM APIs and prompt engineering. Learning vector databases and retrieval-augmented generation.
  ```

---

## cURL Commands for Terminal Testing

### 1. Register
```bash
curl -i -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "postman_user", "email": "postman@example.com", "password": "Password123!"}' \
  -c cookies.txt
```

### 2. Login
```bash
curl -i -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "postman_user", "password": "Password123!"}' \
  -c cookies.txt
```

### 3. Check Profile (Authenticated)
```bash
curl -i -X GET http://localhost:3000/api/auth/profile \
  -b cookies.txt
```

### 4. Generate Interview Report (File Upload)
```bash
curl -i -X POST http://localhost:3000/api/interview \
  -b cookies.txt \
  -F "resume=@/path/to/your/resume.pdf;type=application/pdf" \
  -F "jobDescription=Senior Node.js Developer with 4+ years experience in Express and MongoDB." \
  -F "selfDescription=Backend developer with 3 years experience building APIs."
```

### 5. Logout
```bash
curl -i -X GET http://localhost:3000/api/auth/logout \
  -b cookies.txt
```

---

## Data Models Reference

### `interviewReport` Schema
```javascript
{
  user: { type: ObjectId, ref: 'user', required: true },
  jobDescription: { type: String, required: true },
  resume: { type: String },
  selfDescription: { type: String },
  matchScore: { type: Number, min: 0, max: 100, required: true },
  technicalQuestions: [{
    question: String,
    intention: String,
    answer: String
  }],
  behaviouralQuestions: [{
    question: String,
    intention: String,
    answer: String
  }],
  skillGap: [{
    skill: String,
    severity: { type: String, enum: ['low', 'medium', 'high'] }
  }],
  preparationPlan: [{
    day: Number,
    focus: String,
    task: String
  }],
  timestamps: true
}
```

### `User` Schema
```javascript
{
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}
```
