/**
 * Tax Routes — /api/tax
 */
const express = require('express');
const authMiddleware = require('../middleware/auth');
const { getTaxRecord } = require('../db');

const router = express.Router();
router.use(authMiddleware);

// ── Tax engine ──────────────────────────────────────────────────────────────

const OLD_BRACKETS = [
    { limit: 250000, rate: 0.00 }, { limit: 500000, rate: 0.05 },
    { limit: 1000000, rate: 0.20 }, { limit: Infinity, rate: 0.30 },
];
const NEW_BRACKETS = [
    { limit: 300000, rate: 0.00 }, { limit: 600000, rate: 0.05 },
    { limit: 900000, rate: 0.10 }, { limit: 1200000, rate: 0.15 },
    { limit: 1500000, rate: 0.20 }, { limit: Infinity, rate: 0.30 },
];

function calcByBrackets(income, brackets) {
    let tax = 0, remaining = income, prev = 0;
    for (const b of brackets) {
        if (remaining <= 0) break;
        const amt = Math.min(remaining, b.limit - prev);
        tax += amt * b.rate;
        remaining -= amt;
        prev = b.limit;
    }
    return tax;
}

function calculateTax(income, deductions) {
    const total = (income.grossSalary || 0) + (income.freelanceIncome || 0);
    const std = deductions.standardDeduction || 50000;
    const c80c = Math.min(deductions.section80C || 0, 150000);

    const oldTaxable = Math.max(0, total - c80c - (deductions.section80D || 0) - (deductions.hraExemption || 0) - std);
    let oldTax = calcByBrackets(oldTaxable, OLD_BRACKETS);
    if (oldTaxable <= 500000) oldTax = Math.max(0, oldTax - 12500);
    oldTax = Math.round(oldTax + oldTax * 0.04);

    const newTaxable = Math.max(0, total - std);
    let newTax = calcByBrackets(newTaxable, NEW_BRACKETS);
    if (newTaxable <= 700000) newTax = Math.max(0, newTax - 25000);
    newTax = Math.round(newTax + newTax * 0.04);

    const recommendation = newTax < oldTax ? 'NEW_REGIME' : oldTax < newTax ? 'OLD_REGIME' : 'EQUAL';
    return { oldRegimeTax: oldTax, newRegimeTax: newTax, taxSaved: Math.abs(oldTax - newTax), recommendation };
}

// ── Routes ─────────────────────────────────────────────────────────────────

// POST /api/tax/calculate
router.post('/calculate', async (req, res) => {
    try {
        const { income, deductions, form16Meta } = req.body;
        if (!income) return res.status(400).json({ error: 'Income data is required' });

        const results = calculateTax(income, deductions || {});
        const TaxRecord = getTaxRecord();

        const record = await TaxRecord.findOneAndUpdate(
            { userId: req.user.id },
            { income, deductions: deductions || {}, results, form16Meta: form16Meta || {} },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.json({ results, recordId: record._id });
    } catch (err) {
        console.error('[Tax] Calculate error:', err);
        res.status(500).json({ error: 'Server error during calculation' });
    }
});

// GET /api/tax/latest
router.get('/latest', async (req, res) => {
    try {
        const TaxRecord = getTaxRecord();
        const record = await TaxRecord.findOne({ userId: req.user.id }).sort({ updatedAt: -1 });
        res.json({ record: record || null });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/tax/history
router.get('/history', async (req, res) => {
    try {
        const TaxRecord = getTaxRecord();
        const records = await TaxRecord.find({ userId: req.user.id }).sort({ updatedAt: -1 }).limit(20);
        res.json({ records });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// PATCH /api/tax/insights
router.patch('/insights', async (req, res) => {
    try {
        const { insights } = req.body;
        if (!Array.isArray(insights)) return res.status(400).json({ error: 'insights must be an array' });

        const TaxRecord = getTaxRecord();
        const record = await TaxRecord.findOneAndUpdate(
            { userId: req.user.id },
            { aiInsights: insights },
            { new: true }
        );
        res.json({ record });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
