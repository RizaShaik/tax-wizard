/**
 * TaxContext.tsx
 * Global State Provider — now persists data to the backend via api.ts
 */
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import {
    calculateTax as calcLocal,
    IncomeData,
    DeductionData,
    TaxResults,
} from '../utils/taxEngine';
import { Form16Data } from '../utils/form16Parser';
import * as api from '../lib/api';

// --- STATE MODELS ---

export interface UserDetails {
    name: string;
    email: string;
    age: number;
}

export interface Form16Meta {
    loaded: boolean;
    tdsDeducted: number;
}

export interface TaxState {
    userDetails: UserDetails;
    income: IncomeData;
    deductions: DeductionData;
    results: TaxResults;
    form16Meta: Form16Meta;
    isSyncing: boolean;       // true while backend call is in flight
    lastSyncedAt: string | null;
}

const initialState: TaxState = {
    userDetails: { name: '', email: '', age: 30 },
    income: { grossSalary: 0, freelanceIncome: 0 },
    deductions: {
        section80C: 0,
        section80D: 0,
        hraExemption: 0,
        standardDeduction: 50000,
    },
    results: { oldRegimeTax: 0, newRegimeTax: 0, taxSaved: 0, recommendation: 'EQUAL' },
    form16Meta: { loaded: false, tdsDeducted: 0 },
    isSyncing: false,
    lastSyncedAt: null,
};

// --- ACTION TYPES ---

type TaxAction =
    | { type: 'UPDATE_USER_DETAILS'; payload: Partial<UserDetails> }
    | { type: 'UPDATE_INCOME'; payload: Partial<IncomeData> }
    | { type: 'UPDATE_DEDUCTIONS'; payload: Partial<DeductionData> }
    | { type: 'CALCULATE_TAX' }
    | { type: 'RESET_STATE' }
    | { type: 'LOAD_FROM_FORM16'; payload: Form16Data }
    | { type: 'LOAD_FROM_SERVER'; payload: Partial<TaxState> }
    | { type: 'SET_SYNCING'; payload: boolean }
    | { type: 'SET_SYNCED_AT'; payload: string };

// --- REDUCER ---

function taxReducer(state: TaxState, action: TaxAction): TaxState {
    let newState = state;

    switch (action.type) {
        case 'UPDATE_USER_DETAILS':
            newState = { ...state, userDetails: { ...state.userDetails, ...action.payload } };
            break;

        case 'UPDATE_INCOME':
            newState = { ...state, income: { ...state.income, ...action.payload } };
            break;

        case 'UPDATE_DEDUCTIONS':
            newState = { ...state, deductions: { ...state.deductions, ...action.payload } };
            break;

        case 'CALCULATE_TAX':
            newState = { ...state };
            break;

        case 'RESET_STATE':
            return initialState;

        case 'LOAD_FROM_FORM16': {
            const f = action.payload;
            newState = {
                ...state,
                income: { ...state.income, ...(f.grossSalary > 0 ? { grossSalary: f.grossSalary } : {}) },
                deductions: {
                    ...state.deductions,
                    ...(f.section80C > 0 ? { section80C: f.section80C } : {}),
                    ...(f.section80D > 0 ? { section80D: f.section80D } : {}),
                    ...(f.hraExemption > 0 ? { hraExemption: f.hraExemption } : {}),
                },
                form16Meta: { loaded: true, tdsDeducted: f.tdsDeducted },
            };
            newState.results = calcLocal(newState.income, newState.deductions);
            return newState;
        }

        case 'LOAD_FROM_SERVER':
            return { ...state, ...action.payload };

        case 'SET_SYNCING':
            return { ...state, isSyncing: action.payload };

        case 'SET_SYNCED_AT':
            return { ...state, lastSyncedAt: action.payload, isSyncing: false };

        default:
            return state;
    }

    // Auto-recalculate when income/deductions change
    if (
        action.type === 'UPDATE_INCOME' ||
        action.type === 'UPDATE_DEDUCTIONS' ||
        action.type === 'CALCULATE_TAX'
    ) {
        newState.results = calcLocal(newState.income, newState.deductions);
    }

    return newState;
}

// --- CONTEXT & PROVIDER ---

interface TaxContextProps {
    state: TaxState;
    dispatch: React.Dispatch<TaxAction>;
    /** Persist current tax state to the backend.
     *  Optionally pass income/deductions directly if calling immediately after dispatch (avoids stale-state race). */
    syncToServer: (overrides?: { income?: Partial<IncomeData>; deductions?: Partial<DeductionData>; form16Meta?: Partial<Form16Meta> }) => Promise<void>;
    /** Load the latest saved record from server into state */
    loadFromServer: () => Promise<void>;
}

const TaxContext = createContext<TaxContextProps | undefined>(undefined);

export function TaxProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(taxReducer, initialState);

    /** Load latest record from server on mount (if user is logged in) */
    const loadFromServer = async () => {
        try {
            const token = localStorage.getItem('tw_token');
            if (!token) return;
            const { record } = await api.getLatestTaxRecord();
            if (record) {
                dispatch({
                    type: 'LOAD_FROM_SERVER',
                    payload: {
                        income: record.income,
                        deductions: record.deductions,
                        results: record.results,
                        form16Meta: record.form16Meta,
                    },
                });
            }
        } catch (err) {
            console.warn('[TaxContext] Could not load from server:', err);
        }
    };

    /** Save current state to server — accepts optional direct data to avoid stale-state race */
    const syncToServer = async (overrides?: { income?: Partial<IncomeData>; deductions?: Partial<DeductionData>; form16Meta?: Partial<Form16Meta> }) => {
        try {
            dispatch({ type: 'SET_SYNCING', payload: true });
            const mergedIncome = { ...state.income, ...overrides?.income };
            const mergedDeductions = { ...state.deductions, ...overrides?.deductions };
            const mergedForm16 = { ...state.form16Meta, ...overrides?.form16Meta };
            const { results } = await api.calculateTax(mergedIncome, mergedDeductions, mergedForm16);
            // Update results from server (authoritative)
            dispatch({ type: 'LOAD_FROM_SERVER', payload: { results } });
            dispatch({ type: 'SET_SYNCED_AT', payload: new Date().toISOString() });
        } catch (err) {
            console.error('[TaxContext] syncToServer failed:', err);
            dispatch({ type: 'SET_SYNCING', payload: false });
        }
    };

    return (
        <TaxContext.Provider value={{ state, dispatch, syncToServer, loadFromServer }}>
            {children}
        </TaxContext.Provider>
    );
}

// --- CUSTOM HOOK ---

export function useTax() {
    const context = useContext(TaxContext);
    if (!context) throw new Error('useTax must be used within a TaxProvider');
    return context;
}
