/**
 * form16Parser.ts
 * Robust Form 16 PDF/image parser — 5-stage pipeline.
 *
 * Stage 0: Gemini Vision (instant, most accurate — needs API key)
 * Stage 1: pdfjs text layer (digital PDFs, fast)
 * Stage 2: Tesseract.js OCR (scanned/image PDFs, JPG, PNG)
 * Stage 3: Strict Form 16 label regex
 * Stage 4: Heuristic keyword + size classifier
 * Stage 5: Last-resort largest-number grab
 */

import * as pdfjsLib from 'pdfjs-dist';
import { createWorker } from 'tesseract.js';
import { parseForm16WithVision } from '../lib/geminiService';

// Local bundled worker — no CDN dependency
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).toString();

const TEXT_LAYER_MIN_CHARS = 100;

// ── Output types ───────────────────────────────────────────────────────────

export interface Form16Data {
    grossSalary: number;
    tdsDeducted: number;
    section80C: number;
    section80D: number;
    hraExemption: number;
    parseSuccess: boolean;
    method: 'text' | 'ocr' | 'heuristic' | 'vision' | 'none';
}

export interface ParseProgress {
    stage: 'reading' | 'ocr' | 'vision' | 'done';
    page?: number;
    totalPages?: number;
}

// ── OCR helpers ────────────────────────────────────────────────────────────

async function ocrCanvas(canvas: HTMLCanvasElement): Promise<string> {
    const worker = await createWorker('eng', 1, { logger: () => { } });
    const { data: { text } } = await worker.recognize(canvas);
    await worker.terminate();
    return text;
}

async function ocrImageFile(file: File): Promise<string> {
    const worker = await createWorker('eng', 1, { logger: () => { } });
    const { data: { text } } = await worker.recognize(file);
    await worker.terminate();
    return text;
}

// ── PDF helpers ────────────────────────────────────────────────────────────

async function extractTextLayerFromPDF(pdf: pdfjsLib.PDFDocumentProxy): Promise<string> {
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
            .map((item: unknown) => {
                if (typeof item === 'object' && item !== null && 'str' in item) {
                    return (item as { str: string }).str;
                }
                return '';
            })
            .join(' ');
        fullText += pageText + '\n';
    }
    return fullText;
}

async function renderPageToCanvas(page: pdfjsLib.PDFPageProxy): Promise<HTMLCanvasElement> {
    const scale = 2.0;
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;
    await page.render({ canvas, canvasContext: ctx, viewport }).promise;
    return canvas;
}

async function ocrPDFPages(
    pdf: pdfjsLib.PDFDocumentProxy,
    onProgress?: (page: number, total: number) => void
): Promise<string> {
    let combined = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        onProgress?.(i, pdf.numPages);
        const page = await pdf.getPage(i);
        const canvas = await renderPageToCanvas(page);
        combined += (await ocrCanvas(canvas)) + '\n';
    }
    return combined;
}

/** Convert an image File to a canvas element for Vision processing */
async function fileToCanvas(file: File): Promise<HTMLCanvasElement | null> {
    return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            canvas.getContext('2d')!.drawImage(img, 0, 0);
            URL.revokeObjectURL(url);
            resolve(canvas);
        };
        img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
        img.src = url;
    });
}

// ── Stage 3: Strict regex extraction ──────────────────────────────────────

function extractAmount(text: string, patterns: RegExp[]): number {
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            const value = parseFloat(match[1].replace(/,/g, '').trim());
            if (!isNaN(value) && value > 0) return value;
        }
    }
    return 0;
}

function strictExtract(rawText: string) {
    const n = rawText.replace(/\s+/g, ' ').toUpperCase();
    return {
        grossSalary: extractAmount(n, [
            /GROSS\s+SALARY[^0-9]{0,80}([\d,]{4,12})/i,
            /TOTAL\s+GROSS\s+SALARY[^0-9]{0,80}([\d,]{4,12})/i,
            /SALARY\s+AS\s+PER\s+PROVISIONS[^0-9]{0,80}([\d,]{4,12})/i,
            /SALARY\s+INCOME[^0-9]{0,80}([\d,]{4,12})/i,
            /INCOME\s+FROM\s+SALARY[^0-9]{0,80}([\d,]{4,12})/i,
        ]),
        tdsDeducted: extractAmount(n, [
            /TAX\s+DEDUCTED\s+AT\s+SOURCE[^0-9]{0,80}([\d,]{3,12})/i,
            /TDS\s+DEDUCTED[^0-9]{0,80}([\d,]{3,12})/i,
            /TOTAL\s+TAX\s+DEDUCTED[^0-9]{0,80}([\d,]{3,12})/i,
            /AMOUNT\s+OF\s+TAX\s+DEDUCTED[^0-9]{0,80}([\d,]{3,12})/i,
            /TAX\s+DEPOSITED[^0-9]{0,80}([\d,]{3,12})/i,
            /TOTAL\s+TDS[^0-9]{0,80}([\d,]{3,12})/i,
        ]),
        section80C: extractAmount(n, [
            /80\s*C[^0-9]{0,60}([\d,]{3,10})/i,
            /SECTION\s+80\s*C[^0-9]{0,60}([\d,]{3,10})/i,
            /CHAPTER\s+VI-?A[^0-9]{0,120}([\d,]{3,10})/i,
            /DEDUCTION\s+U\/S\s+80C[^0-9]{0,60}([\d,]{3,10})/i,
        ]),
        section80D: extractAmount(n, [
            /80\s*D[^0-9]{0,60}([\d,]{3,10})/i,
            /HEALTH\s+INSURANCE[^0-9]{0,60}([\d,]{3,10})/i,
            /MEDICLAIM[^0-9]{0,60}([\d,]{3,10})/i,
        ]),
        hraExemption: extractAmount(n, [
            /HRA\s+EXEMPT[^0-9]{0,80}([\d,]{3,10})/i,
            /HOUSE\s+RENT\s+ALLOW[^0-9]{0,80}([\d,]{3,10})/i,
            /EXEMPTION\s+U\/S\s+10\s*\(13A\)[^0-9]{0,80}([\d,]{3,10})/i,
            /10\s*\(13A\)[^0-9]{0,60}([\d,]{3,10})/i,
        ]),
    };
}

// ── Stage 4: Heuristic extraction ─────────────────────────────────────────

const SALARY_MIN = 100_000;
const SALARY_MAX = 50_000_000;
const DEDUCTION_MAX = 500_000;

interface ParsedNumber { value: number; position: number; context: string; }

function extractAllNumbers(text: string): ParsedNumber[] {
    const normalized = text.replace(/\s+/g, ' ');
    const pattern = /[\d]{1,3}(?:,\d{2,3})+|\d{5,}/g;
    const results: ParsedNumber[] = [];
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(normalized)) !== null) {
        const value = parseFloat(match[0].replace(/,/g, ''));
        if (isNaN(value) || value <= 0) continue;
        const start = Math.max(0, match.index - 80);
        const end = Math.min(normalized.length, match.index + match[0].length + 80);
        results.push({ value, position: match.index, context: normalized.slice(start, end).toUpperCase() });
    }
    return results;
}

function contextHasKeyword(ctx: string, keywords: string[]): boolean {
    return keywords.some(k => ctx.includes(k));
}

function heuristicExtract(rawText: string): Omit<Form16Data, 'parseSuccess' | 'method'> | null {
    const numbers = extractAllNumbers(rawText);
    if (numbers.length === 0) return null;

    const salaryKeywords = ['SALARY', 'INCOME', 'GROSS', 'ANNUAL', 'EARNING', 'CTC'];
    const salaryNumbers = numbers.filter(n => n.value >= SALARY_MIN && n.value <= SALARY_MAX);
    const nearSalary = salaryNumbers.filter(n => contextHasKeyword(n.context, salaryKeywords));
    const grossSalaryCandidate = (nearSalary.length > 0 ? nearSalary : salaryNumbers).sort((a, b) => b.value - a.value)[0];
    const grossSalary = grossSalaryCandidate?.value ?? 0;

    const tdsKeywords = ['TAX', 'TDS', 'DEDUCT', 'PAID', 'DEPOSIT'];
    const tdsMin = grossSalary > 0 ? grossSalary * 0.03 : 1000;
    const tdsMax = grossSalary > 0 ? Math.min(grossSalary * 0.40, SALARY_MAX) : SALARY_MAX;
    const tdsDeducted = numbers
        .filter(n => n.value >= tdsMin && n.value <= tdsMax && n.value !== grossSalary && contextHasKeyword(n.context, tdsKeywords))
        .sort((a, b) => b.value - a.value)[0]?.value ?? 0;

    const section80C = Math.min(
        numbers.filter(n => n.value > 1000 && n.value <= 150_000 && contextHasKeyword(n.context, ['80C', '80 C', 'PPF', 'ELSS', 'EPF', 'LIC', 'INVEST', 'VI-A']))
            .sort((a, b) => b.value - a.value)[0]?.value ?? 0,
        150_000
    );

    const section80D = numbers
        .filter(n => n.value > 500 && n.value <= DEDUCTION_MAX && contextHasKeyword(n.context, ['80D', '80 D', 'HEALTH', 'MEDICLAIM', 'INSURANCE']))
        .sort((a, b) => b.value - a.value)[0]?.value ?? 0;

    const hraExemption = numbers
        .filter(n => n.value > 1000 && n.value < (grossSalary * 0.6 || DEDUCTION_MAX) && contextHasKeyword(n.context, ['HRA', 'HOUSE RENT', 'RENT', '10(13', '13A']))
        .sort((a, b) => b.value - a.value)[0]?.value ?? 0;

    return grossSalary > 0 || tdsDeducted > 0
        ? { grossSalary, tdsDeducted, section80C, section80D, hraExemption }
        : null;
}

// ── Shared text→result runner (Stages 3-5) ──────────────────────────────

function extractFromText(rawText: string, method: 'text' | 'ocr'): Form16Data | null {
    console.debug('[Form16Parser] Extracting (%s, %d chars):\n%s', method, rawText.length, rawText.slice(0, 1500));

    const strict = strictExtract(rawText);
    if (strict.grossSalary > 0 || strict.tdsDeducted > 0) {
        console.debug('[Form16Parser] Strict regex succeeded:', strict);
        return { ...strict, parseSuccess: true, method };
    }

    const heuristic = heuristicExtract(rawText);
    if (heuristic) {
        console.debug('[Form16Parser] Heuristic succeeded:', heuristic);
        return { ...heuristic, parseSuccess: true, method: 'heuristic' };
    }

    // Last-resort: just take the biggest numbers by size
    const allNums = extractAllNumbers(rawText)
        .filter(n => n.value >= 10_000 && n.value <= SALARY_MAX)
        .sort((a, b) => b.value - a.value);

    if (allNums.length > 0) {
        const grossSalary = allNums[0].value;
        const tdsCandidate = allNums.find(n =>
            n.value !== grossSalary && n.value >= grossSalary * 0.03 && n.value <= grossSalary * 0.40
        );
        if (grossSalary > 0) {
            console.debug('[Form16Parser] Last-resort grossSalary:', grossSalary);
            return { grossSalary, tdsDeducted: tdsCandidate?.value ?? 0, section80C: 0, section80D: 0, hraExemption: 0, parseSuccess: true, method: 'heuristic' };
        }
    }

    return null;
}

// ── MAIN EXPORT ────────────────────────────────────────────────────────────

export async function parseForm16(
    file: File,
    onProgress?: (p: ParseProgress) => void
): Promise<Form16Data> {
    try {
        const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        const isImage = /\.(jpe?g|png)$/i.test(file.name) || file.type.startsWith('image/');

        if (isPDF) {
            onProgress?.({ stage: 'reading' });
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

            // Stage 0: Gemini Vision
            onProgress?.({ stage: 'vision' });
            try {
                const firstPage = await pdf.getPage(1);
                const visionCanvas = await renderPageToCanvas(firstPage);
                const v = await parseForm16WithVision(visionCanvas);
                if (v && (v.grossSalary > 0 || v.tdsDeducted > 0)) {
                    console.debug('[Form16Parser] Gemini Vision (PDF) succeeded:', v);
                    onProgress?.({ stage: 'done' });
                    return { grossSalary: v.grossSalary, tdsDeducted: v.tdsDeducted, section80C: v.section80C, section80D: v.section80D, hraExemption: v.hraExemption, parseSuccess: true, method: 'vision' };
                }
            } catch { /* no API key or Gemini failed — continue */ }

            // Stage 1: pdfjs text layer
            let rawText = await extractTextLayerFromPDF(pdf);
            let textMethod: 'text' | 'ocr' = 'text';

            // Stage 2: OCR if sparse
            if (rawText.trim().length < TEXT_LAYER_MIN_CHARS) {
                rawText = await ocrPDFPages(pdf, (page, total) => {
                    onProgress?.({ stage: 'ocr', page, totalPages: total });
                });
                textMethod = 'ocr';
            }
            onProgress?.({ stage: 'done' });
            return extractFromText(rawText, textMethod) ?? emptyResult();

        } else if (isImage) {
            // Stage 0: Gemini Vision on image
            onProgress?.({ stage: 'vision' });
            try {
                const imgCanvas = await fileToCanvas(file);
                if (imgCanvas) {
                    const v = await parseForm16WithVision(imgCanvas);
                    if (v && (v.grossSalary > 0 || v.tdsDeducted > 0)) {
                        console.debug('[Form16Parser] Gemini Vision (image) succeeded:', v);
                        onProgress?.({ stage: 'done' });
                        return { grossSalary: v.grossSalary, tdsDeducted: v.tdsDeducted, section80C: v.section80C, section80D: v.section80D, hraExemption: v.hraExemption, parseSuccess: true, method: 'vision' };
                    }
                }
            } catch { /* no API key or Gemini failed — continue */ }

            // Stage 2: Tesseract OCR
            onProgress?.({ stage: 'ocr', page: 1, totalPages: 1 });
            const ocrText = await ocrImageFile(file);
            onProgress?.({ stage: 'done' });
            return extractFromText(ocrText, 'ocr') ?? emptyResult();

        } else {
            return emptyResult();
        }

    } catch (err) {
        console.error('[Form16Parser] Fatal error:', err);
        return emptyResult();
    }
}

function emptyResult(): Form16Data {
    return { grossSalary: 0, tdsDeducted: 0, section80C: 0, section80D: 0, hraExemption: 0, parseSuccess: false, method: 'none' };
}
