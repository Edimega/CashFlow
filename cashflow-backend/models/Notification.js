const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
	recipientUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	title: { type: String, required: true },
	message: { type: String, required: true },
	isRead: { type: Boolean, default: false },
	relatedTransactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }
}, { timestamps: true });

// Optimized for 5s polling: searching by recipient and unread status.
notificationSchema.index({ recipientUserId: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
