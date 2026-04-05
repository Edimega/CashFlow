const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @route   POST api/auth/register
// @desc    Register a new user (Primarily for creating the first Admin)
// @access  Public
router.post('/register', async (req, res) => {
	const { name, email, password, role } = req.body;

	try {
		let user = await User.findOne({ email });

		if (user) {
			return res.status(400).json({ message: 'User already exists' });
		}

		user = new User({
			name,
			email,
			password,
			role: role || 'Standard'
		});

		const salt = await bcrypt.genSalt(10);
		user.password = await bcrypt.hash(password, salt);

		await user.save();

		const payload = { user: { id: user.id, role: user.role } };

		jwt.sign(
			payload,
			process.env.JWT_SECRET || 'super_secret_key_change_me_in_production',
			{ expiresIn: '5 days' },
			(err, token) => {
				if (err) throw err;
				res.json({ token, role: user.role, name: user.name, id: user.id });
			}
		);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

const auth = require('../middleware/auth');

// @route   POST api/auth/create-user
// @desc    Admin creates a standard user
// @access  Private (Admin only)
router.post('/create-user', auth, async (req, res) => {
	const { name, email, password } = req.body;

	try {
		if (req.user.role !== 'Admin') {
			return res.status(403).json({ message: 'Access denied. Only Admins can create users.' });
		}

		let user = await User.findOne({ email });
		if (user) {
			return res.status(400).json({ message: 'User already exists' });
		}

		user = new User({
			name,
			email,
			password,
			role: 'Standard',
			adminId: req.user.id // Link this standard user to the Admin who created them
		});

		const salt = await bcrypt.genSalt(10);
		user.password = await bcrypt.hash(password, salt);

		await user.save();

		// Don't log them in, just return success
		res.json({ message: 'Standard user created successfully', user: { id: user.id, name: user.name, email: user.email } });
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// @route   POST api/auth/login
// @desc    Authenticate User & get token
// @access  Public
router.post('/login', async (req, res) => {
	const { email, password } = req.body;

	try {
		let user = await User.findOne({ email });

		if (!user) {
			return res.status(400).json({ message: 'Invalid Credentials' });
		}

		const isMatch = await bcrypt.compare(password, user.password);

		if (!isMatch) {
			return res.status(400).json({ message: 'Invalid Credentials' });
		}

		const payload = {
			user: {
				id: user.id,
				role: user.role
			}
		};

		jwt.sign(
			payload,
			process.env.JWT_SECRET || 'super_secret_key_change_me_in_production',
			{ expiresIn: '5 days' },
			(err, token) => {
				if (err) throw err;
				res.json({ token, role: user.role, name: user.name, id: user.id });
			}
		);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

module.exports = router;
