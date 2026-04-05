const mongoose = require('mongoose');

// Tracks who changed what in a transaction
const auditLogSchema = new mongoose.Schema({
	transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', required: true },
	editedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	action: { type: String, enum: ['CREATED', 'UPDATED', 'DELETED'], required: true },
	previousState: { type: mongoose.Schema.Types.Mixed }, // JSON snapshot before change (optional for CREATED)
	newState: { type: mongoose.Schema.Types.Mixed }, // JSON snapshot after change (optional for DELETED)
}, { timestamps: true });

// Easy lookups by transaction or editor
auditLogSchema.index({ transactionId: 1 });
auditLogSchema.index({ editedByUserId: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
