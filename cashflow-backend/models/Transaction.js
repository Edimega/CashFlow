const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	type: {
		type: String,
		enum: ['Inflow', 'Withdrawal'],
		required: true
	},
	status: {
		type: String,
		enum: ['Pending', 'Approved', 'Rejected'],
		default: 'Approved'
	},
	amount: { type: Number, required: true },
	receiptDate: { type: Date, default: Date.now },
	observations: { type: String },
	categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }, // Optional, for future dynamic categories
	loanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan' }, // If it relates to a loan
	withdrawalStatus: { type: String, enum: ['Pending', 'Approved', 'Rejected'] } // For Withdrawal types. NOTE: We might consolidate this with the main 'status' field later.
}, { timestamps: true });

// Indexes to speed up range and paginated queries
transactionSchema.index({ userId: 1, receiptDate: -1 });
transactionSchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
