/**
 * Auth Routes — /api/auth
 */
const express = require('express');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');
const { getUser } = require('../db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const JWT_EXPIRES = '30d';

function signToken(user) {
    return jwt.sign(
        { id: user._id, email: user.email, name: user.name },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES }
    );
}

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password)
            return res.status(400).json({ error: 'Name, email and password are required' });
        if (password.length < 4)
            return res.status(400).json({ error: 'Password must be at least 4 characters' });

        const User = getUser();
        const existing = await User.findOne({ email: email.toLowerCase().trim() });
        if (existing)
            return res.status(409).json({ error: 'An account with this email already exists' });

        const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), password });
        const token = signToken(user);
        res.status(201).json({ token, user: user.toJSON() });
    } catch (err) {
        console.error('[Auth] Signup error:', err);
        res.status(500).json({ error: 'Server error during signup' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: 'Email and password are required' });

        const User = getUser();
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user)
            return res.status(401).json({ error: 'Invalid email or password' });

        const match = await user.comparePassword(password);
        if (!match)
            return res.status(401).json({ error: 'Invalid email or password' });

        const token = signToken(user);
        res.json({ token, user: user.toJSON() });
    } catch (err) {
        console.error('[Auth] Login error:', err);
        res.status(500).json({ error: 'Server error during login' });
    }
});

// GET /api/auth/me  (protected)
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const User = getUser();
        const found = await User.findById(req.user.id);
        const user = await (found && found.select ? found.select('-password') : Promise.resolve(found));
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ user: user.toJSON ? user.toJSON() : user });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/auth/me  (protected)
router.put('/me', authMiddleware, async (req, res) => {
    try {
        const { name, age } = req.body;
        const updates = {};
        if (name) updates.name = name.trim();
        if (age) updates.age = Number(age);

        const User = getUser();
        const found = await User.findByIdAndUpdate(req.user.id, updates, { new: true });
        const user = await (found && found.select ? found.select('-password') : Promise.resolve(found));
        res.json({ user: user.toJSON ? user.toJSON() : user });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/auth/me  (protected)
router.delete('/me', authMiddleware, async (req, res) => {
    try {
        const { getTaxRecord, getUser } = require('../db');
        await getTaxRecord().deleteMany({ userId: req.user.id });
        await getUser().findByIdAndDelete(req.user.id);
        res.json({ message: 'Account deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
