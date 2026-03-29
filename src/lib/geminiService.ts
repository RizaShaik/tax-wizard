/**
 * geminiService.ts
 * Now proxies ALL Gemini calls through the backend API.
 * The Gemini API key lives exclusively in server/.env — never in the browser.
 *
 * getAIAdvisorInsights() → POST /api/ai/insights
 * uploadForm16ForVision() → POST /api/ai/parse-form16
 *
 * Legacy client-side key management kept as no-ops for backward compatibility.
 */

import { TaxState } from '../store/TaxContext';
import * as api from './api';

// ── Legacy no-ops (API key now lives server-side) ──────────────────────────

/** @deprecated Key is now set in server/.env. This is a no-op. */
export function getApiKey(): string { return ''; }

/** @deprecated Key is now set in server/.env. This is a no-op. */
export function saveApiKey(_key: string): void {
    console.warn('[geminiService] saveApiKey is deprecated. Set GEMINI_API_KEY in server/.env');
}

// ── Types ──────────────────────────────────────────────────────────────────

export interface VisionParsedFields {
    grossSalary: number;
    tdsDeducted: number;
    section80C: number;
    section80D: number;
    hraExemption: number;
}

export interface AIInsight {
    title: string;
    body: string;
    color: 'indigo' | 'emerald' | 'purple' | 'amber' | 'blue' | 'red';
}

// ── 1. AI Advisor insights (proxied through backend) ──────────────────────

/**
 * Calls /api/ai/insights with the full tax profile.
 * The server calls Gemini and returns structured insight objects.
 * Returns null if no Gemini key is configured on the server.
 */
export async function getAIAdvisorInsights(state: TaxState): Promise<AIInsight[] | null> {
    const totalIncome = (state.income.grossSalary || 0) + (state.income.freelanceIncome || 0);
    if (!totalIncome) return null;

    try {
        const { insights } = await api.getAIInsights(state);
        return insights as AIInsight[] | null;
    } catch (err) {
        console.error('[geminiService] Advisor insights failed:', err);
        return null;
    }
}

// ── 2. Form 16 Vision Parsing (proxied through backend) ──────────────────

/**
 * Uploads a File to /api/ai/parse-form16.
 * The server renders/sends to Gemini Vision and returns parsed fields.
 */
export async function parseForm16FileWithVision(file: File): Promise<VisionParsedFields | null> {
    try {
        const result = await api.uploadForm16(file);
        if (!result.parseSuccess) return null;
        return {
            grossSalary: result.grossSalary,
            tdsDeducted: result.tdsDeducted,
            section80C: result.section80C,
            section80D: result.section80D,
            hraExemption: result.hraExemption,
        };
    } catch (err) {
        console.error('[geminiService] Form16 vision parse failed:', err);
        return null;
    }
}

/**
 * @deprecated Use parseForm16FileWithVision(file) instead.
 * Canvas-based Vision is now handled server-side.
 */
export async function parseForm16WithVision(
    _canvas: HTMLCanvasElement
): Promise<VisionParsedFields | null> {
    console.warn('[geminiService] parseForm16WithVision(canvas) is deprecated. Use parseForm16FileWithVision(file).');
    return null;
}
