import { TaxCalculation } from '../types';

export const mockTaxData: TaxCalculation = {
    oldRegime: {
        totalIncome: 1850000,
        totalDeductions: 350000,
        taxableIncome: 1500000,
        taxAmount: 262500,
        cess: 10500,
        totalTax: 273000,
    },
    newRegime: {
        totalIncome: 1850000,
        totalDeductions: 50000, // Standard deduction
        taxableIncome: 1800000,
        taxAmount: 240000,
        cess: 9600,
        totalTax: 249600,
    },
    recommendedRegime: 'new',
    savings: 23400,
};

export const aiInsights = [
    "Tax Wizard is analyzing your income and deductions...",
    "Running simulations across both tax regimes...",
    `Based on your data, switching to the New Regime saves you ₹23,400.`,
    "You are claiming significant 80C deductions, but the revised slabs in the New Regime offer a better net outcome for your ₹18.5L bracket.",
    "Tip: Ensure you declare your ₹50k standard deduction, which is now available in the New Regime as well!"
];
