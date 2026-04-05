const jwt = require('jsonwebtoken');

// A simple authentication middleware that verifies the JWT token
module.exports = function (req, res, next) {
	const token = req.header('Authorization');

	if (!token) {
		return res.status(401).json({ message: 'No token, authorization denied' });
	}

	try {
		// Expecting token format: "Bearer <token>"
		const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET || 'super_secret_key_change_me_in_production');
		req.user = decoded.user; // attach the payload to req.user (should include id and role at a minimum)
		next();
	} catch (err) {
		res.status(401).json({ message: 'Token is not valid' });
	}
};
