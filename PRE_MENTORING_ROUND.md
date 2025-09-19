# CareerPathak: Pre-Mentoring Round Feature Overview

## 🚀 Project Summary
CareerPathak is a next-generation AI-powered Career Insights Portal and Progressive Web App (PWA) designed to guide students and professionals through personalized career, college, and skill recommendations. Built for accessibility, speed, and intelligence, it works seamlessly on low-end devices and networks, supports offline usage, and offers a rich, multilingual experience.

---

## 🛠️ Tech Stack (Complex Yet Simple)

- **Frontend:**
  - React (TypeScript, Vite, SWC)
  - Tailwind CSS (utility-first, responsive design)
  - Shadcn/UI (modern, accessible UI components)
  - React Router (SPA navigation)
  - i18next (multi-lingual support)
  - Service Workers (PWA, offline caching)
  - Custom Toasts & Hooks

- **Backend:**
  - Node.js (Express.js)
  - FastAPI (Python, AI microservices)
  - MongoDB Atlas (cloud database)
  - Prisma ORM (data modeling)
  - Groq AI (course/college recommendations)
  - RESTful APIs
  - JSON Data Caching (in-memory, file-based)

- **AI & Intelligence:**
  - Groq AI (stream-to-course mapping, psychometric analysis)
  - Custom Python AI microservices (FastAPI)
  - Real-time college/course filtering

- **DevOps & Infra:**
  - Vite (fast builds, HMR)
  - Nodemon (backend hot reload)
  - .env config (secure secrets)

---

## 🌐 Key Features

- **AI-Powered Recommendations:**
  - Personalized college, course, and skill suggestions using Groq AI and custom logic
  - Psychometric fit analysis for career paths
  - Real-time backend filtering of colleges based on stream and course

- **Multi-Lingual Support:**
  - English, Hindi, Urdu, Kashmiri, Dogri (i18next, JSON locales)
  - Dynamic language switching

- **Mobile Responsive & PWA:**
  - Fully responsive UI (Tailwind, Shadcn/UI)
  - Works on all devices, including low-end phones
  - Add to Home Screen, offline access (Service Worker)

- **Offline & Caching:**
  - Service Worker for offline semi-compatibility
  - College/course data cached in-memory and on disk
  - Fast page loads even on slow networks

- **Low-End Network & Device Support:**
  - Optimized for 2G/3G networks
  - Minimal asset sizes, lazy loading
  - No heavy dependencies

- **User Personalization:**
  - Bookmarking, sharing, and rating of insights
  - Feedback system (coming soon)

- **Real-Time Data:**
  - College scraping engine (Python, planned)
  - API endpoints for colleges, scholarships, alumni, skills

- **Accessibility:**
  - Keyboard navigation, screen reader support
  - High-contrast mode (planned)

---

## 🖼️ Mermaid Flow: CareerPathak Architecture & Feature Map

```mermaid
flowchart TD
    subgraph Frontend
        A[React + TypeScript] --> B[Tailwind CSS]
        A --> C[Shadcn/UI]
        A --> D[React Router]
        A --> E[i18next]
        A --> F[Service Worker]
        A --> G[Custom Hooks]
    end
    subgraph Backend
        H[Node.js + Express] --> I[MongoDB Atlas]
        H --> J[Prisma ORM]
        H --> K[RESTful APIs]
        H --> L[JSON Caching]
        H --> M[Groq AI]
        H --> N[FastAPI (Python AI)]
    end
    subgraph Features
        O[AI Recommendations]
        P[Multi-Lingual]
        Q[Offline/PWA]
        R[Mobile Responsive]
        S[Low-End Support]
        T[User Personalization]
        U[Real-Time Data]
        V[Accessibility]
    end
    A --> O
    E --> P
    F --> Q
    B --> R
    S -.-> A
    S -.-> H
    T --> A
    T --> H
    U --> H
    U --> N
    V --> A
    M --> O
    N --> O
    H --> K
    K --> A
    L --> H
    I --> H
    J --> H
```

---

## 📦 Current Modules & Data
- College, course, and fee data (JSON, cached)
- Scholarships, alumni, trending skills (JSON)
- AI-powered college recommendations
- Multi-lingual locale files

---

## 📝 Next Steps
- Expand scraping engine for real-time college data
- Add feedback and rating system
- Enhance accessibility and offline features
- Integrate more AI-driven personalization

---

> **CareerPathak: Empowering every student, everywhere, with AI-driven career guidance.**
