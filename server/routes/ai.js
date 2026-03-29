/**
 * AI Routes — /api/ai
 * Proxies Gemini calls server-side so the API key never reaches the browser.
 */
const express = require('express');
const multer = require('multer');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// Multer: store files in memory for passing to Gemini
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

function getGeminiClient() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return null;
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    return new GoogleGenerativeAI(key);
}

const INR = (v) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

// POST /api/ai/insights — generate tax advisor insights
router.post('/insights', async (req, res) => {
    try {
        const client = getGeminiClient();
        if (!client) {
            return res.status(503).json({ error: 'Gemini API key not configured on server', insights: null });
        }

        const { userDetails, income, deductions, results, form16Meta } = req.body;
        const totalIncome = (income?.grossSalary || 0) + (income?.freelanceIncome || 0);
        if (!totalIncome) return res.json({ insights: null });

        const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const prompt = `
You are an expert Indian tax advisor for FY 2023-24. Analyze this taxpayer's profile and return ONLY a valid JSON array of insights. No markdown, no explanation — pure JSON only.

TAXPAYER PROFILE:
- Name: ${userDetails?.name || 'Taxpayer'}
- Gross Salary: ${INR(income?.grossSalary || 0)}
- Freelance/Other Income: ${INR(income?.freelanceIncome || 0)}
- Total Income: ${INR(totalIncome)}
- Section 80C Investments: ${INR(deductions?.section80C || 0)} (max ₹1,50,000)
- Section 80D Health Insurance: ${INR(deductions?.section80D || 0)}
- HRA Exemption Claimed: ${INR(deductions?.hraExemption || 0)}
- Standard Deduction: ₹50,000 (auto-applied)
- Form 16 Uploaded: ${form16Meta?.loaded ? 'Yes' : 'No'}
- TDS Already Deducted: ${form16Meta?.loaded ? INR(form16Meta?.tdsDeducted || 0) : 'Unknown'}

TAX RESULTS:
- Old Regime Tax: ${INR(results?.oldRegimeTax || 0)}
- New Regime Tax: ${INR(results?.newRegimeTax || 0)}
- Recommended Regime: ${results?.recommendation || 'EQUAL'}
- Tax Saved by choosing recommended: ${INR(results?.taxSaved || 0)}

Return a JSON array of 4-6 insight objects. Each must have:
- "title": short heading (max 5 words)
- "body": 2-3 sentence actionable advice specific to this taxpayer's numbers
- "color": one of "indigo", "emerald", "purple", "amber", "blue", "red"

Example: [{"title":"Switch Regime","body":"Your deductions are low...","color":"indigo"}]

Be specific with actual numbers. Give concrete, actionable Indian tax advice.
`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim().replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim();
        const insights = JSON.parse(text);

        if (!Array.isArray(insights)) return res.json({ insights: null });
        res.json({ insights: insights.filter(i => i.title && i.body && i.color) });
    } catch (err) {
        console.error('[AI] Insights error:', err);
        res.status(500).json({ error: 'Failed to generate insights', insights: null });
    }
});

// POST /api/ai/parse-form16 — upload file, parse with Gemini Vision
router.post('/parse-form16', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const client = getGeminiClient();
        if (!client) {
            return res.status(503).json({ error: 'Gemini API key not configured on server' });
        }

        const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const prompt = `This is a page from an Indian Form 16 (Tax Deduction Certificate). Extract the following fields and return ONLY valid JSON — no markdown, no explanation.

Fields to extract (use 0 if not found):
- grossSalary: Annual gross salary/income from salary (number)
- tdsDeducted: Total tax deducted at source / TDS amount (number)
- section80C: Total deductions under Section 80C (number, max 150000)
- section80D: Deductions under Section 80D health insurance (number)
- hraExemption: House Rent Allowance exemption amount (number)

Return exactly: {"grossSalary":0,"tdsDeducted":0,"section80C":0,"section80D":0,"hraExemption":0}
All values must be plain numbers (no commas, no currency symbols).`;

        const filePart = {
            inlineData: {
                mimeType: req.file.mimetype,
                data: req.file.buffer.toString('base64'),
            },
        };

        const result = await model.generateContent([prompt, filePart]);
        const text = result.response.text().trim().replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim();
        const parsed = JSON.parse(text);

        res.json({
            grossSalary: Number(parsed.grossSalary) || 0,
            tdsDeducted: Number(parsed.tdsDeducted) || 0,
            section80C: Math.min(Number(parsed.section80C) || 0, 150000),
            section80D: Number(parsed.section80D) || 0,
            hraExemption: Number(parsed.hraExemption) || 0,
            method: 'vision',
            parseSuccess: true,
        });
    } catch (err) {
        console.error('[AI] Form16 parse error:', err);
        res.status(500).json({ error: 'Failed to parse Form 16' });
    }
});

module.exports = router;
