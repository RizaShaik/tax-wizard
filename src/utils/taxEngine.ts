/**
 * taxEngine.ts
 * Deterministic utility function for Indian Tax calculations.
 * Supports Old Regime and New Regime taxes.
 */

// --- DATA INTERFACES ---

export interface IncomeData {
    grossSalary: number;
    freelanceIncome: number;
}

export interface DeductionData {
    section80C: number;        // Max ₹1.5L
    section80D: number;        // Max ₹25K - ₹1L
    hraExemption: number;      // Calculated externally or user input
    standardDeduction: number; // Default ₹50,000 for salaried
}

export interface TaxResults {
    oldRegimeTax: number;
    newRegimeTax: number;
    taxSaved: number;
    recommendation: 'OLD_REGIME' | 'NEW_REGIME' | 'EQUAL';
}

// --- TAX BRACKETS (FY 2023-24 / AY 2024-25) ---

/**
 * Standard old regime brackets (Age < 60)
 */
const OLD_REGIME_BRACKETS = [
    { limit: 250000, rate: 0.00 },
    { limit: 500000, rate: 0.05 },
    { limit: 1000000, rate: 0.20 },
    { limit: Infinity, rate: 0.30 }
];

/**
 * Enhanced new regime brackets u/s 115BAC
 */
const NEW_REGIME_BRACKETS = [
    { limit: 300000, rate: 0.00 },
    { limit: 600000, rate: 0.05 },
    { limit: 900000, rate: 0.10 },
    { limit: 1200000, rate: 0.15 },
    { limit: 1500000, rate: 0.20 },
    { limit: Infinity, rate: 0.30 }
];

// --- CORE LOGIC ---

/**
 * Helper to calculate sum of tax based on progressive tax brackets.
 * @param taxableIncome The net income after deductions
 * @param brackets The relevant tax slabs
 * @returns Base tax amount
 */
function calculateTaxByBrackets(taxableIncome: number, brackets: { limit: number; rate: number }[]): number {
    let tax = 0;
    let remainingIncome = taxableIncome;
    let previousLimit = 0;

    for (const bracket of brackets) {
        if (remainingIncome <= 0) break;

        // Amount to tax in this specific slab
        const amountInBracket = Math.min(remainingIncome, bracket.limit - previousLimit);
        tax += amountInBracket * bracket.rate;

        // Move to next slab
        remainingIncome -= amountInBracket;
        previousLimit = bracket.limit;
    }

    return tax;
}

/**
 * The Deterministic Tax Engine.
 * Calculates taxes for both regimes, applies caps/rebates, and returns results.
 * 
 * @param incomeData User's gross income sources
 * @param deductionData User's potential deductions
 * @returns Comparative result object with a recommendation
 */
export function calculateTax(incomeData: IncomeData, deductionData: DeductionData): TaxResults {
    const totalIncome = (incomeData.grossSalary || 0) + (incomeData.freelanceIncome || 0);

    // 1. --- OLD REGIME CALCULATION ---
    // Cap Section 80C at ₹1,50,000 for realistic enforcement
    const capped80C = Math.min(deductionData.section80C || 0, 150000);

    const totalOldDeductions =
        capped80C +
        (deductionData.section80D || 0) +
        (deductionData.hraExemption || 0) +
        (deductionData.standardDeduction || 50000);

    const oldTaxableIncome = Math.max(0, totalIncome - totalOldDeductions);
    let oldTax = calculateTaxByBrackets(oldTaxableIncome, OLD_REGIME_BRACKETS);

    // Rebate u/s 87A for Old Regime: Up to 5L taxable income gets max ₹12,500 rebate
    if (oldTaxableIncome <= 500000) {
        oldTax = Math.max(0, oldTax - 12500);
    }

    // 4% Health & Education Cess
    oldTax += oldTax * 0.04;


    // 2. --- NEW REGIME CALCULATION ---
    // In the New Regime, only the Standard Deduction is allowed (for salaried). 
    // 80C, 80D, HRA etc. are forfeited.
    const newTaxableIncome = Math.max(0, totalIncome - (deductionData.standardDeduction || 50000));
    let newTax = calculateTaxByBrackets(newTaxableIncome, NEW_REGIME_BRACKETS);

    // Rebate u/s 87A for New Regime: Up to 7L taxable income gets max ₹25,000 rebate
    if (newTaxableIncome <= 700000) {
        newTax = Math.max(0, newTax - 25000);
    }

    // 4% Health & Education Cess
    newTax += newTax * 0.04;


    // 3. --- COMPARISONS & RESULTS ---
    let recommendation: 'OLD_REGIME' | 'NEW_REGIME' | 'EQUAL' = 'EQUAL';

    // A small tolerance to prefer New stringently if it's equal or better
    if (newTax < oldTax) {
        recommendation = 'NEW_REGIME';
    } else if (oldTax < newTax) {
        recommendation = 'OLD_REGIME';
    }

    const taxSaved = Math.abs(oldTax - newTax);

    return {
        oldRegimeTax: Math.round(oldTax),
        newRegimeTax: Math.round(newTax),
        taxSaved: Math.round(taxSaved),
        recommendation
    };
}
