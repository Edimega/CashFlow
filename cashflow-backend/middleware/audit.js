const AuditLog = require('../models/AuditLog');

/**
 * Middleware to capture modifications to a transaction
 * Must be used on PUT/PATCH routes for Transactions.
 *
 * NOTE: This requires the original document to be fetched first
 * so that we can compare `previousState` vs `newState`.
 */
const auditLogMiddleware = async (req, res, next) => {
	// We override res.send or interject in the controller.
	// The clean way is to let the controller pass req.auditData to this middleware
	// after it performs the DB update successfully.
	if (req.auditData) {
		try {
			const log = new AuditLog({
				transactionId: req.auditData.transactionId,
				editedByUserId: req.user.id,
				action: req.auditData.action || 'UPDATED',
				previousState: req.auditData.previousState,
				newState: req.auditData.newState
			});
			await log.save();
		} catch (err) {
			console.error('Failed to create audit log:', err);
		}
	}
	next();
};

module.exports = auditLogMiddleware;
