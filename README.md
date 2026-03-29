# 🚕 TAXI — AI Tax Assistant

A modern, frontend-only Indian tax assistant prototype built with React + Vite. Upload your **Form 16**, get instant Old vs. New regime comparison, and receive AI-powered tax insights — all in the browser, no backend required.

---

## ✨ Features

- **Multi-step Onboarding** — Enter income, deductions, and optionally upload Form 16
- **Form 16 PDF Parsing** — 4-stage intelligent extraction pipeline:
  - 📄 **Text layer** — instant extraction for digital PDFs
  - ⚡ **OCR** — Tesseract.js for scanned/image-based PDFs
  - 🔍 **Smart heuristics** — keyword + size-based number classification for non-standard formats
  - 🔁 **Last-resort** — largest number extraction when all labels fail
- **Tax Engine** — Deterministic Old Regime vs. New Regime (FY 2023-24) calculator with 87A rebate & surcharge
- **Interactive Dashboard** — Charts, regime comparison, and savings breakdown
- **AI Advisor Panel** — Simulated personalized tax insights
- **Dark UI** — Fintech-grade design with Framer Motion animations

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Charts | Recharts |
| PDF Parsing | pdfjs-dist |
| OCR | Tesseract.js |
| Routing | React Router v6 |
| Icons | Lucide React |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/AMDCodeNCode/taxi-ai-taxbot.git
cd taxi-ai-taxbot
npm install
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

---

## 📂 Project Structure

```
src/
├── components/
│   ├── layout/         # Navbar, Sidebar, DashboardLayout
│   ├── ui/             # Button, Card, Input
│   ├── AIAdvisorPanel.tsx
│   ├── Dashboard.tsx
│   └── OnboardingStepper.tsx
├── pages/
│   ├── Landing.tsx
│   ├── Auth.tsx
│   ├── Ingest.tsx
│   ├── Dashboard.tsx
│   └── Settings.tsx
├── store/
│   └── TaxContext.tsx   # Global state with useReducer
├── utils/
│   ├── taxEngine.ts     # Deterministic tax calculator
│   └── form16Parser.ts  # 4-stage Form 16 PDF parser
├── lib/
│   ├── mockData.ts
│   └── utils.ts
└── types.ts
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

TAXI accepts:
- **Digital PDFs** (text-layer) — fastest, most accurate
- **Scanned PDFs** (image-based) — OCR via Tesseract.js (~3–10s/page)
- **JPG / PNG** — direct OCR

Extracted fields: Gross Salary, TDS Deducted, Section 80C, Section 80D, HRA Exemption.

> **Note:** This is a prototype. Form 16 parsing is heuristic-based and works best with standard employer-generated PDFs. No data is sent to any server — all processing is client-side.

---

## 📝 License

MIT — free to use for demos, hackathons, and learning.
