const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const auditLogMiddleware = require('../middleware/audit');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @route   POST api/transactions
// @desc    Create a transaction
// @access  Private
router.post('/', auth, async (req, res, next) => {
	try {
		const targetUserId = (req.user.role === 'Admin' && req.body.userId) ? req.body.userId : req.user.id;
		const isSelf = targetUserId.toString() === req.user.id.toString();

		const newTransaction = new Transaction({
			...req.body,
			userId: targetUserId,
			status: isSelf ? 'Approved' : 'Pending'
		});

		const transaction = await newTransaction.save();

		// Update user balance ONLY if Approved
		if (transaction.status === 'Approved') {
			const user = await User.findById(targetUserId);
			if (user) {
				if (transaction.type === 'Inflow') {
					user.balance += transaction.amount;
				} else if (transaction.type === 'Withdrawal') {
					user.balance -= transaction.amount;
				}
				await user.save();
			}
		} else {
			// If Pending, notify user if Admin created it
			if (req.user.role === 'Admin' && !isSelf) {
				const notification = new Notification({
					recipientUserId: targetUserId,
					title: 'Movimiento Pendiente',
					message: `El administrador ha registrado un ${transaction.type} por $${transaction.amount} que requiere tu aprobación.`,
					relatedTransactionId: transaction._id
				});
				await notification.save();
			}
		}

		// Prepare audit log
		req.auditData = {
			transactionId: transaction._id,
			action: 'CREATED',
			newState: transaction.toObject()
		};

		res.json(transaction);
		next();
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
}, auditLogMiddleware);

// @route   GET api/transactions
// @desc    Get all transactions for user (with pagination & filters)
// @access  Private
router.get('/', auth, async (req, res) => {
	try {
		const { page = 1, limit = 10, startDate, endDate, type, userId } = req.query;

		// Logic: Standard users see only their own. Admins see everything they manage (themselves + assigned standard users)
		let query = {};
		if (req.user.role === 'Admin') {
			if (userId) {
				query.userId = userId;
			} else {
				const assignedUsers = await User.find({ adminId: req.user.id }).select('_id');
				const userIds = assignedUsers.map(u => u._id);
				userIds.push(req.user.id);
				query.userId = { $in: userIds };
			}
		} else {
			query.userId = req.user.id;
		}

		if (startDate && endDate) {
			query.receiptDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
		}
		if (type) {
			query.type = type;
		}

		const transactions = await Transaction.find(query)
			.populate('userId', 'name email')
			.sort({ receiptDate: -1 })
			.skip((page - 1) * limit)
			.limit(parseInt(limit));

		const total = await Transaction.countDocuments(query);

		res.json({
			transactions,
			totalPages: Math.ceil(total / limit),
			currentPage: parseInt(page)
		});
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// @route   PUT api/transactions/:id
// @desc    Update a transaction (and log audit)
// @access  Private
router.put('/:id', auth, async (req, res, next) => {
	try {
		let transaction = await Transaction.findById(req.params.id);

		if (!transaction) return res.status(404).json({ msg: 'Transaction not found' });

		// Ensure user owns transaction or is Admin
		if (transaction.userId.toString() !== req.user.id && req.user.role !== 'Admin') {
			return res.status(401).json({ msg: 'Not authorized' });
		}

		const previousState = transaction.toObject();

		transaction = await Transaction.findByIdAndUpdate(
			req.params.id,
			{ $set: req.body },
			{ new: true }
		);

		// Prepare audit data for middleware
		req.auditData = {
			transactionId: transaction._id,
			action: 'UPDATED',
			previousState,
			newState: transaction.toObject()
		};

		res.json(transaction);
		next(); // trigger auditLogMiddleware
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
}, auditLogMiddleware);

// @route   DELETE api/transactions/:id
// @desc    Delete a transaction (and restore balance)
// @access  Private
router.delete('/:id', auth, async (req, res, next) => {
	try {
		const transaction = await Transaction.findById(req.params.id);

		if (!transaction) return res.status(404).json({ msg: 'Transaction not found' });

		// Ensure user owns transaction or is Admin
		if (transaction.userId.toString() !== req.user.id && req.user.role !== 'Admin') {
			return res.status(401).json({ msg: 'Not authorized' });
		}

		const previousState = transaction.toObject();

		// Reverse balance influence ONLY if it was Approved
		if (transaction.status === 'Approved') {
			const user = await User.findById(transaction.userId);
			if (user) {
				if (transaction.type === 'Inflow') {
					user.balance -= transaction.amount;
				} else if (transaction.type === 'Withdrawal') {
					user.balance += transaction.amount;
				}
				await user.save();
			}
		}

		// Notify user of deletion if Admin does it
		if (req.user.role === 'Admin' && transaction.userId.toString() !== req.user.id) {
			const notification = new Notification({
				recipientUserId: transaction.userId,
				title: 'Movimiento Eliminado',
				message: `Se ha eliminado un ${transaction.type} de $${transaction.amount}${transaction.status === 'Pending' ? ' (estaba pendiente)' : ''}.`,
				relatedTransactionId: transaction._id
			});
			await notification.save();
		}

		await Transaction.findByIdAndDelete(req.params.id);

		// Prepare audit data
		req.auditData = {
			transactionId: transaction._id,
			action: 'DELETED',
			previousState
		};

		res.json({ msg: 'Transaction removed' });
		next();
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
}, auditLogMiddleware);

// @route   PUT api/transactions/:id/status
// @desc    Update transaction status (Approve/Reject)
// @access  Private
router.put('/:id/status', auth, async (req, res, next) => {
	try {
		const { status } = req.body;
		if (!['Approved', 'Rejected'].includes(status)) {
			return res.status(400).json({ msg: 'Invalid status' });
		}

		let transaction = await Transaction.findById(req.params.id);
		if (!transaction) return res.status(404).json({ msg: 'Transaction not found' });

		// Only the recipient user can approve/reject their own pending transactions
		if (transaction.userId.toString() !== req.user.id) {
			return res.status(401).json({ msg: 'Not authorized to change status' });
		}

		if (transaction.status !== 'Pending') {
			return res.status(400).json({ msg: 'Transaction already processed' });
		}

		const previousState = transaction.toObject();

		transaction.status = status;

		// If Approved, update balance
		if (status === 'Approved') {
			const user = await User.findById(req.user.id);
			if (user) {
				if (transaction.type === 'Inflow') {
					user.balance += transaction.amount;
				} else if (transaction.type === 'Withdrawal') {
					user.balance -= transaction.amount;
				}
				await user.save();
			}
		}

		await transaction.save();

		// Prepare audit data
		req.auditData = {
			transactionId: transaction._id,
			action: 'UPDATED',
			previousState,
			newState: transaction.toObject()
		};

		res.json(transaction);
		next();
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
}, auditLogMiddleware);

module.exports = router;
