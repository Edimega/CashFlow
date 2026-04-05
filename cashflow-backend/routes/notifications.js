const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');

// @route   GET api/notifications/poll
// @desc    Poll for unread notifications (designed to be called every 5s)
// @access  Private
router.get('/poll', auth, async (req, res) => {
	try {
		// Only fetch unread notifications to keep the payload very small
		const notifications = await Notification.find({
			recipientUserId: req.user.id,
			isRead: false
		}).sort({ createdAt: -1 });

		res.json(notifications);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// @route   PUT api/notifications/:id/read
// @desc    Mark a notification as read
// @access  Private
router.put('/:id/read', auth, async (req, res) => {
	try {
		const notification = await Notification.findById(req.params.id);
		if (!notification) return res.status(404).json({ msg: 'Not found' });

		if (notification.recipientUserId.toString() !== req.user.id) {
			return res.status(401).json({ msg: 'Not authorized' });
		}

		notification.isRead = true;
		await notification.save();

		res.json(notification);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

module.exports = router;
