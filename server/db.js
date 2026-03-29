/**
 * db.js — Database abstraction layer.
 *
 * Tries MongoDB first. If unavailable, falls back to a lightweight
 * JSON file–based store so the app works without installing MongoDB.
 *
 * For production: set MONGODB_URI in server/.env
 * For development without MongoDB: the JSON fallback works automatically.
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

let usingFallback = false;

// ── Fallback JSON store ─────────────────────────────────────────────────────

const DB_FILE = path.join(__dirname, 'data', 'db.json');

function ensureDbFile() {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], taxRecords: [] }));
}

function readDb() {
    ensureDbFile();
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function writeDb(data) {
    ensureDbFile();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function newId() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/** Attaches instance methods to a raw user object from the JSON store */
function hydrateUser(raw) {
    if (!raw) return null;
    return {
        ...raw,
        comparePassword: (pw) => bcrypt.compare(pw, raw.password),
        toJSON: () => {
            const o = { ...raw };
            delete o.password;
            return o;
        },
    };
}

// Fallback User store
const FallbackUser = {
    findOne: async ({ email, _id } = {}) => {
        const db = readDb();
        let raw = null;
        if (email) raw = db.users.find(u => u.email === email) || null;
        else if (_id) raw = db.users.find(u => u._id === _id) || null;
        return hydrateUser(raw);
    },
    findById: (id) => {
        const db = readDb();
        const raw = db.users.find(u => u._id === id) || null;
        const user = hydrateUser(raw);
        // Mimic Mongoose chainable .select()
        return { select: () => Promise.resolve(user) };
    },
    findByIdAndUpdate: (id, updates, _opts) => {
        const db = readDb();
        const idx = db.users.findIndex(u => u._id === id);
        if (idx === -1) return { select: () => Promise.resolve(null) };
        db.users[idx] = { ...db.users[idx], ...updates };
        writeDb(db);
        const user = hydrateUser(db.users[idx]);
        return { select: () => Promise.resolve(user) };
    },
    findByIdAndDelete: (id) => {
        const db = readDb();
        db.users = db.users.filter(u => u._id !== id);
        writeDb(db);
        return Promise.resolve(true);
    },
    create: async (data) => {
        const db = readDb();
        const salt = await bcrypt.genSalt(10);
        const hashedPw = await bcrypt.hash(data.password, salt);
        const raw = { _id: newId(), ...data, password: hashedPw, createdAt: new Date().toISOString() };
        db.users.push(raw);
        writeDb(db);
        return hydrateUser(raw);
    },
};

// Fallback TaxRecord store
const FallbackTaxRecord = {
    findOne: ({ userId } = {}) => {
        const db = readDb();
        const rec = db.taxRecords.find(r => r.userId === userId) || null;
        // Return chainable .sort()
        return { sort: () => Promise.resolve(rec) };
    },
    findOneAndUpdate: async ({ userId }, data, _opts) => {
        const db = readDb();
        let idx = db.taxRecords.findIndex(r => r.userId === userId);
        if (idx === -1) {
            const rec = { _id: newId(), userId, ...data, updatedAt: new Date().toISOString() };
            db.taxRecords.push(rec);
            writeDb(db);
            return rec;
        }
        db.taxRecords[idx] = { ...db.taxRecords[idx], ...data, updatedAt: new Date().toISOString() };
        writeDb(db);
        return db.taxRecords[idx];
    },
    find: ({ userId } = {}) => {
        const db = readDb();
        const recs = db.taxRecords.filter(r => r.userId === userId);
        return { sort: () => ({ limit: () => Promise.resolve(recs) }) };
    },
    deleteMany: async ({ userId }) => {
        const db = readDb();
        db.taxRecords = db.taxRecords.filter(r => r.userId !== userId);
        writeDb(db);
        return true;
    },
};

// ── Connect ─────────────────────────────────────────────────────────────────

async function connectDb() {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/taxwizard';
    try {
        await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
        console.log('✅ Connected to MongoDB');
        usingFallback = false;
    } catch {
        console.warn('⚠️  MongoDB unavailable — using JSON file fallback (data/db.json)');
        usingFallback = true;
    }
}

function getUser() {
    if (usingFallback) return FallbackUser;
    return require('./models/User');
}

function getTaxRecord() {
    if (usingFallback) return FallbackTaxRecord;
    return require('./models/TaxRecord');
}

module.exports = { connectDb, getUser, getTaxRecord };
