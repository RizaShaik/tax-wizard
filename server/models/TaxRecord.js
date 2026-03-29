const mongoose = require('mongoose');

const taxRecordSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    income: {
        grossSalary: { type: Number, default: 0 },
        freelanceIncome: { type: Number, default: 0 },
    },
    deductions: {
        section80C: { type: Number, default: 0 },
        section80D: { type: Number, default: 0 },
        hraExemption: { type: Number, default: 0 },
        standardDeduction: { type: Number, default: 50000 },
    },
    results: {
        oldRegimeTax: { type: Number, default: 0 },
        newRegimeTax: { type: Number, default: 0 },
        taxSaved: { type: Number, default: 0 },
        recommendation: {
            type: String,
            enum: ['OLD_REGIME', 'NEW_REGIME', 'EQUAL'],
            default: 'EQUAL',
        },
    },
    form16Meta: {
        loaded: { type: Boolean, default: false },
        tdsDeducted: { type: Number, default: 0 },
    },
    aiInsights: [{
        title: String,
        body: String,
        color: String,
    }],
}, {
    timestamps: true,
});

module.exports = mongoose.model('TaxRecord', taxRecordSchema);
