const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET api/users/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select('-password');
		res.json(user);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// @route   GET api/users/assigned
// @desc    Admin gets all standard users assigned to them
// @access  Private
router.get('/assigned', auth, async (req, res) => {
	try {
		if (req.user.role !== 'Admin') {
			return res.status(403).json({ msg: 'Access denied. Only Admins can view assigned users.' });
		}

		const assignedUsers = await User.find({ adminId: req.user.id }).select('-password');
		res.json(assignedUsers);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

module.exports = router;
