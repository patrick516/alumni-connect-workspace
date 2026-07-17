# Alumni Connect System

A full-stack web platform that connects **students, alumni, and university administrators** in one digital ecosystem.

The platform allows students and alumni to interact professionally through jobs, messaging, mentorship, and events.

---

# Technologies Used

## Frontend

- React (TypeScript)
- React Router
- Tailwind CSS
- Axios

## Backend

- Node.js
- Express.js

## Database

- MongoDB

---

# Features

### Student

- Register account
- View job opportunities
- Apply for jobs
- View events
- Message alumni
- Save jobs

### Alumni

- Register account
- Post job opportunities
- Offer mentorship
- Communicate with students
- Participate in events

### Admin

- Manage users
- Approve alumni accounts
- Approve job postings
- Manage events
- Monitor platform activity

---

# Project Structure

```

src
│
├── api
│ ├── authApi.ts
│ ├── eventApi.ts
│ ├── jobApi.ts
│ └── messageApi.ts
│
├── components
│ ├── admin
│ ├── auth
│ ├── dashboard
│ ├── events
│ ├── jobs
│ ├── layout
│ └── messaging
│
├── pages
│ ├── admin
│ ├── alumni
│ ├── student
│ ├── LoginPage.tsx
│ ├── RegisterPage.tsx
│ ├── JobsPage.tsx
│ ├── EventsPage.tsx
│ └── MessagingPage.tsx
│
├── context
│ └── AuthContext.tsx
│
├── hooks
│
└── types

```

---

# Authentication

The system uses **JWT authentication**.

Process:

1. User registers
2. Password is encrypted
3. User logs in
4. Server returns JWT token
5. Token is used for secure API requests

---

# API Endpoints

## Authentication

POST /api/register
POST /api/login

## Jobs

GET /api/jobs
POST /api/jobs
DELETE /api/jobs/:id

## Messages

POST /api/messages
GET /api/messages

## Events

GET /api/events
POST /api/events

---

# Installation

Clone the repository

```

git clone [https://github.com/patrick516/alumni-connect.git](https://github.com/patrick516/alumni-connect.git)

```

Install dependencies

```

npm install

```

Run development server

```

npm run dev

```

---

# Future Improvements

- Mobile application
- Real-time chat
- AI career recommendations
- Video mentorship
- Internship matching

---

# Author

Developed as a university project to improve alumni–student engagement and career networking.

```

---
```
