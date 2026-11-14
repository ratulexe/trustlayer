# AI Coding Agent Guidelines & Plan (AGENTS.md)

> This document governs all autonomous AI coding operations for **TrustLayer**.  
> Every modification, scaffolding task, or code generation step must adhere strictly to these constraints.

---

## 1. Approved Technology Stack

- **Frontend**: React 18+ with Vite (PWA template), Tailwind CSS (Bright & Minimal theme).
- **Backend**: Node.js 20+ with Express.js (`cors`, `express.json`).
- **AI / LLM**: Google Gemini API (`gemini-1.5-flash` or `gemini-2.0-flash`).
- **AI / LLM (second model)**: xAI Grok via its OpenAI-compatible REST API (plain fetch), combined with Gemini in an ensemble — added at the evaluators' request.
- **Database**: Cloud Firestore (via `firebase-admin` or official Firebase Client SDK).
- **Payment Link**: Standard NPCI `upi://pay` URI specification.

---

## 2. Hard Constraints & Rules

1. **No New Libraries Without Explicit Confirmation**:
   - Do NOT install extra heavy dependencies (e.g., Redux, Lodash, Moment, Axios, Material UI).
   - Use standard native `fetch()`, native JavaScript date handling, and lightweight CSS.
2. **Secrets & Keys ONLY in `.env`**:
   - Never commit or hardcode `GEMINI_API_KEY`, `FIREBASE_SERVICE_ACCOUNT`, or database credentials into Git or source files.
   - Always load via `process.env` with sensible local mock fallbacks.
3. **Design Aesthetics**:
   - Keep the design **bright, minimalist, and accessible** as specified in `DESIGN.md`.
   - Never switch to heavy dark themes. Canvas must be clean slate/white (`#F8FAFC`, `#FFFFFF`).
4. **Vernacular Completeness**:
   - Every user-facing warning or verdict must have support for **English**, **हिन्दी (Hindi)**, and **বাংলা (Bengali)**.
5. **Deterministic Fallback**:
   - The Heuristic Rule Engine must ALWAYS be capable of running independently without internet access or if Gemini API times out (>1000ms).

---

## 3. Approved Project Folder Structure

```
TrustLayer/
├── .env.example
├── README.md
├── PRD.md
├── DESIGN.md
├── ARCHITECTURE.md
├── DATABASE.md
├── API.md
├── AGENTS.md
├── server.js               # Express API entry point
├── src/
│   ├── engines/
│   │   ├── ruleEngine.js   # Fast heuristic regex & mule blacklists
│   │   └── geminiEngine.js # Google Gemini context & vernacular engine
│   ├── config/
│   │   └── firebase.js     # Firestore client initialization
│   ├── controllers/
│   │   ├── checkController.js
│   │   ├── payController.js
│   │   └── statsController.js
│   └── data/
│       └── scamDatabase.json
├── client/                 # React + Vite PWA
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── src/
│       ├── App.jsx
│       ├── contexts/LanguageContext.jsx
│       ├── components/
│       │   ├── Header.jsx
│       │   ├── LanguageSwitcher.jsx
│       │   ├── RiskGauge.jsx
│       │   └── ScamChip.jsx
│       └── screens/
│           ├── CheckScreen.jsx
│           ├── ResultScreen.jsx
│           ├── PayScreen.jsx
│           └── DashboardScreen.jsx
└── public/                 # Static assets & PWA manifest
```

---

## 4. Phased Execution Roadmap with Time Budgets

| Phase | Time Window | Deliverable | Status |
| :--- | :--- | :--- | :--- |
| **Phase 1** | **08:30 AM – 10:30 AM** | Track Alignment, Pitch Strategy, Initial Working Prototype & First Eval Round | **COMPLETED & READY** |
| **Phase 2** | **10:30 AM – 01:00 PM** | Backend API endpoints (`/api/check`, `/api/pay`, `/api/stats`), Dual-Engine integration with Gemini API & Heuristic Fallbacks | Up Next |
| **Phase 3** | **01:00 PM – 03:30 PM** | React + Vite PWA 4-Screen Flow (Check, Result, Pay, Dashboard) with Hindi & Bengali switchers | Scheduled |
| **Phase 4** | **03:30 PM – 04:30 PM** | Firebase Firestore integration (logging checks, stats aggregation, live scam patterns) | Scheduled |
| **Phase 5** | **04:30 PM – 05:30 PM** | End-to-end testing, UI polish, screenshots, demo recording, and final submission | Scheduled |
