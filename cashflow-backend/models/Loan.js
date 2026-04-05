const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
	lenderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // The Admin/Standard user giving loan
	borrowerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional: If borrower is registered
	borrowerName: { type: String, required: true }, // Name is required regardless if registered or not
	principalAmount: { type: Number, required: true }, // Total loaned
	interestRatePercentage: { type: Number, required: true },
	periodType: {
		type: String,
		enum: ['Monthly', 'Quarterly', 'Semi-Annual', 'Annual'],
		default: 'Monthly'
	},
	numberOfInstallments: { type: Number, required: true },
	installmentsPaid: { type: Number, default: 0 },
	amountPaid: { type: Number, default: 0 },
	status: { type: String, enum: ['Active', 'Completed', 'Defaulted'], default: 'Active' },
	observations: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Loan', loanSchema);
