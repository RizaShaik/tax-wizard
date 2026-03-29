# 🧙‍♂️ Tax Wizard — Full-Stack AI Tax Assistant

A modern, full-stack MERN (MongoDB, Express, React, Node.js) Indian tax assistant application. Upload your **Form 16**, get instant Old vs. New regime comparison, and receive personalized AI-powered tax insights securely.

---

## ✨ Features

- **Multi-step Onboarding** — Enter income, deductions, and optionally upload Form 16.
- **Secure Authentication** — JWT-based authentication to securely save and access tax profiles.
- **Form 16 PDF Parsing** — 4-stage intelligent extraction pipeline:
  - 📄 **Text layer** — instant extraction for digital PDFs.
  - ⚡ **OCR** — Tesseract.js for scanned/image-based PDFs.
  - 🔍 **Smart heuristics** — keyword + size-based number classification.
  - 🤖 **Gemini Vision** — Advanced fallback processing for non-standard formats.
- **Tax Engine** — Deterministic Old Regime vs. New Regime (FY 2023-24) calculator with 87A rebate & surcharge.
- **Premium Dark UI** — Glassmorphism-inspired fintech-grade design with Framer Motion animations.
- **Interactive Dashboard** — Charts, regime comparison, missing deduction detectors, and savings breakdown.
- **AI Advisor Panel** — Server-side Gemini API proxy for real personalized tax insights.

---

## 🛠️ Tech Stack

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS (Premium Dark Theme) |
| Animations | Framer Motion |
| Charts | Recharts |
| PDF Parsing | pdfjs-dist & Tesseract.js |
| Routing | React Router v6 |

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB & Mongoose |
| Authentication| bcryptjs & JWT |
| AI Integration| @google/generative-ai Proxy |
| Utilities | dotenv, cors, multer |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm
- MongoDB URI
- Google Gemini API Key

### Installation

```bash
git clone https://github.com/RizaShaik/tax-wizard/tree/main
cd tax-wizard
npm install
cd server && npm install
```

### Environment Variables

1. Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:5000/api
```

2. Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

### Run Locally (Concurrent)

Start both the frontend and backend development servers with a single command from the root directory:

```bash
npm run dev:full
```

Alternatively, you can run them separately:
- Backend: `cd server && npm run dev` (Runs on port 5000)
- Frontend: `npm run dev` (Runs on port 5173)

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📂 Project Structure

```
tax_wizard/
├── server/              # Express Backend Node app
│   ├── models/          # Mongoose schemas (User, TaxData)
│   ├── routes/          # API endpoints (Auth, AI, Data)
│   ├── middleware/      # JWT verification, Error handling
│   ├── db.js            # MongoDB connection
│   └── index.js         # Entry point
├── src/                 # React Frontend
│   ├── components/
│   │   ├── layout/      # Navbar, Sidebar, Configured Layouts
│   │   ├── ui/          # Reusable components
│   │   ├── AIAdvisorPanel.tsx
│   │   └── ...
│   ├── pages/
│   │   ├── Landing.tsx
│   │   ├── Auth.tsx     # Login/Signup forms
│   │   ├── Dashboard.tsx
│   │   └── ...
│   ├── store/
│   │   └── TaxContext.tsx 
│   ├── lib/             # API helpers, auth state, Gemini services
│   ├── utils/           # Tax engine & form calculations
│   └── types.ts
├── package.json
└── vite.config.ts
```

---

## 🧮 Tax Calculation

Supports **FY 2023-24 / AY 2024-25** rules:

| | Old Regime | New Regime |
|---|---|---|
| Basic Exemption | ₹2.5L | ₹3L |
| 87A Rebate | Up to ₹12,500 (if taxable ≤ ₹5L) | Up to ₹25,000 (if taxable ≤ ₹7L) |
| Standard Deduction | ₹50,000 | ₹50,000 |
| 80C / 80D / HRA | ✅ Applicable | ❌ Not applicable |
| Health & Education Cess | 4% | 4% |

---

## 📄 Form 16 Upload

Tax Wizard accepts:
- **Digital PDFs** (text-layer) — fastest, most accurate
- **Scanned PDFs** (image-based) — OCR via Tesseract.js (~3–10s/page)
- **Advanced Processing** — Automated fallback using Gemini Vision

Extracted fields: Gross Salary, TDS Deducted, Section 80C, Section 80D, HRA Exemption.

> **Note:** Document processing is handled securely, relying on robust client-side heuristics and server-side AI evaluation to derive maximum tax savings.

---

## 📝 License

MIT — free to use for demos, hackathons, and learning.
