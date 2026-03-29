/**
 * api.ts — centralized fetch wrapper for the Tax Wizard backend API.
 * All requests automatically attach the JWT from localStorage.
 */

const BASE_URL = (import.meta as any).env?.VITE_API_URL ?? '';

function getToken(): string | null {
    return localStorage.getItem('tw_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = getToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || `Request failed: ${res.status}`);
    }
    return data as T;
}

// ── Auth ────────────────────────────────────────────────────────────────────

export interface AuthUser {
    _id: string;
    name: string;
    email: string;
    age: number;
}

export interface AuthResponse {
    token: string;
    user: AuthUser;
}

export function signup(name: string, email: string, password: string): Promise<AuthResponse> {
    return request<AuthResponse>('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
    });
}

export function login(email: string, password: string): Promise<AuthResponse> {
    return request<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
}

export function getMe(): Promise<{ user: AuthUser }> {
    return request<{ user: AuthUser }>('/api/auth/me');
}

export function updateMe(data: Partial<AuthUser>): Promise<{ user: AuthUser }> {
    return request<{ user: AuthUser }>('/api/auth/me', {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export function deleteAccount(): Promise<{ message: string }> {
    return request<{ message: string }>('/api/auth/me', { method: 'DELETE' });
}

// ── Tax ─────────────────────────────────────────────────────────────────────

export interface TaxResults {
    oldRegimeTax: number;
    newRegimeTax: number;
    taxSaved: number;
    recommendation: 'OLD_REGIME' | 'NEW_REGIME' | 'EQUAL';
}

export interface TaxRecord {
    _id: string;
    income: { grossSalary: number; freelanceIncome: number };
    deductions: { section80C: number; section80D: number; hraExemption: number; standardDeduction: number };
    results: TaxResults;
    form16Meta: { loaded: boolean; tdsDeducted: number };
    aiInsights: Array<{ title: string; body: string; color: string }>;
    updatedAt: string;
}

export function calculateTax(
    income: object,
    deductions: object,
    form16Meta?: object
): Promise<{ results: TaxResults; recordId: string }> {
    return request('/api/tax/calculate', {
        method: 'POST',
        body: JSON.stringify({ income, deductions, form16Meta }),
    });
}

export function getLatestTaxRecord(): Promise<{ record: TaxRecord | null }> {
    return request('/api/tax/latest');
}

export function getTaxHistory(): Promise<{ records: TaxRecord[] }> {
    return request('/api/tax/history');
}

export function saveInsights(
    insights: Array<{ title: string; body: string; color: string }>
): Promise<{ record: TaxRecord }> {
    return request('/api/tax/insights', {
        method: 'PATCH',
        body: JSON.stringify({ insights }),
    });
}

// ── AI ──────────────────────────────────────────────────────────────────────

export interface AIInsight {
    title: string;
    body: string;
    color: 'indigo' | 'emerald' | 'purple' | 'amber' | 'blue' | 'red';
}

export function getAIInsights(taxState: object): Promise<{ insights: AIInsight[] | null }> {
    return request('/api/ai/insights', {
        method: 'POST',
        body: JSON.stringify(taxState),
    });
}

export async function uploadForm16(file: File): Promise<{
    grossSalary: number;
    tdsDeducted: number;
    section80C: number;
    section80D: number;
    hraExemption: number;
    parseSuccess: boolean;
    method: string;
}> {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${BASE_URL}/api/ai/parse-form16`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Form 16 upload failed');
    return data;
}

// ── Health check ────────────────────────────────────────────────────────────

export function checkHealth(): Promise<{ status: string }> {
    return request('/api/health');
}
