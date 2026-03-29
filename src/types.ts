export interface UserFlowData {
    income: {
        salary: number;
        freelance: number;
        other: number;
    };
    deductions: {
        section80c: number;
        hra: number;
        healthInsurance: number;
    };
}

export interface TaxCalculation {
    oldRegime: {
        totalIncome: number;
        totalDeductions: number;
        taxableIncome: number;
        taxAmount: number;
        cess: number;
        totalTax: number;
    };
    newRegime: {
        totalIncome: number;
        totalDeductions: number;
        taxableIncome: number;
        taxAmount: number;
        cess: number;
        totalTax: number;
    };
    recommendedRegime: 'old' | 'new';
    savings: number;
}

/** Metadata about whether a Form 16 was parsed and what TDS was deducted */
export interface Form16Meta {
    loaded: boolean;
    tdsDeducted: number;
}
